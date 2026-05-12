# Shadowing & Dictation — Lesson Seeding Plan

> **Goal:** Seed **12 new lessons** (6 Shadowing + 6 Dictation) across 4 categories into the database.
> **Current state:** 2 lessons exist (lesson-008 dictation, lesson-009 shadowing). New lessons start at **010**.

---

## Lesson Inventory

### Shadowing — Category: Friends

| # | Lesson ID | Title | YouTube ID | URL |
|---|-----------|-------|------------|-----|
| 1 | `010` | Joey's Bad Birthday Gift | `221F55VPp2M` | https://youtu.be/221F55VPp2M |
| 2 | `011` | The Friends Pretend To Like Rachel's English Trifle | `ky3KiiUK_D0` | https://youtu.be/ky3KiiUK_D0 |
| 3 | `012` | Rachel Works On Her Gossiping Problem | `XbywiblA1eQ` | https://youtu.be/XbywiblA1eQ |

### Shadowing — Category: The Office

| # | Lesson ID | Title | YouTube ID | URL |
|---|-----------|-------|------------|-----|
| 4 | `013` | The Password | `8GxqvnQyaxs` | https://youtu.be/8GxqvnQyaxs |
| 5 | `014` | Michael's Pyramid Scheme | `lC5lsemxaJo` | https://youtu.be/lC5lsemxaJo |
| 6 | `015` | The Michael Scott Method of Negotiation | `r-GFmH0EK9Y` | https://youtu.be/r-GFmH0EK9Y |

### Dictation — Category: Ted Talk

| # | Lesson ID | Title | YouTube ID | URL |
|---|-----------|-------|------------|-----|
| 7 | `016` | Do Schools Kill Creativity? \| Sir Ken Robinson | `iG9CE55wbtY` | https://youtu.be/iG9CE55wbtY |
| 8 | `017` | How Great Leaders Inspire Action \| Simon Sinek | `qp0HIF3SfI4` | https://youtu.be/qp0HIF3SfI4 |
| 9 | `018` | The Danger of a Single Story \| Chimamanda Ngozi Adichie | `D9Ihs241zeg` | https://youtu.be/D9Ihs241zeg |

### Dictation — Category: Kurzgesagt

| # | Lesson ID | Title | YouTube ID | URL |
|---|-----------|-------|------------|-----|
| 10 | `019` | What Happened Before History? Human Origins | `dGiQaabX3_o` | https://youtu.be/dGiQaabX3_o |
| 11 | `020` | What Dinosaurs ACTUALLY Looked Like? | `xaQJbozY_Is` | https://youtu.be/xaQJbozY_Is |
| 12 | `021` | A New History for Humanity – The Human Era | `czgOWmtGVGs` | https://youtu.be/czgOWmtGVGs |

---

## Architecture Overview

```
prisma/data/shadowing-lessons/
├── types.ts                    ← ShadowingLesson & ShadowingSentence interfaces
├── index.ts                    ← Barrel export array: SHADOWING_LESSONS
├── lesson-008-*.ts             ← Existing (dictation, Breaking Bad)
├── lesson-009-*.ts             ← Existing (shadowing, Stevie Emerson)
├── lesson-010-*.ts  ─┐
├── lesson-011-*.ts   │
├── ...                ├─ NEW (12 files)
└── lesson-021-*.ts  ─┘

prisma/data/generate_lesson.py  ← One-off transcription script (yt-dlp + Whisper)
prisma/seeders/shadowing.seeder.ts ← Upserts into ShadowingVideo / DictationVideo
```

---

## Existing Interfaces & Conventions

### `ShadowingLesson` type (from `types.ts`)

```typescript
interface ShadowingLesson {
    id: string;
    title: string;
    audioUrl: string;
    youtubeVideoId?: string;
    image: string;
    tags: string[];
    duration: string;
    type?: 'shadowing' | 'dictation' | 'both';
    sentences: ShadowingSentence[];
}

interface ShadowingSentence {
    id: number;
    english: string;
    phonetic: string;
    vietnamese: string;
    words: string[];
    audioStart: number;
    audioEnd: number;
}
```

### Tag convention

- `tags` array always starts with `"YOUTUBE"`.
- Second tag is a kebab-case **category slug** (e.g., `"friends"`, `"the-office"`, `"ted-talk"`, `"kurzgesagt"`).

### File naming convention

```
lesson-{NNN}-{kebab-case-title}.ts
```

Example: `lesson-010-joeys-bad-birthday-gift-friends.ts`

### Export naming convention

```typescript
export const lesson{NNN}: ShadowingLesson = { ... };
```

### Database models (Prisma)

- **`ShadowingVideo`** — has a `category` field (default `"Other"`)
- **`DictationVideo`** — has a `category` field (default `"Other"`)
- Both have `tags String[] @default([])`

### Seeder routing logic (from `shadowing.seeder.ts`)

- If `type === 'dictation'` → skipped by `seedShadowingLessons`, picked up by `seedDictationLessons`
- If `type === 'shadowing'` → skipped by `seedDictationLessons`, picked up by `seedShadowingLessons`

> **IMPORTANT:** The current seeder does **NOT** populate the `category` field — it defaults to `"Other"`. Phase 3 addresses this.

---

## Phase 1 — Transcribe All 12 Videos

**Goal:** Run `generate_lesson.py` once per video to produce 12 `.ts` data files.

### 1.1 Prerequisites

Ensure these are installed in the Python environment used by `backend-ai`:

```bash
pip install yt-dlp faster-whisper
```

### 1.2 Run the generator 12 times

For each video, update the CONFIG block at the top of `generate_lesson.py` (located at `backend-core/prisma/data/generate_lesson.py`) and run it.

> **TIP:** You can duplicate `generate_lesson.py` into a batch script, or simply edit the CONFIG block and run `python generate_lesson.py` 12 times. The key is the 5 CONFIG values per lesson.

Below is the exact CONFIG for each lesson. Run these **one at a time** (Whisper loads a model each run).

---

#### Lesson 010

```python
YOUTUBE_URL = "https://youtu.be/221F55VPp2M"
LESSON_ID   = "10"
TITLE       = "Joey's Bad Birthday Gift"
TAGS        = ["YOUTUBE", "friends"]
DURATION    = ""  # ← Fill after transcription from video metadata
LESSON_TYPE = "shadowing"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "shadowing-lessons", "lesson-010-joeys-bad-birthday-gift-friends.ts")
```

#### Lesson 011

```python
YOUTUBE_URL = "https://youtu.be/ky3KiiUK_D0"
LESSON_ID   = "11"
TITLE       = "The Friends Pretend To Like Rachel's English Trifle"
TAGS        = ["YOUTUBE", "friends"]
DURATION    = ""
LESSON_TYPE = "shadowing"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "shadowing-lessons", "lesson-011-the-friends-pretend-to-like-rachels-english-trifle.ts")
```

#### Lesson 012

```python
YOUTUBE_URL = "https://youtu.be/XbywiblA1eQ"
LESSON_ID   = "12"
TITLE       = "Rachel Works On Her Gossiping Problem"
TAGS        = ["YOUTUBE", "friends"]
DURATION    = ""
LESSON_TYPE = "shadowing"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "shadowing-lessons", "lesson-012-rachel-works-on-her-gossiping-problem-friends.ts")
```

#### Lesson 013

```python
YOUTUBE_URL = "https://youtu.be/8GxqvnQyaxs"
LESSON_ID   = "13"
TITLE       = "The Password"
TAGS        = ["YOUTUBE", "the-office"]
DURATION    = ""
LESSON_TYPE = "shadowing"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "shadowing-lessons", "lesson-013-the-password-the-office.ts")
```

#### Lesson 014

```python
YOUTUBE_URL = "https://youtu.be/lC5lsemxaJo"
LESSON_ID   = "14"
TITLE       = "Michael's Pyramid Scheme"
TAGS        = ["YOUTUBE", "the-office"]
DURATION    = ""
LESSON_TYPE = "shadowing"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "shadowing-lessons", "lesson-014-michaels-pyramid-scheme-the-office.ts")
```

#### Lesson 015

```python
YOUTUBE_URL = "https://youtu.be/r-GFmH0EK9Y"
LESSON_ID   = "15"
TITLE       = "The Michael Scott Method of Negotiation"
TAGS        = ["YOUTUBE", "the-office"]
DURATION    = ""
LESSON_TYPE = "shadowing"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "shadowing-lessons", "lesson-015-the-michael-scott-method-of-negotiation-the-office.ts")
```

#### Lesson 016

```python
YOUTUBE_URL = "https://youtu.be/iG9CE55wbtY"
LESSON_ID   = "16"
TITLE       = "Do Schools Kill Creativity? | Sir Ken Robinson"
TAGS        = ["YOUTUBE", "ted-talk"]
DURATION    = ""
LESSON_TYPE = "dictation"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "shadowing-lessons", "lesson-016-do-schools-kill-creativity-ted-talk.ts")
```

#### Lesson 017

```python
YOUTUBE_URL = "https://youtu.be/qp0HIF3SfI4"
LESSON_ID   = "17"
TITLE       = "How Great Leaders Inspire Action | Simon Sinek"
TAGS        = ["YOUTUBE", "ted-talk"]
DURATION    = ""
LESSON_TYPE = "dictation"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "shadowing-lessons", "lesson-017-how-great-leaders-inspire-action-ted-talk.ts")
```

#### Lesson 018

```python
YOUTUBE_URL = "https://youtu.be/D9Ihs241zeg"
LESSON_ID   = "18"
TITLE       = "The Danger of a Single Story | Chimamanda Ngozi Adichie"
TAGS        = ["YOUTUBE", "ted-talk"]
DURATION    = ""
LESSON_TYPE = "dictation"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "shadowing-lessons", "lesson-018-the-danger-of-a-single-story-ted-talk.ts")
```

#### Lesson 019

```python
YOUTUBE_URL = "https://youtu.be/dGiQaabX3_o"
LESSON_ID   = "19"
TITLE       = "What Happened Before History? Human Origins"
TAGS        = ["YOUTUBE", "kurzgesagt"]
DURATION    = ""
LESSON_TYPE = "dictation"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "shadowing-lessons", "lesson-019-what-happened-before-history-human-origins-kurzgesagt.ts")
```

#### Lesson 020

```python
YOUTUBE_URL = "https://youtu.be/xaQJbozY_Is"
LESSON_ID   = "20"
TITLE       = "What Dinosaurs ACTUALLY Looked Like?"
TAGS        = ["YOUTUBE", "kurzgesagt"]
DURATION    = ""
LESSON_TYPE = "dictation"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "shadowing-lessons", "lesson-020-what-dinosaurs-actually-looked-like-kurzgesagt.ts")
```

#### Lesson 021

```python
YOUTUBE_URL = "https://youtu.be/czgOWmtGVGs"
LESSON_ID   = "21"
TITLE       = "A New History for Humanity - The Human Era"
TAGS        = ["YOUTUBE", "kurzgesagt"]
DURATION    = ""
LESSON_TYPE = "dictation"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "shadowing-lessons", "lesson-021-a-new-history-for-humanity-the-human-era-kurzgesagt.ts")
```

### 1.3 Post-transcription: fill `duration`

After each run, the script prints segment count. Check the last `audioEnd` value in the generated file and calculate `duration` in `MM:SS` format. Update the `"duration"` field in the generated `.ts` file.

### 1.4 Verification checklist

After Phase 1 you should have **12 new `.ts` files** inside `prisma/data/shadowing-lessons/`:

```
lesson-010-joeys-bad-birthday-gift-friends.ts
lesson-011-the-friends-pretend-to-like-rachels-english-trifle.ts
lesson-012-rachel-works-on-her-gossiping-problem-friends.ts
lesson-013-the-password-the-office.ts
lesson-014-michaels-pyramid-scheme-the-office.ts
lesson-015-the-michael-scott-method-of-negotiation-the-office.ts
lesson-016-do-schools-kill-creativity-ted-talk.ts
lesson-017-how-great-leaders-inspire-action-ted-talk.ts
lesson-018-the-danger-of-a-single-story-ted-talk.ts
lesson-019-what-happened-before-history-human-origins-kurzgesagt.ts
lesson-020-what-dinosaurs-actually-looked-like-kurzgesagt.ts
lesson-021-a-new-history-for-humanity-the-human-era-kurzgesagt.ts
```

Each file must:
- Import `ShadowingLesson` from `'./types'`
- Export `const lesson{NNN}: ShadowingLesson`
- Have `type` set to either `"shadowing"` or `"dictation"`
- Have a valid `youtubeVideoId` matching the YouTube URL
- Have `image` set to `https://img.youtube.com/vi/{youtubeVideoId}/maxresdefault.jpg`
- Have a non-empty `sentences` array with valid `audioStart`/`audioEnd` timestamps

> **WARNING:** **TED Talk videos are 10-20 minutes long.** Whisper will produce 100+ segments per video. This is expected and correct for dictation practice. However, you may want to limit to the first ~3 minutes (roughly 30-40 sentences) for each TED Talk and Kurzgesagt video to keep lesson length manageable. To do this, either:
> - Manually truncate the generated sentences array after the script runs, OR
> - Add a `MAX_DURATION_SECONDS = 180` guard in `generate_lesson.py` to stop after 3 minutes.

---

## Phase 2 — Register Lessons in the Index

**Goal:** Update `index.ts` to export all 14 lessons (2 existing + 12 new).

### 2.1 Edit file: `prisma/data/shadowing-lessons/index.ts`

Replace the entire file contents with:

```typescript
import { ShadowingLesson } from './types';

import { lesson008 } from './lesson-008-walts-deal-with-the-schwartzs-breaking-bad';
import { lesson009 } from './lesson-009-are-you-guys-dating-stevie-emerson';
// -- Shadowing: Friends --
import { lesson010 } from './lesson-010-joeys-bad-birthday-gift-friends';
import { lesson011 } from './lesson-011-the-friends-pretend-to-like-rachels-english-trifle';
import { lesson012 } from './lesson-012-rachel-works-on-her-gossiping-problem-friends';
// -- Shadowing: The Office --
import { lesson013 } from './lesson-013-the-password-the-office';
import { lesson014 } from './lesson-014-michaels-pyramid-scheme-the-office';
import { lesson015 } from './lesson-015-the-michael-scott-method-of-negotiation-the-office';
// -- Dictation: Ted Talk --
import { lesson016 } from './lesson-016-do-schools-kill-creativity-ted-talk';
import { lesson017 } from './lesson-017-how-great-leaders-inspire-action-ted-talk';
import { lesson018 } from './lesson-018-the-danger-of-a-single-story-ted-talk';
// -- Dictation: Kurzgesagt --
import { lesson019 } from './lesson-019-what-happened-before-history-human-origins-kurzgesagt';
import { lesson020 } from './lesson-020-what-dinosaurs-actually-looked-like-kurzgesagt';
import { lesson021 } from './lesson-021-a-new-history-for-humanity-the-human-era-kurzgesagt';

export const SHADOWING_LESSONS: ShadowingLesson[] = [
    lesson008,
    lesson009,
    lesson010,
    lesson011,
    lesson012,
    lesson013,
    lesson014,
    lesson015,
    lesson016,
    lesson017,
    lesson018,
    lesson019,
    lesson020,
    lesson021,
];
```

### 2.2 Verification

Run a quick TypeScript compile check:

```bash
cd backend-core
npx tsc --noEmit prisma/data/shadowing-lessons/index.ts
```

All 14 imports should resolve without errors.

---

## Phase 3 — Update the Seeder to Populate `category`

**Goal:** Map the `tags[1]` slug to a human-readable `category` value when seeding.

### 3.1 Current problem

The seeder (`shadowing.seeder.ts`) does not set `category` — both `ShadowingVideo` and `DictationVideo` have `category String @default("Other")` in the Prisma schema.

### 3.2 Category mapping

Define a tag-to-category map at the top of the seeder:

```typescript
const TAG_TO_CATEGORY: Record<string, string> = {
    'friends': 'Friends',
    'the-office': 'The Office',
    'ted-talk': 'Ted Talk',
    'kurzgesagt': 'Kurzgesagt',
    'breaking-bad': 'Breaking Bad',
    'stevie-emerson': 'Stevie Emerson',
};
```

### 3.3 Helper function

Add a small helper (keeps logic out of the loop):

```typescript
function resolveCategory(tags: string[]): string {
    const slug = tags.find(t => t !== 'YOUTUBE');
    if (!slug) return 'Other';
    return TAG_TO_CATEGORY[slug] ?? 'Other';
}
```

### 3.4 Updated `seedShadowingLessons`

Add `category` to the `data` object inside both seeder functions:

```diff
 const data = {
     title: foundationVocabLesson.title,
     youtubeVideoId: foundationVocabLesson.youtubeVideoId || null,
     audioUrl: foundationVocabLesson.audioUrl,
     imageUrl: foundationVocabLesson.image,
     tags: foundationVocabLesson.tags,
+    category: resolveCategory(foundationVocabLesson.tags),
     folder: 'All Videos',
     duration: foundationVocabLesson.duration,
     sentences: foundationVocabLesson.sentences as any,
 };
```

Apply the same `category: resolveCategory(...)` line to the `data` object inside `seedDictationLessons` as well.

### 3.5 Full updated file

The complete `shadowing.seeder.ts` after changes:

```typescript
import { PrismaClient } from '@prisma/client';
import { SHADOWING_LESSONS } from '../data/shadowing-lessons';

const TAG_TO_CATEGORY: Record<string, string> = {
    'friends': 'Friends',
    'the-office': 'The Office',
    'ted-talk': 'Ted Talk',
    'kurzgesagt': 'Kurzgesagt',
    'breaking-bad': 'Breaking Bad',
    'stevie-emerson': 'Stevie Emerson',
};

function resolveCategory(tags: string[]): string {
    const slug = tags.find(t => t !== 'YOUTUBE');
    if (!slug) return 'Other';
    return TAG_TO_CATEGORY[slug] ?? 'Other';
}

export async function seedShadowingLessons(prisma: PrismaClient) {
    console.log('Seeding Shadowing lessons...');

    for (const lesson of SHADOWING_LESSONS) {
        if (lesson.type === 'dictation') continue;

        const data = {
            title: lesson.title,
            youtubeVideoId: lesson.youtubeVideoId || null,
            audioUrl: lesson.audioUrl,
            imageUrl: lesson.image,
            tags: lesson.tags,
            category: resolveCategory(lesson.tags),
            duration: lesson.duration,
            sentences: lesson.sentences as any,
        };

        await prisma.shadowingVideo.upsert({
            where: { id: lesson.id },
            update: data,
            create: { id: lesson.id, ...data },
        });
    }

    console.log('Shadowing lessons seeded successfully.');
}

export async function seedDictationLessons(prisma: PrismaClient) {
    console.log('Seeding Dictation lessons...');

    for (const lesson of SHADOWING_LESSONS) {
        if (lesson.type === 'shadowing') continue;

        const dictationId = `dictation-${lesson.id}`;

        const data = {
            title: lesson.title,
            youtubeVideoId: lesson.youtubeVideoId || null,
            audioUrl: lesson.audioUrl,
            imageUrl: lesson.image,
            tags: lesson.tags,
            category: resolveCategory(lesson.tags),
            duration: lesson.duration,
            sentences: (lesson.sentences as any[]).map((s: any) => ({
                id: s.id,
                english: s.english,
                words: s.words,
                audioStart: s.audioStart,
                audioEnd: s.audioEnd,
            })) as any,
        };

        await prisma.dictationVideo.upsert({
            where: { id: dictationId },
            update: data,
            create: { id: dictationId, ...data },
        });
    }

    console.log('Dictation lessons seeded successfully.');
}
```

---

## Phase 4 — Seed the Database

**Goal:** Execute the seeder to write all lessons into PostgreSQL.

### 4.1 Ensure both seeders are called

Verify that `seed-shadowing.ts` calls **both** functions. Update if needed:

```typescript
import { PrismaClient } from '@prisma/client';
import { seedShadowingLessons, seedDictationLessons } from './seeders/shadowing.seeder';

const prisma = new PrismaClient();

async function main() {
    await seedShadowingLessons(prisma);
    await seedDictationLessons(prisma);
    console.log('All shadowing & dictation lessons seeded!');
}

main()
    .then(() => prisma.$disconnect())
    .catch(e => { console.error(e); return prisma.$disconnect(); });
```

### 4.2 Run the seed

```bash
cd backend-core
npx ts-node prisma/seed-shadowing.ts
```

### 4.3 Verify in database

```bash
npx prisma studio
```

Check:
- **`shadowing_videos` table**: should contain lessons with `category` = `"Stevie Emerson"`, `"Friends"`, `"The Office"`
- **`dictation_videos` table**: should contain lessons with `category` = `"Breaking Bad"`, `"Ted Talk"`, `"Kurzgesagt"`

### 4.4 Expected record counts

| Table | Before | After |
|-------|--------|-------|
| `shadowing_videos` | 1 (lesson 009) | 7 (009 + 010-015) |
| `dictation_videos` | 1 (dictation-8) | 7 (dictation-8 + dictation-16 to dictation-21) |

---

## Summary Checklist

| Phase | What | Files Touched | Status |
|-------|------|---------------|--------|
| **1** | Transcribe 12 YouTube videos via Whisper | `generate_lesson.py` (config edits), produces 12 new `.ts` files | TODO |
| **2** | Register all lessons in the barrel export | `prisma/data/shadowing-lessons/index.ts` | TODO |
| **3** | Add `category` support to the seeder | `prisma/seeders/shadowing.seeder.ts` | TODO |
| **4** | Run seed and verify database state | `prisma/seed-shadowing.ts` | TODO |
