import os
import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from openai import AsyncOpenAI

router = APIRouter()
logger = logging.getLogger(__name__)

_GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
_client = AsyncOpenAI(
    api_key=_GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",
) if _GROQ_API_KEY else None

class ChatMessage(BaseModel):
    role: str  # "user" or "model" (mapped to "assistant" for DeepSeek)
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    system_instruction: Optional[str] = "You are a helpful, clear, and intelligent AI assistant. Provide concise and accurate answers."

@router.post("")
async def chat_endpoint(request: ChatRequest):
    if not _client:
        logger.error("[Chat] GROQ_API_KEY is missing.")
        raise HTTPException(status_code=500, detail="Groq API is not configured on the server.")
        
    try:
        logger.info(f"[Chat] Received request with {len(request.messages)} messages")
        
        messages = [{"role": "system", "content": request.system_instruction}]
        for msg in request.messages:
            # Map "model" role (Gemini style) → "assistant" (OpenAI/DeepSeek style)
            role = "assistant" if msg.role == "model" else "user"
            messages.append({"role": role, "content": msg.content})
            
        response = await _client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
        )
            
        return {"response": response.choices[0].message.content}
        
    except Exception as e:
        logger.error(f"[Chat] Failed to generate chat response: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
