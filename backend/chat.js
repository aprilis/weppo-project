const Message = require('../models/Message');
const _ = require('underscore');

function initialize(io) {

    const clients = {};

    // Update user names
    function updateUserNames(room) {
        const names = _(clients[room]).pluck('userName');
        io.to(room).emit('updateUserNames', names);
    }

    io.sockets.on('connection', function(socket){
        console.log('Socket Connected...');
        const query = socket.handshake.query;
        const room = query.room;
        var authenticated = false;
    
        // Authenticate
        socket.on('authentication', async function(data) {
            authenticated = true;
            const client = {
                socket: socket,
                user: socket.request.user,
                userName: socket.request.user.userName,
            };

            socket.join(room);
    
            if(clients[room] === undefined) {
                clients[room] = [];
            }
            clients[room].push(client);
    
            // get database messages here
            var messages = await Message.getAllPromise(room);
            var messagesToSend = {};
            messages.forEach(message => {
                var msg = {
                    user: message.userName,
                    message: message.message,
                    created_at: message.created_at
                }
                messagesToSend.push(msg);
            });
    
            client.socket.emit('authentication', messagesToSend);
            updateUserNames(room);
        })
    
        // Send message
        socket.on('message', function(message) {
            if(authenticated) {
                var time = new Date();
                
                // Add to database
                var newMessage = new Message({
                    userName: socket.request.user.userName,
                    message: message,
                    room: room,
                    created_at: time.now
                });

                newMessage.save().catch(console.error);
                io.to(room).emit('message', {
                    user: socket.request.user.userName,
                    message: message,
                    created_at: time.toISOString()
                });
            }
        });
    
        // Disconnection
        socket.on('disconnect', function() {
            clients[room] = _(clients[room]).reject(c => c.socket == socket);
        })
    });
}

module.exports = {
    initialize: initialize
};