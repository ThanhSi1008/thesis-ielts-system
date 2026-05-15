# Phase 2: Dictation Admin

## Objective
Allow admins to manage system Dictation lessons. This phase mirrors Phase 1 (Shadowing) with dictation-specific differences.

## Prerequisites
- Phase 1 completed (admin shell, layout, guard, sidebar, API service scaffold all exist)

---

## Step 1: Backend — Admin Dictation Controller & Service

### 1.1 Create `admin-dictation.service.ts`

**File:** `backend-core/src/modules/dictation/services/admin-dictation.service.ts`

Mirrors `AdminShadowingService` exactly, but operates on the `DictationVideo` model.

Key differences from Shadowing:
- Dictation sentences do **NOT** have `vietnamese` or `phonetic` fields
- Dictation sentences: `{ id, english, words[], audioStart, audioEnd }`
- Shadowing sentences: `{ id, english, vietnamese, phonetic, words[], audioStart, audioEnd }`

```typescript
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { AiClientService } from "../../ai-client/ai-client.service";

@Injectable()
export class AdminDictationService {
  constructor(
    private prisma: PrismaService,
    private aiClient: AiClientService,
  ) {}

  async findAll() {
    return this.prisma.dictationVideo.findMany({
      where: { userId: null },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    const lesson = await this.prisma.dictationVideo.findFirst({
      where: { id, userId: null },
    });
    if (!lesson) throw new NotFoundException("System dictation lesson not found");
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
    return this.prisma.dictationVideo.create({
      data: {
        userId: null,
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
    const lesson = await this.prisma.dictationVideo.findFirst({
      where: { id, userId: null },
    });
    if (!lesson) throw new NotFoundException("System dictation lesson not found");

    return this.prisma.dictationVideo.update({
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
    const lesson = await this.prisma.dictationVideo.findFirst({
      where: { id, userId: null },
    });
    if (!lesson) throw new NotFoundException("System dictation lesson not found");
    return this.prisma.dictationVideo.delete({ where: { id } });
  }

  async importYoutube(dto: { youtubeUrl: string; title: string; category?: string }) {
    const youtubeIdMatch = dto.youtubeUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
    const youtubeVideoId = youtubeIdMatch ? youtubeIdMatch[1] : null;

    const video = await this.prisma.dictationVideo.create({
      data: {
        userId: null,
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
    });

    return video;
  }
}
```

### 1.2 Create Admin DTOs

**File:** `backend-core/src/modules/dictation/dto/admin-create-lesson.dto.ts`

```typescript
import { IsString, IsArray, IsOptional, IsNotEmpty } from "class-validator";

export class AdminCreateDictationLessonDto {
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

**File:** `backend-core/src/modules/dictation/dto/admin-update-lesson.dto.ts`

```typescript
import { IsString, IsArray, IsOptional } from "class-validator";

export class AdminUpdateDictationLessonDto {
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

**File:** `backend-core/src/modules/dictation/dto/admin-import-youtube.dto.ts`

```typescript
import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class AdminImportDictationYoutubeDto {
  @IsString() @IsNotEmpty()
  youtubeUrl: string;

  @IsString() @IsNotEmpty()
  title: string;

  @IsString() @IsOptional()
  category?: string;
}
```

### 1.3 Create Admin Controller

**File:** `backend-core/src/modules/dictation/controllers/admin-dictation.controller.ts`

```typescript
import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Roles } from "../../../common/decorators/roles.decorator";
import { AdminDictationService } from "../services/admin-dictation.service";
import { AdminCreateDictationLessonDto } from "../dto/admin-create-lesson.dto";
import { AdminUpdateDictationLessonDto } from "../dto/admin-update-lesson.dto";
import { AdminImportDictationYoutubeDto } from "../dto/admin-import-youtube.dto";

@Controller("admin/dictation/lessons")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
export class AdminDictationController {
  constructor(private readonly service: AdminDictationService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() dto: AdminCreateDictationLessonDto) {
    return this.service.create(dto);
  }

  @Post("import")
  importYoutube(@Body() dto: AdminImportDictationYoutubeDto) {
    return this.service.importYoutube(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: AdminUpdateDictationLessonDto) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.service.delete(id);
  }
}
```

### 1.4 Register in Module

**File:** `backend-core/src/modules/dictation/dictation.module.ts`

```diff
+import { AdminDictationController } from "./controllers/admin-dictation.controller";
+import { AdminDictationService } from "./services/admin-dictation.service";

 @Module({
   imports: [PrismaModule, NotificationsModule, AiClientModule],
   controllers: [
     DictationLessonsController,
     DictationVideosController,
     DictationFoldersController,
     DictationProgressController,
     DictationWebhookController,
+    AdminDictationController,
   ],
   providers: [
     DictationLessonsService,
     DictationVideosService,
     DictationFoldersService,
     DictationProgressService,
+    AdminDictationService,
   ],
 })
```

---

## Step 2: Frontend — Admin API Extension

**File:** `frontend-web/src/services/admin.api.ts` (extend the file created in Phase 1)

```typescript
import type { DictationVideo } from './dictation.api';

// ─── Dictation Admin ───
export const adminDictationApi = {
  getAll: () =>
    api.get<DictationVideo[]>('/admin/dictation/lessons').then(r => r.data),

  getById: (id: string) =>
    api.get<DictationVideo>(`/admin/dictation/lessons/${id}`).then(r => r.data),

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
    api.post<DictationVideo>('/admin/dictation/lessons', dto).then(r => r.data),

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
    api.patch<DictationVideo>(`/admin/dictation/lessons/${id}`, dto).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/admin/dictation/lessons/${id}`).then(r => r.data),

  importYoutube: (dto: { youtubeUrl: string; title: string; category?: string }) =>
    api.post<DictationVideo>('/admin/dictation/lessons/import', dto).then(r => r.data),
};
```

---

## Step 3: Frontend — Dictation Lessons List Page

**File:** `frontend-web/src/app/admin/dictation/page.tsx`

### Requirements:
Same structure as the Shadowing list page from Phase 1:
1. Data table: Title | Category | Duration | Sentences Count | Status | Actions
2. Status badges, Edit/Delete actions
3. "Add Lesson" and "YouTube Import" buttons
4. Sidebar nav item "Dictation Lessons" is active

### Hook:
**File:** `frontend-web/src/app/admin/dictation/_hooks/useAdminDictationList.ts`

```typescript
// Same pattern as useAdminShadowingList but calls adminDictationApi
```

---

## Step 4: Frontend — Create/Edit Dictation Lesson Page

### 4.1 Create Page
**File:** `frontend-web/src/app/admin/dictation/new/page.tsx`

### 4.2 Edit Page
**File:** `frontend-web/src/app/admin/dictation/[id]/edit/page.tsx`

### Form Component
**File:** `frontend-web/src/app/admin/dictation/_components/DictationLessonForm.tsx`

### Key differences from Shadowing form:
The sentence editor for Dictation is **simpler** — no `vietnamese` or `phonetic` fields:

| Field | Shadowing Sentence | Dictation Sentence |
|---|---|---|
| `id` | ✅ | ✅ |
| `english` | ✅ | ✅ |
| `vietnamese` | ✅ optional | ❌ not applicable |
| `phonetic` | ✅ optional | ❌ not applicable |
| `words` | ✅ | ✅ |
| `audioStart` | ✅ | ✅ |
| `audioEnd` | ✅ | ✅ |

### Sentence Editor
**File:** `frontend-web/src/app/admin/dictation/_components/DictationSentenceEditor.tsx`

Same UI pattern as Shadowing's `SentenceEditor.tsx` but without the Vietnamese/Phonetic fields.

> **TIP:** Consider extracting a shared `BaseSentenceEditor` component that both Shadowing and Dictation editors compose. The shared editor handles the common fields (`id`, `english`, `words`, `audioStart`, `audioEnd`) and accepts an optional `extraFields` render prop for Shadowing-specific fields.

### Hook:
**File:** `frontend-web/src/app/admin/dictation/_hooks/useAdminDictationForm.ts`

---

## Validation Checklist

- [ ] `GET /admin/dictation/lessons` returns all system dictation lessons
- [ ] `POST /admin/dictation/lessons` creates a lesson with `userId: null`
- [ ] `POST /admin/dictation/lessons/import` triggers YouTube transcription
- [ ] `PATCH /admin/dictation/lessons/:id` updates lesson fields
- [ ] `DELETE /admin/dictation/lessons/:id` deletes a system lesson
- [ ] All admin endpoints return `403 Forbidden` for non-ADMIN users
- [ ] Dictation sentence editor does NOT show Vietnamese/Phonetic fields
- [ ] Create and Edit forms work correctly
- [ ] AdminSidebar "Dictation Lessons" link is active on dictation pages

---

## File Checklist (New Files to Create)

### Backend (5 files)
1. `backend-core/src/modules/dictation/services/admin-dictation.service.ts`
2. `backend-core/src/modules/dictation/controllers/admin-dictation.controller.ts`
3. `backend-core/src/modules/dictation/dto/admin-create-lesson.dto.ts`
4. `backend-core/src/modules/dictation/dto/admin-update-lesson.dto.ts`
5. `backend-core/src/modules/dictation/dto/admin-import-youtube.dto.ts`

### Backend (1 file to modify)
6. `backend-core/src/modules/dictation/dictation.module.ts` — register new controller + service

### Frontend (6+ files)
7. `frontend-web/src/services/admin.api.ts` — add `adminDictationApi` section
8. `frontend-web/src/app/admin/dictation/page.tsx`
9. `frontend-web/src/app/admin/dictation/_hooks/useAdminDictationList.ts`
10. `frontend-web/src/app/admin/dictation/new/page.tsx`
11. `frontend-web/src/app/admin/dictation/[id]/edit/page.tsx`
12. `frontend-web/src/app/admin/dictation/_components/DictationLessonForm.tsx`
13. `frontend-web/src/app/admin/dictation/_components/DictationSentenceEditor.tsx`
14. `frontend-web/src/app/admin/dictation/_hooks/useAdminDictationForm.ts`
