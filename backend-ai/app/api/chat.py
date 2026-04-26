import os
import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from google import genai
from google.genai import types

router = APIRouter()
logger = logging.getLogger(__name__)

_GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
_client = genai.Client(api_key=_GEMINI_API_KEY) if _GEMINI_API_KEY else None

MODEL = "gemini-2.5-flash"

class ChatMessage(BaseModel):
    role: str  # "user" or "model" (mapped to "assistant" for DeepSeek)
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    system_instruction: Optional[str] = "You are a helpful, clear, and intelligent AI assistant. Provide concise and accurate answers."

@router.post("")
async def chat_endpoint(request: ChatRequest):
    if not _client:
        logger.error("[Chat] GEMINI_API_KEY is missing.")
        raise HTTPException(status_code=500, detail="Gemini API is not configured on the server.")
        
    try:
        logger.info(f"[Chat] Received request with {len(request.messages)} messages")
        
        contents = []
        for msg in request.messages:
            role = "model" if msg.role == "model" else "user"
            contents.append(types.Content(role=role, parts=[types.Part(text=msg.content)]))
            
        response = await _client.aio.models.generate_content(
            model=MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=request.system_instruction,
                temperature=0.7,
            ),
        )
            
        return {"response": response.text}
        
    except Exception as e:
        logger.error(f"[Chat] Failed to generate chat response: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
