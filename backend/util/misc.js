function repeat(n, o) {
    return new Array(n).fill(o);
}

function copy(o) {
    return Object.assign({}, o);
}

module.exports = {
    repeat: repeat,
    copy: copy
}