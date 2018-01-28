const languages = require('../../config/languages');
const path = require('path');

function detect(file) {
    const ext = path.extname(file);
    for(var lang in languages) {
        if('.' + languages[lang].ext == ext) {
            return lang;
        }
    }
}

module.exports = { detect: detect };