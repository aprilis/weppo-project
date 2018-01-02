const { build } = require('./builder');

const sub = {
    type : 'game',
    code : `#include <bits/stdc++.h> 
            using namespace std; 

            int main () { 
                cout << 1;
            } `,
    username : 'hazus',
    gamename : 'cross',
    language : 'cpp'
};

options = {};

build(sub, options).then(console.log);