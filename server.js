const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const todos = {
	maxId: 2,
	data: [
		{ id: 1, title: 'Learn JavaScript', isDone: false, isWriteble: false },
		{ id: 2, title: 'Sanek rulit in JavaScript', isDone: false, isWriteble: false },

	]
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(cors());

app.get('/api/todos', (req, res) => {

	res.send(JSON.stringify(todos.data));
});

app.listen(3000, () => console.log('All good, we are on port 3000'));

app.post('/api/todos', (req, res) => {
	todos.data.push({ id: todos.maxId + 1, title: req.body.title, isDone: false });
	todos.maxId++;
	res.send(JSON.stringify(todos.data));
});

app.delete('/api/todos/:id', (req, res) => {
	const id = Number(req.params.id);
	todos.data = todos.data.filter(todo => todo.id !== id);
	res.send(JSON.stringify(todos.data));
});

app.get('/api/todos/checked/:id', (req, res) => {
	const id = +req.params.id;
	const todoIndex = todos.data.findIndex(todo => todo.id === id);

	if (todoIndex === -1) res.sendStatus('404');
		
	todos.data[todoIndex].isDone = !todos.data[todoIndex].isDone;
	res.send(JSON.stringify(todos.data));
});

app.put('/api/todos/edit/:id', (req, res) => {
	const id = +req.params.id;
	const todoIndex = todos.data.findIndex(todo => todo.id === id);

	if (todoIndex === -1) res.sendStatus('404');

	todos.data[todoIndex].title = req.body.enteredTitle;
	res.send(JSON.stringify(todos.data));
});