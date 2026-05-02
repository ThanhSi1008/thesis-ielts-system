# Phase 2: Backend API — Serve Grammar Content + Progress

## Objective

Extend the backend so the frontend can:
1. Fetch books with unit lists
2. Fetch a single unit with full theory HTML + parsed exercises
3. Track per-unit progress server-side (replace `localStorage`)

## Current State

### What Already Works

The backend grammar module (`backend-core/src/modules/grammar/`) already has:

- **`GET /grammar/books`** — Returns all books with unit counts ✅
- **`GET /grammar/books/:slug`** — Returns a book with its units (id, title, order) ✅
- **`GET /grammar/units/:id`** — Returns a unit with `theoryContent` + `exercises[]` ✅
- **CRUD endpoints** for admin book/unit management ✅
- **Redis caching** on all read operations ✅

### What's Missing

1. **Exercise parsing** — The `getUnitWithContent` method returns raw `exercises` from Prisma. The `answer` field stores JSON strings, but the frontend needs parsed objects.
2. **Progress tracking** — No `GrammarProgress` model or endpoints exist. The frontend currently uses `localStorage`.
3. **Unit lookup by order** — The frontend navigates with `/grammar/intermediate/unit1`, but the API uses UUID `id`. We need a way to look up units by `bookSlug + order`.

---

## Step 1: Add Unit Lookup by Book Slug + Order

**File:** `backend-core/src/modules/grammar/grammar.service.ts`

### Add new method

```ts
async getUnitByBookAndOrder(bookSlug: string, unitOrder: number) {
  const cacheKey = `${CACHE_PREFIX}:unit:${bookSlug}:${unitOrder}`;
  const cached = await this.redis.getJson(cacheKey);
  if (cached) return cached;

  const unit = await this.prisma.grammarUnit.findFirst({
    where: {
      book: { slug: bookSlug },
      order: unitOrder,
    },
    include: {
      book: { select: { id: true, slug: true, name: true, level: true, color: true } },
      exercises: { orderBy: { order: "asc" } },
    },
  });

  if (!unit) return null;

  // Parse exercise answer JSON strings into objects
  const parsedUnit = {
    ...unit,
    exercises: unit.exercises.map(ex => ({
      ...ex,
      items: this.parseExerciseAnswer(ex.answer),
      options: ex.options ?? null,
    })),
  };

  await this.redis.setJson(cacheKey, parsedUnit, CACHE_TTL);
  return parsedUnit;
}

private parseExerciseAnswer(answer: string): any[] {
  try {
    return JSON.parse(answer);
  } catch {
    return [];
  }
}
```

### Add new endpoint

**File:** `backend-core/src/modules/grammar/grammar.controller.ts`

```ts
@Get("books/:slug/units/:order")
async getUnitByBookAndOrder(
  @Param("slug") slug: string,
  @Param("order", ParseIntPipe) order: number,
) {
  const unit = await this.grammarService.getUnitByBookAndOrder(slug, order);
  if (!unit) throw new NotFoundException("Grammar unit not found");
  return unit;
}
```

> **Note:** Add `ParseIntPipe` to the imports from `@nestjs/common`.

---

## Step 2: Add Progress Tracking

### 2a. Add Prisma Model

**File:** `backend-core/prisma/schema.prisma`

Add after the `GrammarExercise` model (around line 433):

```prisma
// Grammar Progress (per-user, per-unit)
model GrammarProgress {
  id               String   @id @default(uuid())
  userId           String
  unitId           String
  theoryCompleted  Boolean  @default(false)
  exerciseScore    Int?     // Best score (correct count)
  exerciseTotal    Int?     // Total exercise count
  completedAt      DateTime?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  user User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  unit GrammarUnit  @relation(fields: [unitId], references: [id], onDelete: Cascade)

  @@unique([userId, unitId])
  @@map("grammar_progress")
}
```

Also add the reverse relation to `GrammarUnit`:

```prisma
model GrammarUnit {
  // ...existing fields...
  progress GrammarProgress[]   // ADD THIS LINE
}
```

And to the `User` model:

```prisma
model User {
  // ...existing fields...
  grammarProgress GrammarProgress[]   // ADD THIS LINE
}
```

Run migration:

```bash
cd backend-core
npx prisma migrate dev --name add_grammar_progress
```

### 2b. Add Progress DTOs

**File:** `backend-core/src/modules/grammar/dto/grammar.dto.ts`

Append:

```ts
export class UpdateGrammarProgressDto {
  @IsString()
  unitId: string;

  @IsBoolean()
  @IsOptional()
  theoryCompleted?: boolean;

  @IsInt()
  @IsOptional()
  exerciseScore?: number;

  @IsInt()
  @IsOptional()
  exerciseTotal?: number;
}
```

> **Note:** Add `IsBoolean` to the imports from `class-validator`.

### 2c. Add Progress Service Methods

**File:** `backend-core/src/modules/grammar/grammar.service.ts`

```ts
// ==================== PROGRESS ====================

async getProgress(userId: string, bookSlug: string) {
  const progress = await this.prisma.grammarProgress.findMany({
    where: {
      userId,
      unit: { book: { slug: bookSlug } },
    },
    select: {
      unitId: true,
      theoryCompleted: true,
      exerciseScore: true,
      exerciseTotal: true,
      completedAt: true,
      unit: { select: { order: true } },
    },
  });

  return progress.map(p => ({
    unitOrder: p.unit.order,
    theoryCompleted: p.theoryCompleted,
    exerciseScore: p.exerciseScore,
    exerciseTotal: p.exerciseTotal,
    isCompleted: p.theoryCompleted && p.exerciseScore != null && p.exerciseScore === p.exerciseTotal,
    completedAt: p.completedAt,
  }));
}

async updateProgress(
  userId: string,
  dto: UpdateGrammarProgressDto,
) {
  const existing = await this.prisma.grammarProgress.findUnique({
    where: { userId_unitId: { userId, unitId: dto.unitId } },
  });

  const isNowComplete =
    (dto.theoryCompleted ?? existing?.theoryCompleted ?? false) &&
    dto.exerciseScore != null &&
    dto.exerciseTotal != null &&
    dto.exerciseScore === dto.exerciseTotal;

  return this.prisma.grammarProgress.upsert({
    where: { userId_unitId: { userId, unitId: dto.unitId } },
    create: {
      userId,
      unitId: dto.unitId,
      theoryCompleted: dto.theoryCompleted ?? false,
      exerciseScore: dto.exerciseScore,
      exerciseTotal: dto.exerciseTotal,
      completedAt: isNowComplete ? new Date() : null,
    },
    update: {
      theoryCompleted: dto.theoryCompleted ?? undefined,
      exerciseScore: dto.exerciseScore ?? undefined,
      exerciseTotal: dto.exerciseTotal ?? undefined,
      completedAt: isNowComplete ? new Date() : undefined,
    },
  });
}
```

### 2d. Add Progress Endpoints

**File:** `backend-core/src/modules/grammar/grammar.controller.ts`

```ts
// ==================== PROGRESS ENDPOINTS ====================

@Get("progress/:bookSlug")
@UseGuards(JwtAuthGuard)
async getProgress(
  @Req() req: any,
  @Param("bookSlug") bookSlug: string,
) {
  return this.grammarService.getProgress(req.user.id, bookSlug);
}

@Put("progress")
@UseGuards(JwtAuthGuard)
async updateProgress(
  @Req() req: any,
  @Body() dto: UpdateGrammarProgressDto,
) {
  return this.grammarService.updateProgress(req.user.id, dto);
}
```

> **Note:** Add `Req` to the imports from `@nestjs/common`, and import `UpdateGrammarProgressDto`.

---

## Step 3: Update Frontend API Client

**File:** `frontend-web/src/services/learning.api.ts`

Update the `grammarApi` object:

```ts
export const grammarApi = {
  getBooks: async () => {
    const { data } = await api.get<GrammarBook[]>('/grammar/books');
    return data;
  },
  getBook: async (slug: string) => {
    const { data } = await api.get<GrammarBookWithUnits>(`/grammar/books/${slug}`);
    return data;
  },
  getUnit: async (id: string) => {
    const { data } = await api.get<GrammarUnitWithContent>(`/grammar/units/${id}`);
    return data;
  },
  // NEW — fetch unit by book slug and order number
  getUnitByOrder: async (bookSlug: string, order: number) => {
    const { data } = await api.get<GrammarUnitWithContent>(`/grammar/books/${bookSlug}/units/${order}`);
    return data;
  },
  // NEW — fetch user's progress for a book
  getProgress: async (bookSlug: string) => {
    const { data } = await api.get(`/grammar/progress/${bookSlug}`);
    return data;
  },
  // NEW — update progress for a unit
  updateProgress: async (dto: { unitId: string; theoryCompleted?: boolean; exerciseScore?: number; exerciseTotal?: number }) => {
    const { data } = await api.put('/grammar/progress', dto);
    return data;
  },
};
```

---

## Step 4: Update Frontend Types

**File:** `frontend-web/src/types/index.ts`

Update the `GrammarUnitWithContent` interface to include parsed exercise items:

```ts
export interface GrammarExerciseItem {
  label: string;
  answer: string;
  isExample?: boolean;
  value?: string;
}

export interface GrammarExerciseMatch {
  left: string;
  right: string;
  isExample?: boolean;
}

export interface GrammarExercise {
  id: string;
  section: string;
  question: string;
  type: 'fill_blank' | 'match' | 'multiple_choice' | 'rewrite';
  options: {
    verbs?: string[];
    choices?: string[];
  } | null;
  items: GrammarExerciseItem[] | GrammarExerciseMatch[];
  order: number;
}

export interface GrammarUnitWithContent extends GrammarUnit {
  book: { id: string; slug: string; name: string; level: string; color: string };
  exercises: GrammarExercise[];
}

export interface GrammarUnitProgress {
  unitOrder: number;
  theoryCompleted: boolean;
  exerciseScore: number | null;
  exerciseTotal: number | null;
  isCompleted: boolean;
  completedAt: string | null;
}
```

---

## Verification Checklist

- [ ] `GET /grammar/books/intermediate/units/1` returns unit with parsed `theoryContent` HTML and `exercises[]` with parsed `items`
- [ ] `GET /grammar/progress/intermediate` returns empty array for new user
- [ ] `PUT /grammar/progress` with `{ unitId, theoryCompleted: true }` creates/updates progress
- [ ] `PUT /grammar/progress` with `{ unitId, exerciseScore: 14, exerciseTotal: 14 }` sets `completedAt`
- [ ] Redis cache is populated on first read and served on subsequent reads
- [ ] Frontend `grammarApi.getUnitByOrder('intermediate', 1)` returns expected data shape

## Files to Create/Modify

| File | Action |
|------|--------|
| `backend-core/prisma/schema.prisma` | **MODIFY** — Add `GrammarProgress` model + relations |
| `backend-core/src/modules/grammar/grammar.service.ts` | **MODIFY** — Add `getUnitByBookAndOrder`, `getProgress`, `updateProgress` |
| `backend-core/src/modules/grammar/grammar.controller.ts` | **MODIFY** — Add 3 new endpoints |
| `backend-core/src/modules/grammar/dto/grammar.dto.ts` | **MODIFY** — Add `UpdateGrammarProgressDto` |
| `frontend-web/src/services/learning.api.ts` | **MODIFY** — Add `getUnitByOrder`, `getProgress`, `updateProgress` |
| `frontend-web/src/types/index.ts` | **MODIFY** — Update grammar types |

## Dependencies

- **Requires Phase 1 complete**: The `getUnitByBookAndOrder` method will return `theoryContent: null` and `exercises: []` if seed data hasn't been populated.
