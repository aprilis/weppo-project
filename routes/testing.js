// Here will be routed all pages used for internal website testing

const express = require('express');
const multer = require('multer');
const { runGame } = require('../backend/game/runner');
const { build } = require('../backend/game/builder');
const router = express.Router();
const upload = multer({ dest: 'data/code' });
const {uploadGame} = require('../backend/game/gameUploader');
const languages = require('../config/languages');

const fs= require('fs');

router.get('/', (req, res) => {
    res.render('testing/index');
})

router.get('/tictactoe', (req, res) => {
    res.render('testing/tictactoe');
});

router.get('/tictactoe-code', (req, res) => {
    res.render('testing/tictactoe-code', { languages: languages });
});

router.get('/run-tictactoe', (req, res) => {
    const game = {
        command: 'games/tictactoe/game',
        args: []
    };
    
    const bot = {
        command: 'games/tictactoe/bot',
        args: []
    };

    runGame(game, [bot, bot]).then((result) => {
        res.sendFile(result.history);
    }).catch(console.error);
});

router.get('/menu', (req, res ) => {
    res.render('testing/menu');
});

router.get('/tictactoe-anim', (req, res) => {
    res.render('testing/tictactoe-anim');
});

router.get('/upload', (req, res) => {
    res.render('testing/upload.ejs');
});

router.get('/viewer', (req, res) => {
    res.render('testing/viewer.ejs');
});

router.get('/bootstrap', (req, res) => {
    res.render('testing/bootstrap.ejs');
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

function buildCode(code) {
    return build({
        type: 'bot',
        codePath: code,
        username: 'mareklazniak',
        gamename: 'tictactoe',
        language: 'cpp'
    });
}

async function letThemFight(code1, code2) {
    const bots = await Promise.all([buildCode(code1), buildCode(code2)]);
    const game = {
        command: 'games/tictactoe/game',
        args: []
    };
    return await runGame(game, bots);
}

router.post('/run-tictactoe-code', upload.fields([{name: 'code1', maxCount: 1},
    {name: 'code2', maxCount: 1}]), (req, res) => {
    letThemFight(req.files.code1[0].path, req.files.code2[0].path).then((result) => {
        console.log(result.history);
        res.sendFile(result.history)
    }).catch(console.error);
});

module.exports = router;