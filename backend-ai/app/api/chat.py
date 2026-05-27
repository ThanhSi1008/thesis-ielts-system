import os
import logging
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from google import genai
from google.genai import types

from app.prompts.chat_system import build_context_prompt

router = APIRouter()
logger = logging.getLogger(__name__)

_GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
_client = genai.Client(api_key=_GEMINI_API_KEY) if _GEMINI_API_KEY else None

MODEL = "gemini-3.5-flash"


class ChatMessage(BaseModel):
    role: str  # "user" or "model"
    content: str


class UserContext(BaseModel):
    """Real-time user data injected for personalized responses (RAG Phase 2)."""
    name: Optional[str] = None
    currentPage: Optional[str] = None
    studyStreak: Optional[int] = None
    vocabDueCount: Optional[int] = None
    recentScores: Optional[Dict[str, Optional[float]]] = None
    activeContent: Optional[Dict[str, Any]] = None


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    # Override system instruction (used by internal flows like word explanations)
    system_instruction: Optional[str] = None
    # Real-time user context for personalization (Phase 2)
    userContext: Optional[UserContext] = None
    stream: bool = True


@router.post("")
async def chat_endpoint(request: ChatRequest):
    if not _client:
        logger.error("[Chat] GEMINI_API_KEY is missing.")
        raise HTTPException(status_code=500, detail="Gemini API is not configured on the server.")

    try:
        logger.info(f"[Chat] Received request with {len(request.messages)} messages")

        # Build system instruction: explicit override > context-enriched default
        if request.system_instruction:
            system_instruction = request.system_instruction
        else:
            context_dict = request.userContext.model_dump() if request.userContext else None
            system_instruction = build_context_prompt(context_dict)

        contents = []
        for msg in request.messages:
            role = "model" if msg.role == "model" else "user"
            contents.append(types.Content(role=role, parts=[types.Part(text=msg.content)]))

        if not request.stream:
            response = await _client.aio.models.generate_content(
                model=MODEL,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.7,
                ),
            )
            return {"response": response.text}

        async def stream_generator():
            response_stream = await _client.aio.models.generate_content_stream(
                model=MODEL,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.7,
                ),
            )
            async for chunk in response_stream:
                if chunk.text:
                    yield f"data: {chunk.text}\n\n"

        return StreamingResponse(stream_generator(), media_type="text/event-stream")

    except Exception as e:
        logger.error(f"[Chat] Failed to generate chat response: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
