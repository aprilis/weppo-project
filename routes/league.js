var express = require('express')
, router = express.Router()
, auth = require('../libs/auth')

const league = require('../backend/league');

const _ = require('underscore');
const fs = require('fs-extra');

router.get('next-battle', auth.IsAuthenticated, (req, res) => {
    (async function () {
        const result = await league.runBattle(req.params.game);
        const user = _.random(result.inputs.length - 1);
        const [history, stdin, stdout] = await Promise.all([
            fs.readJson(result.history),
            fs.readFile(result.inputs[user], 'utf8'),
            fs.readFile(result.outputs[user], 'utf8'),
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