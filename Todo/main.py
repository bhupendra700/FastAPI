from fastapi import FastAPI
from pydantic import BaseModel
import json

app = FastAPI()

class Todo(BaseModel):
	id: int
	title: str
	completed: bool

class TodoUpdate(BaseModel):
    title: str | None = None
    completed: bool | None = None

TODOS: list[Todo] = []

# @app.get('/')
# def root():
# 	return "Ganpati Bappa Maurya"

@app.post('/create_todo')
def create_todo(todo:Todo):
	TODOS.append(todo)
	return {"message" : "TODO created successfully"}

@app.get('/todos')
def get_todos():
	return TODOS

@app.get('/todos/{todo_id}')
def get_todos_by_id(todo_id: int):
	for td in TODOS:
		if td.id == todo_id:
			return td

	return None

@app.delete('/todos/{todo_id}')
def delete_todo(todo_id: int):
	for index , todo in enumerate(TODOS):
		if todo.id == todo_id:
			TODOS.pop(index)
			return {"message" : "Todos deleted successfully"}

@app.put('/todos/{todo_id}')
def update_todo(todo_id: int , new_todo: Todo):
	for idx , todo in enumerate(TODOS):
		if(todo.id == todo_id):
			TODOS[idx] = new_todo
			return {"message": "Todo updated successfully"}


@app.patch('/todos/{todo_id}')
def patch_todo(todo_id: int, updated_todo: TodoUpdate):
    for todo in TODOS:
        if todo.id == todo_id:
            # Sirf wahi field update hogi jo user ne bheji hai (jo None nahi hai)
            if updated_todo.title is not None:
                todo.title = updated_todo.title
            
            if updated_todo.completed is not None:
                todo.completed = updated_todo.completed
                
            return {"message": "Todo patched successfully", "todo": todo}
            
    return {"message": "Todo not found"}