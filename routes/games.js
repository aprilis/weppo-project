var express = require('express')
, router = express.Router()
, auth = require('../libs/auth');

/**
 * GET: Redirect Homepage to login page.
 * */
router.get('/', auth.IsAuthenticated, function(req, res, next){
    res.render('games.ejs',
    {
        user: req.user
    });
});

router.get('/tictactoe', auth.IsAuthenticated, function(req, res, next){
    res.render('games/tictactoe.ejs',
    {
        user: req.user
    })
})

console.log('Games arena');

module.exports = router;
