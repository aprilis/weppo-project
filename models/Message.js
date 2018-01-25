var mongoose = require('mongoose')

var MessageSchema = mongoose.Schema({
    message : {type: String, required : true},
    userName : {type: String, required : true},
    sent_at: Date
});

MessageSchema.statics.getAllPromise = function () {
    return new Promise( 
        (resolve, reject) => {
            this.find( {}, (err, messages) => {
                if(err) reject(err);
                resolve(messages);
        });
    });
};

module.exports = mongoose.model('Message', MessageSchema);