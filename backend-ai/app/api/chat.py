import os
import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from google import genai
from google.genai import types as genai_types

router = APIRouter()
logger = logging.getLogger(__name__)

_GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
_client = genai.Client(api_key=_GEMINI_API_KEY) if _GEMINI_API_KEY else None

class ChatMessage(BaseModel):
    role: str  # "user" or "model"
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    system_instruction: Optional[str] = "You are a helpful, clear, and intelligent AI assistant. Provide concise and accurate answers."

@router.post("/")
async def chat_endpoint(request: ChatRequest):
    if not _client:
        logger.error("[Chat] GEMINI_API_KEY is missing.")
        raise HTTPException(status_code=500, detail="Gemini API is not configured on the server.")
        
    try:
        logger.info(f"[Chat] Received request with {len(request.messages)} messages")
        
        contents = []
        for msg in request.messages:
            # Enforce valid role names
            role = "model" if msg.role == "model" else "user"
            contents.append(
                genai_types.Content(
                    role=role,
                    parts=[genai_types.Part.from_text(text=msg.content)]
                )
            )
            
        # Use gemini-2.0-flash as primary, fallback to gemini-1.5-flash
        model_name = "gemini-2.0-flash"
        
        try:
            response = _client.models.generate_content(
                model=model_name,
                contents=contents,
                config=genai_types.GenerateContentConfig(
                    system_instruction=request.system_instruction,
                    temperature=0.7,
                ),
            )
        except Exception as api_err:
            logger.warning(f"[Chat] Model {model_name} failed. Falling back to gemini-1.5-flash. Error: {api_err}")
            response = _client.models.generate_content(
                model="gemini-1.5-flash",
                contents=contents,
                config=genai_types.GenerateContentConfig(
                    system_instruction=request.system_instruction,
                    temperature=0.7,
                ),
            )
            
        return {"response": response.text}
        
    except Exception as e:
        logger.error(f"[Chat] Failed to generate chat response: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
