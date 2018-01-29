function queryToPromise(query) {
    return new Promise((res, rej) => {
        query.exec((err, ans) => {
            if(err) rej(err);
            else res(ans);
        });
    });
}

module.exports = {
    queryToPromise: queryToPromise
};