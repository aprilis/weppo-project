var express = require('express')
, router = express.Router();



router.get('/', function(req, res, next){
    res.render('about.ejs');
});



module.exports = router;