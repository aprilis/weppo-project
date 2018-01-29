var express = require('express')
, router = express.Router()
, auth = require('../libs/auth');



router.get('/', auth.IsAuthenticated, function(req, res, next){
    res.render('instructions.ejs', {
        user : req.user
    });
});

router.post('/', auth.IsAuthenticated, (req, res, next) =>  {
    res.redirect('instructions/archive');
});

router.get('/archive', auth.IsAuthenticated, (req, res, next) => {
    
    var file = 'archive.zip';
    res.download(file); // Set disposition and send it.
});


module.exports = router;