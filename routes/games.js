var express = require('express')
, router = express.Router()
, auth = require('../libs/auth');
const languages = require('../config/languages');

/**
 * GET: Redirect Homepage to login page.
 * */
router.get('/', auth.IsAuthenticated, function(req, res, next){
    res.render('games.ejs',
    {
        user: req.user
    });
});

router.get('/:gameId', auth.IsAuthenticated, function(req, res, next) {
    res.render('game.ejs', {
        user: req.user,
        game: {},
        languages: languages
    });
})

console.log('Games arena');

module.exports = router;
