from typing import List
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
import shutil
import os
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from Middleware.verify_user import verifyUser

fileApp = APIRouter(prefix="/files" , tags=["Files"])

UPLOAD_DIR="uploads"

if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
 
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

@fileApp.get('/all-file')
def get_All_File():
    if not os.path.exists(UPLOAD_DIR):
        return {
            "success": True,
            "total_files": 0,
            "files": []
        }

    file_list = [f for f in os.listdir(UPLOAD_DIR) if os.path.isfile(os.path.join(UPLOAD_DIR, f))]

    final_file_list = []

    for i, f in enumerate(file_list):
        file_path = os.path.join(UPLOAD_DIR, f)
        file_size_bytes = os.path.getsize(file_path)

        file_size_mb = round(file_size_bytes / (1024 * 1024), 2)

        final_file_list.append({
            "id": i + 1,
            "name": f,
            "size": file_size_mb,
            "type": f.split(".")[-1] if "." in f else "unknown",
            "url": f"http://localhost:8000/uploads/media/{f}"
        })

    return {
        "success": True,
        "total_files": len(file_list),
        "files": final_file_list
    }

@fileApp.delete('/file/{filename}/{id}')
def deleteFile(filename: str, id: str):
    if not (id and filename):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": "File not found"}  # <-- 2. 'details' ki jagah 'content' hoga
        )

    file_path = os.path.join(UPLOAD_DIR, filename)
    file_exists = os.path.isfile(file_path)

    if not file_exists:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": "File not found"}
        )

    # File delete karna
    os.remove(file_path)

    return {
        "message": "File deleted successfully!"
    }