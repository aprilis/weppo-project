var unzip = require("unzip");
var fs = require("fs-extra");
const uniqid = require('uniqid');
const path = require('path');
const config = require('../../config/languages');

const dataPath = 'data/archives';

function getDataDirectory () {
    return path.resolve(dataPath, uniqid());
}

function validateArchive(desc, anim, game, libdir, botdir, language)
{
    if (fs.existsSync(desc) == false) {
        return {err : "Wrong archive format - no description.html" };
    }
    if (fs.existsSync(anim) == false) {
        return {err : "Wrong archive format - no animation.js"};
    }
    if (fs.existsSync(game) == false) {
        return {err : "Wrong archive format - no game with proper extension"};
    }
    if (fs.existsSync(libdir) == false) {
        return {err : "Wrong archive format - no lib folder"};
    }
    if (fs.existsSync(botdir) == false) {
        return {err : "Wrong archive format - no bots folder"};
    }
    return true;  
}

function gameExtension(language) {
    const ext = config[language].ext;
    return 'game' + (ext ? '.' + ext : '');
}


function handleArchivePromise(archivePath, language) {
    return new Promise( (res, rej ) => {
        var datadir= getDataDirectory();
            fs.createReadStream(archivePath).pipe(unzip.Extract({path : datadir}))
            .on("close", () => {
                var descPath = path.join(datadir, "description.html");
                var animationPath = path.join(datadir, "animation.js");
                var gamePath = path.join(datadir, gameExtension(language) );
                var libPath = path.join(datadir, "lib");
                var botsPath = path.join(datadir, "bots");
                var botsInfoPath = path.join(datadir, "bots.json");
                var validArch = validateArchive(descPath, animationPath, 
                                                gamePath, libPath, botsPath, language); 
                if (validArch.err ) rej(validArch);
                else {
                    var gamePathNew = path.join(libPath, gameExtension(language));
                    fs.copySync(gamePath, gamePathNew);
                    var botFiles = fs.readdirSync(botsPath);
                    var bots = [];
                    for (bot of botFiles) {
                        bots.push(path.join(botsPath, bot));
                    }
                    res({
                        codePath : gamePathNew,
                        scriptPath : animationPath,
                        bots : bots,
                        botsInfoPath: botsInfoPath,
                        language : language,
                        description : fs.readFileSync(descPath).toString()
                    });
                }
            })
            .on("error", () => {
                rej({err : "Wrong format of archive"});
            });
    });   
}

async function processArchive (archivePath, language) {
    try {
        console.log("ARCHIVE");
        var sub = await handleArchivePromise(archivePath, language);
        return sub;
    } catch(err) {
        return err;
    }
};

module.exports = {processArchive : processArchive};