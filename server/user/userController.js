// User controller to sign in/up, log in/out users. Use bcrypt to hash/salt

var Users = require('../../db/index');
var bcrypt = require('bcrypt-nodejs');
var path = require('path');
var Promise = require('bluebird');
// var bodyParser = require('body-parser');

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.clearCookie('u_id');
    res.redirect('/#/');
  });
};

exports.signInUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  Users.findOne({ where: 
    { username: username }
  })
  .then(function (user){
    // bcrypt.compare(password, user.password, function(err, result) {
    //   if (result) {
    //     req.session.regenerate(function(){
    //       req.session.user = username;
    //       console.log(req.session);
    //       res.redirect('/#/dashboard');
    //     });
      if (user.password === password) {
        res.cookie('u_id', user.id);
        res.redirect('/#/dashboard');
      } else {
        console.log('wrooooong password or log in!');
        res.redirect('/#/signin');
      }
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
      res.cookie('u_id', user.id);
      res.redirect('/#/profile');
    }
    if (!user) {
      Users.create({
          username: username,
          password: password
          // firstname: req.body.firstname, //add later?
          // lastname: req.body.lastname, //add later?
          // native: req.body.native, //add later?
          // desired: req.body.desired //add later?
        })
        .complete(function (err, user) {
          if (!!err) {
            console.log('An error occurred while creating the table: user.create', err);
          } else {
            console.log('User created: ', user.username);
            res.cookie('u_id', user.id);
            res.redirect('/#/profile');
          }
        });
    }
  })
  .catch(function (err) {
    console.log('a signup error occurred: ' + err);
    res.redirect('../../client/signin.html');
  });
};

exports.saveProfile = function (req, res) {
  console.log(req.body);
  res.sendStatus('/#/dashboard');
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
