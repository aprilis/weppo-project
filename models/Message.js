var mongoose = require('mongoose')

var MessageSchema = mongoose.Schema({
    message : {type: String, required : true},
    userName : {type: String, required : true},
    room : {type: String, required : true},
    created_at: Date
});

MessageSchema.statics.getAllPromise = function (room) {
    return new Promise( 
        (resolve, reject) => {
            this.find({room: room}, (err, messages) => {
                if(err) reject(err);
                resolve(messages);
        });
    });
};

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;