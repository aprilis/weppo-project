const Leaderboard = require('../models/Leaderboard');
const _ = require('underscore');

function initialize(io) {
    io.on('connection', socket => {
        console.log('connected');
        const query = socket.handshake.query;
        const room = query.room;
        console.log(room);
        socket.join(room);
        Leaderboard.byGameID(room).then(res => {
            console.log('sending', res);
            if(res) socket.emit('update', res.entries);
        }).catch(console.error);
    });

    Leaderboard.events.on('update', upd => {
        console.log('update:', upd);
        io.to(upd.game).emit('update', upd.entries);
    });
}

module.exports = {
    initialize: initialize
};