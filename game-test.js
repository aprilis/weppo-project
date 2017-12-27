const { runGame } = require('./backend/game/runner');

const game = {
    command: 'games/tictactoe/game',
    args: []
};

const bot = {
    command: 'games/tictactoe/bot',
    args: []
};

runGame(game, [bot, bot]).then(console.log).catch(console.error);