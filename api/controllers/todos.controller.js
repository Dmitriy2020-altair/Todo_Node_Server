const todos = {
	maxId: 2,
	data: [
		{ id: 1, title: 'Learn JavaScript', isDone: false, isWriteble: false },
		{ id: 2, title: 'Move forward in JavaScript', isDone: false, isWriteble: false },
	]
}

const getTodos = () => {
    return todos.data
}

const checkTodo = (id) => {
	const todoIndex = todos.data.findIndex(todo => todo.id === id);

	if (todoIndex === -1) {
        throw new Error(`Todo with id: ${id}, is not exist`)
    }
		
    todos.data[todoIndex].isDone = !todos.data[todoIndex].isDone;
    return todo.data
}

const addTodo = (title) => {
    if (!title) {
        throw new Error(`You need to provide title`)
    }
    const newTodo = { id: todos.maxId + 1, title, isDone: false }
	todos.data = [...todos.data, newTodo];
    todos.maxId++;
    return todos.data
}

const updateTodo = (id, newTitle) => {
    const todoIndex = todos.data.findIndex(todo => todo.id === id);
    
	if (todoIndex === -1) {
        throw new Error(`Todo with id: ${id}, is not exist`)
    }

	todos.data[todoIndex].title = newTitle;
}

const deleteTodo = (id) => {
    try {
        todos.data = todos.data.filter(todo => todo.id !== id);
        return todos.data
    } catch (err) {
        throw new Error()
    }
}

module.exports = {
    getTodos,
    checkTodo,
    addTodo,
    updateTodo,
    deleteTodo
}