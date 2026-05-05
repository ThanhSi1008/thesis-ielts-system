# Community Posts & Sharing — Master Plan

> **Entry point** for implementing a social community feed in the TOEIC/IELTS learning platform.
> Each phase is in its own file for independent implementation.

---

## Current Architecture Snapshot

### Tech Stack
| Layer | Technology | Key Files |
|-------|-----------|-----------|
| **Backend** | NestJS + Prisma + PostgreSQL | `backend-core/src/modules/` |
| **Frontend** | Next.js 14 (App Router) + Tailwind CSS | `frontend-web/src/app/` |
| **API Client** | Axios with JWT interceptor | `frontend-web/src/lib/api.ts` |
| **Auth** | JWT guards, `useAuth()` context | `frontend-web/src/contexts/AuthContext.tsx` |
| **Storage** | Cloudinary (via `StorageService`) | `backend-core/src/common/storage/` |
| **Types** | Centralized in `frontend-web/src/types/index.ts` | L1-578 |

### Existing Module Pattern (Follow This)
Every backend module follows: `module.ts` → `controller.ts` → `service.ts` → `dto/*.dto.ts`

| File | Responsibility |
|------|---------------|
| `*.module.ts` | NestJS module registration (imports `StorageModule` if file upload needed) |
| `*.controller.ts` | REST endpoints, `@UseGuards(JwtAuthGuard)`, parameter extraction |
| `*.service.ts` | Business logic, Prisma queries |
| `dto/*.dto.ts` | class-validator DTOs for request validation |

Every frontend API service follows: `frontend-web/src/services/*.api.ts`
- Import `api` from `@/lib/api`
- Export a const object with async methods
- Use generics: `api.get<ResponseType>(url)`

### Existing User Model Relations (schema.prisma L14-54)
The `User` model already has relations for: decks, sharedDecks, notifications, etc.
**New relations will be added** for posts, comments, likes, bookmarks.

### Design System Tokens
| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#FFC600` (CSS var `--primary`) | Buttons, active states |
| Dark bg | `dark:bg-gray-900` / `dark:bg-slate-950` | Dark mode panels |
| Border | `border-gray-200 dark:border-gray-800` | Card borders |
| Radius | `rounded-xl` / `rounded-2xl` | Cards, modals |
| Hover | `hover:bg-gray-50 dark:hover:bg-gray-800` | Interactive elements |
| Font | System sans-serif | Body text |

---

## Feature Summary

### Phase 1 — Backend Foundation (Prisma + NestJS Module)
Create the entire backend for community posts: schema, migration, DTOs, service, controller.

**Scope:**
- New Prisma models: `Post`, `Comment`, `PostLike`, `PostBookmark`
- New NestJS module: `backend-core/src/modules/posts/`
- CRUD endpoints for posts (create, list, get, delete)
- Like toggle, bookmark toggle
- Comment CRUD (create, list, delete)
- Image upload via existing `StorageService` (Cloudinary)
- Cursor-based pagination for feed (YouTube-style: load more on scroll)

### Phase 2 — Frontend UI
Build the complete frontend: new route, components, API client, types.

**Scope:**
- New API service: `frontend-web/src/services/posts.api.ts`
- New TypeScript types in `frontend-web/src/types/index.ts`
- New route: `frontend-web/src/app/community/page.tsx`
- Components: PostCard, CreatePostModal, CommentSection, PostFeed
- Integration with existing sidebar navigation
- Responsive layout matching existing design system
- Infinite scroll with cursor pagination

---

## Post Types (MVP Scope)

| PostType Enum | Description | `metadata` JSON Shape |
|---------------|-------------|----------------------|
| `STUDY_TIP` | User shares a learning tip/strategy | `{ skillTag?: string }` |
| `SCORE_ACHIEVEMENT` | User shares an exam score | `{ examTitle?: string, score?: number }` |
| `GENERAL` | Free-form text post | `{}` |

> Additional post types (DECK_SHARE, SHADOWING_CLIP, etc.) are deferred to future phases.

---

## New Prisma Models

```prisma
// ============================================================
// COMMUNITY POSTS
// ============================================================

enum PostType {
  STUDY_TIP
  SCORE_ACHIEVEMENT
  GENERAL
}

model Post {
  id            String     @id @default(uuid())
  authorId      String
  type          PostType   @default(GENERAL)
  title         String?
  body          String     @db.Text
  imageUrls     String[]   @default([])
  tags          String[]   @default([])
  metadata      Json?

  likeCount     Int        @default(0)
  commentCount  Int        @default(0)
  bookmarkCount Int        @default(0)

  isPinned      Boolean    @default(false)
  isHidden      Boolean    @default(false)

  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  author        User       @relation("UserPosts", fields: [authorId], references: [id], onDelete: Cascade)
  comments      Comment[]
  likes         PostLike[]
  bookmarks     PostBookmark[]

  @@index([authorId])
  @@index([createdAt])
  @@index([likeCount])
  @@map("posts")
}

model Comment {
  id        String   @id @default(uuid())
  postId    String
  authorId  String
  parentId  String?
  body      String   @db.Text

  isHidden  Boolean  @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  author    User     @relation("UserComments", fields: [authorId], references: [id], onDelete: Cascade)
  parent    Comment? @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies   Comment[] @relation("CommentReplies")

  @@index([postId, createdAt])
  @@index([authorId])
  @@map("comments")
}

model PostLike {
  id        String   @id @default(uuid())
  postId    String
  userId    String
  createdAt DateTime @default(now())

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  user User @relation("UserPostLikes", fields: [userId], references: [id], onDelete: Cascade)

  @@unique([postId, userId])
  @@map("post_likes")
}

model PostBookmark {
  id        String   @id @default(uuid())
  postId    String
  userId    String
  createdAt DateTime @default(now())

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  user User @relation("UserBookmarks", fields: [userId], references: [id], onDelete: Cascade)

  @@unique([postId, userId])
  @@map("post_bookmarks")
}
```

### User Model Changes (add these relations)
```prisma
// Add to existing User model (schema.prisma ~L27-53)
posts          Post[]         @relation("UserPosts")
comments       Comment[]      @relation("UserComments")
postLikes      PostLike[]     @relation("UserPostLikes")
bookmarks      PostBookmark[] @relation("UserBookmarks")
```

---

## API Endpoints (Full Spec)

### Posts
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/posts` | JWT | Create a post |
| `GET` | `/api/v1/posts` | JWT | List feed (cursor pagination) |
| `GET` | `/api/v1/posts/:id` | JWT | Get single post with comments |
| `DELETE` | `/api/v1/posts/:id` | JWT | Delete own post |

### Interactions
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/posts/:id/like` | JWT | Toggle like (like if not liked, unlike if already liked) |
| `POST` | `/api/v1/posts/:id/bookmark` | JWT | Toggle bookmark |
| `POST` | `/api/v1/posts/:id/comments` | JWT | Add a comment |
| `DELETE` | `/api/v1/posts/comments/:commentId` | JWT | Delete own comment |

### Query Parameters for `GET /posts`
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `cursor` | `string?` | — | Post ID to paginate after (cursor-based) |
| `limit` | `number?` | `20` | Items per page (max 50) |
| `type` | `PostType?` | — | Filter by post type |
| `tag` | `string?` | — | Filter by skill tag |
| `authorId` | `string?` | — | Filter by author |

---

## Media Hosting Decision

**Cloudinary** — keep using it. Your `StorageService` already handles uploads via `cloudinary.uploader.upload_stream`. For post images, upload to a `post_images` folder.

> Cloudinary is a solid choice for a thesis project. Alternatives like AWS S3 + CloudFront or Supabase Storage offer more control at scale, but Cloudinary's auto-optimization (WebP, responsive sizing) is a significant DX win. **Stick with Cloudinary.**

---

## Real-time Strategy

**YouTube-style polling** — YouTube does NOT use WebSocket for its comment feed. It uses:
1. **Initial load** via REST API
2. **"Load more" button** or **infinite scroll** for pagination
3. **Periodic polling** (every 30-60s) for the comment count badge only
4. **Optimistic UI** for like/comment actions (instant visual feedback, sync in background)

This is much simpler than WebSocket and perfectly appropriate for your thesis scope.

---

## Phase Map

| Phase | File | Scope | Dependencies |
|-------|------|-------|-------------|
| **Phase 1** | `02_phase1_backend.md` | Prisma schema, NestJS module (controller + service + DTOs), all endpoints | None |
| **Phase 2** | `03_phase2_frontend.md` | API client, types, route, components, feed UI, interactions | Phase 1 |

```
Phase 1 (Backend) ──▶ Phase 2 (Frontend)
```

---

## Files Created/Modified Summary

### Phase 1 (Backend)
| Action | File |
|--------|------|
| **Modified** | `backend-core/prisma/schema.prisma` — add Post, Comment, PostLike, PostBookmark + User relations |
| **Created** | `backend-core/src/modules/posts/posts.module.ts` |
| **Created** | `backend-core/src/modules/posts/posts.controller.ts` |
| **Created** | `backend-core/src/modules/posts/posts.service.ts` |
| **Created** | `backend-core/src/modules/posts/dto/posts.dto.ts` |
| **Modified** | `backend-core/src/app.module.ts` — register `PostsModule` |

### Phase 2 (Frontend)
| Action | File |
|--------|------|
| **Created** | `frontend-web/src/services/posts.api.ts` |
| **Modified** | `frontend-web/src/types/index.ts` — add Post, Comment, PostLike types |
| **Created** | `frontend-web/src/app/community/page.tsx` |
| **Created** | `frontend-web/src/app/community/components/PostCard.tsx` |
| **Created** | `frontend-web/src/app/community/components/CreatePostModal.tsx` |
| **Created** | `frontend-web/src/app/community/components/CommentSection.tsx` |
| **Created** | `frontend-web/src/app/community/components/PostFeed.tsx` |
| **Modified** | Navigation (sidebar or top navbar) — add Community link |
