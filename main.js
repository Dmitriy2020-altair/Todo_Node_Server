'use strict';

class TodoModel {
	constructor() {
		this._todos;
		this._subscribers = [];
		this._writeMode = false;
	}

	toggleTodoWriteble(todoId) {
		const todo = this._todos.find(todo => todo.id === +todoId);
		const todoIndex = this._todos.findIndex(todo => todo.id === +todoId);
		if (todoIndex === -1) return;
		const newTodos = this._todos.slice();

		this._writeMode = true;

		newTodos[todoIndex].isWriteble = true;

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
	constructor(containerId, model) {
		this.container = document.getElementById(containerId);
		this.dispatch;
		this.model = model;
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
				type: 'ADD-TODO', payload: input.value
			})
		}
		if (editBtn) this.dispatch({ type: 'TOGGLE-TODO-WRITEBLE', payload: todoId });
		if (agreeBtn) {
			const todoItem = target.closest('.todo-item');
			const todoTitle = todoItem.querySelector('.todo-title');

			this.dispatch({
				type: 'CHANGE-TODO-TILE', payload: {
					todoId: todoId,
					newTitle: todoTitle.value,
				}
			})
		}

	}

	render() {
		const todos = this.model._todos;
		const writeMode = this.dispatch({ type: 'GET-WRITEMODE' });

		this.container.innerHTML = (`
		<input type="text" class="todo-input" placeholder="Create your todo">
		<button ${writeMode && 'disabled'} class="btn todo-pushbtn">Push</button>
		<ul class="todo-list">${(todos.length) ? (
				todos.map((todo, index) => (`

				<li class="todo-item" item="${todo.id}">
					<span class="todo-num">${index + 1}</span>${(todo?.isWriteble) ? (`
					<input autofocus class="todo-title" type="text" value = "${todo.title}" >
					`) : (`<span class="todo-title ${todo.isDone && 'done'}">${todo.title}</span>`)

					}${(writeMode && todo?.isWriteble) ? (`
						<button class="btn todo-edited">agree</button>
					`)
						:
						(`<button ${(writeMode && !todo?.isWriteble) && 'disabled'} class="btn todo-editbtn">edit</button>`)


					}<button ${writeMode && 'disabled'} class="btn todo-choosenbtn">done</button>
					<button ${writeMode && 'disabled'} class="btn todo-deletebtn">delete</button>
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

		fetch('http://127.0.0.1:3000/api/todos')
			.then(data => data.json())
			.then(data => {
				this.model._todos = data;
				this.view.render();

			})
			.catch(err => console.log(err));

	}

	dispatch = (action) => {

		const model = this.model;

		switch (action.type) {

			case 'ADD-TODO': {
				req('http://127.0.0.1:3000/api/todos', { title: action.payload })
					.then(data => {
						this.model._todos = data;
						this.view.render();
					})
				break;
			}

			case 'REM-TODO': {
				req(`http://127.0.0.1:3000/api/todos/${action.payload}`, null, {
					method: 'DELETE',
					headers: {}
				})
					.then(data => {
						this.model._todos = data;
						this.view.render();
					})
				break;

			}

			case 'TOGGLE-TODO-ISDONE': {
				reqGet(`http://127.0.0.1:3000/api/todos/checked/${action.payload}`)
					.then(data => {
						this.model._todos = data;
						this.view.render();
					})
				break;
			}
			case 'TOGGLE-TODO-WRITEBLE':
				model.toggleTodoWriteble(action.payload);
				break;

			case 'GET-WRITEMODE':
				return model.getWriteMode();

			case 'CHANGE-TODO-TILE': {
				this.model._writeMode = false;
				fetch(`http://127.0.0.1:3000/api/todos/edit/${action.payload.todoId}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ enteredTitle: action.payload.newTitle })
				})
					.then(data => data.json())
					.then(data => {
						this.model._todos = data;
						this.view.render();
					});
				break;

			}


			default: return;
		}
	}
}

async function req(url, body, config) {
	const res = await fetch(url, Object.assign({
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	}, config))
		.then(data => data.json());

	return res;
}

async function reqGet(url) {
	const res = await fetch(url)
		.then(data => data.json());

	return res;
}


const model = new TodoModel();

const todo = new TodoController(model, new TodoView('todo', model));