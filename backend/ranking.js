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
    return Promise.all(array.map((elem, i) => func(elem, i)).concat(now));
}

async function computeLeaderboard(battles) {
    const results = {};
    const user = {};

    async function getUser(bot) {
        if(user[bot] === undefined) {
            user[bot] = (await Bot.botByID(bot)).user;
        }
        return user[bot];
    }

    var pointsSum = 0;
    await asyncForEach(battles, async function(b, i) {
        if(b.results === undefined) {
            return;
        }
        const currentPoints = i + 1;
        pointsSum += currentPoints;
        const players = b.bots.length;
        await asyncForEach(b.results, async function(r, j) {
            const u = await getUser(b.bots[j]);
            if(results[u] === undefined) {
                results[u] = 0;
            }
            results[u] += currentPoints * (players - r) / (players - 1);
        });
    });

    const points = _(results).pairs().map(([u, r]) => {
        const res = r / pointsSum;
        return {
            user: u,
            score: res
        };
    });
    return points.sort((a, b) => b.score - a.score);
}

async function updateLeaderboard(game) {
    const leaderboard = await Leaderboard.byGameID(game);
    const battles = await Battle.battles(game);
    const results = await computeLeaderboard(battles);
    await Leaderboard.update(game, results);
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

            await Battle.create(battle);
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