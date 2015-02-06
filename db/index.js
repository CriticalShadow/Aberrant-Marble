// Use sequelize as our ORM. Currently just a user table is needed

var Sequelize = require('sequelize');

var host = 'localhost';
var port = 3306;

var db = {};

//dev vs prod credentials
if (process.env.languageappdb) {
  db.sequelize = new Sequelize('languageapp', 'aberrantmarble', 'hr23greenfield', {
    host: process.env.languageappdb,
    port: process.env.languageappdbport,
    dialect: 'mysql'
  });  
} else { db.sequelize = new Sequelize('languageapp', 'root', '', {
  dialect: 'mysql'
});
}

db.sequelize
  .authenticate()
  .complete(function(err) {
    if (!!err) {
      console.log('Unable to connect to the database:', err);
    } else {
      console.log('Connection has been established successfully');
    }
  });

db.User = db.sequelize.define('User', {
  username: Sequelize.STRING,
  facebookId: Sequelize.STRING,   // string bc facebookIds are larger than largest integer value allowed (2147483647 will be used for all FB ids otherwise)
  firstname: Sequelize.STRING,
  lastname: Sequelize.STRING,
  password: Sequelize.STRING,
  // salt: Sequelize.STRING,
  desireLang: Sequelize.STRING,
  native: Sequelize.STRING,
  nativeRating: Sequelize.STRING
});

// db.Language = db.sequelize.define('Language', {
//   languages: Sequelize.STRING,
// });
// // pre-populate languages table
// db.Language
//   .create({
//     languages: 'English'
//   })
// db.Language
//   .create({
//     languages: 'Chinese'
//   })
// db.Language
//   .create({
//     languages: 'Spanish'
//   })
// db.Language
//   .create({
//     languages: 'French'
//   })
// db.Language
//   .create({
//     languages: 'Italian'
//   })


db.sequelize
  .sync()
  .complete(function(err) {
    if (!!err) {
      console.log('An error occurred while creating the table: user.sync', err);
    } else {
      console.log('Table created!');
      }
    });


// User
//   .create({
//     username: 'aberrantmarble',
//     firstname: 'aberrant',
//     lastname: 'marble',
//     password: 'password',
//     desired: 'english',
//     native: 'english'
//   })
//   .complete(function(err, user) {
//     if (!!err) {
//       console.log('An error occurred while creating the table: user.create', err);
//     } else {
//       console.log('User created: ', user);
//     }
//   });

module.exports = db.User;