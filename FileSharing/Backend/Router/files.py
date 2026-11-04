from typing import List
from fastapi import APIRouter, File, HTTPException, UploadFile, status
import shutil
import os
from fastapi.staticfiles import StaticFiles

fileApp = APIRouter(prefix="/files" , tags=["Files"])

UPLOAD_DIR="uploads"

# Make directory to upload files
if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

# URL -> http://127.0.0.0:8000/files/{filename} 
fileApp.mount("/filess" , StaticFiles(directory=UPLOAD_DIR) , name="static")

@fileApp.post('/upload')
async def uploadFile(files: List[UploadFile] = File(...)):
    uploaded_files = []

    for file in files:
        filename = file.filename

        if not filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File not selected"
            )

        file_path = os.path.join(UPLOAD_DIR, filename) #uploads/demo.png

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        uploaded_files.append(filename)

    return {
        "success": True,
        "message": f"Successfully uploaded {len(uploaded_files)} file(s).",
        "total_files": len(uploaded_files),
        "files": uploaded_files
    }


@fileApp.get('/view/{filename}')
def getFile(filename: str):
	file_path = os.path.join(UPLOAD_DIR , filename)

	if not file_path:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail="File not exists"
			)

	return {
	"message": "File retrive successfully",
	"file_url" : f"http://127.0.0.0:8000/api/files/filess/{filename}"
}

@fileApp.get('/all-file')
def get_All_File():
	uploadedFiles = [
    {
      "id": 1,
      "name": "Resume.pdf",
      "size": 2.5,
      "type": "PDF",
      "date": "04 Nov 2026",
      "url": "https://example.com/resume.pdf"
    },
    {
      "id": 2,
      "name": "Image.png",
      "size": 1.2,
      "type": "Image",
      "date": "03 Nov 2026",
      "url": "https://example.com/image.png"
    }
  ]
	
	return {
  "message": "Files fetched successfully",
  "data": uploadedFiles 
}