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
    bots.forEach(b => results[b.id] = 0);
    var pointsSum = 0;
    battles.forEach((b, i) => {
        if(b.results === undefined) {
            return;
        }
        const currentPoints = i + 1;
        pointsSum += currentPoints;
        const players = b.bots.length;
        b.results.forEach((r, j) => {
            results[b.bots[j]] += currentPoints * (players - r + 1) / players;
        });
    });

    const points = bots.map(b => {
        const res = results[b.id] / pointsSum;
        return {
            bot: b.id,
            user: b.user,
            score: res
        };
    });
    return points.sort((a, b) => b.score - a.score);
}

async function updateLeaderboard(game) {
    const leaderboard = await Leaderboard.byGameID(game);
    const bots = await Bot.rankingBotsForGame(game);
    const battles = await Battle.battlesOfBots(_(bots).pluck('id'), game);
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
}

async function submitAndEval(bot) {
    await submit(bot);
    
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
            if(bot.saveTo) {
                battle.id = bot.saveTo;
                await Battle.update(battle);
            }
            updateLeaderboard(bot.game).catch(console.error);
        });
    });
}

module.exports = {
    submit: submit,
    submitAndEval: submitAndEval,
    updateLeaderboard: updateLeaderboard
};