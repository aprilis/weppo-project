var express = require('express')
, router = express.Router()
, auth = require('../libs/auth');
const multer = require('multer');
const upload = multer({ dest: 'data/archives' });
const {uploadGame} = require('../backend/game/gameUploader');
const {processArchive} = require('../backend/game/archiveProcess');


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

router.post('/upload-run', upload.fields([{name: 'archive', maxCount: 1}]), (req, res) => {
    
        var archivePath = req.files.archive[0].path;
        var title=  req.body.title;
        var ID = req.body.ID;
        var username = req.body.username;
        var language = req.body.language;
        console.log("LANGUAGE ", language);
        processArchive(archivePath, language)
            .then(
            (sub) => {
                if (sub.err) res.send(JSON.stringify(sub));
                sub.gamename = title;
                sub.username = username;
                sub.gameID = ID;
                sub.language = language;
                uploadGame(sub)
                .then( (result ) => {
                    res.send(JSON.stringify(result));
                }).catch(console.error);
            }).catch(console.error);
});

module.exports = router;