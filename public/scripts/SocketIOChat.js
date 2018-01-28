function initSocketIO(room, myUserName) {
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
            var time = message.created_at;

            appendMessage(myUserName, user, message, time);            
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
        var time = data.created_at;
        appendMessage(myUserName, user, message, time);
    });

    return socket;
}

document.getElementById("btn-send").addEventListener("click", function(){
    var message = $('#btn-input').val();
    socket.emit('message', message);
    $('#btn-input').val('');
    return false;
});

function appendMessage(myUserName, user, message, time)
{
    if (myUserName == user)
    {
        var baseString = "base_sent";
        var messageString = "message_sent";
    }
    else
    {
        var baseString = "base_receive";
        var messageString = "message_receive";
    }

    var messages = $('#messages');

    var messageDIV = document.createElement("div");
    messageDIV.className = "row msg_container " + baseString;

    var div2 = document.createElement("div");
    div2.className = "col-md-10 col-xs-10";
    messageDIV.append(div2);

    var divSent = document.createElement("div");
    divSent.className = "messages " + messageString;
    div2.append(divSent);

    var msgParagraph = document.createElement("p");
    msgParagraph.innerHTML = message;
    divSent.append(msgParagraph);

    var timeElement = document.createElement("time");
    timeElement.dateTime = time;
    timeElement.innerHTML = user;
    divSent.append(timeElement);

    messages.append(messageDIV);
}