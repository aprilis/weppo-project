var express = require('express')
, router = express.Router()
, auth = require('../libs/auth');
const languages = require('../config/languages');

var Game = require('../models/Game');

/**
 * GET: Redirect Homepage to login page.
 * */
async function renderGames(res, req) {
    var g = await Game.getAllPromise();
    res.render('games.ejs', {
        user : req.user,
        games : g
    });
}

router.get('/', auth.IsAuthenticated, function(req, res, next){
    renderGames(res, req);
});

router.get('/:gameId', auth.IsAuthenticated, function(req, res, next) {
    Game.getGameByIDPromise(req.params.gameId)
        .then( (game ) => {
            if(game == null) {
                next();
            }
            res.render('game.ejs', {
                game : game,
                user : req.user,
                languages : languages
            });
        }
    ).catch(console.error);
});

console.log('Games arena');

module.exports = router;
