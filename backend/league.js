const runQueue = require('./runQueue');
const ranking = require('ranking');
const _ = require('underscore');
const Bot = require('../models/Bot');

async function runBattle(gameID) {
    const game = await Game.getGameByIDPromise(gameID);
    const bots = await Bot.rankingBotsForGame(gameID);
    const id = uniqid();
    bots = _.shuffle(bots);
    const battle = {
        id: id,
        game: bot.game,
        bots: _(bots).pluck('id')
    };
    await new Battle(battle).save();
    const results = await runQueue.queueBattle(game, bots, {id: id});
    Object.assign(battle, results);
    await Battle.update(battle);
    updateLeaderboard(gameID).catch(console.error);
    return results;
}

module.exports = {
    runBattle: runBattle
}