// User controller to sign in/up, log in/out users. Use bcrypt to hash/salt

var Users = require('../../db/index');
var bcrypt = require('bcrypt-nodejs');
var path = require('path');
// var bodyParser = require('body-parser');

exports.signUpUserForm = function(req, res) {
  res.redirect('../../client/signup.html');
};

exports.signInUserForm = function(req, res) {
  res.redirect('../../client/signin.html');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/signin');
  });
};

exports.signInUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  Users.findOne({ where: 
    { username: username }
  })
  .then(function(user){
    bcrypt.compare(password, user.password, function(err, result) {
      if (result) {
        req.session.regenerate(function(){
          req.session.user = username;
          console.log(req.session.user);
          res.redirect('/');
        });
      } else {
        console.log('wrooooong password or log in!');
        res.redirect('../../client/signin.html');
      }
    });
  })
  .catch(function(err) {
    console.log('user doesnt exist');
    res.redirect('../../client/signin.html');
  });
};

exports.signUpUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  Users.findOne({ where : { 
    username: username }
  })
  .then(function(user) {
    if (user) {
      res.redirect('/profile');
    }
    if (!user) {
      bcrypt.genSalt(10, function(error,result) {
        bcrypt.hash(password, result, null, function(err, hash) {
          Users.create({
              username: username,
              salt: result,
              password: hash
              // firstname: req.body.firstname, //add later?
              // lastname: req.body.lastname, //add later?
              // native: req.body.native, //add later?
              // desired: req.body.desired //add later?
            })
            .complete(function(err, user) {
              if (!!err) {
                console.log('An error occurred while creating the table: user.create', err);
              } else {
                console.log('User created: ', user.username);
                res.redirect('/profile');
              }
            });
        });
      });
    }
  })
  .catch(function(err) {
    console.log('a signup error occurred: ' + err);
    res.redirect('../../client/signin.html');
  });
};

exports.createProfile = function (req, res) {
  res.sendFile(path.join(__dirname , '../../client/profile.html'));
}

exports.saveProfile = function (req, res) {
  console.log(req.body);
  res.sendStatus(201);
}