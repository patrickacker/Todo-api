var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore'); // will refactor get/post
var db = require('./db.js')

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

// whenever json request comes in, express parses this and we can
// access via request.body
app.use(bodyParser.json()); // helps to setup middleware

// GET homepage
app.get('/', function(req, res) {
  res.send('ToDo api root');
});

// GET todos page /todos?completed=true&q=house
// Returns anything completed and description related to house
app.get('/todos', function(req, res) {
  // !!Query parameters
  var query = req.query;
  var where = {};

  // set to boolean
  if (query.hasOwnProperty('completed') && query.completed == 'true') {
    where.completed = true;
  } else if (query.hasOwnProperty('completed') && query.completed == 'false') {
    where.completed = false;
  }

  if (query.hasOwnProperty('q') && query.q.length > 0 ) {
    where.description = {
      $like: '%' + query.q + '%'
    };
  }

  db.todo.findAll({where: where}).then(function(todos){
    res.json(todos);
  }, function (e) {
    res.status(500).send();
  });

  // var queryParams = req.query;
  // var filteredToDos = todos;
  //
  // if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
  //   filteredToDos = _.where(filteredToDos, {completed: true});
  // } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
  //   filteredToDos = _.where(filteredToDos, {completed: false});
  // }
  //
  // // Query description (also helps find upper/lowercase)
  // if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
  //   filteredToDos = _.filter(filteredToDos, function(todo) {
  //     return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
  //   });
  // }
  //
  // res.json(filteredToDos);
});



// GET (by ID)
app.get('/todos/:id', function(req, res) {
  var todoId = parseInt(req.params.id, 10);

  db.todo.findById(todoId).then(function(todo){
    if (!!todo) { //2 !! makes boolean type
      res.json(todo.toJSON());
    } else {
      res.status(404).send();
    }
  }, function(e){
    res.status(500).send(); // Server error
  });

  // res.json(todo)
  // else res.status(404);

  // var matchedToDo = _.findWhere(todos, {id: todoId});
  //
  // if (matchedToDo) {
  //   res.json(matchedToDo);
  // } else {
  //   res.status(404).send();
  // }
});

// POST
app.post('/todos', function(req, res) {
  var body = _.pick(req.body, 'description', 'completed'); // Removes hacked fields - sanitized
  db.todo.create(body).then(function(todo){
    res.json(todo.toJSON());
  }).catch(function(e){
    res.status(400).json(e);
  });

  // if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0){
  //   return res.status(400).send();
  // }
  //
  // // set body.description to be trimmed value
  // body.description = body.description.trim(); // Remove spaces
  //
  // body.id = todoNextId;
  // todoNextId++;
  // todos.push(body);
  // res.json(body);
});

// DELETE /todos/:id
app.delete('/todos/:id', function(req, res) {
  var todoId = parseInt(req.params.id, 10);

  db.todo.destroy({
    where: {
      id: todoId
    }
  }).then(function(rowsDeleted) {
    if (rowsDeleted === 0) {
      res.status(404).json({
        error: 'No todo with id'
      });
    } else {
      res.status(204).send(); // Everything went well, nothing to send back
    }
  }, function() {
      res.status(500).send();
  });

  // var matchedToDo = _.findWhere(todos, {id: todoId});
  //
  // if (matchedToDo) {
  //   // Use underscore "without" to remove value
  //   todos = _.without(todos, matchedToDo);
  //   res.json(matchedToDo);
  // } else {
  //   res.status(404).send();
  // }
});

// PUT  /todos/:id
app.put('/todos/:id', function(req, res) {
  var todoId = parseInt(req.params.id, 10);
  var body = _.pick(req.body, 'description', 'completed'); // Removes hacked fields - sanitized
  var attributes = {};

  // Check to see if req has 'completed' & bool
  if (body.hasOwnProperty('completed')) {
    attributes.completed = body.completed;
  }

  if (body.hasOwnProperty('description')) {
    attributes.description = body.description;
  }

  db.todo.findById(todoId).then(function(todo) {
    if (todo) {
      todo.update(attributes).then(function(todo){
        res.json(todo.toJSON());
      }, function(e) {
        res.status(400).json(e);
      });
    } else {
      res.status(404).send();
    }
  }, function(){
    res.status(500).send(); // if failure
  });


  // var matchedToDo = _.findWhere(todos, {id: todoId});
  // var body = _.pick(req.body, 'description', 'completed'); // Removes hacked fields - sanitized
  // var validAttributes = {};
  //
  // // Check to see if found or not
  // if (!matchedToDo) {
  //   return res.status(404).send();
  // }
  //
  // // Check to see if req has 'completed' & bool
  // if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
  //   validAttributes.completed = body.completed;
  // } else if (body.hasOwnProperty('completed')){
  //   return res.status(400).send(); // tells user we need a boolean value
  // }
  //
  // if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
  //   validAttributes.description = body.description;
  // } else if (body.hasOwnProperty('description')) {
  //   return res.status(400).send();
  // }
  //
  // // Override properties in destination
  // _.extend(matchedToDo, validAttributes);
  // res.json(matchedToDo);
});

db.sequelize.sync().then(function(){
  app.listen(PORT, function() {
    console.log('Express listening on port ' + PORT);
  });
});
