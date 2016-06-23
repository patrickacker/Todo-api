var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
  'dialect': 'sqlite', // tells which DB type we want to use
  'storage': __dirname + '/basic-sqlite-database.sqlite'
});

// Define the model
var Todo = sequelize.define('todo', {
  description: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      len: [1, 250]
    }
  },
  completed: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
});

// Force true wipes database and starts from scratch
sequelize.sync({force: false}).then(function(){
  console.log('Everything is synced');

  // FInd item by id
  //  if found, print
  //  if cant find it log "cannot find"

  Todo.findById(3).then(function(todo) {
    if (todo) {
      console.log(todo.toJSON());
    } else {
      console.log('To do not found');
    }

  });


  // // Make a new insertion (returns a promise)
  // Todo.create({
  //   description: 'Take out trash',
  //   completed: false
  // }).then(function(todo){
  //   return Todo.create({
  //     description: 'clean office'
  //   }).then(function() {
  //     return Todo.findAll({
  //       where: {
  //         description: {
  //           $like: '%Office%'
  //         }
  //       }
  //     });
  //   }).then(function(todos){
  //       if (todos) {
  //         todos.forEach(function(todo){
  //           console.log(todo.toJSON());
  //         });
  //
  //       } else {
  //         console.log('No to do found.');
  //       }
  //   });
  // }).catch(function(e){
  //   console.log(e);
  // });
});
