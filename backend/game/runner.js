const childProcess = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const uniqid = require('uniqid');
const _ = require('underscore');
const { EventEmitter } = require('events');
const { repeat, copy } = require('../util/misc');
const promiseUtil = require('../util/promise');

const dataPath = 'data/games';

const defaultOptions = {
    timeLimit: 1000,
    messageTimeLimit: 10000,
    seed: 0
};

function getDataDirectory(id) {
    return path.resolve(dataPath, id);
}

async function monitorBotTimeout(bot, timeout, result) {
    const inputReader = promiseUtil.lineReader(bot.input),
          outputReader = promiseUtil.lineReader(bot.output);
    while(true) {
        try {
            await promiseUtil.specialLine(inputReader, 'END');
        } catch(e) {
            return result;
        }
        var res;
        try {
            res = await promiseUtil.runWithTimeout(
                promiseUtil.specialLine(outputReader, 'END'), timeout, 'timeout');
        } catch(e) {
            throw {
                object: bot,
                result, result,
                error: 'Bot has terminated unexpectedly'
            }
        }
        if(res == 'timeout') {
            throw {
                object: bot,
                result: result,
                error: 'Bot has exceeded its time limit'
            }
        }
    }
}

async function runGame(game, bots, options) {
    game = _.clone(game);
    bots = bots.map(_.clone);
    options = _(options || {}).defaults(defaultOptions, { id: uniqid() });

    bots.forEach((b, i) => b.nr = i);

    const directory = getDataDirectory(options.id);
    await fs.mkdirs(directory);
    
    const historyPath = path.join(directory, 'history.json');
    
    const object = {
        id: options.id,
        results: null,
        inputs: bots.map(b => path.join(directory, 'input' + b.nr)),
        outputs: bots.map(b => path.join(directory, 'output' + b.nr)),
        history: historyPath
    };

    const history = {
        updates: [],
        fails: [],
        results: null,
        initialInfo: {}
    };

    var monitors = [];
    var currentTurn = 0;

    game.args.push(options.seed, bots.length);
    game.process = childProcess.spawn(game.command, game.args, {
        stdio: ['ignore', 'ipc', process.stderr].concat(repeat(2 * bots.length, 'pipe'))
    });

    bots.forEach(b => {
        b.process = childProcess.spawn(b.command, b.args);
        b.input = game.process.stdio[2 * b.nr + 3];
        b.output = b.process.stdout;

        b.input.pipe(b.process.stdin, { end: true });
        b.input.pipe(fs.createWriteStream(object.inputs[b.nr]));

        b.output.pipe(game.process.stdio[2 * b.nr + 1 + 3], { end: false });
        b.output.pipe(fs.createWriteStream(object.outputs[b.nr]));

        b.process.stdin.on('error', console.error);
        b.process.stdout.on('error', console.error);
        game.process.stdio[2 * b.nr + 3].on('error', console.error);
        game.process.stdio[2 * b.nr + 1 + 3].on('error', console.error);

        monitors.push(monitorBotTimeout(b, options.timeLimit, monitors.length));

        b.process.on('exit', () => {
            b.process = null;
            if(game.process) {
                game.process.stdio[2 * b.nr + 1 + 3].end();
            }
        });
    });

    function playerFailed(nr, reason) {
        if(bots[nr].finished) {
            return;
        }
        bots[nr].finished = true;
        history.fails.push({
            player: nr,
            reason: reason,
            turn: currentTurn
        });
        if(bots[nr].process) {
            bots[nr].process.kill('SIGKILL');
        }
    }

    async function monitorGame(result) {
        const message = promiseUtil.messageReader(game.process);
        while(true) {
            var m;
            try {
                m = await promiseUtil.runWithTimeout(message(), 
                    options.messageTimeLimit, 'timeout');
            } catch(e) {
                throw {
                    object: game,
                    result: result,
                    error: 'Game process has terminated unexpectedly'
                };
            }
            if(m == 'timeout') {
                throw {
                    object: game,
                    error: "Game didn't send any message within specified timeout"
                };
            }
            switch(m.type) {
                case 'player_failed':
                    playerFailed(m.player, m.reason);
                    break;
                case 'finished':
                    object.results = history.results = m.results;
                    return result;
                case 'update':
                    if(m.nextTurn) {
                        currentTurn++;
                    }
                    history.updates.push({
                        turn: currentTurn,
                        description: m.description
                    });
                    break;
                case 'initial_info':
                    history.initialInfo = m.description;
                    break;
                case 'keep_alive':
                    break;
                default:
                    throw {
                        object: game,
                        error: 'Incorrect message received from Game instance'
                    };
            }
        }
    }

    function clean() {
        bots.concat(game).forEach(o => {
            if(o.process) {
                o.process.kill('SIGKILL');
            }
        });
    }

    game.process.on('exit', () => game.process = null);

    monitors.push(monitorGame(game));
    while(true) {
        try {
            const finished = await Promise.race(monitors);
            if(finished == game || finished == undefined) {
                break;
            } else {
                monitors[finished] = promiseUtil.forever();
            }
        } catch(e) {
            if(e.object == game) {
                clean();
                throw new Error(e.error);
            } else {
                playerFailed(e.object.nr, e.error);
                monitors[e.result] = promiseUtil.forever();
            }
        }
    }

    clean();
    await fs.writeJson(historyPath, history);
    return object;
}

module.exports = { runGame: runGame };