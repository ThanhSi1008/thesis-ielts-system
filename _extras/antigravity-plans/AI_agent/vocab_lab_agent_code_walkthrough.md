# Vocab Lab AI Agent — Code Walkthrough for Thesis Defense

> [!NOTE]
> This document explains the AI Agent implementation in academic terms suitable for a thesis committee. It covers the design pattern (ReAct), the technology (Gemini Function Calling), and walks through each file with annotated code excerpts.

---

## 1. What Is This Agent?

The Vocab Lab AI Agent transforms the Lexon AI chatbot from a **stateless text generator** into an **autonomous agent** that can take real actions in the system. Instead of just answering questions, it can:

- Look up a user's flashcard decks
- Create new flashcards with rich content
- Check study statistics and give personalized advice
- Create new decks on demand

### Academic Foundation: The ReAct Pattern

Our agent implements the **ReAct** (Reasoning + Acting) pattern from Yao et al. (2023):

```
Traditional Chatbot:    Input → LLM → Text Output
                        (one-shot, no side effects)

ReAct Agent:            Input → LLM → [Reason] → [Act] → [Observe] → [Reason] → ... → Output
                        (multi-step, autonomous, with real side effects)
```

The agent **reasons** about what the user wants, **acts** by calling tools (API endpoints), **observes** the results, and then either takes more actions or generates a final response.

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                         │
│   GlobalAIChatFab.tsx — sends messages with JWT Authorization      │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ POST /api/v1/chat
                               │ Authorization: Bearer <JWT>
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    backend-core (NestJS) — Proxy                   │
│   chat.controller.ts — forwards JWT to AI service                  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ POST /api/v1/chat (with JWT)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     backend-ai (FastAPI)                            │
│                                                                     │
│   chat.py ──→ vocab_agent.py ──→ Gemini API (with 7 tools)         │
│                     │                    │                           │
│                     │              function_call?                    │
│                     │                    │ YES                       │
│                     │                    ▼                           │
│                     │         execute_tool() ──→ backend-core API   │
│                     │                    │       (with proxied JWT)  │
│                     │              result ◄────────────────────────  │
│                     │                    │                           │
│                     │         feed result back to Gemini             │
│                     │              (loop until text response)        │
│                     │                    │                           │
│                     ◄──── SSE stream (status events + text)         │
└─────────────────────────────────────────────────────────────────────┘
```

**Key design decision**: The AI service acts as an intelligent **orchestrator** — it proxies the user's JWT to make authenticated API calls to backend-core. This means the agent can only access data the user is authorized to see, enforcing the existing permission model.

---

## 3. File-by-File Code Walkthrough

### File 1: `vocab_agent.py` — The Agent Core

This is the heart of the system. It has three parts:

#### Part A: Tool Declarations (lines 28-138)

These tell Gemini **what tools are available** using structured schemas:

```python
VOCAB_TOOLS = types.Tool(function_declarations=[
    types.FunctionDeclaration(
        name="list_decks",
        description=(
            "List all of the user's vocabulary decks with card counts. "
            "Returns each deck's id, name, newCount, learningCount, dueCount, and totalCards. "
            "Call this FIRST whenever you need to know which decks exist "
            "or resolve a deck name to an ID."
        ),
        parameters=types.Schema(type="OBJECT", properties={}),
    ),
    # ... 6 more tools
])
```

> **Committee talking point**: "We define 7 tool declarations using Gemini's native function calling schema. Each declaration includes a name, natural language description, and parameter schema. The descriptions act as behavioral instructions — for example, `list_decks` tells the model to 'call this FIRST' before creating cards, enabling multi-step planning."

**The 7 tools and what they map to:**

| Tool | backend-core Endpoint | Purpose |
|------|----------------------|---------|
| `list_decks` | `GET /vocab-lab/decks` | See user's decks before creating cards |
| `create_deck` | `POST /vocab-lab/decks` | Create a new deck on demand |
| `get_card_types` | `GET /vocab-lab/card-types` | Understand card structure (fields, templates) |
| `create_flashcard` | `POST /vocab-lab/cards` | Create a flashcard with rich content |
| `search_cards` | `GET /vocab-lab/cards` | Duplicate detection before creating |
| `get_study_stats` | `GET /vocab-lab/stats` | Retrieve FSRS stats for personalized advice |
| `get_tags` | `GET /vocab-lab/tags` | Suggest existing tags for new cards |

#### Part B: Tool Executor (lines 145-250)

This function **bridges** between the LLM's function calls and the real REST API:

```python
async def execute_tool(function_call, user_token: str) -> dict:
    """Proxy tool calls to backend-core with the user's JWT."""
    
    name = function_call.name
    args = dict(function_call.args) if function_call.args else {}
    base = settings.backend_core_url   # http://localhost:3000/api/v1
    
    headers = {"Content-Type": "application/json"}
    if user_token:
        headers["Authorization"] = f"Bearer {user_token}"

    async with httpx.AsyncClient(timeout=15.0) as client:
        if name == "list_decks":
            resp = await client.get(f"{base}/vocab-lab/decks", headers=headers)
            resp.raise_for_status()
            return {"decks": resp.json()}

        elif name == "create_flashcard":
            payload = {
                "deckId": args["deckId"],
                "front": args.get("front", ""),
                "back": args.get("back", ""),
            }
            if args.get("tags"):
                payload["tags"] = args["tags"]
            resp = await client.post(f"{base}/vocab-lab/cards", json=payload, headers=headers)
            resp.raise_for_status()
            return {"success": True, "card": resp.json()}
        # ... other tools
```

> **Committee talking point**: "The tool executor acts as a secure proxy layer. It forwards the user's JWT token to backend-core, ensuring that all agent actions are authenticated and authorized through the same permission model as the rest of the application. Error handling is built in — if a tool fails, the error is returned to Gemini as a function response so it can explain the issue to the user naturally."

#### Part C: The ReAct Loop (lines 285-380)

This is the core agent loop — the **agentic behavior**:

```python
async def run_agent(client, contents, system_prompt, user_token):
    """ReAct loop: Reason → Act → Observe → Repeat."""
    
    config = types.GenerateContentConfig(
        system_instruction=system_prompt,
        tools=[VOCAB_TOOLS],       # ← 7 tools available
        temperature=0.7,
    )

    for iteration in range(MAX_REACT_ITERATIONS):    # Max 8 iterations (safety)
        # Step 1: Call Gemini with tools
        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents,
            config=config,
        )

        parts = response.candidates[0].content.parts
        fc_parts = [p for p in parts if p.function_call]   # Function calls
        text_parts = [p for p in parts if p.text]           # Text response

        if not fc_parts:
            # No tools called → model returned final text answer
            yield {"type": "text", "content": response.text}
            return

        # Step 2: Execute each function call
        function_response_parts = []
        for part in fc_parts:
            fc = part.function_call

            yield {"type": "status", "tool": fc.name, "phase": "calling"}

            result = await execute_tool(fc, user_token)     # ← Real API call

            yield {"type": "status", "tool": fc.name, "phase": "done",
                   "summary": summarize_tool_result(fc.name, result)}

            function_response_parts.append(
                types.Part.from_function_response(name=fc.name, response=result)
            )

        # Step 3: Feed results back to Gemini (continue the loop)
        contents.append(response.candidates[0].content)          # Model's function calls
        contents.append(types.Content(role="user", parts=function_response_parts))  # Our results
```

> **Committee talking point**: "The ReAct loop is bounded to 8 iterations for safety. In each iteration, Gemini decides whether to call a tool or return a text response. When it calls tools, we execute them against our backend, feed the results back as `function_response` messages, and Gemini reasons about the next step. This creates an autonomous multi-step workflow — for example: `list_decks → get_card_types → create_flashcard → text response`."

---

### File 2: `chat_system.py` — Agent System Prompt

The system prompt is **layered** in three tiers:

```
Layer 1: CHAT_SYSTEM_INSTRUCTION     ← Base IELTS tutor identity (existing)
Layer 2: AGENT_TOOL_INSTRUCTIONS     ← When and how to use tools (new)
Layer 3: User Context Injection      ← Name, streak, scores, current page
```

Key excerpt from the agent tool instructions:

```python
AGENT_TOOL_INSTRUCTIONS = """
## Agent Capabilities — Tool Use

### Tool Usage Rules
1. **Always call `list_decks` first** if you need to create a card and 
   don't know the user's decks yet. Never guess a deckId.
2. **Call `get_card_types` before creating structured cards** so you can 
   use the correct cardTypeId and field IDs.
3. **Check for duplicates** — before creating a card, consider calling 
   `search_cards` to see if a similar card already exists.
4. **Always tag AI-created cards** with "ai-generated" for traceability.
5. **Never hallucinate tool results** — only report data that a tool 
   actually returned.

### When NOT to use tools
- If the user is just asking a question about English — answer directly.
- If explaining a word — explain first, then offer to save as flashcard.
"""
```

> **Committee talking point**: "The system prompt uses prompt engineering to establish behavioral rules for tool selection. This is critical because the LLM must decide *autonomously* when to call tools vs. when to respond directly. The rules create a decision framework — for example, 'explain first, then offer to save' ensures the agent doesn't create cards without user consent."

---

### File 3: `chat.py` — The Chat Endpoint

The endpoint was modified to route through the agent by default:

```python
@router.post("")
async def chat_endpoint(request: ChatRequest, req: Request):
    # Extract JWT from the proxied request
    auth_header = req.headers.get("authorization", "")
    user_token = auth_header.replace("Bearer ", "").strip()

    # Build the agent system prompt (tutor identity + tool rules + user context)
    agent_prompt = build_agent_prompt(context_dict)

    # Run the agent and stream results as SSE
    async def agent_stream_generator():
        async for event in run_agent(_client, contents, agent_prompt, user_token):
            if event["type"] == "status":
                yield f"event: status\ndata: {json.dumps(event)}\n\n"   # Tool action
            elif event["type"] == "text":
                yield f"data: {event['content']}\n\n"                    # Final text

    return StreamingResponse(agent_stream_generator(), media_type="text/event-stream")
```

> **Committee talking point**: "The SSE (Server-Sent Events) protocol was extended with a custom `event: status` type. This allows the frontend to display real-time tool execution feedback (e.g., '🔍 Looking up decks...') while the agent is working, providing full transparency into the agent's decision-making process."

---

### File 4: `GlobalAIChatFab.tsx` — Frontend Agent UI

The frontend was updated to parse the new SSE event types and display tool action "pills":

```tsx
// Parse SSE events
if (rawEvent.startsWith("event: status")) {
    // Agent is calling a tool — show a status pill
    const status = JSON.parse(dataLine.slice(6));
    const action: ToolAction = {
        tool: status.tool,
        displayName: status.displayName,
        phase: status.phase,          // "calling" or "done"
        summary: status.summary,       // e.g., "Found 3 decks"
    };
}
```

This renders as visual pills in the chat:

```
┌──────────────────────────────────────────────┐
│ 🔄 Looking up decks...                       │  ← calling (blue, spinner)
│ ✅ Found 3 decks: IELTS Vocab, Academic, ... │  ← done (green, checkmark)
│ 🔄 Creating flashcard...                     │  ← calling
│ ✅ Created card "ubiquitous"                 │  ← done
│                                              │
│ Done! I've added 'ubiquitous' to your        │  ← final text response
│ IELTS Vocab deck with a definition and       │
│ example sentence. ✅                         │
└──────────────────────────────────────────────┘
```

---

### File 5: `chat.controller.ts` — JWT Proxy Fix

The NestJS proxy was updated to forward the Authorization header:

```typescript
// Forward the user's JWT so the AI agent can make authenticated calls
const authHeader = request.headers["authorization"];
if (authHeader) {
    proxyHeaders["Authorization"] = authHeader as string;
}
```

> **Committee talking point**: "Service-to-service authentication uses JWT passthrough — the user's token flows from the frontend through the NestJS proxy, to the FastAPI AI service, and back to the NestJS vocab-lab APIs. This ensures the agent operates within the user's permission scope."

---

## 4. Example Interaction Trace

**User says**: *"Add 'ubiquitous' to my IELTS deck"*

| Step | ReAct Phase | What Happens |
|------|-------------|--------------|
| 1 | **Reason** | Gemini reads the prompt and decides it needs to know the user's decks first |
| 2 | **Act** | Gemini calls `list_decks()` |
| 3 | **Observe** | Agent executes `GET /vocab-lab/decks` → returns 3 decks including "IELTS Vocab" (id: abc123) |
| 4 | **Reason** | Gemini now has the deck ID, decides to create the flashcard |
| 5 | **Act** | Gemini calls `create_flashcard(deckId="abc123", front="ubiquitous", back="present, appearing, or found everywhere...", tags=["ai-generated"])` |
| 6 | **Observe** | Agent executes `POST /vocab-lab/cards` → card created successfully |
| 7 | **Reason** | All tools succeeded, time to respond to the user |
| 8 | **Respond** | Gemini generates: "Done! I've added 'ubiquitous' to your IELTS Vocab deck ✅" |

**Total Gemini API calls**: 3 (initial + 2 function response rounds)  
**Total backend-core API calls**: 2 (list_decks + create_flashcard)  
**ReAct iterations**: 3

---

## 5. Key Thesis Defense Points

### Technical Contributions

1. **ReAct Agent Pattern**: Implements the ReAct architecture (Yao et al., 2023) using Gemini's native function calling, demonstrating multi-step autonomous reasoning
2. **Tool Composition**: The agent composes multiple tools in sequence (`list_decks → create_flashcard`) to fulfill complex user intents that no single API call could handle
3. **Service Orchestration**: The AI service acts as an intelligent orchestrator between the LLM and the data layer, with JWT-scoped security
4. **Transparent Agent UI**: Real-time tool execution visibility via SSE status events, allowing users to observe the agent's reasoning process

### Design Decisions

| Decision | Rationale |
|----------|-----------|
| Bounded loop (max 8) | Prevents infinite tool-calling from runaway agent behavior |
| JWT passthrough | Agent operates within user's existing permission scope — no privilege escalation |
| Error-as-response | Tool failures are returned to Gemini as data, not exceptions — agent explains errors naturally |
| `ai-generated` tag | All agent-created cards are tagged for traceability and user trust |
| No backend-core changes | All 7 tools use existing REST endpoints — zero modifications to the data layer |

### References

- Yao, S., et al. "ReAct: Synergizing Reasoning and Acting in Language Models." ICLR 2023.
- Schick, T., et al. "Toolformer: Language Models Can Teach Themselves to Use Tools." NeurIPS 2023.
- Google. "Gemini API Function Calling." https://ai.google.dev/gemini-api/docs/function-calling
