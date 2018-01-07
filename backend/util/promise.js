const readline = require('readline');

//Promise which returns (or rejects if reject is true) given value after specified timeout
function timeout(time, value, reject) {
    return new Promise((res, rej) => {
        setTimeout(() => {
            (reject ? rej : res)(value);
        }, time);
    });
}

//Promise which never returns
function forever() {
    return new Promise((res, rej) => { });
}

//Returns a function which returns a Promise for the next line at each callback
function eventListener(emitter, event, exitEvent) {
    const eventsQueue = []; //queue of lines waiting to be read
    const waitingQueue = []; //queue of functions waiting to be executed
    var closed = false;
    emitter.on(event, (x) => {
        if(waitingQueue.length) {
            const [res, rej] = waitingQueue.shift(); //takes the first element from the queue and removes it
            res(x);
        } else {
            eventsQueue.push(x);
        }
    });

    if(exitEvent) {
        emitter.on(exitEvent, () => {
            waitingQueue.forEach(([res, rej]) => rej('EventEmitter has closed'));
            closed = true;
        });   
    }

    return function() {
        return new Promise((res, rej) => {
            if(eventsQueue.length) {
                res(eventsQueue.shift());
            } else if(closed) {
                rej('EventEmitter has closed');
            } else {
                waitingQueue.push([res, rej]);
            }
        });
    };
}

function lineReader(stream) {
    const rl = readline.createInterface(stream);
    return eventListener(rl, 'line', 'close');
}

function messageReader(process) {
    return eventListener(process, 'message');
}

async function specialLine(reader, line) {
    while(true) {
        if(await reader() == line) {
            return;
        }
    }
}

function runWithTimeout(promise, time, value, reject) {
    return Promise.race([promise, timeout(time, value, reject)]);
}

module.exports = {
    timeout: timeout,
    forever: forever,
    eventListener: eventListener,
    lineReader: lineReader,
    messageReader: messageReader,
    specialLine: specialLine,
    runWithTimeout: runWithTimeout
};