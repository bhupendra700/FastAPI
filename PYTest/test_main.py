from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# Test Home API
def test_home():
	response = client.get("/")
	assert response.status_code == 200
	assert response.json() == {"message" : "Hello Worlds"}

# Test Add API
def test_add():
	response = client.get('/add?a=5&b=6')
	assert response.status_code == 200
	assert response.json() == {"result":11}
