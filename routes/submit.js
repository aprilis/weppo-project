var express = require('express')
, router = express.Router()
, auth = require('../libs/auth')

const languages = require('../config/languages');
const { runGame } = require('../backend/game/runner');
const { build } = require('../backend/game/builder');

const fs = require('fs-extra');
const multer = require('multer');
const upload = multer({ dest: 'data/code' });

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
        const bot2 = {
            command: 'games/tictactoe/bot',
            args: []
        };
        const game = {
            command: 'games/tictactoe/game',
            args: []
        };

        try {
            const result = await runGame(game, [bot1, bot2]);
            const history = await fs.readJson(result.history);
            res.send({
                success: true,
                history: history
            });
        } catch(e) {
            console.error(e);
            res.send({
                success: false,
                error: {
                    title: 'Internal Server Error',
                    message: e.toString()
                }
            });
        }
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