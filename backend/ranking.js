const { build } = require('./game/builder');
const runQueue = require('./runQueue');
const Bot = require('../models/Bot');
const Battle = require('../models/Battle');
const Game = require('../models/Game');
const Leaderboard = require('../models/Leaderboard');
const pickRandom = require('pick-random');
const _ = require('underscore');
const uniqid = require('uniqid');

const opponentsLimit = 10;
const battles = 3;

function asyncForEach(array, func) {
    const now = new Promise((res, rej) => res());
    return Promise.all(array.map(elem => func(elem)).concat(now));
}

function computeLeaderboard(bots, battles) {
    const results = {};
    bots.forEach(b => results[b] = {});
    battles.forEach(b => {
        if(b.results === undefined) {
            return;
        }
        var [b1, b2] = b.bots;
        var [r1, r2] = b.results;
        [0, 0].forEach(() => {
            var score;
            if(r1 == 1) {
                //win
                score = 1;
            } else if(r2 == 1) {
                //draw
                score = 0.5;
            } else {
                //lose
                score = 0;
            }
            if(!results[b1][b2]) {
                results[b1][b2] = [];
            }
            results[b1][b2].push(score);

            [b1, b2] = [b2, b1];
            [r1, r2] = [r2, r1];
        });
    });

    const avg = arr => arr.length ? arr.reduce((a, b) => a + b) / arr.length : 0;
    const points = _(results).mapObject(res => {
        const average = _(res).mapObject(avg);
        return avg(_(average).values());
    });
    return points;
}

async function updateLeaderboard(game) {
    const leaderboard = await Leaderboard.byGameID(game);
    const bots = _(await Bot.rankingBotsForGame(game)).pluck('id');
    const battles = await Battle.battlesOfBots(bots, game);
    console.log(battles);
    const results = computeLeaderboard(bots, battles);
    await Leaderboard.update(game, results);
    console.log(results);
    return results;
}

async function submit(bot) {
    bot.id = bot.id || uniqid();
    if(bot.command === undefined) {
        const builded = await build({
            type: 'bot',
            codePath: bot.code,
            username: bot.user,
            gameID: bot.game,
            language: req.body.language
        });
        Object.assign(bot, builded);
    }

    await Bot.addBot(bot);
    var bots = await Bot.rankingBotsForGame(bot.game);
    bots = _(bots).reject(b => b.id == bot.id);
    bots = pickRandom(bots, { count: Math.min(opponentsLimit, bots.length) });

    const game = await Game.getGameByIDPromise(bot.game);

    await asyncForEach(bots, async function(opp) {
        await asyncForEach(_.range(battles), async function() {
            const id = uniqid();
            const bots = Math.random() > 0.5 ? [bot, opp] : [opp, bot];
            const battle = {
                id: id,
                game: bot.game,
                bots: _(bots).pluck('id')
            };

            await new Battle(battle).save();
            const results = await runQueue.queueBattle(game, bots, {id: id});
            Object.assign(battle, results);
            await Battle.update(battle);
            updateLeaderboard(bot.game).catch(console.error);
        });
    });
}

module.exports = {
    submit: submit
};