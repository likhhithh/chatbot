import os
import shutil
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from services.rag_service import process_pdf, clear_vector_store

router = APIRouter()

UPLOAD_DIR = "uploaded_pdfs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        chunks_added = process_pdf(file_path)
        
        return JSONResponse(content={
            "message": f"Successfully processed {file.filename}",
            "chunks_encoded": chunks_added
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # We can clean up the file after ingestion to save space
        if os.path.exists(file_path):
            os.remove(file_path)

@router.delete("/clear")
async def clear_documents():
    clear_vector_store()
    return JSONResponse(content={"message": "All documents cleared from memory."})
