import os
import json
import logging
from typing import Any

from google import genai
from google.genai import types

from app.prompts.chat_system import build_agent_prompt
from app.services.vocab_agent import run_agent
from app.schemas.chat import ChatRequest

_client = None

def _get_client():
    global _client
    if _client is None:
        from app.config import get_settings
        api_key = get_settings().gemini_api_key or os.getenv("GEMINI_API_KEY", "")
        if api_key:
            _client = genai.Client(api_key=api_key)
    return _client

MODEL = "gemini-1.5-flash"

def is_client_configured() -> bool:
    return _get_client() is not None

async def process_agent_chat(request: ChatRequest, user_token: str) -> Any:
    """Process agent chat, either streaming or non-streaming."""
    client = _get_client()
    if not client:
        raise RuntimeError("Gemini Client not configured")

    # Map message schema to types.Content
    contents = []
    for msg in request.messages:
        role = "model" if msg.role == "model" else "user"
        contents.append(types.Content(role=role, parts=[types.Part(text=msg.content)]))

    context_dict = request.userContext.model_dump() if request.userContext else None
    agent_prompt = build_agent_prompt(context_dict)

    if not request.stream:
        final_text = ""
        async for event in run_agent(client, list(contents), agent_prompt, user_token):
            if event["type"] == "text":
                final_text += event["content"]
        return {"response": final_text}

    async def stream_generator():
        try:
            async for event in run_agent(client, list(contents), agent_prompt, user_token):
                if event["type"] == "status":
                    yield f"event: status\ndata: {json.dumps(event)}\n\n"
                elif event["type"] == "text":
                    yield f"data: {event['content']}\n\n"
        except Exception as e:
            error_msg = str(e)
            logger.error(f"[Chat Service] Stream error: {error_msg}")
            if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
                yield "data: [SYSTEM] The AI is currently experiencing heavy load. Please try again later.\n\n"
            elif "503" in error_msg or "UNAVAILABLE" in error_msg:
                yield "data: [SYSTEM] The AI servers are temporarily unavailable. Please try again later.\n\n"
            else:
                yield "data: [SYSTEM] An error occurred while generating the response.\n\n"

    return stream_generator()

async def process_simple_chat(request: ChatRequest) -> Any:
    """Process simple/legacy non-agent chat, either streaming or non-streaming."""
    client = _get_client()
    if not client:
        raise RuntimeError("Gemini Client not configured")

    contents = []
    for msg in request.messages:
        role = "model" if msg.role == "model" else "user"
        contents.append(types.Content(role=role, parts=[types.Part(text=msg.content)]))

    system_instruction = request.system_instruction or ""

    if not request.stream:
        response = await client.aio.models.generate_content(
            model=MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
            ),
        )
        return {"response": response.text}

    async def stream_generator():
        try:
            response_stream = await client.aio.models.generate_content_stream(
                model=MODEL,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.7,
                    max_output_tokens=8192,
                ),
            )
            async for chunk in response_stream:
                if chunk.text:
                    yield f"data: {chunk.text}\n\n"
        except Exception as e:
            error_msg = str(e)
            logger.error(f"[Chat Service Simple] Stream error: {error_msg}")
            if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
                yield "data: [SYSTEM] The AI is currently experiencing heavy load. Please try again later.\n\n"
            elif "503" in error_msg or "UNAVAILABLE" in error_msg:
                yield "data: [SYSTEM] The AI servers are temporarily unavailable. Please try again later.\n\n"
            else:
                yield "data: [SYSTEM] An error occurred while generating the response.\n\n"

    return stream_generator()
