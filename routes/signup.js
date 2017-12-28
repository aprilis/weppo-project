var express = require('express')
, router = express.Router()
, passport = require('passport');

/**
 *  GET: register
 * */
router.get('/',
    function(req, res, next) {
        res.render('signup.ejs');
    });

/**
 * POST: register
 */
router.post('/',
    function(req, res, next) {
        passport.authenticate('local-register', {
            successRedirect: '/games',
            failureRedirect: '/signup',
            failureFlash : true,
            badRequestMessage: 'All fields are required.'
        })(req, res, next);
    });


console.log('signup loaded');

module.exports = router;