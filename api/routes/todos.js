const express = require('express');
const { getTodos, checkTodo, updateTodo, addTodo, deleteTodo } = require('../controllers/todos.controller');
const router = express.Router()


router.get('/todos', (req, res) => {
	const todos = getTodos()
	res.send(todos);
});

router.get('/todos/checked/:id', (req, res) => {
	try {
		const todos = checkTodo(req.params.id)
		res.send(todos);
	} catch(err) {
		res.status(400).send({error: err.message})
	}
});


router.post('/todos', (req, res) => {
	try {
		const todos = addTodo(req.body.title)
		res.send(todos);
	} catch (err) {
		res.status(400).send({error: err.message})
	}
});

router.put('/todos/edit/:id', (req, res) => {
	try {
		const todos = updateTodo(req.params.id, req.body.newTitle)
		res.send(todos)
		
	} catch (err) {
		res.status(400).send({error: err.message})
	}
});

router.delete('/todos/:id', (req, res) => {
	try {
		const todos = deleteTodo(req.params.id)
		res.send(todos);
	} catch (err) {
		res.status(400).send({error: err.message})
	}
});


module.exports = router