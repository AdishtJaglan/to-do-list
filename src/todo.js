import { v1 as uuidv1, validate as uuidValidate } from 'uuid';
import { format, eachDayOfInterval, isWithinInterval } from 'date-fns';
import clearMainContent from './clear';
import deleteIcon from './images/delete-icon-2.svg';
import expandIcon from './images/expand.svg';

export class Todos {
    constructor(title, description, dueDate, priority, projectName) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.projectName = projectName;
    }

    static newTodo(title, description, dueDate, priority, projectName) {
        const todo = new Todos(title, description, dueDate, priority, projectName);

        return todo;
    }

    static displayTodo(todoObj, id) {
        const todoContainer = document.querySelector("#todos");
        const newTodoContainer = document.createElement("div");
        const style = getPriorityColor(todoObj.priority);

        newTodoContainer.innerHTML = `
        <div class="todo-card">
            <div class="todo-headings">  
                <div class="heading">
                <p class="todo-title">${todoObj.title}</p>
                <button class="todo-priority" style="background-color:${style}"></button>
                </div>
                <p class="todo-dueDate">${todoObj.dueDate}</p>
            </div>
            
            <div class="todo-actions">
                <img src="${deleteIcon}" alt="delete button" data-id="${id}" class="btn-delete-todo">
                <img src="${expandIcon}" data-infoId="${id}" class="btn-expand-todo">
            </div>
        </div>
        `
        todoContainer.appendChild(newTodoContainer);
    }

    static displayTodoInfo(id) {
        const lsItem = JSON.parse(localStorage.getItem(id));
        const infoDialog = document.createElement("dialog");
        const body = document.querySelector("body");
        const style = getPriorityColor(lsItem.priority);

        infoDialog.classList.add("info-dialog");
        infoDialog.innerHTML = `
        <div class="info-container">
            <div class="info-heading">
                <p>${lsItem.title}</p>
                <button class="todo-priority" style="background-color:${style}"></button>
            </div>
        
            <p>${lsItem.dueDate}</p>
            <p>${lsItem.description}</p>
            <button class="btn-info-close">close</button>
        </div>
        `;

        body.appendChild(infoDialog);
        infoDialog.showModal();

        const closeInfoBtn = infoDialog.querySelector(".btn-info-close");
        closeInfoBtn.addEventListener("click", () => {
            infoDialog.close();
            infoDialog.remove();
        });
    }

    static populateTodos() {
        for (let key in localStorage) {
            if (uuidValidate(key)) {
                const lsItem = JSON.parse(localStorage.getItem(key));

                this.displayTodo(lsItem, key);
            }
        }
    }

    static populateProjectTodos(projectName) {
        const keys = Object.keys(localStorage);
        const filteredKey = keys.filter(key => key.includes(`${projectName}`));

        for (let key of filteredKey) {
            let ptItem = JSON.parse(localStorage.getItem(key));

            this.displayTodo(ptItem, key);
        }
    }

    static deleteTodo(id) {
        const item = JSON.parse(localStorage.getItem(id));

        if (item.projectName != 0) {
            localStorage.removeItem(id);
            const todoToDelete = document.querySelector(`[data-id="${id}]"`);

            if (todoToDelete) {
                todoToDelete.closest("div").remove();
            }

            this.reloadProjectTodos(item.projectName);
        } else {
            localStorage.removeItem(id);
            const todoToDelete = document.querySelector(`[data-id="${id}]"`);

            if (todoToDelete) {
                todoToDelete.closest("div").remove();
            }

            this.reloadTodos();
        }
    }

    static reloadProjectTodos(projectName) {
        const todoContainer = document.querySelector("#todos");
        todoContainer.innerHTML = " ";

        this.populateProjectTodos(projectName);
    }

    static reloadTodos() {
        const todoContainer = document.querySelector("#todos");
        todoContainer.innerHTML = " ";

        this.populateTodos();
    }

    static filterByDueDate(interval) {
        const todoContainer = document.querySelector("#todos");
        clearMainContent();

        const today = new Date();
        const filteredTodos = [];

        for (let key in localStorage) {
            if (uuidValidate(key)) {
                const todo = JSON.parse(localStorage.getItem(key));

                if (isWithinInterval(dueDate, today)) {
                    filteredTodos.push({ id: key, todo });
                }
            }
        }

        filteredTodos.forEach(({ id, todo }) => {
            this.displayTodo(todo, id);
        });
    }
}

function getPriorityColor(priority) {
    switch (priority) {
        case "high":
            return "#d00000";
        case "medium":
            return "#FFA500";
        default:
            return "#aacc00";
    }
}

export default function makeToDo() {
    Todos.populateTodos();

    const makeToDoButton = document.querySelector(".daily-make-todo");
    const btnCloseTodo = document.querySelector(".btn-close-todo");
    const todoDialog = document.querySelector(".todo-dialog");
    const todoForm = document.querySelector(".todo-form");

    makeToDoButton.addEventListener("click", () => {
        todoDialog.showModal();
    });

    btnCloseTodo.addEventListener("click", () => {
        todoDialog.close();
    });

    // submitting form and storing data local storage
    todoForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const todoTitle = document.querySelector("#todo-title");
        const todoDueDate = document.querySelector("#todo-dueDate");
        const todoDescription = document.querySelector("#todo-description");
        const todoPriority = document.querySelector("#todo-priority");

        let id = uuidv1();
        let formattedDueDate = format(new Date(todoDueDate.value), "dd-MM-yyyy");
        let item = Todos.newTodo(todoTitle.value, todoDescription.value, formattedDueDate, todoPriority.value, 0);
        let itemJSON = JSON.stringify(item);

        Todos.displayTodo(item, id);
        localStorage.setItem(`${id}`, itemJSON);

        todoTitle.value = "";
        todoDescription.value = "";
        todoDueDate.value = "";
        todoPriority.value = "";
        todoDialog.close();
    });

    // listening for delete button & expand view click
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-delete-todo")) {
            const todoId = e.target.dataset.id;

            Todos.deleteTodo(todoId);
        } else if (e.target.classList.contains("btn-expand-todo")) {
            const todoId = e.target.dataset.infoid;

            Todos.displayTodoInfo(todoId);
        }
    });
}