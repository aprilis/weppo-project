const uniqid = require('uniqid');
const path = require('path');
const fs = require('fs-extra');
const { build } = require('./builder');
const { repeat, copy } = require('../util/misc');


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
        command : 
        args :
        script : 
        owner : 
    }
*/

codePath = 'games/';
scriptPath = 'public/gameScripts/';

const defaultOptions = {
    timeLimit : 50000
}

function getCodeDirectory ( Sub ) {
    return path.resolve(codePath, Sub.gamename);
}

function getScriptDirectory( Sub) {
    return path.resolve(scriptPath, Sub.gamename);
}

async function buildGame(Sub) {
    var game = await build({
        type: 'game',
        codePath: Sub.codePath,
        username: Sub.username,
        gamename: Sub.gamename,
        language: Sub.language
    });
    game.scriptPath = path.join(getScriptDirectory(Sub), 'script.js');
    game.owner = Sub.username;
    return game;
}

function gameExists (Sub) {
    return false;
}

async function uploadGame(Sub, options) {
    Sub = copy(Sub);
    if (gameExists(Sub)) throw(new Error("game of the given name already exists"));
    options = Object.assign({}, defaultOptions, options);    
    const codeDirectory = getCodeDirectory(Sub);
    const scriptDirectory = getScriptDirectory(Sub);
    await fs.mkdirs(codeDirectory);
    await fs.mkdirs(scriptDirectory);
    fs.copySync(Sub.codePath, path.join(codeDirectory, 'code') );
    fs.copySync(Sub.scriptPath, path.join(scriptDirectory, 'script.js'));
    return buildGame(Sub);
}

module.exports = { uploadGame : uploadGame};