var express = require('express')
, router = express.Router()
, auth = require('../libs/auth');
const languages = require('../config/languages');

var Game = require('../models/Game');


/**
 * GET: Redirect Homepage to login page.
 * */
async function renderGames(res, req) {
    var g= await Game.getAllPromise();
    res.render('games.ejs', 
    {
        user : req.user,
        games : g
    });
}

router.get('/', auth.IsAuthenticated, function(req, res, next){
    renderGames(res, req);
});

router.get('/:gameId', auth.IsAuthenticated, function(req, res, next) {
    res.render('game.ejs', {
        user: req.user,
        game: {
            id: 'tictactoe',
            title: 'Game Title',
            description: `
                Some introduction to the game
                <h4>Details</h4>
                Some details about the game mechanics
                <h4>Input</h4>
                Description of the standard input
                <h4>Output</h4>
                Description of the standard output
            `,
            animation: '/gameScripts/tictactoe/script.js'
        },
        languages: languages
    });
})

console.log('Games arena');

module.exports = router;
