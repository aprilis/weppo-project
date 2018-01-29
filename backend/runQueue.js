const { runGame } = require('./game/runner');

const queue = [];

async function startQueue() {
    while(queue.length > 0) {
        const first = queue[0];
        await first();
        queue.shift();
    }
}

function addToQueue(func) {
    queue.push(func);
    if(queue.length == 1) {
        startQueue().catch(console.error);
    }
}

function queueBattle(...args) {
    return new Promise((res, rej) => {
        addToQueue(() => {
            runGame(...args).then(res).catch(rej);
        });
    });
}

module.exports = {
    queueBattle: queueBattle
};