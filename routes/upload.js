var express = require('express')
, router = express.Router()
, auth = require('../libs/auth');

/**
 * GET: Redirect Homepage to login page.
 * */
router.get('/', auth.IsAuthenticated, function(req, res, next){
    res.render('upload.ejs',
    {
        user: req.user
    });
});

module.exports = router;