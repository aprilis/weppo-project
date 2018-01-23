var mongoose = require('mongoose')

/* 
    Game = {
        name :
        command : 
        args :
        script : 
        owner : 
    }
*/

var GameSchema = mongoose.Schema({
    name : {type: String, required : true},
    command : {type: String, required : true},
    args : {type: [String]},
    script : {type: String, required : true},
    owner :{type: String, required : true}
});

GameSchema.statics.existsPromise = function (name) {
    return new Promise( 
        (res, rej ) => {
            this.findOne({name : name}, (err, game ) => {
                if(err) rej(err);
                if(game) res(true);
                res(false);
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


