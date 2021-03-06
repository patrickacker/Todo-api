// CREATES DB AND IMPORTS MODELS
// load all modules into sequelize, then return this DB connection to server.js
// Server.js will call this file and it can use the db right inside of the API requests
var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var sequelize;

// ONly true when on Heroku
if (env === 'production') {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres'
  });
} else { // NOT in production
  sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite', // tells which DB type we want to use
    'storage': __dirname + '/data/dev-todo-api.sqlite'
  });
}

// db object to be exported
var db = {}; // Common practice so we can return multiple items from file via export

// Create models (located in object above)
db.todo = sequelize.import(__dirname + '/models/todo.js');
db.user = sequelize.import(__dirname + '/models/user.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
