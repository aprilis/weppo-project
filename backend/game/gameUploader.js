const uniqid = require('uniqid');
const path = require('path');
const fs = require('fs-extra');
const { build } = require('./builder');
const { repeat, copy } = require('../util/misc');
const language = require('../util/language');

var Game = require('../../models/Game');


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

/* 
    game = {
        name:
        command : 
        args :
        script : 
        owner : 
    }
*/

codePath = 'games/';
scriptPath = 'public/gameScripts/';
scriptServerPath ='/gameScripts';

const defaultOptions = {
    timeLimit : 50000
}

function getCodeDirectory ( Sub ) {
    return path.resolve(codePath, Sub.gameID);
}

function getScriptDirectory( Sub) {
    return path.resolve(scriptPath, Sub.gameID);
}

function getScriptServerPath(Sub) {
    return path.join(scriptServerPath, Sub.gameID, 'script.js');
}

async function buildGame(Sub) {
    console.log("CODE PATH ", Sub.codePath);
    var game = await build({
        type: 'game',
        codePath: Sub.codePath,
        gamename: Sub.gamename,
        gameID: Sub.gameID,
        username: Sub.username,
        language: Sub.language
    });
    game.scriptPath = getScriptServerPath(Sub);
    game.owner = Sub.username;
    game.name = Sub.gamename;
    return game;
}

async function buildBots(Sub) {
    var botsInfo = {};
    try {
        botsInfo = await fs.readJson(Sub.botsInfoPath, { throws: false });
    } catch(e) {
        //it's ok as this file isn't required
    }
    var bots = [];
    for (botSrc of Sub.bots) {
        const basename = path.basename(botSrc);
        const info = botsInfo[basename] || {};
        var bot = await build({
            type : 'bot',
            codePath : botSrc,
            gamename : Sub.gamename,
            gameID : Sub.gameID,
            username : Sub.username,
            language : info.language || language.detect(basename) || Sub.language
        });
        bot.name = info.name || basename;
        bot.id = basename;
        bots.push(bot);
    }
    return bots;
}


async function gameExists (Sub) {
    console.log("checking ", Sub.gamename);
    var exists = await Game.existsPromise(Sub.gameID, Sub.username);
    console.log("GAME EXISTS ", exists);
    return exists;
}

function saveGamePromise(game) {
    console.log("saving game ", game.name);

    return new Promise((res, rej) => {
        var g = new Game({
            gameID : game.gameID,
            name : game.name,
            command : game.command,
            args :  game.args,
            script : game.scriptPath,
            owner : game.owner,
            bots : game.bots,
            description : game.description
        });

        g.save((err) => {
            if (err) rej(err);
            res(g);
        });
    });
}

async function uploadGame(Sub, options) {
    Sub = copy(Sub);
    var exist = await gameExists(Sub);
    console.log("EXIST", exist);
    if (exist == true) {
        console.log("SHIT");
        return ({err :"game of the given name already exists"});
    }
    options = Object.assign({}, defaultOptions, options);    
    const codeDirectory = getCodeDirectory(Sub);
    const scriptDirectory = getScriptDirectory(Sub);
    await fs.mkdirs(codeDirectory);
    await fs.mkdirs(scriptDirectory);
    fs.copySync(Sub.codePath, path.join(codeDirectory, 'code') );
    fs.copySync(Sub.scriptPath, path.join(scriptDirectory, 'script.js'));
    try {
        var game = await buildGame(Sub);
        game.gameID = Sub.gameID;
        game.bots = await buildBots(Sub);
        game.description = Sub.description;
    }
    catch(e) {
        console.error(e);
        return ({err : e.toString()});
    }
    console.log("game built")
    console.log(game);
    await saveGamePromise(game);
    return game;
}

module.exports = { uploadGame : uploadGame};