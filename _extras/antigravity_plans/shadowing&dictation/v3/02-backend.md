# Phase 2: Backend Separation

## Current State

One unified `ShadowingModule` at `backend-core/src/modules/shadowing/`:
```
shadowing/
├── shadowing.module.ts          → registers all 4 controllers + 4 services
├── controllers/
│   ├── system-lessons.controller.ts   → GET /shadowing/system-lessons
│   ├── user-videos.controller.ts      → CRUD /shadowing/videos
│   ├── folders.controller.ts          → CRUD /shadowing/folders
│   └── progress.controller.ts         → GET/POST /shadowing/progress
├── services/
│   ├── system-lessons.service.ts      → queries ShadowingVideo where userId=null
│   ├── user-videos.service.ts         → queries ShadowingVideo where userId!=null
│   ├── folders.service.ts             → queries ShadowingFolder
│   └── progress.service.ts           → queries ShadowingDictationProgress (both types)
└── dto/
    ├── create-video.dto.ts
    ├── update-video.dto.ts
    └── upsert-progress.dto.ts
```

**Problem**: `ProgressService` handles both shadowing and dictation in a single table via `type` column. All services query the same `ShadowingVideo` table.

## Target State

Two independent NestJS modules:

```
modules/
├── shadowing/
│   ├── shadowing.module.ts
│   ├── controllers/
│   │   ├── shadowing-lessons.controller.ts    → GET /shadowing/lessons
│   │   ├── shadowing-videos.controller.ts     → CRUD /shadowing/videos
│   │   ├── shadowing-folders.controller.ts    → CRUD /shadowing/folders
│   │   └── shadowing-progress.controller.ts   → GET/POST /shadowing/progress
│   ├── services/
│   │   ├── shadowing-lessons.service.ts       → prisma.shadowingVideo (userId=null)
│   │   ├── shadowing-videos.service.ts        → prisma.shadowingVideo (userId!=null)
│   │   ├── shadowing-folders.service.ts       → prisma.shadowingFolder
│   │   └── shadowing-progress.service.ts      → prisma.shadowingProgress
│   └── dto/
│       ├── create-shadowing-video.dto.ts
│       ├── update-shadowing-video.dto.ts
│       └── upsert-shadowing-progress.dto.ts
│
├── dictation/
│   ├── dictation.module.ts
│   ├── controllers/
│   │   ├── dictation-lessons.controller.ts    → GET /dictation/lessons
│   │   ├── dictation-videos.controller.ts     → CRUD /dictation/videos
│   │   ├── dictation-folders.controller.ts    → CRUD /dictation/folders
│   │   └── dictation-progress.controller.ts   → GET/POST /dictation/progress
│   ├── services/
│   │   ├── dictation-lessons.service.ts       → prisma.dictationVideo (userId=null)
│   │   ├── dictation-videos.service.ts        → prisma.dictationVideo (userId!=null)
│   │   ├── dictation-folders.service.ts       → prisma.dictationFolder
│   │   └── dictation-progress.service.ts      → prisma.dictationProgress
│   └── dto/
│       ├── create-dictation-video.dto.ts
│       ├── update-dictation-video.dto.ts
│       └── upsert-dictation-progress.dto.ts
```

---

## Step 2.1: Create `ShadowingModule`

### `shadowing-progress.service.ts`
Key difference from current `ProgressService`:
- Queries `prisma.shadowingProgress` (no `type` column)
- NO `dictationDifficulty` field
- NO notification on completion (shadowing doesn't trigger notifications)
- `findByLesson` returns `{ completedSentences: number[] }` (flat, no shadowing/dictation nesting)
- `findAllByUser` returns `Record<string, number[]>` (just lessonId → completedSentences)

### `shadowing-lessons.service.ts`
- Identical logic to current `system-lessons.service.ts`
- Queries `prisma.shadowingVideo.findMany({ where: { userId: null } })`

### `shadowing-videos.service.ts`
- Identical logic to current `user-videos.service.ts`
- Queries `prisma.shadowingVideo`

### `shadowing-folders.service.ts`
- Identical logic to current `folders.service.ts`
- Queries `prisma.shadowingFolder` + `prisma.shadowingVideo`

### DTOs
- `UpsertShadowingProgressDto`: `lessonId`, `completedSentences` (NO `type`, NO `dictationDifficulty`)

### Controller Routes
| Method | Route | Handler |
|---|---|---|
| GET | `/shadowing/lessons` | `findAll()` |
| GET | `/shadowing/lessons/:id` | `findById(id)` |
| GET | `/shadowing/videos` | `findAll(userId)` |
| POST | `/shadowing/videos` | `create(userId, dto)` |
| PATCH | `/shadowing/videos/:id` | `update(userId, id, dto)` |
| DELETE | `/shadowing/videos/:id` | `delete(userId, id)` |
| GET | `/shadowing/folders` | `findAll(userId)` |
| POST | `/shadowing/folders` | `create(userId, name)` |
| PATCH | `/shadowing/folders/:name` | `rename(userId, name, newName)` |
| DELETE | `/shadowing/folders/:name` | `delete(userId, name)` |
| GET | `/shadowing/progress` | `findAllByUser(userId)` |
| GET | `/shadowing/progress/:lessonId` | `findByLesson(userId, lessonId)` |
| POST | `/shadowing/progress` | `upsert(userId, dto)` |

---

## Step 2.2: Create `DictationModule`

### `dictation-progress.service.ts`
Key differences from shadowing:
- Queries `prisma.dictationProgress`
- HAS `difficulty` field (read + write)
- Triggers `NotificationsService.notifyDictationComplete()` on lesson completion
- `findByLesson` returns `{ completedSentences: number[], difficulty: string }`
- `findAllByUser` returns `Record<string, { completedSentences: number[], difficulty: string }>`

### `dictation-lessons.service.ts`
- Queries `prisma.dictationVideo.findMany({ where: { userId: null } })`

### `dictation-videos.service.ts`
- Queries `prisma.dictationVideo`

### `dictation-folders.service.ts`
- Queries `prisma.dictationFolder` + `prisma.dictationVideo`

### DTOs
- `UpsertDictationProgressDto`: `lessonId`, `completedSentences`, `difficulty?`, `lessonTitle?`, `totalSentences?`

### Controller Routes
| Method | Route | Handler |
|---|---|---|
| GET | `/dictation/lessons` | `findAll()` |
| GET | `/dictation/lessons/:id` | `findById(id)` |
| GET | `/dictation/videos` | `findAll(userId)` |
| POST | `/dictation/videos` | `create(userId, dto)` |
| PATCH | `/dictation/videos/:id` | `update(userId, id, dto)` |
| DELETE | `/dictation/videos/:id` | `delete(userId, id)` |
| GET | `/dictation/folders` | `findAll(userId)` |
| POST | `/dictation/folders` | `create(userId, name)` |
| PATCH | `/dictation/folders/:name` | `rename(userId, name, newName)` |
| DELETE | `/dictation/folders/:name` | `delete(userId, name)` |
| GET | `/dictation/progress` | `findAllByUser(userId)` |
| GET | `/dictation/progress/:lessonId` | `findByLesson(userId, lessonId)` |
| POST | `/dictation/progress` | `upsert(userId, dto)` |

---

## Step 2.3: Register Modules

In `app.module.ts`:
```ts
import { ShadowingModule } from './modules/shadowing/shadowing.module';
import { DictationModule } from './modules/dictation/dictation.module';

@Module({
  imports: [
    // ... existing
    ShadowingModule,
    DictationModule,
  ],
})
export class AppModule {}
```

## Step 2.4: Delete Old Unified Module

Remove the entire `backend-core/src/modules/shadowing/` directory (the old one) AFTER the new modules are registered and tested.

> **Backward compatibility note**: During transition, you can keep the old `/shadowing/progress` endpoint alive alongside the new ones. Remove it in Phase 6 (cleanup).
