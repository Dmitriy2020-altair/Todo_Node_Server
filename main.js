'use strict';

class TodoModel {
	constructor(todo = []) {
		this._todos = todos;
		this._subscribers = [];
		this._writeMode = false;

		this.notify();
	}

	addTodo(todo) {
		const copyOfTodos = this._todos.slice();

		copyOfTodos.push(todo);

		this._todos = copyOfTodos;
		this.notify();
	}

	removeTodo(todoId) {
		const newTodos = this._todos.filter(todo => todo.id !== todoId);

		this._todos = newTodos;
		this.notify();
	}

	toggleTodoDone(todoId) {
		const todo = this._todos.find(todo => todo.id === todoId);
		const todoIndex = this._todos.findIndex(todo => todo.id === todoId);
		const newTodos = this._todos.slice();

		newTodos[todoIndex].isDone = !todo.isDone;

		this._todos = newTodos;
		this.notify();
	}

	toggleTodoWriteble(todoId) {
		const todo = this._todos.find(todo => todo.id === todoId);
		const todoIndex = this._todos.findIndex(todo => todo.id === todoId);
		const newTodos = this._todos.slice();

		if (todo.isWriteble === false) {
			this._writeMode = true;
		} else {
			this._writeMode = false;
		}

		newTodos[todoIndex].isWriteble = !todo.isWriteble;

		this._todos = newTodos;
		this.notify();
	}

	changeTodoTitle({todoId, newTitle}) {
		const todo = this._todos.find(todo => todo.id === todoId);
		const todoIndex = this._todos.findIndex(todo => todo.id === todoId);
		const newTodos = this._todos.slice();

		newTodos[todoIndex].title = newTitle;
		newTodos[todoIndex].isWriteble = false;

		this._writeMode = false;
		this._todos = newTodos;
		this.notify();
	}

	notify() {
		this._subscribers.forEach(sub => sub());
	}

	subscribe(callback) {
		this._subscribers.push(callback);
	}

	getTodos() {
		return this._todos;
	}

	getWriteMode() {
		return this._writeMode;
	}

}

class TodoView {
	constructor(containerId) {
		this.container = document.getElementById(containerId);
		this.dispatch;
		this.container.addEventListener('click', this.handleclick);
	}

	handleclick = (event) => {
		const target = event.target;
		const todoId = target?.closest('.todo-item')?.getAttribute('item');

		const input = this.container.querySelector('.todo-input');
		const deleteBtn = target.closest('.todo-deletebtn');
		const choosenBtn = target.closest('.todo-choosenbtn');
		const editBtn = target.closest('.todo-editbtn');
		const todoPushBtn = target.closest('.todo-pushbtn');
		const agreeBtn = target.closest('.todo-edited')

		if (deleteBtn) this.dispatch({ type: 'REM-TODO', payload: todoId });
		if (choosenBtn) this.dispatch({ type: 'TOGGLE-TODO-ISDONE', payload: todoId });
		if (todoPushBtn) {
			if (input.value === '') return;

			this.dispatch({
				type: 'ADD-TODO', payload: {
				id: (new Date().toJSON()),
				isDone: false,
				title: input.value,
				isWriteble: false,
				}
			})
		}
		if (editBtn) this.dispatch({ type: 'TOGGLE-TODO-WRITEBLE', payload: todoId });
		if (agreeBtn) {
			const todoItem = target.closest('.todo-item');
			const todoTitle = todoItem.querySelector('.todo-title')

			this.dispatch({
				type: 'CHANGE-TODO-TILE', payload: {
				todoId: todoId,
				newTitle: todoTitle.value,
			} })
		}

	}

	render() {
		const todos = this.dispatch({ type: 'GET-TODOS' });
		const writeMode = this.dispatch({ type: 'GET-WRITEMODE' });
		
		this.container.innerHTML = (`
		<input type="text" class="todo-input" placeholder="Create your todo">
		<button class="todo-pushbtn">Push</button>
		<ul class="todo-list">${
			
			(todos.length) ? (
				todos.map((todo, index) => (`

				<li class="todo-item" item=${ todo.id }>
					<span class="todo-num">${ index + 1}</span>${
					(todo.isWriteble) ? (`
					<input class="todo-title" type="text" value = "${ todo.title }" >
					`) : (`<span class="todo-title ${ todo.isDone && 'done' }">${ todo.title }</span>`)
		
					}${ 
					
					(writeMode && todo.isWriteble) ? (`
					<button class="todo-edited">agree</button>
					`)
					:
					(`<button ${ (writeMode && !todo.isWriteble) && 'disabled' } class="todo-editbtn">edit</button>`)

					
					}<button ${ writeMode && 'disabled'} class="todo-choosenbtn">done</button>
					<button ${ writeMode && 'disabled'} class="todo-deletebtn">delete</button>
				</li>	
				
			`)).join('')
		)
		:
		(`<h2 class="subtitle-warning">No time to chill, let's do something!</h2>`)

		}</ul>
		`)
	}

}

class TodoController {
	constructor(model, view) {
		this.model = model;
		this.view = view;

		this.model.subscribe(() => {
			this.view.render();
		});

		this.view.dispatch = this.dispatch;

		this.view.render();
	}

	dispatch = (action) => {

		const model = this.model;

		switch (action.type) {

			case 'ADD-TODO':
				model.addTodo(action.payload);
				break;
			
			case 'REM-TODO':
				model.removeTodo(action.payload);
				break;
			
			case 'TOGGLE-TODO-ISDONE':
				model.toggleTodoDone(action.payload);
				break;
			
			case 'TOGGLE-TODO-WRITEBLE':
				this.model.toggleTodoWriteble(action.payload);
				break;
			case 'GET-TODOS':
				return model.getTodos();
			
			case 'GET-WRITEMODE':
				return model.getWriteMode();
			
			case 'CHANGE-TODO-TILE':
				model.changeTodoTitle(action.payload)
			
			default: return;
		}
	}
}

const todos = [
	{id: '1', title: 'Learn JavaScript', isDone: false, isWriteble: false},
]

const todo = new TodoController(new TodoModel(todos), new TodoView('todo'));