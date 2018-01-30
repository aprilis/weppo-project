var express = require('express')
, router = express.Router()
, auth = require('../libs/auth')

const languages = require('../config/languages');
const { runGame } = require('../backend/game/runner');
const { build } = require('../backend/game/builder');
const ranking = require('../backend/ranking');

const _ = require('underscore');
const fs = require('fs-extra');
const multer = require('multer');
const upload = multer({ dest: 'data/code' });

const Game = require('../models/Game');
const Battle = require('../models/Battle');

router.post('/quick-fight', auth.IsAuthenticated, upload.single('code'), (req, res) => {
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

        const game = await Game.getGameByIDPromise(req.body.game);
        const bot2 = _(game.bots).find(b => b.id == req.body.opponent);
        console.log(game, bot2, game.args);

        const result = await runGame(game, [bot1, bot2]);
        const [history, stdin, stdout, stderr] = await Promise.all([
            fs.readJson(result.history),
            fs.readFile(result.inputs[0], 'utf8'),
            fs.readFile(result.outputs[0], 'utf8'),
        ]);
        res.send({
            success: true,
            history: history,
            stdin: stdin,
            stdout: stdout
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

router.post('/ranking', auth.IsAuthenticated, upload.single('code'), (req, res) => {
    (async function(params) {
        var bot = {
            game: req.body.game,
            user: req.user.userName,
            code: req.file.path,
            language: req.body.language,
            saveTo: req.body.saveTo
        };
        try {
            const builded = await build({
                type: 'bot',
                codePath: bot.code,
                username: bot.user,
                gameID: bot.game,
                language: req.body.language
            });
            Object.assign(bot, builded);
            console.log(bot);
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
        ranking.submit(bot).catch(console.error);
        res.send({ success: true });
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

router.get('/replay/:battleID', (req, res, next) => {
    (async function() {
        const battle = await Battle.byID(req.params.battleID);
        const result = {
            results: battle.results
        };
        if(battle == null) {
            res.send(null);
        } else {
            result.history = await fs.readJson(battle.history);
            result.stdin = await fs.readFile(battle.inputs[0], 'utf8');
            result.stdout = await fs.readFile(battle.outputs[0], 'utf8');
            res.send(result);
        }
    })().catch(console.error);
});

module.exports = router;