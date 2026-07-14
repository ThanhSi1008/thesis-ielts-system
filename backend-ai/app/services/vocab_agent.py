"""
Vocab Lab AI Agent — Gemini Function Calling with ReAct Loop

This agent uses Gemini's native function calling to autonomously interact
with the Vocab Lab backend (decks, flashcards, stats) on behalf of the user.
It implements a bounded ReAct (Reasoning + Acting) loop.
"""

import os
import json
import logging
from typing import AsyncGenerator, Any

import httpx
from google import genai
from google.genai import types

from app.config import get_settings
from app.services.vocab_tts_service import synthesize_vocab_audio

logger = logging.getLogger(__name__)
settings = get_settings()

MODEL = "gemini-flash-latest"

# ─── Tool Declarations ────────────────────────────────────────────────────────
# Each tool maps to an existing backend-core REST endpoint.

VOCAB_TOOLS = types.Tool(function_declarations=[
    types.FunctionDeclaration(
        name="list_decks",
        description=(
            "List all of the user's vocabulary decks with card counts. "
            "Returns each deck's id, name, newCount, learningCount, dueCount, and totalCards. "
            "Call this FIRST whenever you need to know which decks exist or resolve a deck name to an ID."
        ),
        parameters=types.Schema(type="OBJECT", properties={}),
    ),
    types.FunctionDeclaration(
        name="create_deck",
        description=(
            "Create a new vocabulary deck. Use this when the user wants a new deck, "
            "or when you need to create one because the target deck doesn't exist yet."
        ),
        parameters=types.Schema(
            type="OBJECT",
            properties={
                "name": types.Schema(type="STRING", description="Name of the new deck"),
            },
            required=["name"],
        ),
    ),
    types.FunctionDeclaration(
        name="get_card_types",
        description=(
            "Get all available card types (note types) with their fields and templates. "
            "Each card type defines a structure (e.g., 'Basic' has Front/Back, 'essential' has Word/IPA/Meaning/Example/Image/Audio). "
            "Call this when you need to create a flashcard with a specific card type structure."
        ),
        parameters=types.Schema(type="OBJECT", properties={}),
    ),
    types.FunctionDeclaration(
        name="create_flashcard",
        description=(
            "Create a new flashcard in a specific deck. "
            "You MUST provide a valid deckId (get it from list_decks first). "
            "For simple cards, just use front/back. "
            "For structured cards (when the user specifies a card type), also provide cardTypeName and fields. "
            "Always add the tag 'ai-generated' so the user can track AI-created cards."
        ),
        parameters=types.Schema(
            type="OBJECT",
            properties={
                "deckId": types.Schema(type="STRING", description="ID of the target deck (from list_decks)"),
                "front": types.Schema(type="STRING", description="Front side of the card (word or question)"),
                "back": types.Schema(type="STRING", description="Back side of the card (definition or answer)"),
                "tags": types.Schema(
                    type="ARRAY",
                    items=types.Schema(type="STRING"),
                    description="Tags for categorization. Always include 'ai-generated'.",
                ),
                "cardTypeName": types.Schema(
                    type="STRING",
                    description=(
                        "Optional. The NAME of the card type to use (e.g., 'Test', 'essential'). "
                        "Omit or set to 'Basic' for simple front/back cards. "
                        "If provided, you MUST also provide 'fields' with values for ALL fields of that card type."
                    ),
                ),
                "fields": types.Schema(
                    type="OBJECT",
                    description=(
                        "Field values keyed by field NAME (not ID). "
                        "Example for a 'Test' card type with Word/IPA/Origin/Meaning fields: "
                        '{"Word": "ubiquitous", "IPA": "/juːˈbɪk.wɪ.təs/", "Origin": "from Latin ubique", "Meaning": "present everywhere"}. '
                        "You MUST provide a value for EVERY field in the card type — do NOT leave any field empty."
                    ),
                ),
            },
            required=["deckId", "front", "back"],
        ),
    ),
    types.FunctionDeclaration(
        name="search_cards",
        description=(
            "Search existing flashcards. Use this to check for duplicates before creating a new card, "
            "or to help the user find specific cards. Returns cards with their deck, card type, and field values."
        ),
        parameters=types.Schema(
            type="OBJECT",
            properties={
                "deckId": types.Schema(type="STRING", description="Filter by deck ID"),
                "tag": types.Schema(type="STRING", description="Filter by tag"),
                "cardState": types.Schema(
                    type="STRING",
                    description="Filter by card state: NEW, LEARNING, REVIEW, or RELEARNING",
                ),
            },
        ),
    ),
    types.FunctionDeclaration(
        name="get_study_stats",
        description=(
            "Get comprehensive study statistics: card counts by state, review activity history, "
            "streak data, maturity distribution, 30-day forecast, retention rate, and hourly activity. "
            "Use this when the user asks about their progress, study habits, or what to study next."
        ),
        parameters=types.Schema(
            type="OBJECT",
            properties={
                "range": types.Schema(
                    type="INTEGER",
                    description="Number of days of history to include (default 30, max 365)",
                ),
            },
        ),
    ),
    types.FunctionDeclaration(
        name="get_tags",
        description=(
            "Get all unique tags the user has used across their flashcards. "
            "Useful for suggesting existing tags when creating new cards."
        ),
        parameters=types.Schema(type="OBJECT", properties={}),
    ),
])

MAX_REACT_ITERATIONS = 8


# ─── Tool Executor ─────────────────────────────────────────────────────────────

async def execute_tool(function_call: Any, user_token: str) -> dict:
    """
    Execute a tool call by proxying to the backend-core Vocab Lab API.
    The user's JWT is forwarded for authentication.
    """
    name = function_call.name
    args = dict(function_call.args) if function_call.args else {}
    base = settings.backend_core_url
    headers: dict[str, str] = {"Content-Type": "application/json"}
    if user_token:
        headers["Authorization"] = f"Bearer {user_token}"
    else:
        logger.warning("[Agent] No user token available — tool calls to backend-core will likely fail auth")

    logger.info(f"[Agent] Executing tool: {name} with args: {args}")

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            if name == "list_decks":
                resp = await client.get(f"{base}/vocab-lab/decks", headers=headers)
                resp.raise_for_status()
                return {"decks": resp.json()}

            elif name == "create_deck":
                resp = await client.post(
                    f"{base}/vocab-lab/decks",
                    json={"name": args["name"]},
                    headers=headers,
                )
                resp.raise_for_status()
                return {"deck": resp.json()}

            elif name == "get_card_types":
                resp = await client.get(f"{base}/vocab-lab/card-types", headers=headers)
                resp.raise_for_status()
                return {"cardTypes": resp.json()}

            elif name == "create_flashcard":
                payload = {
                    "deckId": args["deckId"],
                    "front": args.get("front", ""),
                    "back": args.get("back", ""),
                }
                if args.get("tags"):
                    payload["tags"] = args["tags"]

                # Generate pronunciation audio for the card's WORD/term only (never the
                # meaning or example) so the learner can press to listen — same UX as
                # Foundation vocabulary. Always attempted for every AI-created card.
                # Source: `front`, falling back to a Word/Front field for structured
                # cards (where the model fills `fields` and may leave `front` empty).
                # Best-effort: never blocks card creation if TTS/Cloudinary fails.
                fields_arg = args.get("fields") or {}
                word_text = (args.get("front") or "").strip()
                if not word_text and isinstance(fields_arg, dict):
                    for _key in ("Word", "word", "Front", "front", "Term", "term"):
                        if fields_arg.get(_key):
                            word_text = str(fields_arg[_key]).strip()
                            break
                audio_url = await synthesize_vocab_audio(word_text)
                if audio_url:
                    payload["audioUrl"] = audio_url

                # Resolve card type name → ID and field names → field IDs
                card_type_name = args.get("cardTypeName", "Basic")
                fields_by_name = dict(args.get("fields", {})) if args.get("fields") else None

                try:
                    ct_resp = await client.get(
                        f"{base}/vocab-lab/card-types", headers=headers
                    )
                    ct_resp.raise_for_status()
                    card_types = ct_resp.json()

                    # Find the requested card type (case-insensitive)
                    target_type = next(
                        (ct for ct in card_types
                         if ct.get("name", "").lower() == card_type_name.lower()),
                        None,
                    )
                    if not target_type:
                        # Fallback to Basic
                        target_type = next(
                            (ct for ct in card_types if ct.get("name") == "Basic"),
                            None,
                        )

                    if target_type:
                        payload["cardTypeId"] = target_type["id"]
                        ct_fields = target_type.get("fields", [])

                        fv = {}
                        if fields_by_name:
                            # Map field names to field IDs
                            for field_def in ct_fields:
                                field_name = field_def.get("name", "")
                                field_id = field_def.get("id", "")
                                if field_name in fields_by_name:
                                    fv[field_id] = fields_by_name[field_name]
                                elif field_name.lower() in {k.lower(): v for k, v in fields_by_name.items()}:
                                    # Case-insensitive fallback
                                    lower_map = {k.lower(): v for k, v in fields_by_name.items()}
                                    fv[field_id] = lower_map[field_name.lower()]
                        else:
                            # No explicit fields — map front/back to Front/Back fields
                            for field_def in ct_fields:
                                field_name = field_def.get("name", "")
                                field_id = field_def.get("id", "")
                                if field_name.lower() == "front" or field_name.lower() == "word":
                                    fv[field_id] = args.get("front", "")
                                elif field_name.lower() == "back" or field_name.lower() == "meaning":
                                    fv[field_id] = args.get("back", "")

                        if fv:
                            payload["fieldValues"] = fv
                except Exception as e:
                    logger.warning(f"[Agent] Failed to resolve card type fields: {e}")

                resp = await client.post(
                    f"{base}/vocab-lab/cards",
                    json=payload,
                    headers=headers,
                )
                resp.raise_for_status()
                card = resp.json()
                return {
                    "success": True,
                    "card": {
                        "id": card.get("id"),
                        "front": card.get("front"),
                        "back": card.get("back"),
                        "tags": card.get("tags"),
                        "audioUrl": card.get("audioUrl"),
                    },
                }

            elif name == "search_cards":
                params = {}
                if args.get("deckId"):
                    params["deckId"] = args["deckId"]
                if args.get("tag"):
                    params["tag"] = args["tag"]
                if args.get("cardState"):
                    params["cardState"] = args["cardState"]
                resp = await client.get(
                    f"{base}/vocab-lab/cards",
                    params=params,
                    headers=headers,
                )
                resp.raise_for_status()
                cards = resp.json()
                # Summarize to avoid overwhelming the model context
                summary = []
                for c in cards[:20]:
                    summary.append({
                        "id": c.get("id"),
                        "front": c.get("front", "")[:100],
                        "back": c.get("back", "")[:100],
                        "tags": c.get("tags", []),
                        "cardState": c.get("cardState"),
                        "deckName": c.get("deck", {}).get("name"),
                    })
                return {"cards": summary, "totalFound": len(cards)}

            elif name == "get_study_stats":
                params = {}
                if args.get("range"):
                    params["range"] = str(args["range"])
                resp = await client.get(
                    f"{base}/vocab-lab/stats",
                    params=params,
                    headers=headers,
                )
                resp.raise_for_status()
                stats = resp.json()
                # Return a focused subset to keep the context manageable
                return {
                    "cardCounts": stats.get("cardCounts"),
                    "streakData": stats.get("streakData"),
                    "averages": stats.get("averages"),
                    "maturityDistribution": stats.get("maturityDistribution"),
                }

            elif name == "get_tags":
                resp = await client.get(f"{base}/vocab-lab/tags", headers=headers)
                resp.raise_for_status()
                return {"tags": resp.json()}

            else:
                return {"error": f"Unknown tool: {name}"}

    except httpx.HTTPStatusError as e:
        status = e.response.status_code
        detail = e.response.text[:300]
        logger.error(f"[Agent] Tool {name} HTTP error {status}: {detail}")
        if status == 401:
            return {"error": "Authentication failed. The user may need to log in again."}
        if status == 403:
            return {"error": f"Permission denied: {detail}"}
        if status == 404:
            return {"error": f"Not found: {detail}"}
        return {"error": f"HTTP {status}: {detail}"}
    except Exception as e:
        logger.error(f"[Agent] Tool {name} failed: {e}")
        return {"error": f"Tool execution failed: {str(e)}"}


def summarize_tool_result(tool_name: str, result: dict) -> str:
    """Create a human-readable summary of a tool result for the UI status pill."""
    if "error" in result:
        return f"Error: {result['error'][:80]}"

    if tool_name == "list_decks":
        decks = result.get("decks", [])
        if not decks:
            return "No decks found"
        names = [d.get("name", "?") for d in decks[:5]]
        return f"Found {len(decks)} deck(s): {', '.join(names)}"

    elif tool_name == "create_deck":
        deck = result.get("deck", {})
        return f"Created deck \"{deck.get('name', '?')}\""

    elif tool_name == "get_card_types":
        types_list = result.get("cardTypes", [])
        names = [t.get("name", "?") for t in types_list[:5]]
        return f"Found {len(types_list)} card type(s): {', '.join(names)}"

    elif tool_name == "create_flashcard":
        card = result.get("card", {})
        return f"Created card \"{card.get('front', '?')[:40]}\""

    elif tool_name == "search_cards":
        total = result.get("totalFound", 0)
        return f"Found {total} card(s)"

    elif tool_name == "get_study_stats":
        counts = result.get("cardCounts", {})
        total = counts.get("totalCount", 0)
        streak = result.get("streakData", {}).get("currentStreak", 0)
        return f"{total} total cards, {streak}-day streak"

    elif tool_name == "get_tags":
        tags = result.get("tags", [])
        return f"Found {len(tags)} tag(s)"

    return "Done"


TOOL_DISPLAY_NAMES = {
    "list_decks": "Looking up decks",
    "create_deck": "Creating deck",
    "get_card_types": "Checking card types",
    "create_flashcard": "Creating flashcard",
    "search_cards": "Searching cards",
    "get_study_stats": "Loading study stats",
    "get_tags": "Getting tags",
}


# ─── ReAct Agent Loop ──────────────────────────────────────────────────────────

async def run_agent(
    client: genai.Client,
    contents: list,
    system_prompt: str,
    user_token: str,
) -> AsyncGenerator[dict, None]:
    """
    Run the ReAct agent loop.

    Yields events:
      {"type": "status", "tool": str, "phase": "calling"|"done", ...}
      {"type": "text", "content": str}
    """
    config = types.GenerateContentConfig(
        system_instruction=system_prompt,
        tools=[VOCAB_TOOLS],
        temperature=0.7,
    )

    for iteration in range(MAX_REACT_ITERATIONS):
        logger.info(f"[Agent] ReAct iteration {iteration + 1}/{MAX_REACT_ITERATIONS}")

        try:
            response = await client.aio.models.generate_content(
                model=MODEL,
                contents=contents,
                config=config,
            )
        except Exception as e:
            logger.error(f"[Agent] Gemini call failed: {e}")
            yield {"type": "text", "content": "Sorry, I encountered an error while processing your request."}
            return

        if not response.candidates or not response.candidates[0].content:
            yield {"type": "text", "content": "I wasn't able to generate a response. Please try again."}
            return

        candidate_content = response.candidates[0].content
        parts = candidate_content.parts or []

        # Separate function calls from text parts
        fc_parts = [p for p in parts if p.function_call]
        text_parts = [p for p in parts if p.text]

        if not fc_parts:
            # No function calls — model returned final text
            final_text = "".join(p.text for p in text_parts if p.text)
            if final_text:
                yield {"type": "text", "content": final_text}
            else:
                yield {"type": "text", "content": "I'm not sure how to help with that. Could you rephrase?"}
            return

        # Execute function calls and collect responses
        function_response_parts = []
        for part in fc_parts:
            fc = part.function_call
            display = TOOL_DISPLAY_NAMES.get(fc.name, fc.name)

            # Yield "calling" status
            yield {
                "type": "status",
                "tool": fc.name,
                "displayName": display,
                "phase": "calling",
            }

            # Execute the tool
            result = await execute_tool(fc, user_token)

            # Yield "done" status with summary
            summary = summarize_tool_result(fc.name, result)
            yield {
                "type": "status",
                "tool": fc.name,
                "displayName": display,
                "phase": "done",
                "summary": summary,
            }

            function_response_parts.append(
                types.Part.from_function_response(
                    name=fc.name,
                    response=result,
                )
            )

        # Append the model's function-call content and our responses to the conversation
        contents.append(candidate_content)
        contents.append(types.Content(role="user", parts=function_response_parts))

    # Safety: max iterations reached
    yield {
        "type": "text",
        "content": (
            "I've reached the maximum number of steps for this request. "
            "The actions I've completed so far are saved. Please try again if you need more."
        ),
    }
