from fastapi import FastAPI , Request, status
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

app = FastAPI();

# def get_user_token_or_ip(request: Request) -> str:
#     # 1. Check karo ki request me Authorization header hai ya nahi
#     auth_header = request.headers.get("Authorization")
    
#     if auth_header and auth_header.startswith("Bearer "):
#         # Token mil gaya, toh token ko hi key bana do
#         token = auth_header.split(" ")[1]
#         return token
    
#     # 2. Agar logged-in nahi hai (Public route), toh fallback karke IP use kar lo
#     forwarded_for = request.headers.get("x-forwarded-for")
#     if forwarded_for:
#         return forwarded_for.split(",")[0].strip()
        
#     return get_remote_address(request)

# limiter = Limiter(
#     key_func=get_user_token_or_ip,
#     default_limits=["10/minute"],
#     storage_uri="redis://localhost:6379"
# )




limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# app.exception_handler(RateLimitExceeded)
# def rate_limit_handler(request: Request , exc: RateLimitExceeded):
# 	return JSONResponse(
# 		status_code=status.HTTP_429_TOO_MANY_REQUESTS,
# 		content={
# 			"details": "Too many Requests"
# 		}
# 	)

@app.get('/')
@limiter.limit("5/minutes")
def root(request: Request):
	return {
		"message": "Hello worlds..."
	}

@app.get('/data')
def root(request: Request):
	return {
		"message": "Hellow worlds... from data endpoints"
	}