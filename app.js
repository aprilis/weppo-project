var express = require('express')
    , app = express()
    , session = require('express-session')
    , cookieParser = require('cookie-parser')
    , bodyParser = require('body-parser')
    , path = require('path')
    , favicon = require('serve-favicon')
    , logger = require('morgan')
    , passport = require('./config/passport.js')
    , mongo = require('./config/mongo.js')
    , settings = require('./config/settings.js')

var sessionStore = new session.MemoryStore();

// Export some variables so that they are shared across files.
app.sessionStore = sessionStore;
app.cookieParser = cookieParser;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    key: 'connect.sid',
    store: sessionStore,
    secret: settings.secret,
    //cookie: { maxAge: 60000, secure: false },
    resave: false,
    saveUninitialized: false
}));

// Mongo setup
mongo.init();

// Passport setup
passport.init(app);

// Set up routing
var routes = require('./routes/index')
    , games = require('./routes/games')
    , signup = require('./routes/signup')
    , login = require('./routes/login')
    , logout = require('./routes/logout')
    , testing = require('./routes/testing')
    , upload = require('./routes/upload')
    , submit = require('./routes/submit')
    , instructions = require('./routes/instructions')
    , updateUser = require('./routes/updateUser')
    , about = require('./routes/about');

// Routes
app.use(express.static(path.join(__dirname, 'public')));
app.use('/ace-builds', express.static(path.join(__dirname, 'node_modules', 'ace-builds')));
app.use('/', routes);
app.use('/signup', signup);
app.use('/login', login);
app.use('/logout', logout);
app.use('/games', games);
app.use('/testing', testing);
app.use('/upload', upload);
app.use('/submit', submit);
app.use('/instructions', instructions);
app.use('/updateUser', updateUser);
app.use('/about', about);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
