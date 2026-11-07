from fastapi import FastAPI , Request, status
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

app = FastAPI();

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.exception_handler(RateLimitExceeded)
def rate_limit_handler(request: Request , exc: RateLimitExceeded):
	return JSONResponse(
		status_code=status.HTTP_429_TOO_MANY_REQUESTS,
		content={
			"details": "Too many Requests"
		}
	)

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