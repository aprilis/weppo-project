var mongoose = require('mongoose')

/* 
    Game = {
        command : 
        args :
        script : 
        owner : 
    }
*/

var GameSchema = mongoose.Schema({
    name : {type: String, required : true},
    command : {type: String, required : true},
    args : {type: String, required : true},
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


module.exports = mongoose.model('Game', UserSchema);


