var express = require('express')
, router = express.Router()
, auth = require('../libs/auth')

const league = require('../backend/league');

const uniqid = require('uniqid');
const _ = require('underscore');
const fs = require('fs-extra');

var Game = require('../models/Game');
const Battle = require('../models/Battle');

router.get('/schedule/:gameId', auth.IsAuthenticated, function(req, res, next) {
    Game.getGameByIDPromise(req.params.gameId)
        .then((game) => {
            console.log(game);
            if(game == null) {
                next();
            }
            res.render('schedule.ejs', {
                user : req.user,
                game : game
            });
        }
    ).catch(console.error);
});

router.get('/next-battle/:gameId', auth.IsAuthenticated, (req, res) => {
    const id = uniqid();
    res.send({
        success: true,
        id: id
    });
    console.log(req.params);
    league.runBattle(req.params.gameId, id).catch(console.error);
});

router.get('/battles/:gameId', (req, res) => {
    Battle.battles(req.params.gameId).then(battles => {
        res.send({
            success: true,
            battles: _(battles).pluck('id')
        });
    }).catch(e => {
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

router.get('/battle/:battleId', auth.IsAuthenticated, (req, res) => {
    (async function() {
        const result = await Battle.byID(req.params.battleId);
            const [history, stdin, stdout] = await Promise.all([
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

module.exports = router;