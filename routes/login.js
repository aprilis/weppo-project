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
            user: req.user,
            next: req.query.next
        });
    }
});

/**
 * POST login
 */
router.post('/', function(req, res, next) {
    passport.authenticate('local-login', {
        successRedirect: req.body.redirect || '/',
        failureRedirect: '/login',
        failureFlash : true
    })(req, res, next)
});

console.log('login loaded');

module.exports = router;
