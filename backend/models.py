from pydantic import BaseModel
from typing import List, Optional, Dict

class MessagePrompt(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    mode: str = "friendly"
    history: List[MessagePrompt] = []

class ChatResponse(BaseModel):
    response: str
