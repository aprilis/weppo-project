const childProcess = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const uniqid = require('uniqid');
const _ = require('underscore');
const { EventEmitter } = require('events');

const dataPath = 'data/games';

const defaultOptions = {
    timeLimit: 1000,
    messageTimeLimit: 10000,
    seed: 0
};

function getDataDirectory() {
    return path.join(dataPath, uniqid());
}

function repeat(n, o) {
    return new Array(n).fill(o);
}

function specialLineEmitter(stream, line) {
    const emitter = new EventEmitter();
    var buffer = '';
    stream.on('data', (chunk) => {
        buffer += chunk.toString('utf8');
        const parts = buffer.split('\n');
        parts.slice(0, -1).forEach(p => {
            if(p == line) {
                emitter.emit('line');
            }
        });
        buffer = _.last(parts);
    });
    return emitter;
}

function runGamePromise(game, bots, options) {
    
    return new Promise((res, rej) => {
        var returned = false;

        function clean() {
            bots.concat(game).forEach(o => {
                if(o.process) {
                    o.process.kill('SIGKILL');
                }
                o.process = null;
                if(o.timeout) {
                    clearTimeout(o.timeout);
                }
                o.timeout = null;
            });
        }

        function success(...args) {
            if(returned) return;
            returned = true;
            clean();
            res(...args);
        }
    
        function failure(...args) {
            if(returned) return;
            returned = true;
            clean();
            rej(...args);        
        }

        try {
            const directory = options.outputPath;
            const historyPath = path.join(directory, 'history.json');

            const object = {
                results: null,
                inputs: bots.map((_, i) => path.join(directory, 'input' + i)),
                outputs: bots.map((_, i) => path.join(directory, 'output' + i)),
                errs: bots.map((_, i) => path.join(directory, 'stderr' + i))
            };

            const history = {
                updates: [],
                fails: [],
                results: null,
                initialInfo: {}
            };

            var finished = false;
            const playing = new Set(bots);
            var currentTurn = 0;

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
                playing.delete(bots[nr]);
                if(bots[nr].process) {
                    bots[nr].process.kill('SIGKILL');
                    if(game.process) {
                        game.process.stdio[nr+3].destroy();
                    }
                }
            }

            function finish() {
                fs.writeJson(historyPath, history, err => {
                    if(err) {
                        failure(err);
                    } else {
                        success(object);
                    }
                });
            }

            function beginTurn(nr) {
                bots[nr].timeout = setTimeout(_.partial(playerFailed, nr,
                    "Bot hasn't provided required output within the time limit"), options.timeLimit);
            }

            function endTurn(nr) {
                if(bots[nr].timeout) {
                    clearTimeout(bots[nr].timeout);
                    bots[nr].timeout = null;
                }
            }

            game.args.push(options.seed, bots.length);
            game.process = childProcess.spawn(game.command, game.args, {
                stdio: ['ignore', 'ipc', process.stderr].concat(repeat(bots.length, 'pipe'))
            });

            bots.forEach((b, i) => {
                b.process = childProcess.spawn(b.command, b.args);
                const input = game.process.stdio[i+3];
                const output = b.process.stdout;
                const stderr = fs.createWriteStream(object.errs[i]);

                specialLineEmitter(input, 'END').on('line', () => beginTurn(i));
                input.pipe(b.process.stdin, { end: false });
                input.pipe(fs.createWriteStream(object.inputs[i]));

                specialLineEmitter(output, 'END').on('line', () => {
                    endTurn(i);
                    stderr.write('END\n');
                });
                output.pipe(game.process.stdio[i+3], { end: false });
                output.pipe(fs.createWriteStream(object.outputs[i]));

                b.process.stderr.pipe(stderr);

                b.process.on('exit', (code, signal) => {
                    b.process = null;
                    if(!finished && code != 0) {
                        const message = signal ? 'Process terminated by signal ' + signal :
                            'Process exited with code ' + code;
                        playerFailed(i, message);
                    }
                });
            });

            game.process.on('message', m => {
                if(game.timeout) {
                    clearTimeout(game.timeout);
                    game.timeout = setTimeout(() => {
                        failure(new Error("Game hasn't sent any message within required timeout"));
                    }, options.messageTimeLimit);
                }
                switch(m.type) {
                    case 'player_failed':
                        playerFailed(m.player, m.reason);
                        break;
                    case 'finished':
                        object.results = history.results = m.results;
                        finished = true;
                        finish();
                        break;
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
                }
            });
            game.timeout = setTimeout(() => {
                failure(new Error("Game hasn't sent any message within required timeout"));
            }, options.messageTimeLimit);

            game.process.on('exit', (code, signal) => {
                game.process = null;
                if(code == 0) {
                    setTimeout(() => {
                        if(!finished) {
                            failure(new Error("Game process hasn't sent message 'finished'"));
                        }
                    }, 1000);
                } else {
                    const message = signal ? 'Process terminated by signal ' + signal :
                        'Process exited with code ' + code;
                    failure(new Error(message));
                }
            });
        } catch(e) {
            failure(e);
        }
    });
}

async function runGame(game, bots, options) {
    if(!options) options = { };
    const directory = getDataDirectory();
    options.outputPath = directory;
    await fs.mkdirs(directory);
    return await runGamePromise(game, bots, Object.assign({}, defaultOptions, options));
}

module.exports = { runGame: runGame };