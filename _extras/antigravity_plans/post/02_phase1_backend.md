# Phase 1 — Backend Foundation

> **Goal:** Create the complete backend for community posts: Prisma schema, NestJS module, all CRUD + interaction endpoints.
>
> **Dependencies:** None (this is the first phase)
>
> **Estimated effort:** ~4-5 hours

---

## Overview

Create a new `posts` NestJS module with full CRUD for posts, comments, likes, and bookmarks. Uses cursor-based pagination (YouTube-style) and the existing Cloudinary `StorageService` for image uploads.

---

## Step 1: Prisma Schema — Add Models + User Relations

**File:** `backend-core/prisma/schema.prisma`

### 1.1 — Add the PostType enum (after the existing `NotificationType` enum, ~line 1063)

```prisma
// ============================================================
// COMMUNITY POSTS
// ============================================================

enum PostType {
  STUDY_TIP
  SCORE_ACHIEVEMENT
  GENERAL
}
```

### 1.2 — Add the Post model (after the enum)

```prisma
model Post {
  id            String     @id @default(uuid())
  authorId      String
  type          PostType   @default(GENERAL)
  title         String?
  body          String     @db.Text
  imageUrls     String[]   @default([])
  tags          String[]   @default([])   // skill tags: "Listening", "Reading", etc.
  metadata      Json?                      // type-specific context (examTitle, score, etc.)

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
```

### 1.3 — Add the Comment model

```prisma
model Comment {
  id        String   @id @default(uuid())
  postId    String
  authorId  String
  parentId  String?  // null = top-level comment, non-null = reply
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
```

### 1.4 — Add PostLike and PostBookmark models

```prisma
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

### 1.5 — Add relations to existing User model

In the existing `User` model (schema.prisma ~L27-53), add these lines inside the `// Relations` section:

```prisma
  posts              Post[]         @relation("UserPosts")
  comments           Comment[]      @relation("UserComments")
  postLikes          PostLike[]     @relation("UserPostLikes")
  bookmarks          PostBookmark[] @relation("UserBookmarks")
```

### 1.6 — Run migration

```bash
cd backend-core
npx prisma migrate dev --name add_community_posts
```

---

## Step 2: DTOs — Request Validation

**File:** `backend-core/src/modules/posts/dto/posts.dto.ts` (create new file)

```typescript
import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  IsEnum,
  IsObject,
  Min,
  Max,
  MaxLength,
  MinLength,
} from "class-validator";

// ==================== POST TYPE ENUM ====================

export enum PostType {
  STUDY_TIP = "STUDY_TIP",
  SCORE_ACHIEVEMENT = "SCORE_ACHIEVEMENT",
  GENERAL = "GENERAL",
}

// ==================== POST DTOs ====================

export class CreatePostDto {
  @IsEnum(PostType)
  @IsOptional()
  type?: PostType;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  body: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageUrls?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class ListPostsDto {
  @IsString()
  @IsOptional()
  cursor?: string; // Post ID — fetch posts older than this

  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number;

  @IsEnum(PostType)
  @IsOptional()
  type?: PostType;

  @IsString()
  @IsOptional()
  tag?: string;

  @IsString()
  @IsOptional()
  authorId?: string;
}

// ==================== COMMENT DTOs ====================

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  body: string;

  @IsString()
  @IsOptional()
  parentId?: string; // null = top-level, non-null = reply
}
```

**Key points:**
- `ListPostsDto` uses `cursor` (post ID) instead of `page`/`offset` — this is the YouTube-style pagination pattern
- `limit` defaults to 20, max 50
- `CreateCommentDto.parentId` enables one level of threaded replies
- `class-validator` decorators match the pattern used in `vocab-lab.dto.ts`

---

## Step 3: Service — Business Logic

**File:** `backend-core/src/modules/posts/posts.service.ts` (create new file)

```typescript
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreatePostDto, ListPostsDto, CreateCommentDto } from "./dto/posts.dto";

// Reusable select object for author data (ISP: only fetch needed fields)
const AUTHOR_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  avatar: true,
} as const;

const POST_LIST_LIMIT = 20;
const COMMENT_LIST_LIMIT = 50;

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== POST CRUD ====================

  async createPost(userId: string, dto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        authorId: userId,
        type: dto.type ?? "GENERAL",
        title: dto.title ?? null,
        body: dto.body,
        imageUrls: dto.imageUrls ?? [],
        tags: dto.tags ?? [],
        metadata: dto.metadata ?? null,
      },
      include: {
        author: { select: AUTHOR_SELECT },
      },
    });
  }

  async listPosts(userId: string, query: ListPostsDto) {
    const limit = query.limit ?? POST_LIST_LIMIT;

    // Build the where clause
    const where: any = { isHidden: false };
    if (query.type) where.type = query.type;
    if (query.tag) where.tags = { has: query.tag };
    if (query.authorId) where.authorId = query.authorId;

    // Cursor-based pagination: fetch posts with createdAt < cursor post's createdAt
    let cursorCondition: any = undefined;
    if (query.cursor) {
      const cursorPost = await this.prisma.post.findUnique({
        where: { id: query.cursor },
        select: { createdAt: true },
      });
      if (cursorPost) {
        where.createdAt = { lt: cursorPost.createdAt };
      }
    }

    const posts = await this.prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit + 1, // Fetch one extra to determine if there's a next page
      include: {
        author: { select: AUTHOR_SELECT },
        likes: {
          where: { userId },
          select: { id: true },
        },
        bookmarks: {
          where: { userId },
          select: { id: true },
        },
      },
    });

    // Determine if there are more results
    const hasMore = posts.length > limit;
    const results = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore ? results[results.length - 1].id : null;

    // Transform: add isLiked/isBookmarked booleans, remove raw arrays
    const items = results.map((post) => ({
      ...post,
      isLiked: post.likes.length > 0,
      isBookmarked: post.bookmarks.length > 0,
      likes: undefined,
      bookmarks: undefined,
    }));

    return { items, nextCursor };
  }

  async getPost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: { select: AUTHOR_SELECT },
        likes: {
          where: { userId },
          select: { id: true },
        },
        bookmarks: {
          where: { userId },
          select: { id: true },
        },
        comments: {
          where: { isHidden: false, parentId: null }, // Top-level only
          orderBy: { createdAt: "asc" },
          take: COMMENT_LIST_LIMIT,
          include: {
            author: { select: AUTHOR_SELECT },
            replies: {
              where: { isHidden: false },
              orderBy: { createdAt: "asc" },
              include: {
                author: { select: AUTHOR_SELECT },
              },
            },
          },
        },
      },
    });

    if (!post || post.isHidden) {
      throw new NotFoundException("Post not found");
    }

    return {
      ...post,
      isLiked: post.likes.length > 0,
      isBookmarked: post.bookmarks.length > 0,
      likes: undefined,
      bookmarks: undefined,
    };
  }

  async deletePost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new NotFoundException("Post not found");
    if (post.authorId !== userId) throw new ForbiddenException("Not your post");

    await this.prisma.post.delete({ where: { id: postId } });
    return { success: true };
  }

  // ==================== LIKE ====================

  async toggleLike(userId: string, postId: string) {
    // Check post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });
    if (!post) throw new NotFoundException("Post not found");

    // Check if already liked
    const existing = await this.prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing) {
      // Unlike
      await this.prisma.$transaction([
        this.prisma.postLike.delete({ where: { id: existing.id } }),
        this.prisma.post.update({
          where: { id: postId },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);
      return { liked: false };
    }

    // Like
    await this.prisma.$transaction([
      this.prisma.postLike.create({
        data: { postId, userId },
      }),
      this.prisma.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
      }),
    ]);
    return { liked: true };
  }

  // ==================== BOOKMARK ====================

  async toggleBookmark(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });
    if (!post) throw new NotFoundException("Post not found");

    const existing = await this.prisma.postBookmark.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing) {
      await this.prisma.$transaction([
        this.prisma.postBookmark.delete({ where: { id: existing.id } }),
        this.prisma.post.update({
          where: { id: postId },
          data: { bookmarkCount: { decrement: 1 } },
        }),
      ]);
      return { bookmarked: false };
    }

    await this.prisma.$transaction([
      this.prisma.postBookmark.create({
        data: { postId, userId },
      }),
      this.prisma.post.update({
        where: { id: postId },
        data: { bookmarkCount: { increment: 1 } },
      }),
    ]);
    return { bookmarked: true };
  }

  // ==================== COMMENTS ====================

  async createComment(userId: string, postId: string, dto: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });
    if (!post) throw new NotFoundException("Post not found");

    // If replying to a comment, validate parent exists and belongs to same post
    if (dto.parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: dto.parentId },
        select: { postId: true },
      });
      if (!parent || parent.postId !== postId) {
        throw new NotFoundException("Parent comment not found");
      }
    }

    const [comment] = await this.prisma.$transaction([
      this.prisma.comment.create({
        data: {
          postId,
          authorId: userId,
          body: dto.body,
          parentId: dto.parentId ?? null,
        },
        include: {
          author: { select: AUTHOR_SELECT },
        },
      }),
      this.prisma.post.update({
        where: { id: postId },
        data: { commentCount: { increment: 1 } },
      }),
    ]);

    return comment;
  }

  async deleteComment(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true, postId: true },
    });

    if (!comment) throw new NotFoundException("Comment not found");
    if (comment.authorId !== userId) throw new ForbiddenException("Not your comment");

    await this.prisma.$transaction([
      this.prisma.comment.delete({ where: { id: commentId } }),
      this.prisma.post.update({
        where: { id: comment.postId },
        data: { commentCount: { decrement: 1 } },
      }),
    ]);

    return { success: true };
  }

  // ==================== IMAGE UPLOAD ====================
  // Image upload uses the existing StorageService in the controller layer.
  // No service method needed — the controller handles the Multer file
  // and calls storageService.uploadFile(file, "post_images").
}
```

**Key design decisions:**
- **Cursor pagination:** Uses `createdAt < cursorPost.createdAt` instead of `skip/take` offset. This ensures consistent results even when new posts are added during scrolling.
- **`take: limit + 1`:** Fetch one extra row to determine `hasMore` without a separate count query.
- **`isLiked`/`isBookmarked` computed per-request:** The `likes` and `bookmarks` arrays are filtered by the current user's ID, then converted to booleans. The raw arrays are stripped from the response (ISP).
- **Transactions for counters:** Like/unlike/comment operations update the denormalized counter fields atomically.
- **`AUTHOR_SELECT`:** Reusable select object that only fetches `id`, `firstName`, `lastName`, `avatar` — not the full User (ISP).

---

## Step 4: Controller — REST Endpoints

**File:** `backend-core/src/modules/posts/posts.controller.ts` (create new file)

```typescript
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { PostsService } from "./posts.service";
import { StorageService } from "../../common/storage/storage.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreatePostDto, ListPostsDto, CreateCommentDto } from "./dto/posts.dto";

@Controller("posts")
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly storageService: StorageService,
  ) {}

  // ==================== POST CRUD ====================

  @Post()
  async createPost(@Request() req: any, @Body() dto: CreatePostDto) {
    return this.postsService.createPost(req.user.id, dto);
  }

  @Get()
  async listPosts(@Request() req: any, @Query() query: ListPostsDto) {
    return this.postsService.listPosts(req.user.id, query);
  }

  @Get(":id")
  async getPost(@Request() req: any, @Param("id") id: string) {
    return this.postsService.getPost(req.user.id, id);
  }

  @Delete(":id")
  async deletePost(@Request() req: any, @Param("id") id: string) {
    return this.postsService.deletePost(req.user.id, id);
  }

  // ==================== INTERACTIONS ====================

  @Post(":id/like")
  async toggleLike(@Request() req: any, @Param("id") id: string) {
    return this.postsService.toggleLike(req.user.id, id);
  }

  @Post(":id/bookmark")
  async toggleBookmark(@Request() req: any, @Param("id") id: string) {
    return this.postsService.toggleBookmark(req.user.id, id);
  }

  // ==================== COMMENTS ====================

  @Post(":id/comments")
  async createComment(
    @Request() req: any,
    @Param("id") id: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.postsService.createComment(req.user.id, id, dto);
  }

  @Delete("comments/:commentId")
  async deleteComment(
    @Request() req: any,
    @Param("commentId") commentId: string,
  ) {
    return this.postsService.deleteComment(req.user.id, commentId);
  }

  // ==================== IMAGE UPLOAD ====================

  @Post("images/upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("File is required");
    const url = await this.storageService.uploadFile(file, "post_images");
    return { url };
  }
}
```

**Notes:**
- All endpoints are under `@Controller("posts")` → prefix `/api/v1/posts`
- All protected by `@UseGuards(JwtAuthGuard)` at class level (same pattern as `VocabLabController`)
- Image upload uses existing `StorageService` with folder `"post_images"` (Cloudinary)
- The `DELETE comments/:commentId` route must come after `:id/comments` to avoid route conflict — NestJS resolves routes top-down, and `"comments/:commentId"` is a literal segment `comments/` so there's no ambiguity

---

## Step 5: Module Registration

### 5.1 — Create PostsModule

**File:** `backend-core/src/modules/posts/posts.module.ts` (create new file)

```typescript
import { Module } from "@nestjs/common";
import { PostsController } from "./posts.controller";
import { PostsService } from "./posts.service";
import { StorageModule } from "../../common/storage/storage.module";

@Module({
  imports: [StorageModule],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
```

### 5.2 — Register in AppModule

**File:** `backend-core/src/app.module.ts`

Add the import (after existing module imports, ~line 23):

```typescript
import { PostsModule } from "./modules/posts/posts.module";
```

Add `PostsModule` to the `imports` array (after `NotificationsModule`, ~line 60):

```typescript
    NotificationsModule,
    PostsModule,
```

---

## Step 6: Verify

After implementing all steps, verify with these tests:

### 6.1 — Run migration
```bash
cd backend-core
npx prisma migrate dev --name add_community_posts
npx prisma generate
```

### 6.2 — Start backend and test endpoints
```bash
npm run backend:dev
```

Use a tool like Postman, Insomnia, or `curl` with a valid JWT token:

**Create a post:**
```bash
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "STUDY_TIP",
    "title": "How I improved my Listening score by 50 points",
    "body": "Here are 3 strategies that worked for me...",
    "tags": ["Listening", "TOEIC"]
  }'
```
**Expected:** 201 with the created post object including `author` data.

**List posts (cursor pagination):**
```bash
curl http://localhost:3000/api/v1/posts?limit=5 \
  -H "Authorization: Bearer <TOKEN>"
```
**Expected:** `{ items: [...], nextCursor: "uuid" | null }`

**Like a post:**
```bash
curl -X POST http://localhost:3000/api/v1/posts/<POST_ID>/like \
  -H "Authorization: Bearer <TOKEN>"
```
**Expected first call:** `{ liked: true }`, post.likeCount → 1
**Expected second call:** `{ liked: false }`, post.likeCount → 0

**Add a comment:**
```bash
curl -X POST http://localhost:3000/api/v1/posts/<POST_ID>/comments \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "body": "Great tip! Thanks for sharing." }'
```
**Expected:** 201 with comment object, post.commentCount → 1

**Upload image:**
```bash
curl -X POST http://localhost:3000/api/v1/posts/images/upload \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@/path/to/image.jpg"
```
**Expected:** `{ url: "https://res.cloudinary.com/..." }`

---

## Files Created/Modified

| Action | File |
|--------|------|
| **Modified** | `backend-core/prisma/schema.prisma` — add PostType enum, Post, Comment, PostLike, PostBookmark models + User relations |
| **Created** | `backend-core/src/modules/posts/dto/posts.dto.ts` — CreatePostDto, ListPostsDto, CreateCommentDto |
| **Created** | `backend-core/src/modules/posts/posts.service.ts` — all business logic |
| **Created** | `backend-core/src/modules/posts/posts.controller.ts` — REST endpoints |
| **Created** | `backend-core/src/modules/posts/posts.module.ts` — NestJS module |
| **Modified** | `backend-core/src/app.module.ts` — register PostsModule |
