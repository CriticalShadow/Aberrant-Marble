// User controller to sign in/up, log in/out users. Use bcrypt to hash/salt

var Users = require('../../db/index');
var bcrypt = require('bcrypt-nodejs');
var path = require('path');
var Promise = require('bluebird');
var app = require('../../server.js');
var cookieParser = require('cookie-parser');
var session = require('express-session');
// var bodyParser = require('body-parser');

exports.logoutUser = function (req, res) {
  req.session.destroy(function (){
    res.clearCookie('u_id');
    res.redirect('/#/');
  });
};

exports.userTable = {};

exports.signInUser = function (req, res) {
  var username = req.body.username;
  var password = req.body.password;

  console.log(req.headers.cookie);

  Users.find({ where: 
    { username: username }
  })
  .complete(function (err, user) {
    if (err) {
      console.log('error searching the db', err);
      return;
    }
    bcrypt.compare(password, user.password, function (err, result) {
      if (result) {
          res.cookie('u_id', user.id);
          console.log('req.headers', req.headers);
          var parsedCookie = req.headers.cookie ? req.headers.cookie.split('event.sid=s%3A')[1].split('.')[0] : null;
          exports.userTable[user.id] = parsedCookie;
          res.cookie('connection.id', parsedCookie);
          console.log(exports.userTable);
          res.redirect('/#/dashboard');
      } else {
        console.log('wrooooong password or log in!');
        res.redirect('/#/signin');
      }

    });
  })
  .catch(function(err) {
    console.log('user doesnt exist');
    res.redirect('/#/');
  });
};

exports.signUpUser = function (req, res) {
  var username = req.body.username;
  var password = req.body.password;


  Users.findOne({ where : { 
    username: username }
  })
  .then(function(user) {
    if (user) {
      res.redirect('/#/signin');
    }
    if (!user) {
      bcrypt.genSalt(10, function (error,result) {
        bcrypt.hash(password, result, null, function (err, hash) {
          Users.create({
              username: username,
              salt: result,
              password: hash
              // firstname: req.body.firstname, //add later?
              // lastname: req.body.lastname, //add later?
              // native: req.body.native, //add later?
              // desired: req.body.desired //add later?
            })
            .complete(function (err, user) {
              if (!!err) {
                console.log('An error occurred while creating the table: user.create', err);
              } else {
                res.cookie('u_id', user.id);
                res.redirect('/#/profile');
              }
            });
        });
      });
    }
  })
  .catch(function (err) {
    console.log('a signup error occurred: ' + err);
    res.redirect('/#/signin');
  });
};

exports.saveProfile = function (req, res) {
  var userID = req.cookies.u_id;
  console.log('prof here: ' + req.body.nativeLangs.prof);
  console.log(typeof req.body.nativeLangs.prof);

  Users.findOne({ where : { 
    id: userID }
  })   
  .on('success', function(user){
    if(user){
      user.updateAttributes({
        firstname: req.body.firstName,
        lastname: req.body.lastName,
        native: req.body.nativeLangs.lang,
        desireLang: req.body.desiredLangs.lang,
        nativeRating: req.body.nativeLangs.prof
        }) 
    }
    if(!user){
      console.log('could not find user with this ID');
    }
  })
  .complete(function (err, user) {
    if (!!err) {
      console.log('An error occurred while creating the table: user.create', err);
    } else {
      res.redirect('/#/dashboard');
    }
  });
}

exports.setUser = function (username) {
  return new Promise(function (resolve, reject) {
    var name = username;
    // check to see whether or not the user exists already
    Users
    .find({ where: {
      username: name}
    })
    .complete(function (err, user) {
      if (err) {
        console.log(err);
        return err;
      } else if (user === null) { 
        // if the user is not found in the db, then we create the user
        Users.create({
          username: name
        })
        .complete(function (err, user) {
          if (err) { 
            console.log(err)
          } else {
            // send the user info back to the server
            resolve(user);
          }
        });  
      } else { 
        // send the user info back to the server
        resolve(user);
      }
    });
  });
};

exports.setNative = function (req, res) {
  var userID = req.cookies.u_id;
  var newNativeLang = req.body.msg;

  Users.findOne({ where : { 
    id: userID }
  })   
  .on('success', function(user){
    if(user){
      user.updateAttributes({
        native: newNativeLang
        }) 
    }
    if(!user){
      console.log('could not find user with this ID');
    }
  })
  .complete(function (err, user) {
    if (!!err) {
      console.log('An error occurred while creating the table: user.create', err);
    }
  });
}

exports.setNativeRating = function (req, res) {
  var userID = req.cookies.u_id;
  var newNativeRating = req.body.msg;

  Users.findOne({ where : { 
    id: userID }
  })   
  .on('success', function(user){
    if(user){
      user.updateAttributes({
        nativeRating: newNativeRating
        }) 
    }
    if(!user){
      console.log('could not find user with this ID');
    }
  })
  .complete(function (err, user) {
    if (!!err) {
      console.log('An error occurred while creating the table: user.create', err);
    }
  });
};

exports.setDesired = function (req, res) {
  var userID = req.cookies.u_id;
  var newDesired = req.body.msg;

  Users.findOne({ where : { 
    id: userID }
  })   
  .on('success', function(user){
    if(user){
      console.log('setting desired now');
      user.updateAttributes({
        desireLang: newDesired
        }) 
    }
    if(!user){
      console.log('could not find user with this ID');
    }
  })
  .complete(function (err, user) {
    if (!!err) {
      console.log('An error occurred while querying the table: ', err);
    } else {
      console.log('made it to newDesired query!')
      Users
      .findAll({ where: {native: newDesired}})
      .complete(function(err, results){
        if(err){
          console.log('error querying');
          return;
        } else if (results === null){
          console.log('no matches');
        } else {
          for (var i = 0; i < results.length; i++) {
            console.log('RESULTS!!!: ', results[i].dataValues);
          }
        }
      });
    }
  });
};



