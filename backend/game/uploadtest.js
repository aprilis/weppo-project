var { uploadGame } = require('./gameUploader');


var Sub = {
    codePath : 'prog.cpp',
    scriptPath : 'script.js',
    username : 'mareklazniak',
    gamename : 'gierka',
    language : 'cpp',
}

var x = (async function () {
    try {
        var game = await uploadGame(Sub);
        console.log(game);
    }
    catch (e) {
        console.log("--------------");
        console.log(e);
    }
})();