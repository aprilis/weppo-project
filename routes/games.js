var express = require('express')
, router = express.Router()
, auth = require('../libs/auth');

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

router.get('/tictactoe', auth.IsAuthenticated, function(req, res, next){
    res.render('games/tictactoe.ejs',
    {
        user: req.user
    })
})

console.log('Games arena');

module.exports = router;
