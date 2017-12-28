// Here will be routed all pages used for internal website testing

const express = require('express');
const { runGame } = require('../backend/game/runner');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('testing/index');
})

router.get('/tictactoe', (req, res) => {
    res.render('testing/tictactoe');
});

router.get('/run-tictactoe', (req, res) => {
    const game = {
        command: 'games/tictactoe/game',
        args: []
    };
    
    const bot = {
        command: 'games/tictactoe/bot',
        args: []
    };

    runGame(game, [bot, bot]).then((result) => {
        res.sendFile(result.history);
    }).catch(console.error);
})

module.exports = router;