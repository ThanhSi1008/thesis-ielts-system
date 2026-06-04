# IELTS Listening Intensive — Explanation Feature

## Overview

Add AI-generated explanations to the IELTS Listening Intensive result page. When a user clicks "Explain" on a question they got wrong, the system calls the existing `/chat` API with a specialized prompt and displays the AI's response inline.

## Architecture Summary

```
User clicks "Explain" on question #3
         │
         ▼
Frontend builds prompt with:
  - question text, correct answer, user's wrong answer
  - transcript snippet around that question
  - question type (MC, fill-in-blank, matching, etc.)
         │
         ▼
POST /chat  (backend-core proxy → backend-ai Gemini)
  { system_instruction: EXPLAIN_PROMPT, messages: [...], stream: false }
         │
         ▼
AI returns markdown explanation
         │
         ▼
Frontend renders it in a collapsible blue panel below the question
```

**Zero backend changes required** — we reuse the existing `/chat` endpoint's `system_instruction` override.

## Phases

| Phase | File | Description |
|-------|------|-------------|
| 1 | [phase-1-explain-service.md](./phase-1-explain-service.md) | Create the frontend API service + prompt builder |
| 2 | [phase-2-enable-explain-button.md](./phase-2-enable-explain-button.md) | Wire up the Explain button and render inline explanations |
| 3 | [phase-3-polish.md](./phase-3-polish.md) | Caching, error handling, loading skeleton, and markdown rendering |

## Key Files (read these before starting)

| File | Purpose |
|------|---------|
| `frontend-web/src/app/ielts/intensive/[examId]/result/[sessionId]/page.tsx` | The result page (1859 lines). Contains `ReviewActions` (L423-451) and `ReviewItemField` (L453-1049) |
| `frontend-web/src/services/exams.api.ts` | Exam API service (where new explain function goes) |
| `frontend-web/src/lib/api.ts` | Axios client — used for `api.post('/chat', ...)` |
| `frontend-web/src/lib/exam-parser.ts` | `NormalizedItem` type definition + `extractAllItemsFromPart()` |
| `frontend-web/src/constants/index.ts` | `API_BASE_URL` constant |
| `frontend-web/src/services/auth.service.ts` | `authService.getToken()` at L68 |
| `frontend-web/src/components/GlobalAIChatFab.tsx` | Reference implementation of calling `/chat` with `system_instruction` (L233-239) |
| `backend-core/src/modules/ai-client/chat.controller.ts` | NestJS proxy: `POST /chat` → `POST backend-ai:8000/api/v1/chat` |
| `backend-ai/app/api/chat.py` | FastAPI endpoint accepting `{ messages, system_instruction, stream }` |

## Important Context

- The chat API flow: Frontend `POST /chat` → backend-core proxy (chat.controller.ts) → backend-ai FastAPI `/api/v1/chat`
- The `ChatRequest` model in `backend-ai/app/api/chat.py` already accepts `system_instruction` override (L40)
- When `stream: false`, the response is `{ response: string }` (L76)
- When `stream: true`, the response is SSE format `data: ...\n\n` (L89)
- The `api` client in `frontend-web/src/lib/api.ts` auto-injects Bearer token (L42-44)
- The result page already has `transcript` data per part (L1076): `const transcript: any[] = activePart?.transcript ?? [];`
- Each transcript line has: `{ speaker, text, question_number?, highlight_text?, timestamp_seconds? }`
