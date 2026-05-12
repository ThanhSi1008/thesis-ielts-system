# Feature: SRS Rating Integration for Vocabulary Learning Flow

## Overview

Replace the binary **"Already Know / Add to My Flashcard"** buttons on the Foundation Vocabulary word-list page with the Vocab Lab's 4-button SRS rating system (**Again / Hard / Good / Easy**) plus a subtle **"Already Know"** skip link.

When a user rates a word (Again/Hard/Good/Easy), the system will:
1. Create a flashcard in Vocab Lab (reusing the existing `createFlashcardFromVocabulary` logic)
2. Immediately submit an initial FSRS review with the chosen rating
3. Advance to the next word in the lesson

When a user clicks "Already Know", it simply skips to the next word with no Vocab Lab entry.

## Phases

| Phase | File | Description |
|-------|------|-------------|
| 1 | `phase1_backend_endpoint.md` | Add new combined backend endpoint |
| 2 | `phase2_frontend_api.md` | Add frontend API method |
| 3 | `phase3_ui_component.md` | Replace UI buttons with SRS rating panel |
| 4 | `phase4_verification.md` | Testing & verification checklist |

## Key Files

### Backend
- `backend-core/src/modules/vocab-lab/dto/vocab-lab.dto.ts` — DTO definitions
- `backend-core/src/modules/vocab-lab/vocab-lab.controller.ts` — Route handlers
- `backend-core/src/modules/vocab-lab/vocab-lab.service.ts` — Business logic

### Frontend
- `frontend-web/src/services/vocabLab.api.ts` — API client
- `frontend-web/src/app/ielts/vocabulary/[bookSlug]/[unitSlug]/page.tsx` — Main page with `WordListFlipCard` component
- `frontend-web/src/app/vocab-lab/study/[deckId]/page.tsx` — Reference for SRS button styling

## Design Principles (from code-rules.md)
- **SRP**: Keep the new rating panel as a pure UI component; API call logic stays in the parent handler
- **ISP**: The rating panel only receives `onRate`, `onSkip`, `isSubmitting` — no large data objects
- **DIP**: UI → API client abstraction, never call `fetch` directly
- **No Magic Numbers**: Rating values (1–4) and interval labels defined as constants
- **Early Return**: Use bouncer pattern in handlers
