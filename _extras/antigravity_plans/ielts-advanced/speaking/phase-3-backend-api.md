# Phase 3: Backend API Endpoints

> **Goal**: Implement NestJS controller + service for IELTS Advanced Speaking: part listing, session management, audio submission, and grading trigger.

> **Depends on**: Phase 2 (schema + seeder)

---

## 1. Architecture Overview

```
Controller (ielts-advanced.controller.ts)
  └─► Service (ielts-advanced.service.ts)
        └─► PrismaService (DB queries)
        └─► AiClientService (RabbitMQ publish for grading)
```

**Follow the existing pattern** in `ielts-advanced.controller.ts` — add speaking routes alongside the existing listening/reading/writing routes.

---

## 2. New Endpoints

Add these routes to the existing `IeltsAdvancedController`:

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| `GET` | `/ielts/advanced/speaking/parts` | `getSpeakingParts` | List parts with filters + pagination |
| `GET` | `/ielts/advanced/speaking/parts/:id` | `getSpeakingPartDetail` | Single part with user's sessions |
| `GET` | `/ielts/advanced/speaking/parts/:id/sessions` | `getSpeakingSessionsByPart` | All sessions for this part (My Answers) |
| `POST` | `/ielts/advanced/speaking/sessions` | `createSpeakingSession` | Start a new speaking session |
| `POST` | `/ielts/advanced/speaking/sessions/:id/submit` | `submitSpeakingSession` | Submit audio for AI grading |
| `GET` | `/ielts/advanced/speaking/sessions/:id` | `getSpeakingSession` | Get session detail + feedback |
| `GET` | `/ielts/advanced/speaking/history` | `getSpeakingHistory` | User's speaking history |

---

## 3. Controller Implementation

File: `backend-core/src/modules/ielts/ielts-advanced.controller.ts`

Add after the existing writing routes:

```typescript
// --- SPEAKING ROUTES ---

@Get("speaking/parts")
async getSpeakingParts(
  @Request() req: any,
  @Query("partNumber") partNumber?: string,  // "1" | "2" | "3"
  @Query("category") category?: string,      // "cambridge-academic" etc.
  @Query("topic") topic?: string,
  @Query("page") page?: string,
  @Query("limit") limit?: string,
) {
  return this.advancedService.getSpeakingParts(req.user.id, {
    partNumber: partNumber ? parseInt(partNumber) : undefined,
    category,
    topic,
    page: parseInt(page || "1"),
    limit: parseInt(limit || "20"),
  });
}

@Get("speaking/parts/:id")
async getSpeakingPartDetail(
  @Request() req: any,
  @Param("id") id: string,
) {
  return this.advancedService.getSpeakingPartDetail(req.user.id, id);
}

@Get("speaking/parts/:id/sessions")
async getSpeakingSessionsByPart(
  @Request() req: any,
  @Param("id") partId: string,
) {
  return this.advancedService.getSpeakingSessionsByPart(req.user.id, partId);
}

@Post("speaking/sessions")
async createSpeakingSession(
  @Request() req: any,
  @Body() body: { partId: string },
) {
  return this.advancedService.createSpeakingSession(req.user.id, body.partId);
}

@Post("speaking/sessions/:id/submit")
async submitSpeakingSession(
  @Request() req: any,
  @Param("id") sessionId: string,
  @Body() body: { audioAnswers: Record<string, string>; timeTaken?: number },
) {
  return this.advancedService.submitSpeakingSession(
    req.user.id, sessionId, body.audioAnswers, body.timeTaken,
  );
}

@Get("speaking/sessions/:id")
async getSpeakingSession(
  @Request() req: any,
  @Param("id") sessionId: string,
) {
  return this.advancedService.getSpeakingSession(req.user.id, sessionId);
}

@Get("speaking/history")
async getSpeakingHistory(@Request() req: any) {
  return this.advancedService.getSpeakingHistory(req.user.id);
}
```

---

## 4. Service Implementation

File: `backend-core/src/modules/ielts/ielts-advanced.service.ts`

Add these methods to the existing `IeltsAdvancedService`:

### 4.1. getSpeakingParts

```typescript
async getSpeakingParts(
  userId: string,
  filters: {
    partNumber?: number;
    category?: string;
    topic?: string;
    page: number;
    limit: number;
  },
) {
  const where: any = { isPublished: true };
  if (filters.partNumber) where.partNumber = filters.partNumber;
  if (filters.category) where.category = filters.category;
  if (filters.topic) where.topic = { contains: filters.topic, mode: 'insensitive' };

  const [parts, total] = await Promise.all([
    this.prisma.ieltsAdvancedSpeakingPart.findMany({
      where,
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      orderBy: [
        { bookNumber: 'asc' },
        { testNumber: 'asc' },
        { partNumber: 'asc' },
      ],
      select: {
        id: true,
        partNumber: true,
        partType: true,
        topic: true,
        source: true,
        category: true,
        bookNumber: true,
        testNumber: true,
        title: true,
        questions: true,
        // Include user's best score
        sessions: {
          where: { userId, status: 'GRADED' },
          select: { bandScore: true, createdAt: true },
          orderBy: { bandScore: 'desc' },
          take: 1,
        },
      },
    }),
    this.prisma.ieltsAdvancedSpeakingPart.count({ where }),
  ]);

  // Transform: flatten best score
  const data = parts.map((p) => ({
    ...p,
    bestScore: p.sessions[0]?.bandScore ?? null,
    lastAttempt: p.sessions[0]?.createdAt ?? null,
    sessions: undefined,
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

### 4.2. getSpeakingPartDetail

```typescript
async getSpeakingPartDetail(userId: string, partId: string) {
  const part = await this.prisma.ieltsAdvancedSpeakingPart.findUniqueOrThrow({
    where: { id: partId },
  });

  // Check if user has an in-progress session
  const activeSession = await this.prisma.ieltsAdvancedSpeakingSession.findFirst({
    where: { userId, partId, status: 'IN_PROGRESS' },
    select: { id: true, createdAt: true },
  });

  return { ...part, activeSession };
}
```

### 4.3. getSpeakingSessionsByPart

```typescript
async getSpeakingSessionsByPart(userId: string, partId: string) {
  return this.prisma.ieltsAdvancedSpeakingSession.findMany({
    where: { userId, partId },
    select: {
      id: true,
      status: true,
      bandScore: true,
      timeTaken: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}
```

### 4.4. createSpeakingSession

```typescript
async createSpeakingSession(userId: string, partId: string) {
  // Verify part exists
  await this.prisma.ieltsAdvancedSpeakingPart.findUniqueOrThrow({
    where: { id: partId },
  });

  // Check for existing in-progress session
  const existing = await this.prisma.ieltsAdvancedSpeakingSession.findFirst({
    where: { userId, partId, status: 'IN_PROGRESS' },
  });

  if (existing) return existing; // Resume existing session

  return this.prisma.ieltsAdvancedSpeakingSession.create({
    data: { userId, partId },
  });
}
```

### 4.5. submitSpeakingSession

```typescript
async submitSpeakingSession(
  userId: string,
  sessionId: string,
  audioAnswers: Record<string, string>,  // { "0": "base64...", "1": "base64...", ... }
  timeTaken?: number,
) {
  const session = await this.prisma.ieltsAdvancedSpeakingSession.findFirst({
    where: { id: sessionId, userId, status: 'IN_PROGRESS' },
    include: { part: true },
  });

  if (!session) throw new NotFoundException('Session not found or already submitted');

  // Update session
  const updated = await this.prisma.ieltsAdvancedSpeakingSession.update({
    where: { id: sessionId },
    data: {
      audioUrls: audioAnswers,
      timeTaken: timeTaken ?? null,
      status: 'GRADING',
    },
  });

  // Publish grading task to RabbitMQ
  // Build questions list from part data
  const questions = (session.part.questions as any[]).map((q: any) => q.text);

  await this.aiClientService.publishGradingTask({
    type: 'ADVANCED_SPEAKING',
    sessionId: session.id,
    partNumber: session.part.partNumber,
    partType: session.part.partType,
    questions,
    audioAnswers,
  });

  return updated;
}
```

> **Audio payload format**: `audioAnswers` is a `Record<string, string>` where keys are question indices ("0", "1", "2", etc.) and values are base64-encoded audio blobs (e.g., `"data:audio/webm;base64,..."`). This matches the existing Intensive Speaking pattern.

### 4.6. getSpeakingSession

```typescript
async getSpeakingSession(userId: string, sessionId: string) {
  return this.prisma.ieltsAdvancedSpeakingSession.findFirstOrThrow({
    where: { id: sessionId, userId },
    include: {
      part: {
        select: {
          id: true,
          title: true,
          partNumber: true,
          partType: true,
          topic: true,
          questions: true,
        },
      },
    },
  });
}
```

### 4.7. getSpeakingHistory

```typescript
async getSpeakingHistory(userId: string) {
  return this.prisma.ieltsAdvancedSpeakingSession.findMany({
    where: { userId, status: { not: 'IN_PROGRESS' } },
    include: {
      part: {
        select: {
          id: true,
          title: true,
          partNumber: true,
          partType: true,
          topic: true,
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

## 5. Dependency Injection

Ensure `AiClientService` is injected into `IeltsAdvancedService` (should already be present from writing integration):

```typescript
constructor(
  private readonly prisma: PrismaService,
  private readonly aiClientService: AiClientService,
) {}
```

---

## 6. Files Modified

| File | Change |
|------|--------|
| `backend-core/src/modules/ielts/ielts-advanced.controller.ts` | Add 7 new speaking routes |
| `backend-core/src/modules/ielts/ielts-advanced.service.ts` | Add 7 new service methods |

---

## 7. Testing Checklist

- [ ] `GET /ielts/advanced/speaking/parts` returns paginated parts
- [ ] `GET /ielts/advanced/speaking/parts?partNumber=2` filters correctly
- [ ] `GET /ielts/advanced/speaking/parts?category=cambridge-academic` filters correctly
- [ ] `GET /ielts/advanced/speaking/parts/:id` returns part + questions + activeSession
- [ ] `GET /ielts/advanced/speaking/parts/:id/sessions` returns user's sessions for that part
- [ ] `POST /ielts/advanced/speaking/sessions` creates a new session (or resumes existing)
- [ ] `POST /ielts/advanced/speaking/sessions/:id/submit` updates status to GRADING and publishes to RabbitMQ
- [ ] `GET /ielts/advanced/speaking/sessions/:id` returns session with part data
- [ ] `GET /ielts/advanced/speaking/history` returns user's past submissions
