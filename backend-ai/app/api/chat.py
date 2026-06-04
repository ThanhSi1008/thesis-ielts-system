import logging
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

from app.schemas.chat import ChatRequest
from app.services import chat_service

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("")
async def chat_endpoint(request: ChatRequest, req: Request):
    if not chat_service.is_client_configured():
        logger.error("[Chat] GEMINI_API_KEY is missing.")
        raise HTTPException(status_code=500, detail="Gemini API is not configured on the server.")

    try:
        logger.info(f"[Chat] Received request with {len(request.messages)} messages (stream={request.stream})")

        # Extract user JWT for agent tool calls to backend-core
        auth_header = req.headers.get("authorization", "")
        user_token = auth_header.replace("Bearer ", "").strip() if auth_header else ""

        if request.system_instruction:
            # Simple non-agent flow (e.g. quick word explanations)
            response = await chat_service.process_simple_chat(request)
            if not request.stream:
                return response
            return StreamingResponse(response, media_type="text/event-stream")

        # Agentic Study Coach flow
        response = await chat_service.process_agent_chat(request, user_token)
        if not request.stream:
            return response
        return StreamingResponse(response, media_type="text/event-stream")

    except Exception as e:
        error_msg = str(e)
        logger.error(f"[Chat] Failed to generate chat response: {error_msg}")
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            raise HTTPException(
                status_code=429, 
                detail="AI is currently busy (Rate Limit Exceeded). Please wait a minute and try again."
            )
        if "503" in error_msg or "UNAVAILABLE" in error_msg:
            raise HTTPException(
                status_code=503, 
                detail="AI servers are currently experiencing high demand. Please try again later."
            )
        raise HTTPException(status_code=500, detail=error_msg)
