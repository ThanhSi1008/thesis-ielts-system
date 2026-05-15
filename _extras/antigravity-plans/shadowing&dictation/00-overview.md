# Shadowing & Dictation — Full Refactoring Plan

> **Goal**: Decompose the monolithic Shadowing & Dictation module into clean, maintainable files following SRP, OCP, ISP, and DIP — across Database, Backend, and Frontend layers.

---

## Current State (Problems)

| Layer | File | Lines | Problem |
|---|---|---|---|
| **DB** | `schema.prisma` (3 models) | ~55 | `ShadowingVideo` stores both system lessons and user videos in one table, differentiated only by `userId == null`. Works but couples two different concepts. |
| **DB** | `shadowing-lessons.ts` (seed data) | 4,015 | Single massive file with all lesson content. Manageable but could use typed interfaces. |
| **Backend** | `shadowing.service.ts` | 235 | One god-service handling 5 domains: System Lessons, User Videos, Folders, Progress. Violates SRP. |
| **Backend** | `shadowing.controller.ts` | 109 | One controller with all routes. Acceptable for now but should match service split. |
| **Backend** | DTOs (3 files) | ~105 | Clean, no issues. |
| **Frontend** | `dictation/page.tsx` | **894** | Massive monolith: data fetching, YouTube API, audio playback, difficulty logic, word matching, keyboard shortcuts, AND 400+ lines of JSX all in ONE component. **Critically violates SRP**. |
| **Frontend** | `shadowing/page.tsx` | **885** | Same problem. Nearly identical structure to dictation with recording logic instead. |
| **Frontend** | `my-videos/page.tsx` | **868** | Monolith: folder CRUD, video CRUD, modals, search, progress — all in one file. |
| **Frontend** | `page.tsx` (library listing) | 319 | Acceptable but could extract card component. |
| **Frontend** | `shadowing.api.ts` | 132 | Single API service for everything. Clean but should be split when backend splits. |

---

## Refactoring Phases

### Phase 1 — Database Layer
### Phase 2 — Backend Layer (NestJS)
### Phase 3 — Frontend API & Hooks Layer
### Phase 4 — Frontend Components (Dictation)
### Phase 5 — Frontend Components (Shadowing)
### Phase 6 — Frontend Components (Library & My Videos)

> Each phase has its own detailed file in this folder. **Phases are designed to be executed sequentially** — each phase builds on the previous one.

---

## File Index

| File | Description |
|---|---|
| `00-overview.md` | This file — high-level overview and phase summary |
| `01-database.md` | Database schema changes and seed data refactoring |
| `02-backend.md` | NestJS service/controller/DTO decomposition |
| `03-frontend-api-hooks.md` | API client split + custom hooks extraction |
| `04-frontend-dictation.md` | Dictation page decomposition into components |
| `05-frontend-shadowing.md` | Shadowing page decomposition into components |
| `06-frontend-library.md` | Library listing + My Videos page refactoring |

---

## Target Architecture (After Refactoring)

```
backend-core/src/modules/shadowing/
├── shadowing.module.ts              # NestJS module (unchanged)
├── controllers/
│   ├── system-lessons.controller.ts  # GET /shadowing/system-lessons
│   ├── user-videos.controller.ts     # CRUD /shadowing/videos
│   ├── folders.controller.ts         # CRUD /shadowing/folders
│   └── progress.controller.ts        # GET/POST /shadowing/progress
├── services/
│   ├── system-lessons.service.ts
│   ├── user-videos.service.ts
│   ├── folders.service.ts
│   └── progress.service.ts
└── dto/
    ├── create-video.dto.ts           # (unchanged)
    ├── update-video.dto.ts           # (unchanged)
    └── upsert-progress.dto.ts        # (unchanged)

frontend-web/src/
├── services/
│   └── shadowing.api.ts              # Kept as single file (thin client)
├── app/shadowing-dictation/
│   ├── _hooks/
│   │   ├── useLesson.ts              # Fetch lesson + resolve system vs user
│   │   ├── useProgress.ts            # Fetch/save progress (shadowing + dictation)
│   │   ├── useYouTubePlayer.ts       # YouTube IFrame API lifecycle
│   │   ├── useAudioPlayer.ts         # HTML5 audio segment playback
│   │   └── useKeyboardShortcuts.ts   # Keyboard event handlers
│   ├── _components/
│   │   ├── ShadowingSidebar.tsx       # (unchanged)
│   │   ├── VideoPlayer.tsx            # YouTube or Audio source panel
│   │   ├── TranscriptList.tsx         # Scrollable sentence list (shared)
│   │   ├── SentenceRow.tsx            # Single sentence row (completed/active)
│   │   ├── PlaybackControls.tsx       # Speed panel + repeat button
│   │   ├── ProgressBar.tsx            # Top progress indicator
│   │   ├── DifficultySelector.tsx     # Dictation difficulty dropdown
│   │   ├── WordGrid.tsx              # Dictation word blanks display
│   │   ├── DictationInput.tsx         # Textarea for typing answers
│   │   ├── RecordingControls.tsx      # Shadowing mic + playback
│   │   ├── LessonCard.tsx             # Video card for library listing
│   │   └── CompletionScreen.tsx       # Finished-all-sentences overlay
│   ├── [id]/
│   │   ├── dictation/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx              # ~120 lines (composition only)
│   │   └── shadowing/
│   │       ├── layout.tsx
│   │       └── page.tsx              # ~120 lines (composition only)
│   ├── my-videos/
│   │   ├── _components/
│   │   │   ├── CreateVideoModal.tsx
│   │   │   ├── EditVideoModal.tsx
│   │   │   ├── FolderSidebar.tsx
│   │   │   └── VideoCard.tsx
│   │   └── page.tsx                  # ~100 lines
│   ├── layout.tsx
│   └── page.tsx                      # ~100 lines
```
