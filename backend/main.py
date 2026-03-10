from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import chat, upload

app = FastAPI(title="Last Minute Revision Buddy API", version="1.0.0")

# Allow all origins for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(upload.router, prefix="/api", tags=["Upload"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Last Minute Revision Buddy API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
