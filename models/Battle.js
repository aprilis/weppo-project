var mongoose = require('mongoose');
const { EventEmitter } = require('events');
const { queryToPromise } = require('./promise');

var BattleSchema = mongoose.Schema({
    id: {type: String, required: true},
    game: {type: String, required: true},
    bots: {type: [String], required: true},
    results: {type: [Number]},
    history: {type: String},
    inputs: {type: [String]},
    outputs: {type: [String]}
});

BattleSchema.statics.byID = function(id) {
    return queryToPromise(this.findOne({ id: id }));
}

BattleSchema.statics.battlesOfBots = function(ids, game) {
    return queryToPromise(this.find({
        game: game,
        bots: { $not: { $elemMatch: { $nin: ids }  } } 
    }).sort('time'));
}

BattleSchema.statics.battlesOfBot = function(id, others, game) {
    return queryToPromise(this.find({
        game: game,
        bots: { $and: [
            { $not: { $elemMatch: { $nin: others }  } } ,
            { $elemMatch: id }
        ]}
    }).sort('time'));
}

BattleSchema.statics.battles = function(game) {
    return queryToPromise(this.find({
        game: game
    }).sort('time'));
}

BattleSchema.statics.update = function(battle) {
    Battle.events.emit('update', battle);
    return queryToPromise(this.findOneAndUpdate({id: battle.id}, battle, { upsert: true }));
}

BattleSchema.statics.create = function(battle) {
    battle.time = new Date().getTime();
    return new Battle(battle).save();
}

const Battle = mongoose.model('Battle', BattleSchema);
Battle.events = new EventEmitter();
module.exports = Battle;