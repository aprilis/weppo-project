
const defaults = {
    name: 'Other',
    build: 'cp {code} {exec}',
    run: '{exec}',
    ext: '',
    editor: ''
};

const config = {

    cpp: {
        name: 'C++ 14',
        build: 'g++ {code} -o {exec} -O2 -std=c++14 -lm',
        ext: 'cpp',
        editor: 'c_cpp'
    },

    c: {
        name: 'C 11',
        build: 'gcc {code} -o {exec} -O2 -std=gnu11',
        ext: 'c',
        editor: 'c_cpp'
    },

    python: {
        name: 'Python 2',
        run: 'python {exec}',
        ext: 'py',
        editor: 'python'
    },

    python3: {
        name: 'Python 3',
        run: 'python3 {exec}',
        ext: 'py',
        editor: 'python'
    },

    node: {
        name: 'JavaScript (NodeJS)',
        run: 'node {exec}',
        ext: 'js',
        editor: 'javascript'
    }

};

const _ = require('underscore');
module.exports = _(config).mapObject(c => _.defaults(c, defaults));