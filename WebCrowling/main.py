# # This is in the python

# import requests
# from bs4 import BeautifulSoup

# url = "http://example.com"

# response = requests.get(url)

# soup = BeautifulSoup(response.text , "html.parser")

# print(soup.title.text)



# This is in the FastAPI
from fastapi import FastAPI
import requests
from bs4 import BeautifulSoup
import time

app = FastAPI()

cache_data = []
last_fetch = 0

@app.get('/news')
def get_news(page: int = 1, limit: int = 5):
    global cache_data, last_fetch

    start_time = time.time()

    if time.time() - last_fetch > 60:
        print("Fetching Fresh Data")

        url = "https://news.ycombinator.com/"
        response = requests.get(url)
        soup = BeautifulSoup(response.text, "html.parser")

        cache_data = [item.text for item in soup.find_all("span", class_="titleline")]
        
        last_fetch = time.time()

    else:
        print("Using Cache Data")

    end_time = time.time()
    time_taken = round(end_time - start_time, 4)

    # Pagination Logic
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit

    return {
        "Time Taken": time_taken,
        "page": page,
        "limit": limit,
        "total": len(cache_data),
        "data": cache_data[start_idx:end_idx]
    }