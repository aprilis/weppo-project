const uniqid = require('uniqid');
const path = require('path');
const fs_extra = require('fs-extra');
const fs = require('fs');
const childProcess = require('child_process');

const dataPath = 'data/builds';

const defaultOptions = {
    timeLimit : 10000
};

/*

 Submissson
 {
     type : game/bot
     code : string
     username : string
     gamename : string
     language : string
 }
 */

function getDataDirectory ( Sub ) {
    return path.resolve(dataPath, Sub.gamename, Sub.type, Sub.username, uniqid());
}

function buildPromise( Sub, options ) {
    return new Promise( (res, rej) => {
        var returned = false;

        function clean() {
            if (Sub.process) Sub.process.kill('SIGKILL');
            if(Sub.timeout)  clearTimeout(Sub.timeout);
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


        try {
            const codePath = path.join(options.dataDirectory, 'code.cpp');
            const execPath = path.join(options.dataDirectory, 'executable');

            const object = {
                command : '',
                args : []
            };

            function onExecFinish(error, stdout, stderr) {
                if (error) {
                    const message = "Compilation Error " + stderr;
                    failure(message);
                }
                else {
                    success(object);
                }         
            }

            function buildCPP(Sub) {
                object.command = execPath;
                var buildCommand = "g++ -std=c++11 " + codePath + " -o " + execPath;
                Sub.process = childProcess.exec(buildCommand, onExecFinish);
            }

            fs.writeFileSync(codePath, Sub.code);

            switch(Sub.language) {
                case 'cpp':
                    buildCPP(Sub);
                    break;
                case 'none':
                    failure( new Error('invalid language'));
                    break;
            }

            Sub.timeout = setTimeout(() => {
                clean();
                failure(new Error("Code was compiling too long"));
            }, options.timeLimit);

        } catch(e) {
            failure(e);
        }

    });
}

function copy(o) {
    return Object.assign({}, o);
}

async function build( Sub, options ) {
    Sub = copy(Sub);
    options = Object.assign({}, defaultOptions, options);
    const directory = getDataDirectory(Sub);
    options.dataDirectory = directory;
    await fs_extra.mkdirs(directory);
    return buildPromise(Sub, options)
}


module.exports = { build: build };


