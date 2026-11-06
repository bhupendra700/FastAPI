from fastapi import FastAPI

app = FastAPI()

@app.get('/')
def home():
	return {
		"message" : "Hello Worlds"
	}

@app.get("/add")
def sum(a: int , b: int):
	return {
		"result" : a+b
	}