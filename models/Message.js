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

MessageSchema.statics.saveMessagePromise(message) = function () {
    return new Promise((res, rej) => {
        var msg = new Message({
            userName : message.userName,
            message : message.message,
            created_at :  message.created_at
        });

        msg.save((err) => {
            if (err) rej(err);
            res(msg);
        });
    });
};

module.exports = mongoose.model('Message', MessageSchema);