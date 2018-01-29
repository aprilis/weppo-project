var express = require('express')
, router = express.Router()
, auth = require('../libs/auth');

const User = require('../models/Game');

router.post('/chatSound', auth.IsAuthenticated, function(req, res){
    console.log(req.body);
    var sound = req.body.sound;
    User.updateUser(req.user, "", "");
});

router.post('/chatPosition', auth.IsAuthenticated, function(req, res) {
    var leftPosition = req.body.left;
    User.updateUser(req.user, "", "");
});

module.exports = router;