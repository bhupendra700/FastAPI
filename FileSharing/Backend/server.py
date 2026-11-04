from fastapi import FastAPI , APIRouter
from Router.auth import authApp
from fastapi.middleware.cors import CORSMiddleware
from Database.model import Base
from Database.neon import engine
from sqlalchemy import text
from Router.files import fileApp

def check_db():
	try:
		with engine.connect() as connection:
			connection.execute(text("SELECT 1"))
		print("Database connected successfully!")
	except Exception as e:
		print("Database connection failed!")
		print(e)
		raise

def create_table():
	Base.metadata.create_all(bind=engine)
	print("All tables created successfully!")


app = FastAPI(title="File Sharing Backend")

# @app.on_event("startup")
# def startup():
# 	check_db()
# 	create_table()

app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://localhost:5173"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"]
	)

@app.get('/')
def check_server():
	return {
	"message" : "Server is running absolutely fine",
	"quote" : "Ganpati Bappa Maurya"
}

app.include_router(authApp , prefix="/api")
app.include_router(fileApp , prefix="/api")