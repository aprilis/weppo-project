var express = require('express')
, router = express.Router()
, auth = require('../libs/auth');
const multer = require('multer');
const upload = multer({ dest: 'data/code' });
const {uploadGame} = require('../backend/game/gameUploader');

/**
 * GET: Redirect Homepage to login page.
 * */
router.get('/', auth.IsAuthenticated, function(req, res, next){
    res.render('upload.ejs',
    {
        user: req.user
    });
});

/*
 Submission format 
    {
        codePath : string
        scriptPath : path to file
        username : string 
        gamename : string
        language : string 
    }

*/

router.post('/upload-run', upload.fields([{name: 'code', maxCount: 1},
{name: 'script', maxCount: 1}]), (req, res) => {
    
        var codePath = req.files.code[0].path;
        var scriptPath = req.files.script[0].path;
        var title=  req.body.title;
        var username = req.body.username;
        uploadGame({
            codePath : codePath,
            scriptPath : scriptPath, 
            username : username,
            gamename : title,
            language : 'cpp'
        }).then( (result ) => {
            res.send(JSON.stringify(result));
        }).catch( console.error );
});

module.exports = router;