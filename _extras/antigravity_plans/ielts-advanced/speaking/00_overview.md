# IELTS Advanced Speaking — Master Plan

> **Entry point** for adding IELTS Advanced Speaking practice to the system.
> Each phase is in its own file for independent implementation.

---

## Current Architecture Snapshot

| Layer | Technology | Key Files |
|-------|-----------|-----------|
| **Backend** | NestJS + Prisma + PostgreSQL | `backend-core/src/modules/ielts/ielts-advanced.controller.ts`, `ielts-advanced.service.ts` |
| **Frontend** | Next.js 14 (App Router) | `frontend-web/src/app/ielts/advanced/` |
| **AI Grading** | Python + Gemini 2.5 Flash + Whisper | `backend-ai/app/services/speaking_grader.py` |
| **Message Queue** | RabbitMQ | `backend-ai/app/consumers/grading_consumer.py` |
| **Seeder** | ts-node script | `backend-core/prisma/seeders/ielts-advanced.seeder.ts` |
| **Data Source** | Engnovate.com (WordPress REST API) | `backend-core/prisma/scripts/scrape-engnovate-speaking.mjs` |

### Current Speaking Status in IELTS Advanced
- **No** `IeltsAdvancedSpeakingPart` model in the Prisma schema
- **No** speaking routes in `ielts-advanced.controller.ts`
- **No** "Speaking" tab in `AdvancedContent.tsx` (only Listening, Reading, Writing)
- IELTS **Intensive** Speaking works end-to-end (video-based, `SpeakingTaskBoard.tsx`)
- IELTS **Intensive** Speaking grader works (`speaking_grader.py` with Whisper + Gemini)

### Key Difference from IELTS Intensive Speaking

| | IELTS Intensive | IELTS Advanced (this plan) |
|---|---|---|
| **Structure** | Full exam (Part 1 + 2 + 3 together) | Individual parts practiced separately |
| **Question Delivery** | Video-based (examiner video plays) | **Text-based** (questions on screen) |
| **Scope** | One session = entire speaking exam | One session = single part |
| **Grading** | Grades all 3 parts together | Grades one part at a time |
| **Data Source** | Manually seeded with video links | Scraped from Engnovate (text only) |

---

## Phase Overview

| Phase | File | Scope | Depends On | Effort |
|-------|------|-------|------------|--------|
| **Phase 1** | `phase-1-data-scraping.md` | Scrape engnovate.com → `speaking-parts.json` | Nothing | 1–2 days |
| **Phase 2** | `phase-2-schema-seeder.md` | Prisma schema + migration + seeder | Phase 1 | 1 day |
| **Phase 3** | `phase-3-backend-api.md` | NestJS controller + service (7 endpoints) | Phase 2 | 1–2 days |
| **Phase 4** | `phase-4-ai-grading.md` | `grade_single_speaking_part()` + consumer | Phase 3 | 1–2 days |
| **Phase 5** | `phase-5-frontend-ui.md` | Catalog, practice page, result page, hooks | Phase 3 + 4 | 2–3 days |
| **Phase 6** | `phase-6-polish.md` | Statistics, gamification, edge cases, UX | Phase 5 | 1 day |

**Total estimated effort: ~8–11 days**

---

## Data Source Summary

- **Source**: engnovate.com public WordPress REST API
- **Endpoint**: `GET /wp-json/wp/v2/ielts_speaking_test`
- **Categories**: 10 categories, ~340 total tests
- **Target**: Academic categories only → ~55–60 full tests → **~165–180 part entries**
- **Strategy**: Scrape full test pages only (exclude per-part duplicates), split into Part 1/2/3

---

## Key Design Decisions

1. **Text-based, not video-based** — Questions displayed as text, user records audio
2. **Per-part practice** — Practice Part 1, 2, or 3 individually (not all together)
3. **Simplified state machine** — `IDLE → READING → THINKING → RECORDING → RECORDED` (no video states)
4. **Audio as base64** — Same pattern as Intensive Speaking for MVP
5. **Reuse existing grader** — Adapt `speaking_grader.py` with part-specific prompts
6. **Reuse existing result view** — `SpeakingResultView.tsx` works with same feedback shape

---

## Files Created/Modified (Summary)

### New Files
| File | Phase |
|------|-------|
| `backend-core/prisma/scripts/scrape-engnovate-speaking.mjs` | 1 |
| `backend-core/prisma/data/ielts-advanced-compiled/speaking-parts.json` | 1 |
| `frontend-web/src/hooks/useIeltsAdvancedSpeaking.ts` | 5 |
| `frontend-web/src/app/ielts/advanced/speaking/page.tsx` | 5 |
| `frontend-web/src/app/ielts/advanced/speaking/SpeakingCatalogContent.tsx` | 5 |
| `frontend-web/src/app/ielts/advanced/speaking/[partId]/layout.tsx` | 5 |
| `frontend-web/src/app/ielts/advanced/speaking/[partId]/page.tsx` | 5 |
| `frontend-web/src/app/ielts/advanced/speaking/[partId]/SpeakingPracticeContent.tsx` | 5 |
| `frontend-web/src/app/ielts/advanced/speaking/[partId]/my-answers/page.tsx` | 5 |
| `frontend-web/src/app/ielts/advanced/speaking/[partId]/community/page.tsx` | 5 |
| `frontend-web/src/app/ielts/advanced/speaking/[partId]/result/[sessionId]/page.tsx` | 5 |
| `frontend-web/src/app/ielts/advanced/speaking/[partId]/result/[sessionId]/SpeakingResultContent.tsx` | 5 |

### Modified Files
| File | Phase |
|------|-------|
| `backend-core/prisma/schema.prisma` | 2 |
| `backend-core/prisma/seeders/ielts-advanced.seeder.ts` | 2 |
| `backend-core/src/modules/ielts/ielts-advanced.controller.ts` | 3 |
| `backend-core/src/modules/ielts/ielts-advanced.service.ts` | 3 |
| `backend-ai/app/services/speaking_grader.py` | 4 |
| `backend-ai/app/consumers/grading_consumer.py` | 4 |
| `frontend-web/src/app/ielts/advanced/AdvancedContent.tsx` | 5 |
| `frontend-web/src/app/ielts/statistics/StatisticsContent.tsx` | 6 |
