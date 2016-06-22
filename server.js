var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore'); // will refactor get/post

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

// whenever json request comes in, express parses this and we can
// access via request.body
app.use(bodyParser.json()); // helps to setup middleware

app.get('/', function(req, res) {
  res.send('ToDo api root');
});

app.get('/todos', function(req, res) {
  res.json(todos);
});

app.get('/todos/:id', function(req, res) {
  var todoId = parseInt(req.params.id, 10);
  var matchedToDo = _.findWhere(todos, {id: todoId})

  if (matchedToDo) {
    res.json(matchedToDo);
  } else {
    res.status(404).send();
  }
});

app.post('/todos', function(req, res) {
  var body = _.pick(req.body, 'description', 'completed'); // Removes hacked fields - sanitized

  if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0){
    return res.status(400).send();
  }

  // set body.description to be trimmed value
  body.description = body.description.trim(); // Remove spaces

  body.id = todoNextId;
  todoNextId++;
  todos.push(body);
  res.json(body);
});


app.listen(PORT, function() {
  console.log('Express listening on port ' + PORT);
});
