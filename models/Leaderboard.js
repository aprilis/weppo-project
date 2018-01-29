var mongoose = require('mongoose');
const { EventEmitter } = require('events');
const { queryToPromise } = require('./promise');

var LeaderboardSchema = mongoose.Schema({
    game: {type: String, required: true},
    entries: {type: [{
        bot: {type: String, required: true},
        user: {type: String},
        score: {type: Number, required: true}
    }], required: true}
});

LeaderboardSchema.statics.byGameID = function(id) {
    return queryToPromise(this.findOne({game: id}));
}

LeaderboardSchema.statics.update = function(game, entries) {
    Leaderboard.events.emit('update', {
        game: game,
        entries: entries
    });
    return queryToPromise(this.findOneAndUpdate({ game: game }, { 
        game: game,
        entries: entries
    }, { upsert: true }));
}

const Leaderboard = mongoose.model('Leaderboard', LeaderboardSchema);
Leaderboard.events = new EventEmitter();
module.exports = Leaderboard;