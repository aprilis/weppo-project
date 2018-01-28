var express = require('express')
, router = express.Router()
, auth = require('../libs/auth');



router.get('/', auth.IsAuthenticated, function(req, res, next){
    res.render('instructions.ejs', {
        user : req.user
    });
});


module.exports = router;