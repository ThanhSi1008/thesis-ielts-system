# Phase 2 — Backend Layer (NestJS)

> **Risk**: MEDIUM — Splitting services requires careful testing.  
> **Estimated Effort**: Medium  
> **Dependencies**: Phase 1 (indexes)

---

## 2.1 Current State

All backend logic is in **one service** (`shadowing.service.ts`, 235 lines) and **one controller** (`shadowing.controller.ts`, 109 lines). The service has 5 distinct domains crammed together:

1. **System Lessons** — `getSystemLessons()`, `getSystemLessonById()`
2. **User Videos** — `getVideos()`, `createVideo()`, `updateVideo()`, `deleteVideo()`, `getVideoById()`
3. **Folders** — `getFolders()`, `createFolder()`, `renameFolder()`, `deleteFolder()`
4. **Progress** — `getProgress()`, `upsertProgress()`, `getAllProgress()`
5. **Notifications** — triggered inside `upsertProgress()` via `NotificationsService`

### Current File Map

```
backend-core/src/modules/shadowing/
├── shadowing.module.ts          # 13 lines
├── shadowing.controller.ts      # 109 lines
├── shadowing.service.ts         # 235 lines (SRP violation)
└── dto/
    ├── create-video.dto.ts      # 62 lines
    ├── update-video.dto.ts      # 16 lines
    └── upsert-progress.dto.ts   # 27 lines
```

---

## 2.2 Target File Structure

```
backend-core/src/modules/shadowing/
├── shadowing.module.ts              # Updated — registers all sub-services
├── controllers/
│   ├── system-lessons.controller.ts  # 2 endpoints
│   ├── user-videos.controller.ts     # 5 endpoints
│   ├── folders.controller.ts         # 4 endpoints
│   └── progress.controller.ts        # 3 endpoints
├── services/
│   ├── system-lessons.service.ts     # ~35 lines
│   ├── user-videos.service.ts        # ~60 lines
│   ├── folders.service.ts            # ~60 lines
│   └── progress.service.ts           # ~70 lines
└── dto/
    ├── create-video.dto.ts           # (unchanged)
    ├── update-video.dto.ts           # (unchanged)
    └── upsert-progress.dto.ts        # (unchanged)
```

---

## 2.3 Implementation — Service Split

### 2.3.1 `system-lessons.service.ts`

Extract from `shadowing.service.ts` lines 21-34:

```typescript
// backend-core/src/modules/shadowing/services/system-lessons.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";

@Injectable()
export class SystemLessonsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.shadowingVideo.findMany({
      where: { userId: null },
      orderBy: { id: "asc" },
    });
  }

  async findById(id: string) {
    const lesson = await this.prisma.shadowingVideo.findFirst({
      where: { id, userId: null },
    });
    if (!lesson) throw new NotFoundException("System lesson not found");
    return lesson;
  }
}
```

### 2.3.2 `user-videos.service.ts`

Extract from `shadowing.service.ts` lines 36-93:

```typescript
// backend-core/src/modules/shadowing/services/user-videos.service.ts
import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { CreateVideoDto } from "../dto/create-video.dto";
import { UpdateVideoDto } from "../dto/update-video.dto";

@Injectable()
export class UserVideosService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.shadowingVideo.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
  }

  async findById(userId: string, videoId: string) {
    const video = await this.prisma.shadowingVideo.findUnique({
      where: { id: videoId },
    });
    if (!video) throw new NotFoundException("Video not found");
    if (video.userId !== userId) throw new ForbiddenException();
    return video;
  }

  async create(userId: string, dto: CreateVideoDto) {
    return this.prisma.shadowingVideo.create({
      data: {
        userId,
        title: dto.title,
        youtubeVideoId: dto.youtubeVideoId,
        folder: dto.folder ?? "All Videos",
        category: dto.category ?? "Other",
        duration: dto.duration,
        sentences: dto.sentences as any,
      },
    });
  }

  async update(userId: string, videoId: string, dto: UpdateVideoDto) {
    const video = await this.prisma.shadowingVideo.findUnique({
      where: { id: videoId },
    });
    if (!video) throw new NotFoundException("Video not found");
    if (video.userId !== userId) throw new ForbiddenException();

    return this.prisma.shadowingVideo.update({
      where: { id: videoId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.folder !== undefined && { folder: dto.folder }),
        ...(dto.category !== undefined && { category: dto.category }),
      },
    });
  }

  async delete(userId: string, videoId: string) {
    const video = await this.prisma.shadowingVideo.findUnique({
      where: { id: videoId },
    });
    if (!video) throw new NotFoundException("Video not found");
    if (video.userId !== userId) throw new ForbiddenException();
    return this.prisma.shadowingVideo.delete({ where: { id: videoId } });
  }
}
```

### 2.3.3 `folders.service.ts`

Extract from `shadowing.service.ts` lines 95-153:

```typescript
// backend-core/src/modules/shadowing/services/folders.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";

@Injectable()
export class FoldersService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const folders = await this.prisma.shadowingFolder.findMany({
      where: { userId },
      orderBy: { order: "asc" },
    });
    return folders.map((f) => f.name);
  }

  async create(userId: string, name: string) {
    const existing = await this.prisma.shadowingFolder.findUnique({
      where: { userId_name: { userId, name } },
    });
    if (existing) return existing;

    const count = await this.prisma.shadowingFolder.count({ where: { userId } });
    return this.prisma.shadowingFolder.create({
      data: { userId, name, order: count },
    });
  }

  async rename(userId: string, oldName: string, newName: string) {
    const folder = await this.prisma.shadowingFolder.findUnique({
      where: { userId_name: { userId, name: oldName } },
    });
    if (!folder) throw new NotFoundException("Folder not found");

    await this.prisma.shadowingVideo.updateMany({
      where: { userId, folder: oldName },
      data: { folder: newName },
    });

    return this.prisma.shadowingFolder.update({
      where: { userId_name: { userId, name: oldName } },
      data: { name: newName },
    });
  }

  async delete(userId: string, name: string) {
    const folder = await this.prisma.shadowingFolder.findUnique({
      where: { userId_name: { userId, name } },
    });
    if (!folder) throw new NotFoundException("Folder not found");

    await this.prisma.shadowingVideo.updateMany({
      where: { userId, folder: name },
      data: { folder: "All Videos" },
    });

    return this.prisma.shadowingFolder.delete({
      where: { userId_name: { userId, name } },
    });
  }
}
```

### 2.3.4 `progress.service.ts`

Extract from `shadowing.service.ts` lines 155-233:

```typescript
// backend-core/src/modules/shadowing/services/progress.service.ts
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { UpsertProgressDto } from "../dto/upsert-progress.dto";
import { NotificationsService } from "../../notifications/notifications.service";

@Injectable()
export class ProgressService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async findByLesson(userId: string, lessonId: string) {
    const rows = await this.prisma.shadowingDictationProgress.findMany({
      where: { userId, lessonId },
    });

    const shadowing = rows.find((r) => r.type === "shadowing");
    const dictation = rows.find((r) => r.type === "dictation");

    return {
      shadowing: {
        completedSentences: (shadowing?.completedSentences as number[]) ?? [],
      },
      dictation: {
        completedSentences: (dictation?.completedSentences as number[]) ?? [],
        difficulty: dictation?.dictationDifficulty ?? "Intermediate",
      },
    };
  }

  async upsert(userId: string, dto: UpsertProgressDto) {
    const result = await this.prisma.shadowingDictationProgress.upsert({
      where: {
        userId_lessonId_type: {
          userId,
          lessonId: dto.lessonId,
          type: dto.type,
        },
      },
      update: {
        completedSentences: dto.completedSentences,
        ...(dto.dictationDifficulty !== undefined && {
          dictationDifficulty: dto.dictationDifficulty,
        }),
      },
      create: {
        userId,
        lessonId: dto.lessonId,
        type: dto.type,
        completedSentences: dto.completedSentences,
        dictationDifficulty: dto.dictationDifficulty,
      },
    });

    // Fire notification (non-blocking) on dictation completion
    if (
      dto.type === "dictation" &&
      dto.totalSentences &&
      dto.completedSentences.length >= dto.totalSentences
    ) {
      const lessonTitle = dto.lessonTitle ?? dto.lessonId;
      this.notifications
        .notifyDictationComplete(userId, lessonTitle, dto.lessonId)
        .catch(() => {});
    }

    return result;
  }

  async findAllByUser(userId: string) {
    const rows = await this.prisma.shadowingDictationProgress.findMany({
      where: { userId },
    });

    const map: Record<string, { shadowing: number[]; dictation: number[] }> = {};
    for (const row of rows) {
      if (!map[row.lessonId]) map[row.lessonId] = { shadowing: [], dictation: [] };
      if (row.type === "shadowing")
        map[row.lessonId].shadowing = row.completedSentences as number[];
      if (row.type === "dictation")
        map[row.lessonId].dictation = row.completedSentences as number[];
    }
    return map;
  }
}
```

---

## 2.4 Implementation — Controller Split

### 2.4.1 `system-lessons.controller.ts`

```typescript
// backend-core/src/modules/shadowing/controllers/system-lessons.controller.ts
import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { SystemLessonsService } from "../services/system-lessons.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";

@Controller("shadowing/system-lessons")
@UseGuards(JwtAuthGuard)
export class SystemLessonsController {
  constructor(private readonly service: SystemLessonsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.service.findById(id);
  }
}
```

### 2.4.2 `user-videos.controller.ts`

```typescript
// backend-core/src/modules/shadowing/controllers/user-videos.controller.ts
import { Controller, Get, Post, Patch, Delete, Param, Body, Req, UseGuards } from "@nestjs/common";
import { UserVideosService } from "../services/user-videos.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CreateVideoDto } from "../dto/create-video.dto";
import { UpdateVideoDto } from "../dto/update-video.dto";

@Controller("shadowing/videos")
@UseGuards(JwtAuthGuard)
export class UserVideosController {
  constructor(private readonly service: UserVideosService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.service.findAll(req.user.id);
  }

  @Get(":id")
  findById(@Req() req: any, @Param("id") id: string) {
    return this.service.findById(req.user.id, id);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateVideoDto) {
    return this.service.create(req.user.id, dto);
  }

  @Patch(":id")
  update(@Req() req: any, @Param("id") id: string, @Body() dto: UpdateVideoDto) {
    return this.service.update(req.user.id, id, dto);
  }

  @Delete(":id")
  delete(@Req() req: any, @Param("id") id: string) {
    return this.service.delete(req.user.id, id);
  }
}
```

### 2.4.3 `folders.controller.ts`

```typescript
@Controller("shadowing/folders")
@UseGuards(JwtAuthGuard)
export class FoldersController {
  constructor(private readonly service: FoldersService) {}

  @Get()
  findAll(@Req() req: any) { return this.service.findAll(req.user.id); }

  @Post()
  create(@Req() req: any, @Body() body: { name: string }) {
    return this.service.create(req.user.id, body.name);
  }

  @Patch(":name")
  rename(@Req() req: any, @Param("name") name: string, @Body() body: { newName: string }) {
    return this.service.rename(req.user.id, name, body.newName);
  }

  @Delete(":name")
  delete(@Req() req: any, @Param("name") name: string) {
    return this.service.delete(req.user.id, name);
  }
}
```

### 2.4.4 `progress.controller.ts`

```typescript
@Controller("shadowing/progress")
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly service: ProgressService) {}

  @Get()
  findAll(@Req() req: any) { return this.service.findAllByUser(req.user.id); }

  @Get(":lessonId")
  findByLesson(@Req() req: any, @Param("lessonId") lessonId: string) {
    return this.service.findByLesson(req.user.id, lessonId);
  }

  @Post()
  upsert(@Req() req: any, @Body() dto: UpsertProgressDto) {
    return this.service.upsert(req.user.id, dto);
  }
}
```

---

## 2.5 Module Registration Update

```typescript
// backend-core/src/modules/shadowing/shadowing.module.ts
import { Module } from "@nestjs/common";
import { PrismaModule } from "../../common/prisma/prisma.module";
import { NotificationsModule } from "../notifications/notifications.module";

// Controllers
import { SystemLessonsController } from "./controllers/system-lessons.controller";
import { UserVideosController } from "./controllers/user-videos.controller";
import { FoldersController } from "./controllers/folders.controller";
import { ProgressController } from "./controllers/progress.controller";

// Services
import { SystemLessonsService } from "./services/system-lessons.service";
import { UserVideosService } from "./services/user-videos.service";
import { FoldersService } from "./services/folders.service";
import { ProgressService } from "./services/progress.service";

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [
    SystemLessonsController,
    UserVideosController,
    FoldersController,
    ProgressController,
  ],
  providers: [
    SystemLessonsService,
    UserVideosService,
    FoldersService,
    ProgressService,
  ],
})
export class ShadowingModule {}
```

---

## 2.6 Cleanup

After all controllers/services are verified:

1. **Delete** `shadowing.controller.ts` (the old monolith)
2. **Delete** `shadowing.service.ts` (the old monolith)
3. Verify `app.module.ts` still imports `ShadowingModule` (no change needed there)

---

## 2.7 API Route Compatibility

**CRITICAL**: All API routes remain EXACTLY the same:

| Method | Route | Controller |
|---|---|---|
| GET | `/shadowing/system-lessons` | SystemLessonsController |
| GET | `/shadowing/system-lessons/:id` | SystemLessonsController |
| GET | `/shadowing/videos` | UserVideosController |
| GET | `/shadowing/videos/:id` | UserVideosController |
| POST | `/shadowing/videos` | UserVideosController |
| PATCH | `/shadowing/videos/:id` | UserVideosController |
| DELETE | `/shadowing/videos/:id` | UserVideosController |
| GET | `/shadowing/folders` | FoldersController |
| POST | `/shadowing/folders` | FoldersController |
| PATCH | `/shadowing/folders/:name` | FoldersController |
| DELETE | `/shadowing/folders/:name` | FoldersController |
| GET | `/shadowing/progress` | ProgressController |
| GET | `/shadowing/progress/:lessonId` | ProgressController |
| POST | `/shadowing/progress` | ProgressController |

**The frontend `shadowing.api.ts` does NOT need any changes** because the URL paths and request/response shapes are identical.

---

## Acceptance Criteria

- [ ] 4 service files created, each under 70 lines
- [ ] 4 controller files created, each under 30 lines
- [ ] Old `shadowing.controller.ts` and `shadowing.service.ts` deleted
- [ ] `ShadowingModule` updated to register all new providers/controllers
- [ ] All 14 API routes return identical responses to before
- [ ] DTOs unchanged
- [ ] Frontend works without any modifications
