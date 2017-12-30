// This file contains some useful snippets of code that might be used in the future implementations.
// Sets up a session store with Redis
var RedisStore = require('connect-redis')(session);
var redis = require("redis").createClient();
var sessionStore = new RedisStore;//({client: redis});


var bundle = require('socket.io-bundle');
var ioPassport = require('socket.io-passport');

io.use(bundle.cookieParser());
io.use(bundle.session({
  secret: 'secret',
  store: require('../app').sessionStore,
}));
io.use(ioPassport.initialize());
io.use(ioPassport.session());

// Socket connection
var sessionStore = new redisStore();


io.use(passportSocketIo.authorize({
  key: 'connect.sid',
  secret: process.env.SECRET_KEY_BASE,
  cookie: { maxAge: 60000, secure: false },
  store: sessionStore,
  //passport: passport,
  cookieParser: cookieParser
}));


// another socket trying
if (socket.handshake && socket.handshake.headers && socket.handshake.headers.cookie) {
    var raw = cookie.parse(socket.handshake.headers.cookie)['connect.sid'];
    if (raw) {
        socket.sessionId = signature.unsign(raw.slice(2), secret);
    }
  }
  if (socket.sessionId) {
      store.get(socket.sessionId, function(err, session) { // ERROR HERE!!!
          if (session) { 
              // here we should be able to access:
              // session.passport.user.userName and other properties!
              console.log(session.passport.user);
          }
      });
  }