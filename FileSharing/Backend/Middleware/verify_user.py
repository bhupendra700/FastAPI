from Database.model import User
from Database.neon import SessionLocal
from fastapi import HTTPException, Request, status
from jwt import decode
from dotenv import load_dotenv
load_dotenv()
from os import getenv


JWT_ACCESS_SECRET_KEY = getenv("JWT_ACCESS_SECRET_KEY")
ALGORITHM = "HS256"

def verifyUser(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization header missing")
    
    try:
        accessToken = auth_header.split(" ")[-1]
        payload = decode(accessToken, JWT_ACCESS_SECRET_KEY, algorithms=[ALGORITHM])
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    with SessionLocal() as session:
        userExists = session.query(User).filter(User.id == payload.get("user_id")).first()

    if not userExists:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return userExists