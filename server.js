var express = require('express'); 
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var crypto = require('crypto');
var Guid = require('node-uuid');
var session = require('express-session');
var path = require('path');
var io = require('socket.io')(http);
var Promise = require('bluebird');
var User = require('./server/user/userController');
var Users = require('./db/index');
var passport = require('./server/facebookSignin.js');

var port = process.env.PORT || 3000;
var host = process.env.host || '127.0.0.1';

app.use(express.static(__dirname));
app.use(cookieParser('shhhh, very secret'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(session({
  secret: 'secret',
  resave: false,
  key: 'event.sid',
  name: 'event.sid',
  saveUninitialized: false
}));


var users = {}; // server session store
var clients = {}; // socket session store
var MemoryStore = session.MemoryStore;

app.sessionStore = new MemoryStore();

io.on('connection', function (socket) {
  var session_id; //declare var in outer scope so disconnect function has access to this variable
  var socket_id; //same as above

  //Creates the key-value pair for session ID and socket ID
  cookieParser('secret')(socket.handshake, null, function () { 
    session_id = socket.handshake.cookies['connection.id'] || Guid.v4();
    socket_id = socket.id;
    app.sessionStore[session_id] = socket_id;
    socket.emit('session', session_id);
  });

  socket.on('end', function (userId) {
    var socketId = app.sessionStore[User.userTable[userId]];
    socket.to(socketId).emit('close', userId);
  });

  socket.on('connectionreq', function (data) {
    console.log("User Table: ", User.userTable);
    var socketId = app.sessionStore[User.userTable[data.u_id]];
    var mySocket = app.sessionStore[User.userTable[data.my_id]];
    console.log('App Session Store: ', app.sessionStore);

    var newRoom = crypto.pseudoRandomBytes(256).toString('base64');
    var contents = {
      room: newRoom,
      u_id: data.u_id,
      my_id: mySocket
    };
    socket.to(socketId).emit('connecting', contents);
  });

  socket.on('roomRequest', function (data) {
    socket.to(data.my_id).emit('joinRoom', data.room);
  });
  
});

http.listen(port, function () {
  console.log('Server now listening on port ' + port);
});

app.set('views', __dirname);


app.get('/', function (req, res) {
  res.sendFile(__dirname, '/index.html'); //home page
});

app.post('/signup', User.signUpUser);
app.post('/signin', User.signInUser);

app.post('/api/updateNative', User.setNative);
app.post('/api/updateNativeRating', User.setNativeRating);
app.post('/api/updateDesired', User.setDesired);

app.get('/api/initialGet', User.initialGet);

app.get('/logout', User.logoutUser);
app.post('/logout', User.signInUser);

app.get('/profile', function (req, res) {
  res.sendFile(path.join(__dirname, '/client/profile.html'));
});
app.post('/api/profile', User.saveProfile);


//Passport facebook auth
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'user_birthday', 'user_likes'] }));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/#/login'}), function (req, res) {
  User.setUser(req.user.displayName)
    .then(function (user) {
      res.cookie('u_id', user.id); 
    })
    .then(function () {
      res.redirect('/#/dashboard'); //redirect them to their dashboard
    })
    .catch(function () {
      res.redirect('/#/signin');
    });
});

module.exports = app;
