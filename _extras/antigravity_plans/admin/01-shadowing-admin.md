# Phase 1: Shadowing Admin

## Objective
Allow admins to manage system Shadowing lessons (CRUD + YouTube import with AI transcription).

## Prerequisites
- None (first phase — includes admin shell scaffolding)

---

## Step 1: Backend — Admin Shadowing Controller & Service

### 1.1 Create `admin-shadowing.service.ts`

**File:** `backend-core/src/modules/shadowing/services/admin-shadowing.service.ts`

This service manages system lessons (`userId: null`). It is separate from the student-facing `ShadowingVideosService` (which scopes everything to a logged-in user).

```typescript
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { AiClientService } from "../../ai-client/ai-client.service";

@Injectable()
export class AdminShadowingService {
  constructor(
    private prisma: PrismaService,
    private aiClient: AiClientService,
  ) {}

  // Return ALL system lessons (userId = null), including non-READY ones
  async findAll() {
    return this.prisma.shadowingVideo.findMany({
      where: { userId: null },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    const lesson = await this.prisma.shadowingVideo.findFirst({
      where: { id, userId: null },
    });
    if (!lesson) throw new NotFoundException("System lesson not found");
    return lesson;
  }

  async create(dto: {
    title: string;
    youtubeVideoId?: string;
    audioUrl?: string;
    imageUrl?: string;
    tags?: string[];
    folder?: string;
    category?: string;
    duration: string;
    sentences: any[];
  }) {
    return this.prisma.shadowingVideo.create({
      data: {
        userId: null, // System lesson
        title: dto.title,
        youtubeVideoId: dto.youtubeVideoId ?? null,
        audioUrl: dto.audioUrl ?? null,
        imageUrl: dto.imageUrl ?? null,
        tags: dto.tags ?? [],
        folder: dto.folder ?? "All Videos",
        category: dto.category ?? "Other",
        duration: dto.duration,
        sentences: dto.sentences as any,
        status: "READY",
      },
    });
  }

  async update(id: string, dto: {
    title?: string;
    youtubeVideoId?: string;
    audioUrl?: string;
    imageUrl?: string;
    tags?: string[];
    folder?: string;
    category?: string;
    duration?: string;
    sentences?: any[];
    status?: string;
  }) {
    const lesson = await this.prisma.shadowingVideo.findFirst({
      where: { id, userId: null },
    });
    if (!lesson) throw new NotFoundException("System lesson not found");

    return this.prisma.shadowingVideo.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.youtubeVideoId !== undefined && { youtubeVideoId: dto.youtubeVideoId }),
        ...(dto.audioUrl !== undefined && { audioUrl: dto.audioUrl }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.tags !== undefined && { tags: dto.tags }),
        ...(dto.folder !== undefined && { folder: dto.folder }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.duration !== undefined && { duration: dto.duration }),
        ...(dto.sentences !== undefined && { sentences: dto.sentences as any }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });
  }

  async delete(id: string) {
    const lesson = await this.prisma.shadowingVideo.findFirst({
      where: { id, userId: null },
    });
    if (!lesson) throw new NotFoundException("System lesson not found");
    return this.prisma.shadowingVideo.delete({ where: { id } });
  }

  async importYoutube(dto: { youtubeUrl: string; title: string; category?: string }) {
    const youtubeIdMatch = dto.youtubeUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})[^\w-]?/);
    const youtubeVideoId = youtubeIdMatch ? youtubeIdMatch[1] : null;

    const video = await this.prisma.shadowingVideo.create({
      data: {
        userId: null, // System lesson
        title: dto.title,
        youtubeVideoId,
        category: dto.category ?? "Other",
        folder: "All Videos",
        duration: "0:00",
        sentences: [],
        status: "PROCESSING",
      },
    });

    await this.aiClient.publishTranscriptionTask({
      videoId: video.id,
      youtubeUrl: dto.youtubeUrl,
      type: "shadowing",
    } as any);

    return video;
  }
}
```

### 1.2 Create Admin DTOs

**File:** `backend-core/src/modules/shadowing/dto/admin-create-lesson.dto.ts`

```typescript
import { IsString, IsArray, IsOptional, IsNotEmpty } from "class-validator";

export class AdminCreateLessonDto {
  @IsString() @IsNotEmpty()
  title: string;

  @IsString() @IsOptional()
  youtubeVideoId?: string;

  @IsString() @IsOptional()
  audioUrl?: string;

  @IsString() @IsOptional()
  imageUrl?: string;

  @IsArray() @IsOptional()
  tags?: string[];

  @IsString() @IsOptional()
  folder?: string;

  @IsString() @IsOptional()
  category?: string;

  @IsString() @IsNotEmpty()
  duration: string;

  @IsArray()
  sentences: any[];
}
```

**File:** `backend-core/src/modules/shadowing/dto/admin-update-lesson.dto.ts`

```typescript
import { IsString, IsArray, IsOptional } from "class-validator";

export class AdminUpdateLessonDto {
  @IsString() @IsOptional()
  title?: string;

  @IsString() @IsOptional()
  youtubeVideoId?: string;

  @IsString() @IsOptional()
  audioUrl?: string;

  @IsString() @IsOptional()
  imageUrl?: string;

  @IsArray() @IsOptional()
  tags?: string[];

  @IsString() @IsOptional()
  folder?: string;

  @IsString() @IsOptional()
  category?: string;

  @IsString() @IsOptional()
  duration?: string;

  @IsArray() @IsOptional()
  sentences?: any[];

  @IsString() @IsOptional()
  status?: string;
}
```

**File:** `backend-core/src/modules/shadowing/dto/admin-import-youtube.dto.ts`

```typescript
import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class AdminImportYoutubeDto {
  @IsString() @IsNotEmpty()
  youtubeUrl: string;

  @IsString() @IsNotEmpty()
  title: string;

  @IsString() @IsOptional()
  category?: string;
}
```

### 1.3 Create Admin Controller

**File:** `backend-core/src/modules/shadowing/controllers/admin-shadowing.controller.ts`

```typescript
import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Roles } from "../../../common/decorators/roles.decorator";
import { AdminShadowingService } from "../services/admin-shadowing.service";
import { AdminCreateLessonDto } from "../dto/admin-create-lesson.dto";
import { AdminUpdateLessonDto } from "../dto/admin-update-lesson.dto";
import { AdminImportYoutubeDto } from "../dto/admin-import-youtube.dto";

@Controller("admin/shadowing/lessons")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
export class AdminShadowingController {
  constructor(private readonly service: AdminShadowingService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() dto: AdminCreateLessonDto) {
    return this.service.create(dto);
  }

  @Post("import")
  importYoutube(@Body() dto: AdminImportYoutubeDto) {
    return this.service.importYoutube(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: AdminUpdateLessonDto) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.service.delete(id);
  }
}
```

### 1.4 Register in Module

**File:** `backend-core/src/modules/shadowing/shadowing.module.ts`

Add to the existing module:
```diff
+import { AdminShadowingController } from "./controllers/admin-shadowing.controller";
+import { AdminShadowingService } from "./services/admin-shadowing.service";

 @Module({
   imports: [PrismaModule, AiClientModule],
   controllers: [
     ShadowingLessonsController,
     ShadowingVideosController,
     ShadowingFoldersController,
     ShadowingProgressController,
     ShadowingWebhookController,
+    AdminShadowingController,
   ],
   providers: [
     ShadowingLessonsService,
     ShadowingVideosService,
     ShadowingFoldersService,
     ShadowingProgressService,
+    AdminShadowingService,
   ],
 })
```

---

## Step 2: Frontend — Admin Shell & API Service

### 2.1 Admin API Service

**File:** `frontend-web/src/services/admin.api.ts`

```typescript
import api from '@/lib/api';
import type { ShadowingVideo } from './shadowing.api';

// ─── Shadowing Admin ───
export const adminShadowingApi = {
  getAll: () =>
    api.get<ShadowingVideo[]>('/admin/shadowing/lessons').then(r => r.data),

  getById: (id: string) =>
    api.get<ShadowingVideo>(`/admin/shadowing/lessons/${id}`).then(r => r.data),

  create: (dto: {
    title: string;
    youtubeVideoId?: string;
    audioUrl?: string;
    imageUrl?: string;
    tags?: string[];
    folder?: string;
    category?: string;
    duration: string;
    sentences: any[];
  }) =>
    api.post<ShadowingVideo>('/admin/shadowing/lessons', dto).then(r => r.data),

  update: (id: string, dto: {
    title?: string;
    youtubeVideoId?: string;
    audioUrl?: string;
    imageUrl?: string;
    tags?: string[];
    folder?: string;
    category?: string;
    duration?: string;
    sentences?: any[];
    status?: string;
  }) =>
    api.patch<ShadowingVideo>(`/admin/shadowing/lessons/${id}`, dto).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/admin/shadowing/lessons/${id}`).then(r => r.data),

  importYoutube: (dto: { youtubeUrl: string; title: string; category?: string }) =>
    api.post<ShadowingVideo>('/admin/shadowing/lessons/import', dto).then(r => r.data),
};
```

### 2.2 Admin Route Guard

**File:** `frontend-web/src/app/admin/_components/AdminGuard.tsx`

```tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return <>{children}</>;
}
```

### 2.3 Admin Layout with Sidebar

**File:** `frontend-web/src/app/admin/layout.tsx`

```tsx
import { Metadata } from "next";
import AdminGuard from "./_components/AdminGuard";
import AdminSidebar from "./_components/AdminSidebar";

export const metadata: Metadata = {
  title: "Admin Dashboard | TOEIC Master AI",
  description: "Manage learning content",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex h-[calc(100vh-56px)] overflow-hidden bg-gray-50 dark:bg-gray-950">
        <AdminSidebar />
        <main className="flex-1 h-full overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}
```

**File:** `frontend-web/src/app/admin/_components/AdminSidebar.tsx`

Build a sidebar with these nav groups:
- **Content Management**
  - Shadowing Lessons → `/admin/shadowing`
  - Dictation Lessons → `/admin/dictation`
- **IELTS** (disabled / "Coming Soon" initially)
  - Basic → `/admin/ielts-basic`
  - Advanced → `/admin/ielts-advanced`
  - Intensive → `/admin/ielts-intensive`

Styled similarly to the existing `ShadowingSidebar.tsx` pattern. Width: 240px. Active item highlight using `usePathname()`.

### 2.4 Admin Dashboard Home

**File:** `frontend-web/src/app/admin/page.tsx`

Simple dashboard showing:
- Total system lessons count (Shadowing)
- Total system lessons count (Dictation)
- Quick links to "Manage Shadowing" / "Manage Dictation"

---

## Step 3: Frontend — Shadowing Lessons List Page

**File:** `frontend-web/src/app/admin/shadowing/page.tsx`

### Requirements:
1. **Data table** listing all system shadowing lessons (from `adminShadowingApi.getAll()`)
2. Columns: Title | Category | Duration | Sentences Count | Status | Actions
3. **Status badge**: `READY` = green, `PROCESSING` = amber/spinner, `FAILED` = red
4. **Actions column**: Edit (link to `/admin/shadowing/[id]/edit`) | Delete (with confirm dialog)
5. **Top bar**: "Add Lesson" button → links to `/admin/shadowing/new`
6. **YouTube Import** button → opens a modal with URL + Title fields → calls `adminShadowingApi.importYoutube()`

### Hook (SRP):
**File:** `frontend-web/src/app/admin/shadowing/_hooks/useAdminShadowingList.ts`

```typescript
// Manages: fetch list, delete mutation, import mutation, loading/error states
// Returns: { lessons, isLoading, error, deleteLesson, importYoutube }
```

---

## Step 4: Frontend — Create/Edit Shadowing Lesson Page

### 4.1 Create Page

**File:** `frontend-web/src/app/admin/shadowing/new/page.tsx`

### 4.2 Edit Page

**File:** `frontend-web/src/app/admin/shadowing/[id]/edit/page.tsx`

### Both pages share a form component:

**File:** `frontend-web/src/app/admin/shadowing/_components/ShadowingLessonForm.tsx`

### Form Fields:
| Field | Type | Required | Notes |
|---|---|---|---|
| Title | text input | ✅ | |
| YouTube Video ID | text input | ❌ | Extracted from URL or entered directly |
| Audio URL | text input | ❌ | Alternative to YouTube |
| Image URL | text input | ❌ | Thumbnail |
| Category | select dropdown | ✅ | Options: "Conversation", "TED Talk", "Movie Clip", "Music", "News", "Other" |
| Tags | multi-tag input | ❌ | Free-form tags |
| Duration | text input | ✅ | e.g., "5:32" |
| Sentences | sentence editor | ✅ | See below |

### Sentence Editor Sub-Component

**File:** `frontend-web/src/app/admin/shadowing/_components/SentenceEditor.tsx`

An array editor where admin can add/remove/reorder sentences. Each sentence row has:
- `id` (auto-generated sequential number)
- `english` (text input — required)
- `vietnamese` (text input — optional translation)
- `phonetic` (text input — optional IPA)
- `words` (auto-split from english, or manual override)
- `audioStart` (number input in seconds)
- `audioEnd` (number input in seconds)

Features:
- "Add Sentence" button at the bottom
- Drag-to-reorder (or up/down arrows)
- Delete button per row
- YouTube preview player synchronized with `audioStart`/`audioEnd` for verification
- "Auto-split words" button that tokenizes `english` into `words[]`

### Hook (SRP):
**File:** `frontend-web/src/app/admin/shadowing/_hooks/useAdminShadowingForm.ts`

```typescript
// Manages: form state, validation, submit (create/update), loading states
// Returns: { formData, setField, addSentence, removeSentence, reorderSentence, submit, isSubmitting, errors }
```

---

## Step 5: Navbar — Admin Link

**File:** `frontend-web/src/components/Navbar.tsx`

Add a conditional admin link in the profile dropdown menu (between "My Profile" and "Sign Out"):

```diff
+ {user.role === "ADMIN" && (
+   <Link
+     href="/admin"
+     className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
+     onClick={() => setIsProfileOpen(false)}
+   >
+     {/* Shield/Settings icon */}
+     <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
+       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
+         d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
+       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
+     </svg>
+     Admin Dashboard
+   </Link>
+ )}
```

---

## Validation Checklist

- [ ] `GET /admin/shadowing/lessons` returns all system lessons (including PROCESSING ones)
- [ ] `POST /admin/shadowing/lessons` creates a lesson with `userId: null`
- [ ] `POST /admin/shadowing/lessons/import` triggers YouTube transcription pipeline
- [ ] `PATCH /admin/shadowing/lessons/:id` updates lesson fields
- [ ] `DELETE /admin/shadowing/lessons/:id` deletes a system lesson
- [ ] All admin endpoints return `403 Forbidden` for non-ADMIN users
- [ ] Admin layout only renders for ADMIN users (frontend guard)
- [ ] Lessons list page shows correct data with status badges
- [ ] Create form validates required fields before submit
- [ ] Edit form pre-fills existing data
- [ ] Sentence editor supports add/remove/reorder
- [ ] YouTube import shows "Processing..." status while AI transcribes
- [ ] Admin link appears in Navbar only for ADMIN users

---

## File Checklist (New Files to Create)

### Backend (6 files)
1. `backend-core/src/modules/shadowing/services/admin-shadowing.service.ts`
2. `backend-core/src/modules/shadowing/controllers/admin-shadowing.controller.ts`
3. `backend-core/src/modules/shadowing/dto/admin-create-lesson.dto.ts`
4. `backend-core/src/modules/shadowing/dto/admin-update-lesson.dto.ts`
5. `backend-core/src/modules/shadowing/dto/admin-import-youtube.dto.ts`

### Backend (1 file to modify)
6. `backend-core/src/modules/shadowing/shadowing.module.ts` — register new controller + service

### Frontend (10+ files)
7. `frontend-web/src/services/admin.api.ts`
8. `frontend-web/src/app/admin/layout.tsx`
9. `frontend-web/src/app/admin/page.tsx`
10. `frontend-web/src/app/admin/_components/AdminGuard.tsx`
11. `frontend-web/src/app/admin/_components/AdminSidebar.tsx`
12. `frontend-web/src/app/admin/shadowing/page.tsx`
13. `frontend-web/src/app/admin/shadowing/_hooks/useAdminShadowingList.ts`
14. `frontend-web/src/app/admin/shadowing/new/page.tsx`
15. `frontend-web/src/app/admin/shadowing/[id]/edit/page.tsx`
16. `frontend-web/src/app/admin/shadowing/_components/ShadowingLessonForm.tsx`
17. `frontend-web/src/app/admin/shadowing/_components/SentenceEditor.tsx`
18. `frontend-web/src/app/admin/shadowing/_hooks/useAdminShadowingForm.ts`

### Frontend (1 file to modify)
19. `frontend-web/src/components/Navbar.tsx` — add admin link in profile dropdown
