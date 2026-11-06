
from Database.model import User
from Database.neon import SessionLocal
from fastapi import APIRouter, HTTPException, Request, Response, status
from pydantic import BaseModel
from pwdlib import PasswordHash
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
load_dotenv()
from os import access, getenv
from jwt import encode , decode

password_hash = PasswordHash.recommended()

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
	email: str
	password: str

authApp = APIRouter(prefix="/auth", tags=["Auth"])


# JWT
ENVIRONMENT = getenv("ENVIRONMENT", "development")
ALGORITHM = "HS256"
JWT_ACCESS_SECRET_KEY=getenv("JWT_ACCESS_SECRET_KEY")
JWT_REFRESH_SECRET_KEY=getenv("JWT_REFRESH_SECRET_KEY")
ACCESS_TOKEN_EXPIRE_MINUTES=int(getenv("ACCESS_TOKEN_EXPIRE_MINUTES" , 15))
REFRESH_TOKEN_EXPIRE_DAYS=int(getenv("REFRESH_TOKEN_EXPIRE_DAYS" , 7))


def Create_Access_Token(data: dict, expires_delta: timedelta | None):

	to_encode = data.copy()

	if expires_delta:
		expire = datetime.now(timezone.utc) + expires_delta

	else:
		expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)


	to_encode.update({"exp": expire})

	encoded_jwt = encode(to_encode, JWT_ACCESS_SECRET_KEY, algorithm=ALGORITHM)
	return encoded_jwt

def Create_Refresh_Token(data: dict, expires_delta: timedelta | None):
  to_encode = data.copy()

  if expires_delta:
    expire = datetime.now(timezone.utc) + expires_delta
  else:
    expire = datetime.now(timezone.utc) + timedelta(
        days=REFRESH_TOKEN_EXPIRE_DAYS
    )

  to_encode.update({"exp": expire})

  encoded_jwt = encode(to_encode, JWT_REFRESH_SECRET_KEY, algorithm=ALGORITHM)
  return encoded_jwt

@authApp.post("/signup")
def signup(data: SignupRequest):

    hashed_password = password_hash.hash(data.password)

    with SessionLocal() as session:

        user = User(
            name=data.name,
            email=data.email,
            password=hashed_password
        )

        session.add(user)
        session.commit()

    return {"message": "Account created successfully"}


@authApp.post("/login")
def login(data: LoginRequest , response: Response):
  try:
    with SessionLocal() as session:
      existing_user = (
          session.query(User).filter(User.email == data.email).first()
      )
      if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email is not present",
        )

      isPasswordMatch = password_hash.verify(
          data.password, existing_user.password
      )

      if not isPasswordMatch:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
        )

      tokenData = {"user_id": existing_user.id}

      accessToken = Create_Access_Token(tokenData, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

      refreshToken = Create_Refresh_Token(tokenData, timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))

      response.set_cookie(
      	key="refresh_token",
      	value=refreshToken,
      	httponly=True,
      	secure=ENVIRONMENT!="development",
      	samesite="lax",
      	max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
      	)

      return {"message": "Login successfully!", "access_token": accessToken}

  except HTTPException as httpe:
    raise httpe

  except Exception as e:
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
    )


@authApp.get('/users/me')
def getMe(request: Request):
	accessToken = request.headers.get("Authorization").split(" ")[1]
	if not accessToken:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED , detail="Access Token is missing")

	payload = decode(accessToken , JWT_ACCESS_SECRET_KEY , algorithms=[ALGORITHM])

	with SessionLocal() as session:
		user = session.query(User).get(payload.get("user_id"))

	return {"message": "Details of users" , "data" : user.to_dict()}

@authApp.get('/refresh')
def Access_Refresh_Token_Rotation(request: Request, response: Response):
	refreshToken = request.cookies.get("refresh_token")
	payload = decode(refreshToken, JWT_REFRESH_SECRET_KEY, algorithms=[ALGORITHM])

	if not payload:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Refresh Token is expired"
		)

	# expiry_date = datetime.fromtimestamp(payload.get("exp"))
	# current_date = datetime.now()
	# time_left = expiry_date - current_date
	# print("Remaining Time (Days, Hours, Minutes):", time_left)

	tokenData = {"user_id": payload.get('user_id')}
	accessToken = Create_Access_Token(tokenData, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

	refreshToken = Create_Refresh_Token(tokenData, timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))

	response.set_cookie(
		key="refresh_token",
		value=refreshToken,
		httponly=True,
		secure=ENVIRONMENT != "development",
		samesite="lax",
		max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
	)

	return {"message": "Token rotation is successfull", "access_token": accessToken}

@authApp.post('/logout')
def Logout(response: Response):
	response.delete_cookie(
		key="refresh_token",
		httponly=True,
      	secure=ENVIRONMENT!="development",
      	samesite="lax",
		)

	return {"message": "Logout successfully"}