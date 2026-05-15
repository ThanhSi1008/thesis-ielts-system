# Phase 3: Backend API Endpoints

> **Goal**: Implement NestJS controller + service for IELTS Advanced Writing: prompt listing, session management, draft saving, and submission.

> **Depends on**: Phase 2 (schema + seeder)

---

## 1. Architecture Overview

```
Controller (ielts-advanced.controller.ts)
  └─► Service (ielts-advanced.service.ts)
        └─► PrismaService (DB queries)
        └─► AiClientService (RabbitMQ publish for grading)
```

**Follow the existing pattern** in `ielts-advanced.controller.ts` — add writing routes alongside the existing listening/reading routes.

---

## 2. New Endpoints

Add these routes to the existing `IeltsAdvancedController`:

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| `GET` | `/ielts/advanced/writing/prompts` | `getWritingPrompts` | List prompts with filters + pagination |
| `GET` | `/ielts/advanced/writing/prompts/:id` | `getWritingPromptDetail` | Single prompt with user's sessions |
| `POST` | `/ielts/advanced/writing/sessions` | `createWritingSession` | Start a new practice session |
| `PATCH` | `/ielts/advanced/writing/sessions/:id/draft` | `saveDraft` | Auto-save draft essay |
| `POST` | `/ielts/advanced/writing/sessions/:id/submit` | `submitWritingSession` | Submit essay for AI grading |
| `GET` | `/ielts/advanced/writing/sessions/:id` | `getWritingSession` | Get session detail + feedback |
| `GET` | `/ielts/advanced/writing/history` | `getWritingHistory` | User's writing practice history |

---

## 3. Controller Implementation

File: `backend-core/src/modules/ielts/ielts-advanced.controller.ts`

Add after the existing reading routes:

```typescript
// --- WRITING ROUTES ---

@Get("writing/prompts")
async getWritingPrompts(
  @Request() req: any,
  @Query("taskType") taskType?: string,      // "TASK_1" | "TASK_2"
  @Query("subType") subType?: string,        // "bar_chart" | "opinion" | etc.
  @Query("category") category?: string,      // "cambridge-academic" | etc.
  @Query("page") page?: string,
  @Query("limit") limit?: string,
) {
  return this.advancedService.getWritingPrompts(req.user.id, {
    taskType,
    subType,
    category,
    page: parseInt(page || "1"),
    limit: parseInt(limit || "20"),
  });
}

@Get("writing/prompts/:id")
async getWritingPromptDetail(
  @Request() req: any,
  @Param("id") id: string,
) {
  return this.advancedService.getWritingPromptDetail(req.user.id, id);
}

@Post("writing/sessions")
async createWritingSession(
  @Request() req: any,
  @Body() body: { promptId: string },
) {
  return this.advancedService.createWritingSession(req.user.id, body.promptId);
}

@Patch("writing/sessions/:id/draft")
async saveDraft(
  @Request() req: any,
  @Param("id") sessionId: string,
  @Body() body: { draftEssay: string },
) {
  return this.advancedService.saveWritingDraft(req.user.id, sessionId, body.draftEssay);
}

@Post("writing/sessions/:id/submit")
async submitWritingSession(
  @Request() req: any,
  @Param("id") sessionId: string,
  @Body() body: { essay: string; timeTaken?: number },
) {
  return this.advancedService.submitWritingSession(
    req.user.id, sessionId, body.essay, body.timeTaken,
  );
}

@Get("writing/sessions/:id")
async getWritingSession(
  @Request() req: any,
  @Param("id") sessionId: string,
) {
  return this.advancedService.getWritingSession(req.user.id, sessionId);
}

@Get("writing/history")
async getWritingHistory(@Request() req: any) {
  return this.advancedService.getWritingHistory(req.user.id);
}
```

> **Import note**: Add `Patch` to the NestJS imports at the top of the controller file.

---

## 4. Service Implementation

File: `backend-core/src/modules/ielts/ielts-advanced.service.ts`

Add these methods to the existing `IeltsAdvancedService`:

### 4.1. getWritingPrompts

```typescript
async getWritingPrompts(
  userId: string,
  filters: {
    taskType?: string;
    subType?: string;
    category?: string;
    page: number;
    limit: number;
  },
) {
  const where: any = { isPublished: true };
  if (filters.taskType) where.taskType = filters.taskType;
  if (filters.subType) where.subType = filters.subType;
  if (filters.category) where.category = filters.category;

  const [prompts, total] = await Promise.all([
    this.prisma.ieltsAdvancedWritingPrompt.findMany({
      where,
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      orderBy: [
        { bookNumber: 'asc' },
        { testNumber: 'asc' },
        { taskType: 'asc' },
      ],
      select: {
        id: true,
        taskType: true,
        subType: true,
        source: true,
        category: true,
        bookNumber: true,
        testNumber: true,
        title: true,
        imageUrl: true,
        minimumWords: true,
        suggestedTime: true,
        difficulty: true,
        // Include user's best score
        sessions: {
          where: { userId, status: 'GRADED' },
          select: { bandScore: true, createdAt: true },
          orderBy: { bandScore: 'desc' },
          take: 1,
        },
      },
    }),
    this.prisma.ieltsAdvancedWritingPrompt.count({ where }),
  ]);

  // Transform: flatten best score
  const data = prompts.map((p) => ({
    ...p,
    bestScore: p.sessions[0]?.bandScore ?? null,
    lastAttempt: p.sessions[0]?.createdAt ?? null,
    sessions: undefined, // Remove raw sessions array
  }));

  return {
    data,
    total,
    page: filters.page,
    limit: filters.limit,
    totalPages: Math.ceil(total / filters.limit),
  };
}
```

### 4.2. getWritingPromptDetail

```typescript
async getWritingPromptDetail(userId: string, promptId: string) {
  const prompt = await this.prisma.ieltsAdvancedWritingPrompt.findUniqueOrThrow({
    where: { id: promptId },
    include: {
      sessions: {
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          bandScore: true,
          timeTaken: true,
          createdAt: true,
        },
      },
    },
  });

  // Check if user has an in-progress session
  const activeSession = await this.prisma.ieltsAdvancedWritingSession.findFirst({
    where: { userId, promptId, status: 'IN_PROGRESS' },
    select: { id: true, draftEssay: true, createdAt: true },
  });

  return { ...prompt, activeSession };
}
```

### 4.3. createWritingSession

```typescript
async createWritingSession(userId: string, promptId: string) {
  // Verify prompt exists
  await this.prisma.ieltsAdvancedWritingPrompt.findUniqueOrThrow({
    where: { id: promptId },
  });

  // Check for existing in-progress session
  const existing = await this.prisma.ieltsAdvancedWritingSession.findFirst({
    where: { userId, promptId, status: 'IN_PROGRESS' },
  });

  if (existing) return existing; // Resume existing session

  return this.prisma.ieltsAdvancedWritingSession.create({
    data: { userId, promptId },
  });
}
```

### 4.4. saveWritingDraft

```typescript
async saveWritingDraft(userId: string, sessionId: string, draftEssay: string) {
  const session = await this.prisma.ieltsAdvancedWritingSession.findFirst({
    where: { id: sessionId, userId, status: 'IN_PROGRESS' },
  });

  if (!session) throw new NotFoundException('Session not found or already submitted');

  return this.prisma.ieltsAdvancedWritingSession.update({
    where: { id: sessionId },
    data: { draftEssay },
  });
}
```

### 4.5. submitWritingSession

```typescript
async submitWritingSession(
  userId: string,
  sessionId: string,
  essay: string,
  timeTaken?: number,
) {
  const session = await this.prisma.ieltsAdvancedWritingSession.findFirst({
    where: { id: sessionId, userId, status: 'IN_PROGRESS' },
    include: { prompt: true },
  });

  if (!session) throw new NotFoundException('Session not found or already submitted');

  // Update session status
  const updated = await this.prisma.ieltsAdvancedWritingSession.update({
    where: { id: sessionId },
    data: {
      essay,
      timeTaken: timeTaken ?? null,
      status: 'GRADING',
    },
  });

  // Publish grading task to RabbitMQ
  // Use the existing AiClientService pattern
  await this.aiClientService.publishGradingTask({
    type: 'ADVANCED_WRITING',         // New type for the consumer
    sessionId: session.id,
    taskType: session.prompt.taskType,
    prompt: session.prompt.prompt,
    essay,
    imageUrl: session.prompt.imageUrl || '',
  });

  return updated;
}
```

### 4.6. getWritingSession

```typescript
async getWritingSession(userId: string, sessionId: string) {
  return this.prisma.ieltsAdvancedWritingSession.findFirstOrThrow({
    where: { id: sessionId, userId },
    include: {
      prompt: {
        select: {
          id: true,
          title: true,
          taskType: true,
          prompt: true,
          imageUrl: true,
        },
      },
    },
  });
}
```

### 4.7. getWritingHistory

```typescript
async getWritingHistory(userId: string) {
  return this.prisma.ieltsAdvancedWritingSession.findMany({
    where: { userId, status: { not: 'IN_PROGRESS' } },
    include: {
      prompt: {
        select: {
          id: true,
          title: true,
          taskType: true,
          subType: true,
          source: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}
```

---

## 5. AiClientService Update

File: `backend-core/src/modules/ai-client/ai-client.service.ts`

Ensure `publishGradingTask` supports the new `ADVANCED_WRITING` type. The existing method already publishes to `exam-grading-queue` — just ensure the payload shape works:

```typescript
// The existing publishGradingTask should already handle this.
// The payload structure:
{
  type: 'ADVANCED_WRITING',
  sessionId: string,
  taskType: 'TASK_1' | 'TASK_2',
  prompt: string,
  essay: string,
  imageUrl: string,
}
```

---

## 6. Dependency Injection

Ensure `AiClientService` is injected into `IeltsAdvancedService`:

```typescript
constructor(
  private readonly prisma: PrismaService,
  private readonly aiClientService: AiClientService, // Add if not present
) {}
```

And imported in `IeltsModule`:

```typescript
// In ielts.module.ts, ensure AiClientModule is imported
imports: [AiClientModule],
```

---

## 7. Files Modified

| File | Change |
|------|--------|
| `backend-core/src/modules/ielts/ielts-advanced.controller.ts` | Add 7 new writing routes |
| `backend-core/src/modules/ielts/ielts-advanced.service.ts` | Add 7 new service methods |
| `backend-core/src/modules/ielts/ielts.module.ts` | Import `AiClientModule` (if not already) |

---

## 8. Testing Checklist

- [ ] `GET /ielts/advanced/writing/prompts` returns paginated prompts
- [ ] `GET /ielts/advanced/writing/prompts?taskType=TASK_1` filters correctly
- [ ] `GET /ielts/advanced/writing/prompts/:id` returns prompt + user sessions
- [ ] `POST /ielts/advanced/writing/sessions` creates a new session (or resumes existing)
- [ ] `PATCH /ielts/advanced/writing/sessions/:id/draft` saves draft
- [ ] `POST /ielts/advanced/writing/sessions/:id/submit` updates status to GRADING and publishes to RabbitMQ
- [ ] `GET /ielts/advanced/writing/sessions/:id` returns session with prompt data
- [ ] `GET /ielts/advanced/writing/history` returns user's past submissions
