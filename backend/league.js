const runQueue = require('./runQueue');
const ranking = require('./ranking');
const _ = require('underscore');
const Bot = require('../models/Bot');
const Game = require('../models/Game');
const Battle = require('../models/Battle');

var broadcast;

function initialize(io) {
    io.on('connection', socket => {
        const query = socket.handshake.query;
        const room = query.room;
        socket.join(room);
    });

    broadcast = function(id, result, game) {
        io.to(game).emit('update', id, result);
    }
}

async function runBattle(gameID, id) {
    try {
        const game = await Game.getGameByIDPromise(gameID);
        var bots = await Bot.rankingBotsForGame(gameID);
        if(bots.length <= 1) {
            broadcast(id, 'No bots', gameID);
            return;
        }
        bots = _.shuffle(bots);
        while(bots.size() > 6)
            bots.pop();
        const battle = {
            id: id,
            game: gameID,
            bots: _(bots).pluck('id')
        };
        await Battle.create(battle);
        const results = await runQueue.queueBattle(game, bots, {id: id});
        Object.assign(battle, results);
        await Battle.update(battle);
        ranking.updateLeaderboard(gameID).catch(console.error);
        broadcast(id, 'Finished', gameID);
    } catch(e) {
        console.error(e);
        broadcast(id, 'Error', gameID);
    }
}

module.exports = {
    runBattle: runBattle,
    initialize: initialize
}