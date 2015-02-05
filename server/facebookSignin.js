// Using passport (http://passportjs.org/guide/facebook/) to authenticate users from Facebook.

var Users = require('../db/index');

var passport = require('passport'), FacebookStrategy = require('passport-facebook').Strategy; 

//serialize and deserialize are used for sessions
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

//TODO: REFACTOR OUT THE USER MODEL CREATION TO BE HANDLED IN SERVER.JS SO APPROPRIATE REDIRECT CAN HAPPEN FOR NEW VS. OLD USERS
passport.use(new FacebookStrategy({
    clientID: 1006036516092054,
    clientSecret: '6cffbe530d47734d27c2be8754f3481e',
    callbackURL: "http://localhost:3000/auth/facebook/callback",
  },
  function(accessToken, refreshToken, profile, done) {
    var profileIdString = profile.id.toString();

    process.nextTick(function () { 
      Users.findOne({where: { facebookId: profileIdString }})
      .then(function(user) {
        if (user) {
          done(null, profile);    
        } else {
          Users.create({ 
            username: profile.name.givenName + profile.name.familyName,
            facebookId: profile.id,
            firstname: profile.name.givenName,
            lastname: profile.name.familyName
          });
          done(null, profile);
        }
      })
      // .then(function(user){
      //   console.log("testing"+user);
      // });
    });
  }
));

module.exports = passport;
