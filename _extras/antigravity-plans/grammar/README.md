# Grammar Module Redesign — Master Plan

## Problem Statement

The grammar module is **half-hardcoded, half-database**:

- **Database layer** exists (`GrammarBook`, `GrammarUnit`, `GrammarExercise` Prisma models) and backend CRUD is wired up.
- **But the frontend ignores the database entirely.** It imports from a hardcoded `data.ts` file that has only 1 unit of actual content (intermediate unit 1). The rest show "Content coming soon..."
- The seed data in `backend-core/prisma/data/grammar.ts` has only 10/115 Elementary units, 5/145 Intermediate units, 3/105 Advanced units — all **without theory or exercise content**.
- The `GrammarLessonClient.tsx` is a 347-line monolith that handles theory rendering, exercise rendering, answer checking, progress tracking (localStorage), and result modals all in one component.

## Goal

Fully database-driven grammar module with:
1. **Complete seed data** for at least the Intermediate book (145 units with theory HTML + exercises JSON)
2. **Frontend fetches from API** instead of hardcoded `data.ts`
3. **Server-side progress tracking** (replace `localStorage`)
4. **Component decomposition** following project SOLID rules (SRP < 120 lines per component)

## Phase Overview

| Phase | File | Description |
|-------|------|-------------|
| **1** | [PHASE_1_DATA_PIPELINE.md](./PHASE_1_DATA_PIPELINE.md) | Scrape & generate complete seed data for all 3 books |
| **2** | [PHASE_2_BACKEND_API.md](./PHASE_2_BACKEND_API.md) | Extend backend to serve unit content + exercises + progress |
| **3** | [PHASE_3_FRONTEND_REFACTOR.md](./PHASE_3_FRONTEND_REFACTOR.md) | Rewrite frontend to fetch from API, decompose components |

## Execution Order

Phases must be executed sequentially: **Phase 1 → Phase 2 → Phase 3**.

Each phase is self-contained with:
- Current state analysis
- Exact file paths to create/modify
- Code structure and interfaces
- Verification checklist

## Key File Locations

| Layer | Path | Current State |
|-------|------|---------------|
| **Prisma Schema** | `backend-core/prisma/schema.prisma` (L386-433) | ✅ Models exist |
| **Seed Data** | `backend-core/prisma/data/grammar.ts` | ⚠️ Skeleton only |
| **Backend Service** | `backend-core/src/modules/grammar/grammar.service.ts` | ✅ CRUD exists |
| **Backend Controller** | `backend-core/src/modules/grammar/grammar.controller.ts` | ✅ Endpoints exist |
| **Frontend API** | `frontend-web/src/services/learning.api.ts` (L60-73) | ✅ API calls exist |
| **Frontend Types** | `frontend-web/src/types/index.ts` (L158-194) | ✅ Types exist |
| **Frontend Data (HARDCODED)** | `frontend-web/src/app/grammar/data.ts` | ❌ Must be replaced |
| **Book List Page** | `frontend-web/src/app/ielts/grammar/page.tsx` | ⚠️ Uses hardcoded import |
| **Topic Page** | `frontend-web/src/app/ielts/grammar/[topicSlug]/page.tsx` | ⚠️ Uses hardcoded import |
| **Lesson Page** | `frontend-web/src/app/ielts/grammar/[topicSlug]/[lessonSlug]/page.tsx` | ⚠️ Uses hardcoded import |
| **Lesson Client** | `frontend-web/src/app/ielts/grammar/[topicSlug]/[lessonSlug]/GrammarLessonClient.tsx` | ❌ 347-line monolith, hardcoded data |
