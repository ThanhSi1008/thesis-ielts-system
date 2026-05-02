# Phase 1 — Database Schema & Seed Data

## Goal
Enrich the `PronunciationSound` model, add a child `SoundExampleWord` model, add a `PronunciationProgress` model for per-user per-sound tracking, and create a comprehensive seed file with real IPA content.

---

## 1.1 Schema Changes (`backend-core/prisma/schema.prisma`)

### Modify `PronunciationSound`

Add fields to the existing model:

```prisma
model PronunciationSound {
  id          String   @id @default(uuid())
  symbol      String   @unique
  type        String   // "monophthong", "diphthong", "consonant"
  word        String   // Primary example word (shown on chart tile)
  name        String?  // Human-readable name, e.g. "Long E", "Voiceless Dental Fricative"
  description String?  @db.Text  // How to produce the sound (paragraph)
  tip         String?  @db.Text  // Short pronunciation tip (displayed in a callout)
  imageUrl    String?  // Mouth position diagram URL
  audioUrl    String?  // Audio of the isolated sound
  videoUrl    String?  // Optional video demonstration URL
  voiced      Boolean? // For consonants
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  exampleWords SoundExampleWord[]
  progress     PronunciationProgress[]

  @@map("pronunciation_sounds")
}
```

### New Model: `SoundExampleWord`

Each sound has 4–8 example words with their own audio and IPA transcription.

```prisma
model SoundExampleWord {
  id          String  @id @default(uuid())
  soundId     String
  word        String  // e.g. "sheep"
  ipa         String? // e.g. "/ʃiːp/"
  audioUrl    String? // Audio URL for this specific word
  order       Int     @default(0)

  sound PronunciationSound @relation(fields: [soundId], references: [id], onDelete: Cascade)

  @@map("sound_example_words")
}
```

### New Model: `PronunciationProgress`

Tracks per-user mastery of each sound.

```prisma
model PronunciationProgress {
  id             String   @id @default(uuid())
  userId         String
  soundId        String
  status         PronunciationMastery @default(NEW)
  practiceCount  Int      @default(0)   // Total practice attempts on this sound
  bestScore      Int?                   // Best score achieved (0-100)
  lastPracticedAt DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user  User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  sound PronunciationSound @relation(fields: [soundId], references: [id], onDelete: Cascade)

  @@unique([userId, soundId])
  @@map("pronunciation_progress")
}

enum PronunciationMastery {
  NEW         // Never practiced
  PRACTICING  // Practiced but best score < 80
  MASTERED    // Best score >= 80
}
```

### Update `User` model

Add relation:

```prisma
// In the User model, add:
pronunciationProgress  PronunciationProgress[]
```

---

## 1.2 Migration

```bash
cd backend-core
npx prisma migrate dev --name add-pronunciation-enrichment
```

---

## 1.3 Seed Data (`backend-core/prisma/data/pronunciation.ts`)

Rewrite the existing file. The new structure must export:

```ts
export interface SoundSeedData {
  symbol: string;
  type: "monophthong" | "diphthong" | "consonant";
  word: string;        // Primary example word (chart tile)
  name: string;        // Human-readable sound name
  description: string; // How to produce the sound
  tip: string;         // Short pronunciation tip
  voiced?: boolean;    // For consonants
  order: number;
  exampleWords: {
    word: string;
    ipa: string;
    order: number;
  }[];
}

export const pronunciationSounds: SoundSeedData[] = [
  // ... 44 sounds
];
```

### Content Requirements Per Sound

Each of the 44 sounds MUST have:
1. `name` — e.g. "Long E vowel", "Voiceless bilabial plosive"
2. `description` — 2-3 sentences explaining tongue/lip/jaw position
3. `tip` — 1 sentence quick tip (e.g. "Spread your lips wide like you're smiling")
4. `exampleWords` — **at least 5 words** with IPA transcription, ordered by difficulty

### Example (one sound):

```ts
{
  symbol: "iː",
  type: "monophthong",
  word: "sheep",
  name: "Long E vowel",
  description: "This is a long, high, front vowel. Your tongue should be high and forward in your mouth, almost touching the roof. Your lips should be spread wide, and the sound is held for a longer duration than /ɪ/.",
  tip: "Spread your lips wide like you're smiling. Think of the 'ee' in 'cheese'.",
  order: 1,
  exampleWords: [
    { word: "sheep", ipa: "/ʃiːp/", order: 1 },
    { word: "tree", ipa: "/triː/", order: 2 },
    { word: "green", ipa: "/ɡriːn/", order: 3 },
    { word: "beach", ipa: "/biːtʃ/", order: 4 },
    { word: "people", ipa: "/ˈpiːpəl/", order: 5 },
    { word: "believe", ipa: "/bɪˈliːv/", order: 6 },
  ],
}
```

### Consonant Example:

```ts
{
  symbol: "θ",
  type: "consonant",
  word: "think",
  name: "Voiceless dental fricative",
  description: "Place the tip of your tongue lightly between your upper and lower front teeth. Blow air gently over your tongue. Your vocal cords should NOT vibrate — this is a voiceless sound.",
  tip: "Stick your tongue out slightly between your teeth and blow air. Don't vibrate your throat.",
  voiced: false,
  order: 11,
  exampleWords: [
    { word: "think", ipa: "/θɪŋk/", order: 1 },
    { word: "three", ipa: "/θriː/", order: 2 },
    { word: "bath", ipa: "/bɑːθ/", order: 3 },
    { word: "tooth", ipa: "/tuːθ/", order: 4 },
    { word: "birthday", ipa: "/ˈbɜːθdeɪ/", order: 5 },
  ],
}
```

> **Important**: The implementer must fill in ALL 44 sounds with accurate phonetic data. Use resources like Cambridge Dictionary IPA charts, Oxford Learner's Dictionary, and the British Council "Sounds Right" app for reference.

---

## 1.4 Seeder (`backend-core/prisma/seeders/pronunciation.seed.ts`)

Create a dedicated seeder function:

```ts
import { PrismaClient } from "@prisma/client";
import { pronunciationSounds } from "../data/pronunciation";

export async function seedPronunciation(prisma: PrismaClient) {
  console.log("🔊 Seeding pronunciation sounds...");

  for (const sound of pronunciationSounds) {
    const { exampleWords, ...soundData } = sound;

    const created = await prisma.pronunciationSound.upsert({
      where: { symbol: soundData.symbol },
      update: {
        ...soundData,
        exampleWords: {
          deleteMany: {},
          create: exampleWords,
        },
      },
      create: {
        ...soundData,
        exampleWords: {
          create: exampleWords,
        },
      },
    });

    console.log(`  ✓ ${created.symbol} (${created.name})`);
  }

  console.log(`✅ Seeded ${pronunciationSounds.length} pronunciation sounds`);
}
```

### Register in `seed.ts`

Add to the main seed file:
```ts
import { seedPronunciation } from "./seeders/pronunciation.seed";

// Inside the main seed function:
await seedPronunciation(prisma);
```

---

## 1.5 Verification Checklist

- [ ] `npx prisma migrate dev` runs without errors
- [ ] `npx prisma db seed` populates all 44 sounds + their example words
- [ ] `PronunciationProgress` table exists (empty until users practice)
- [ ] Each sound has at least 5 example words with IPA
- [ ] Each sound has non-empty `name`, `description`, and `tip`
- [ ] Consonants have `voiced` boolean set correctly
- [ ] No duplicate symbols in the seed data
