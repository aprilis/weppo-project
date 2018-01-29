var express = require('express')
, router = express.Router()
, auth = require('../libs/auth');

const User = require('../models/Game');

router.post('/chatSound', auth.IsAuthenticated, function(req, res){
    var chatSound = req.body.sound;
    User.updateUserChatSound(req.user, chatSound);
});

router.post('/chatPosition', auth.IsAuthenticated, function(req, res) {
    var leftPosition = req.body.left;
    User.updateUserChatPosition(req.user, leftPosition);
});

module.exports = router;