import os
import logging
from typing import List, Optional
from pypdf import PdfReader
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv

from .prompts import get_prompt_for_mode, BASE_INSTRUCTIONS

load_dotenv()
logger = logging.getLogger(__name__)

# In-memory storage for PDF text (simplified for light deployment)
_pdf_context = ""

def get_llm():
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY is not set.")
    return ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=api_key,
        temperature=0.7,
    )

def process_pdf(file_path: str) -> int:
    """Extract text from PDF and store in memory (Lightweight RAG)."""
    global _pdf_context
    logger.info(f"Extracting text from PDF: {file_path}")
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        
        # Limit context to avoid token overflow in light version
        _pdf_context = text[:20000] # roughly 5000 tokens
        logger.info(f"PDF processed. Context length: {len(_pdf_context)} chars.")
        return 1
    except Exception as e:
        logger.error(f"PDF processing error: {e}")
        return 0

def generate_chat_response(query: str, mode: str, history: list = None) -> str:
    global _pdf_context
    llm = get_llm()
    prompt = get_prompt_for_mode(mode)
    
    context = _pdf_context if _pdf_context else "No specific study material uploaded. Using general knowledge."
    
    # Simple chain
    chain = prompt | llm | StrOutputParser()
    
    try:
        response = chain.invoke({
            "question": query,
            "context": context,
            "base_instructions": BASE_INSTRUCTIONS
        })
        return response
    except Exception as e:
        logger.error(f"Chat generation error: {e}")
        return f"⚠️ Error: {str(e)}"

def clear_vector_store():
    global _pdf_context
    _pdf_context = ""
    logger.info("Context cleared.")
