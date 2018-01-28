var express = require('express')
, router = express.Router()
, passport = require('passport');

/**
 * GET login
  */
router.get('/', function(req, res, next) {
    if(req.isAuthenticated()) {
        res.redirect('/');
    } else {
        res.render('login.ejs', {
            user: req.user
        });
    }
});

/**
 * POST login
 */
router.post('/', function(req, res, next) {
    passport.authenticate('local-login', {
        successRedirect: '/games',
        failureRedirect: '/login',
        failureFlash : true
    })(req, res, next)
});

console.log('login loaded');

module.exports = router;
