function initSocketIO(room) {
    var socket = io({
        query: {
            room: 'tictactoe'
        }
    });
    
    socket.on('connect', function() { 
        socket.emit('authentication', null);
    });
    
    socket.on('authentication', function(msg) {    
        msg.forEach(message => {
            var user = message.userName;
            var message = message.message;
            //TODO
        });
    });
    
    socket.on('updateUserNames', function(userNames) {
        //TODO
    
        userNames.forEach(userName => {
            //TODO
        });
    });
    
    socket.on('message', function(data) {
        var user = data.user;
        var message = data.message;
        //TODO
    });

    return socket;
}