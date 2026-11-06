import time

from Middleware.verify_user import verifyUser
from fastapi import Depends, HTTPException, Request, status


class RateLimiter:
    def __init__(self, requests_limit: int, time_window: int):
        self.requests_limit = requests_limit
        self.time_window = time_window
        self.clients = {}  # Key: (ip, email), Value: [timestamps]

    def __call__(self, request: Request, currentUser=Depends(verifyUser)):
        client_ip = request.client.host if request.client else "unknown"

        user_email = getattr(currentUser , "email" , "unknown")

        identifier = (client_ip, user_email)
        
        current_time = time.time()

        if identifier not in self.clients:
            self.clients[identifier] = []

        self.clients[identifier] = [
            t for t in self.clients[identifier]
            if current_time - t < self.time_window
        ]

        if len(self.clients[identifier]) >= self.requests_limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded for user ({user_email}). Please thodi der baad try karein."
            )

        self.clients[identifier].append(current_time)

        return currentUser