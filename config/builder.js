
const config = {

    default: {
        build: 'cp {code} {exec}',
        run: '{exec}',
        ext: ''
    },

    cpp: {
        build: 'g++ {code} -o {exec} -O2 -std=c++14 -lm',
        ext: 'cpp'
    },

    c: {
        build: 'gcc {code} -o {exec} -O2 -std=gnu11',
        ext: 'c'
    },

    python: {
        run: 'python {exec}',
        ext: 'py'
    },

    python3: {
        run: 'python3 {exec}',
        ext: 'py'
    },

    node: {
        run: 'node {exec}',
        ext: 'js'
    }

};

const _ = require('underscore');
const defaults = _.partial(_.defaults, _, config.default);
module.exports = _(config).mapObject(defaults);