const _ = require('underscore');

function repeat(n, o) {
    return new Array(n).fill(o);
}

function copy(o) {
    return _.clone(o);
}

module.exports = {
    repeat: repeat,
    copy: copy
}