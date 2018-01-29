function initSocketIO(room, myUserName) {
    socket = io({
        query: {
            room: room
        }
    });
    
    socket.on('connect', function() { 
        socket.emit('authentication', null);
    });
    
    socket.on('authentication', function(msgs) {  
        if (msgs && msgs.length > 0) {  
            msgs.forEach(msg => {
                var user = msg.userName;
                var message = msg.message;
                var time = msg.timeString;

                appendMessage(myUserName, user, message, time);            
            });
        }
    });
    
    socket.on('updateUserNames', function(userNames) {
        //TODO
    
        userNames.forEach(userName => {
            //TODO
        });
    });
    
    socket.on('message', function(msg) {
        var user = msg.userName;
        var message = msg.message;
        var time = msg.timeString;
        appendMessage(myUserName, user, message, time);

        if (soundOn && user != myUserName) {
            var audio = new Audio('/../sounds/msg_beep.mp3');
            audio.play();
        }
    });

    return socket;
}

function sendMessage() {
    var message = $('#btn-input').val();
    if (message.length > 0) {
        socket.emit('message', message);
        $('#btn-input').val('');
        return false;
    }
}

btnInput = document.getElementById("btn-input");
btnSend = document.getElementById("btn-send");
if (btnSend && btnInput) {
    btnSend.addEventListener("click", function(){
        sendMessage();
    });

    btnInput.addEventListener("keypress", function(event) {
        if (event.keyCode == 13)
            sendMessage();
    });
}

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
    timeElement.innerHTML = user + ' ■ ' + time;
    divSent.append(timeElement);

    messages.append(messageDIV);
    messages.scrollTop(messages.prop("scrollHeight"));
}