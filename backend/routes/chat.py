from fastapi import APIRouter, HTTPException
from models import ChatRequest, ChatResponse
from services.rag_service import generate_chat_response

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        response_text = generate_chat_response(
            query=request.message,
            mode=request.mode,
            history=request.history
        )
        return ChatResponse(response=response_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
