# Phase 2 — Backend API

## Goal
Extend the pronunciation backend with progress tracking endpoints, enrich the existing sound endpoints to include example words, and wire up progress auto-updates after practice attempts.

---

## 2.1 Update DTOs (`backend-core/src/modules/pronunciation/dto/pronunciation.dto.ts`)

Add new DTOs:

```ts
// Existing DTOs stay unchanged. Add:

export class UpdateProgressDto {
  soundId: string;
  score: number;  // 0-100, from the latest practice attempt
}

export class GetProgressResponseDto {
  soundId: string;
  symbol: string;
  status: 'NEW' | 'PRACTICING' | 'MASTERED';
  practiceCount: number;
  bestScore: number | null;
  lastPracticedAt: string | null;
}

export class PronunciationStatsDto {
  totalSounds: number;
  masteredCount: number;
  practicingCount: number;
  newCount: number;
  overallMastery: number; // 0-100 percentage
}
```

---

## 2.2 Update Service (`pronunciation.service.ts`)

### Modify `getAllSounds()`

Include example words in the response (they are small, OK to include):

```ts
async getAllSounds() {
  const cacheKey = `${CACHE_PREFIX}:sounds`;
  const cached = await this.redis.getJson(cacheKey);
  if (cached) return cached;

  const sounds = await this.prisma.pronunciationSound.findMany({
    orderBy: [{ type: "asc" }, { order: "asc" }],
    include: {
      exampleWords: {
        orderBy: { order: "asc" },
      },
    },
  });

  const grouped = {
    monophthongs: sounds.filter((s) => s.type === "monophthong"),
    diphthongs: sounds.filter((s) => s.type === "diphthong"),
    consonants: sounds.filter((s) => s.type === "consonant"),
  };

  await this.redis.setJson(cacheKey, grouped, CACHE_TTL);
  return grouped;
}
```

### Modify `getSoundBySymbol()`

Include example words:

```ts
async getSoundBySymbol(symbol: string) {
  const cacheKey = `${CACHE_PREFIX}:sound:${symbol}`;
  const cached = await this.redis.getJson(cacheKey);
  if (cached) return cached;

  const sound = await this.prisma.pronunciationSound.findUnique({
    where: { symbol },
    include: {
      exampleWords: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (sound) await this.redis.setJson(cacheKey, sound, CACHE_TTL);
  return sound;
}
```

### Add Progress Methods

```ts
// ==================== PROGRESS ====================

async getUserProgress(userId: string) {
  const cacheKey = `${CACHE_PREFIX}:progress:${userId}`;
  const cached = await this.redis.getJson(cacheKey);
  if (cached) return cached;

  // Get all sounds + user's progress
  const sounds = await this.prisma.pronunciationSound.findMany({
    orderBy: [{ type: "asc" }, { order: "asc" }],
    select: { id: true, symbol: true, type: true },
  });

  const progressRecords = await this.prisma.pronunciationProgress.findMany({
    where: { userId },
  });

  const progressMap = new Map(progressRecords.map(p => [p.soundId, p]));

  const result = sounds.map(sound => {
    const progress = progressMap.get(sound.id);
    return {
      soundId: sound.id,
      symbol: sound.symbol,
      type: sound.type,
      status: progress?.status ?? 'NEW',
      practiceCount: progress?.practiceCount ?? 0,
      bestScore: progress?.bestScore ?? null,
      lastPracticedAt: progress?.lastPracticedAt ?? null,
    };
  });

  await this.redis.setJson(cacheKey, result, 300); // 5 min cache
  return result;
}

async getUserStats(userId: string): Promise<PronunciationStatsDto> {
  const progress = await this.getUserProgress(userId);
  const totalSounds = progress.length;
  const masteredCount = progress.filter(p => p.status === 'MASTERED').length;
  const practicingCount = progress.filter(p => p.status === 'PRACTICING').length;
  const newCount = progress.filter(p => p.status === 'NEW').length;

  return {
    totalSounds,
    masteredCount,
    practicingCount,
    newCount,
    overallMastery: totalSounds > 0 ? Math.round((masteredCount / totalSounds) * 100) : 0,
  };
}

async updateProgress(userId: string, soundId: string, score: number) {
  const MASTERY_THRESHOLD = 80;

  const existing = await this.prisma.pronunciationProgress.findUnique({
    where: { userId_soundId: { userId, soundId } },
  });

  const newBestScore = Math.max(score, existing?.bestScore ?? 0);
  const newStatus = newBestScore >= MASTERY_THRESHOLD ? 'MASTERED' : 'PRACTICING';
  const newPracticeCount = (existing?.practiceCount ?? 0) + 1;

  const progress = await this.prisma.pronunciationProgress.upsert({
    where: { userId_soundId: { userId, soundId } },
    update: {
      bestScore: newBestScore,
      status: newStatus,
      practiceCount: newPracticeCount,
      lastPracticedAt: new Date(),
    },
    create: {
      userId,
      soundId,
      bestScore: score,
      status: newStatus,
      practiceCount: 1,
      lastPracticedAt: new Date(),
    },
  });

  // Invalidate user progress cache
  await this.redis.delByPattern(`${CACHE_PREFIX}:progress:${userId}`);

  return progress;
}
```

---

## 2.3 Update Controller (`pronunciation.controller.ts`)

Add these endpoints:

```ts
// ==================== PROGRESS ENDPOINTS (Authenticated) ====================

@Get("progress")
@UseGuards(JwtAuthGuard)
async getUserProgress(@Req() req: any) {
  return this.pronunciationService.getUserProgress(req.user.id);
}

@Get("progress/stats")
@UseGuards(JwtAuthGuard)
async getUserStats(@Req() req: any) {
  return this.pronunciationService.getUserStats(req.user.id);
}

@Post("progress")
@UseGuards(JwtAuthGuard)
async updateProgress(@Req() req: any, @Body() dto: UpdateProgressDto) {
  return this.pronunciationService.updateProgress(req.user.id, dto.soundId, dto.score);
}
```

### Import Requirements

Add `Req` to NestJS imports, `UpdateProgressDto` to DTO imports.

---

## 2.4 Auto-Update Progress After Practice Attempts

When a `PronunciationAttempt` completes successfully (status = COMPLETED), the system should automatically update `PronunciationProgress`.

### Option A: Hook into the existing learning service

In `backend-core/src/modules/learning/learning.service.ts`, find the code that marks a `PronunciationAttempt` as `COMPLETED`. After setting the score, call:

```ts
// After attempt is marked COMPLETED with a score:
if (attempt.score !== null) {
  // Find the sound by matching the targetWord to any SoundExampleWord
  const exampleWord = await this.prisma.soundExampleWord.findFirst({
    where: { word: attempt.targetWord },
    select: { soundId: true },
  });

  if (exampleWord) {
    await this.pronunciationService.updateProgress(
      attempt.userId,
      exampleWord.soundId,
      attempt.score,
    );
  }
}
```

### Option B: Manual — User posts score from frontend

The frontend calls `POST /pronunciation/progress` directly after receiving a score from the recorder. This is simpler to implement and is the **recommended approach** if wiring into the learning service is complex.

---

## 2.5 API Endpoint Summary

| Method | Path | Auth | Description |
|:---|:---|:---|:---|
| `GET` | `/pronunciation/sounds` | Public | All sounds with example words, grouped |
| `GET` | `/pronunciation/sounds/:symbol` | Public | Single sound with example words |
| `GET` | `/pronunciation/progress` | JWT | User's progress for all 44 sounds |
| `GET` | `/pronunciation/progress/stats` | JWT | Summary stats (mastered/practicing/new counts) |
| `POST` | `/pronunciation/progress` | JWT | Update progress after practice `{ soundId, score }` |

---

## 2.6 Verification Checklist

- [ ] `GET /pronunciation/sounds` returns sounds with `exampleWords` array
- [ ] `GET /pronunciation/sounds/iː` returns the sound with 5+ example words
- [ ] `GET /pronunciation/progress` returns 44 entries (all `NEW` for a fresh user)
- [ ] `POST /pronunciation/progress { soundId, score: 85 }` creates a `MASTERED` record
- [ ] `POST /pronunciation/progress { soundId, score: 60 }` creates a `PRACTICING` record
- [ ] Second POST with higher score updates `bestScore` correctly
- [ ] `GET /pronunciation/progress/stats` returns correct mastery percentage
- [ ] Cache invalidation works (progress cache clears after POST)
