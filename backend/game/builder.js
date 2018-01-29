const uniqid = require('uniqid');
const path = require('path');
const fs = require('fs-extra');
const childProcess = require('child_process');
const format = require('string-format');
const config = require('../../config/languages');
const language = require('../util/language');
const { copy } = require('../util/misc');

const dataPath = 'data/builds';

const defaultOptions = {
    timeLimit : 20000
};

/*

 Submissson
 {
     type : game/bot
     code : string (optional)
     codePath : string (optional)
     username : string
     gameID : string
     language : string (optional if can be autodetected by file extension)
 }
 */

function getDataDirectory ( Sub ) {
    return path.resolve(dataPath, Sub.gameID,  Sub.type, Sub.username, uniqid());
}

function splitCommand(command) {
    const words = command.split(' ');
    return {
        command: words[0],
        args: words.slice(1)
    };
}

function runCompiler(Sub, buildCommand, options) {
    return new Promise((res, rej) => {
        var returned = false;

        function clean() {
            if (Sub.process) Sub.process.kill('SIGKILL');
            if (Sub.timeout)  clearTimeout(Sub.timeout);
            Sub.timeout = null;
        }

        function success(...args) {
            if(returned) return;
            returned = true;
            res(...args);
        }

        function failure(...args) {
            if(returned) return;
            returned = true;
            rej(...args);        
        }

        function onExecFinish(error, stdout, stderr) {
            if (error) {
                const message = stderr;
                failure(message);
            }
            else {
                success();
            }
        }

        Sub.process = childProcess.exec(buildCommand, onExecFinish);
        Sub.timeout = setTimeout(() => {
            clean();
            failure(new Error("Code was compiling too long"));
        }, options.timeLimit);
    });

}

async function build( Sub, options ) {
    Sub = copy(Sub);
    options = Object.assign({}, defaultOptions, options);
    const directory = getDataDirectory(Sub);
    options.dataDirectory = directory;
    await fs.mkdirs(directory);

    function codeExtension(Sub) {
        const ext = config[Sub.language].ext;
        return 'code' + (ext ? '.' + ext : '');
    }

    var codePath;
    var execPath = path.join(options.dataDirectory, 'executable');

    if(Sub.codePath) {
        if(Sub.language === undefined) {
            Sub.language = language.detect(Sub.codePath);
        }
        if(Sub.type == 'game') {
            codePath = Sub.codePath;
        } else {
            codePath = path.join(options.dataDirectory, codeExtension(Sub));
            await fs.copy(Sub.codePath, codePath);
        }
    } else {
        codePath = path.join(options.dataDirectory, codeExtension(Sub));
        await fs.writeFile(codePath, Sub.code);
    }

    var buildCommand = config[Sub.language].build;
    buildCommand = format(buildCommand, {
        code: codePath,
        exec: execPath
    });

    await runCompiler(Sub, buildCommand, options);
    
    var runCommand = config[Sub.language].run;
    runCommand = format(runCommand, {
        exec: execPath
    });
    return splitCommand(runCommand);
}


module.exports = { build: build };


