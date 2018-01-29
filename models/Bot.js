var mongoose = require('mongoose')

var BotSchema = mongoose.Schema({
    game: {type: String},
    user: {type: String},
    id: {type: String},
    code: {type: String},
    exec: {type: String},
});

BotSchema.statics.existsPromise = function (id, owner) {
    return new Promise( 
        (res, rej ) => {
            this.findOne({gameID : id}, (err, game ) => {
                if(err) rej(err);
                if(!game) {
                    res(false);
                }
                else if(game && game.owner != owner) res(true);
                else {
                    console.log("DELETING GAME ", id);
                    this.deleteOne({gameID : id}, (err) => {
                        if (err) rej(err);
                        res(false);
                    });
                }
        });
    });
};

GameSchema.statics.getGameByIDPromise = function (id) {
    return new Promise( (res, rej ) => {
        this.findOne({gameID : id}, (err, game) => {
            if (err) rej(err);
            res(game);
        });
    });
};

GameSchema.statics.getAllPromise = function () {
    return new Promise( 
        (res, rej ) => {
            this.find( {}, (err, games ) => {
                if(err) rej(err);
                res(games);
        });
    });
};


module.exports = mongoose.model('Game', GameSchema);


