var mongoose = require('mongoose');
const { queryToPromise } = require('./promise');

var BotSchema = mongoose.Schema({
    game: {type: String, required: true},
    user: {type: String, required: true},
    id: {type: String, required: true},
    code: {type: String, required: true},
    language: {type: String, required: true},
    command: {type: String, required: true},
    args: {type: [String]},
    ranking: {type: Boolean, required: true}
});

BotSchema.statics.botByID = function(id) {
    return queryToPromise(this.findOne({id: id}));
}

BotSchema.statics.rankingBotsForGame = function(game) {
    return queryToPromise(this.find({game: game, ranking: true}));
}

BotSchema.statics.addBot = function(bot) {
    const ranking = Object.assign({}, bot, { ranking: true });
    const nonRanking = new Bot(Object.assign(bot, { ranking: false }));
    return Promise.all([
        nonRanking.save(),
        queryToPromise(this.findOneAndUpdate({game: bot.game, user: bot.user},
             ranking, { upsert: true }))
    ]);
}

const Bot = mongoose.model('Bot', BotSchema);
module.exports = Bot;