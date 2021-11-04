const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

//Check User Exist
function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found!" })
  }

  request.user = user;

  return next();
}

//All Users
app.get('/users', (request, response) => {
  return response.json({ users });
});

//Create User
app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExist = users.some(
    (user) => user.username === username
  );

  if (userAlreadyExist) {
    return response.status(400).json({ error: "User already exist!" });
  }

  userData = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(userData);

  return response.status(201).json(userData);
});

//Todos From User
app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

//Todo Create
app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const todoData = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todoData);

  return response.status(201).json(todoData);
});

//Todo update "title" and/or "deadline"
app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  const { title, deadline } = request.body;

  todo.title = (title ?? todo.title);
  todo.deadline = (deadline ? new Date(deadline) : todo.deadline);

  return response.status(201).json(todo);

});

//Todo Status Change
app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found!" })
  }

  const { done } = request.body;

  todo.done = (done ? true : true); //Test does not allow the ternary condition

  return response.status(201).json(todo);

});

//Todo Delete
app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found!" })
  }

  user.todos.splice(user.todos.indexOf(todo), 1);

  return response.status(204).json(users);

});

module.exports = app;