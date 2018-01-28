var express = require('express')
, router = express.Router()
, auth = require('../libs/auth')

const languages = require('../config/languages');
const { runGame } = require('../backend/game/runner');
const { build } = require('../backend/game/builder');

const _ = require('underscore');
const fs = require('fs-extra');
const multer = require('multer');
const upload = multer({ dest: 'data/code' });

const Game = require('../models/Game');

router.post('/quick-fight', auth.IsAuthenticated, upload.single('code'), (req, res) => {
    console.log(req.file, req.body);
    (async function(params) {
        var bot1;
        try {
            bot1 = await build({
                type: 'bot',
                codePath: req.file.path,
                username: req.user.userName,
                gameID: req.body.game,
                language: req.body.language
            });
        } catch(e) {
            console.log(e);
            res.send({
                success: false,
                error: {
                    title: 'Compilation Error',
                    message: e.toString()
                }
            });
            return;
        }

        //TODO
        const game = await Game.getGameByIDPromise(req.body.game);
        const bot2 = _(game.bots).find(b => b.id == req.body.opponent);
        console.log(game, bot2, game.args);

        const result = await runGame(game, [bot1, bot2]);
        const [history, stdin, stdout, stderr] = await Promise.all([
            fs.readJson(result.history),
            fs.readFile(result.inputs[0], 'utf8'),
            fs.readFile(result.outputs[0], 'utf8'),
            fs.readFile(result.errs[0], 'utf8')
        ]);
        res.send({
            success: true,
            history: history,
            stdin: stdin,
            stdout: stdout,
            stderr: stderr
        });
    })().catch(e => {
        console.error(e);
        res.send({
            success: false,
            error: {
                title: 'Internal Server Error',
                message: e.toString()
            }
        });
    });
});

module.exports = router;