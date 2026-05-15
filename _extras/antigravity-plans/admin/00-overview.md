# Admin Content Management System — Master Plan

## Goal
Build an admin dashboard at `/admin` that lets `ADMIN` users create, edit, and delete learning content for:
1. **Shadowing** lessons (Phase 1)
2. **Dictation** lessons (Phase 2)
3. IELTS Basic lessons & exercises (Phase 3 — future)
4. IELTS Advanced practice parts (Phase 4 — future)
5. IELTS Intensive exams (Phase 5 — future)

> **IMPORTANT:**
> Phases 1–2 (Shadowing + Dictation) are the immediate deliverables.
> Phases 3–5 are scoped here for architectural planning but will be planned in separate files later.

---

## Existing Infrastructure (Do NOT Re-Implement)

| Concern | Exists? | Location |
|---|---|---|
| `UserRole` enum (`STUDENT`, `ADMIN`, `INSTRUCTOR`) | ✅ | `schema.prisma` line 55 |
| `@Roles('ADMIN')` decorator | ✅ | `common/decorators/roles.decorator.ts` |
| `RolesGuard` (checks `user.role` against `@Roles()`) | ✅ | `common/guards/roles.guard.ts` |
| `JwtAuthGuard` | ✅ | `modules/auth/guards/jwt-auth.guard.ts` |
| `User.role` on frontend type | ✅ | `types/index.ts` line 27 — `'STUDENT' | 'INSTRUCTOR' | 'ADMIN'` |
| `user` object in `AuthContext` | ✅ | `contexts/AuthContext.tsx` — exposes `user.role` |
| Axios API client with token injection | ✅ | `lib/api.ts` |
| `ShadowingVideo` / `DictationVideo` Prisma models | ✅ | `schema.prisma` lines 664, 721 |
| Shadowing backend CRUD (user videos) | ✅ | `modules/shadowing/` |
| Dictation backend CRUD (user videos) | ✅ | `modules/dictation/` |

### Key Architecture Observation
"System lessons" (visible to all students) are `ShadowingVideo` / `DictationVideo` rows where **`userId = null`**. User-uploaded videos have `userId = <owner>`. The current `ShadowingLessonsService.findAll()` queries `where: { userId: null }`.

Admin CRUD for system lessons will follow the same pattern: create rows with `userId: null`.

---

## Phase Delivery Order

| Phase | File | Scope | Status |
|---|---|---|---|
| 1 | `01-shadowing-admin.md` | Backend API + Frontend pages for managing system Shadowing lessons | ✅ Done |
| 2 | `02-dictation-admin.md` | Backend API + Frontend pages for managing system Dictation lessons | ✅ Done |
| 3 | `03-admin-shell.md` | Verified reference for all shared admin shell infrastructure | ✅ Done |
| 4 | *(not yet planned)* | IELTS Basic admin | 🔲 Future |
| 5 | *(not yet planned)* | IELTS Advanced admin | 🔲 Future |
| 6 | *(not yet planned)* | IELTS Intensive admin | 🔲 Future |

---

## Shared Conventions (All Phases Must Follow)

### Backend
1. Admin endpoints live in **new controller files** inside the existing module folder (e.g., `shadowing/controllers/admin-shadowing.controller.ts`). Do NOT add admin routes to existing student-facing controllers.
2. Controller prefix: `admin/shadowing`, `admin/dictation`, etc.
3. Guards: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN')` at the controller class level.
4. Service: reuse existing service or create a new admin-specific service if the logic diverges significantly.
5. DTOs: create admin-specific DTOs (e.g., `AdminCreateLessonDto`) — admin can set fields that students cannot (like `tags`, `category`, `imageUrl`, `status`).

### Frontend
1. All admin pages live under `frontend-web/src/app/admin/`.
2. Route guard: `AdminGuard` component wraps the admin layout — redirects non-admin users to `/`.
3. API service: `frontend-web/src/services/admin.api.ts` — single file for all admin API calls.
4. Admin layout: `/admin/layout.tsx` with a sidebar listing all content modules.
5. Follow SRP: page components are thin shells, logic lives in hooks, UI in small components.

### Data Flow (Shadowing/Dictation)
```
Admin fills form → POST /admin/shadowing/lessons (or YouTube import)
  → Backend creates ShadowingVideo { userId: null, status: "READY" }
  → If YouTube import: publishes transcription task → AI backend processes → webhook completes
Student browses library → GET /shadowing/lessons
  → Returns all ShadowingVideo where userId = null AND status = "READY"
```
