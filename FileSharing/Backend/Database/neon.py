from os import getenv
from dotenv import load_dotenv
from sqlalchemy import create_engine , text
from sqlalchemy.orm import sessionmaker


load_dotenv()

DATABASE_URL = getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set")

engine = create_engine(DATABASE_URL , echo=False)
	
SessionLocal = sessionmaker(bind = engine)