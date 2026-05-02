# Plan: Add Audio to Pronunciation Sounds & Example Words

## Current State

The DB schema already has `audioUrl` fields on both models — they're just `null`:

```prisma
model PronunciationSound {
  audioUrl    String?  // Audio of the isolated sound  ← EMPTY
  ...
}

model SoundExampleWord {
  audioUrl    String?  // Audio URL for this specific word  ← EMPTY
  ...
}
```

The seed data in `pronunciation.ts` has no `audioUrl` in either the `SoundSeedData` interface or the example word objects.

The frontend (`SoundHeroSection`, `ExampleWordCard`) already reads `audioUrl` and plays it — the play buttons just show disabled because the value is `null`.

**Goal:** Populate every `audioUrl` so both the big play button (isolated phoneme) and the per-word play buttons work.

---

## Audio Sources

| Content | Source | License | Format |
|---|---|---|---|
| **Example words** (~220 words) | [Free Dictionary API](https://dictionaryapi.dev) — `https://api.dictionaryapi.dev/api/v2/entries/en/{word}` | CC BY-SA 3.0 (Wikimedia audio) | `.mp3` direct URL |
| **Isolated phonemes** (44 sounds) | Wikimedia Commons IPA audio — e.g. `https://upload.wikimedia.org/wikipedia/commons/.../Close_front_unrounded_vowel.ogg` | Public Domain / CC BY-SA | `.ogg` |

> The Free Dictionary API returns stable Wikimedia-hosted `.mp3` URLs. These won't expire and don't need re-hosting. For the isolated phonemes, Wikimedia `.ogg` files are also permanent and browser-playable.

---

## Step 1 — Write a scraper script to fetch audio URLs

**File:** `backend-core/prisma/scripts/fetch-pronunciation-audio.ts`

This script will:

1. **For each example word** in `pronunciation.ts`:
   - Call `https://api.dictionaryapi.dev/api/v2/entries/en/{word}`
   - Extract `phonetics[].audio` — prefer the `-uk.mp3` variant (British English, consistent with IPA notation)
   - Fall back to any available `.mp3` if `-uk` is unavailable
   - If the API returns no audio (rare), log a warning and leave it `null`

2. **For each IPA sound** (44 symbols):
   - Use a hardcoded lookup table mapping IPA symbols to their Wikimedia Commons filename, e.g.:
     ```
     "iː" → "https://upload.wikimedia.org/wikipedia/commons/9/91/Close_front_unrounded_vowel.ogg"
     "ɪ"  → "https://upload.wikimedia.org/wikipedia/commons/4/4c/Near-close_near-front_unrounded_vowel.ogg"
     ```
   - This must be manually curated (44 entries) because IPA symbols don't map to filenames programmatically

3. **Output:** Write a new version of the `pronunciation.ts` file with `audioUrl` populated on both `SoundSeedData` and each `exampleWord`.

### Pseudocode

```ts
import { pronunciationSounds } from "../data/pronunciation";

const DICT_API = "https://api.dictionaryapi.dev/api/v2/entries/en";

// Manually curated: IPA symbol → Wikimedia audio URL
const PHONEME_AUDIO_MAP: Record<string, string> = {
  "iː": "https://upload.wikimedia.org/wikipedia/commons/9/91/Close_front_unrounded_vowel.ogg",
  "ɪ": "https://upload.wikimedia.org/wikipedia/commons/4/4c/Near-close_near-front_unrounded_vowel.ogg",
  // ... all 44
};

async function fetchWordAudio(word: string): Promise<string | null> {
  const res = await fetch(`${DICT_API}/${word}`);
  if (!res.ok) return null;
  const [entry] = await res.json();
  const ukAudio = entry.phonetics?.find(p => p.audio?.includes("-uk"))?.audio;
  const anyAudio = entry.phonetics?.find(p => p.audio)?.audio;
  return ukAudio || anyAudio || null;
}

// For each sound, fetch audio for all example words
// Then write updated data to pronunciation.ts
```

### Rate limiting
The Free Dictionary API has no auth but should be called with a ~200ms delay between requests to be respectful. With ~220 words, this takes ~45 seconds.

---

## Step 2 — Update the seed data interface & file

**File:** `backend-core/prisma/data/pronunciation.ts`

### 2a. Add `audioUrl` to both types

```diff
 export interface SoundSeedData {
   symbol: string;
   type: "monophthong" | "diphthong" | "consonant";
   word: string;
   name: string;
   description: string;
   tip: string;
   voiced?: boolean;
+  audioUrl?: string;       // Isolated phoneme audio
   order: number;
   exampleWords: {
     word: string;
     ipa: string;
+    audioUrl?: string;     // Word pronunciation audio
     order: number;
   }[];
 }
```

### 2b. Populate values

The scraper from Step 1 will produce output like:

```ts
{
  symbol: "iː",
  // ... existing fields
  audioUrl: "https://upload.wikimedia.org/wikipedia/commons/9/91/Close_front_unrounded_vowel.ogg",
  exampleWords: [
    { word: "sheep", ipa: "/ʃiːp/", audioUrl: "https://api.dictionaryapi.dev/media/pronunciations/en/sheep-uk.mp3", order: 1 },
    // ...
  ],
},
```

---

## Step 3 — Update the seeder

**File:** `backend-core/prisma/seeders/pronunciation.seed.ts`

The seeder already spreads `...soundData` and `exampleWords` into Prisma `upsert` — since `audioUrl` is already a column in both tables, **no changes are needed** to the seeder logic. It will automatically pick up the new `audioUrl` fields from the data.

The seeder also does `deleteMany` on example words and re-creates them on upsert, so old records without `audioUrl` will be replaced.

### Run the seeder

```bash
npx prisma db seed
```

---

## Step 4 — Verify on frontend

No frontend code changes needed. The components already handle `audioUrl`:

- `SoundHeroSection.tsx` line 14-22: `playAudio()` uses `new Audio(audioUrl)`, button is disabled when `!audioUrl`
- `ExampleWordCard.tsx` line 20-29: Same pattern, button shows `bg-slate-100 text-slate-300 cursor-not-allowed` when `!audioUrl`, switches to `bg-blue-50 text-blue-600` when URL exists

After reseeding, both buttons will automatically become active.

### Checklist

- [ ] All 44 isolated phoneme play buttons are active and play correct sounds
- [ ] All ~220 example word play buttons are active
- [ ] Audio plays on both desktop and mobile browsers (`.mp3` has universal support; `.ogg` is supported in Chrome/Firefox/Safari 15+)
- [ ] No CORS errors (both Wikimedia and dictionaryapi.dev set appropriate headers)
- [ ] Redis cache is invalidated after reseeding (the seeder calls `invalidateCache`)

---

## File Summary

| File | Action |
|---|---|
| `backend-core/prisma/scripts/fetch-pronunciation-audio.ts` | **CREATE** — Scraper script |
| `backend-core/prisma/data/pronunciation.ts` | **MODIFY** — Add `audioUrl` to interface + all 44 sounds + ~220 words |
| `backend-core/prisma/seeders/pronunciation.seed.ts` | **NO CHANGE** — Already handles new fields |
| `frontend-web/src/*` | **NO CHANGE** — Already wired up |

> The only manual work is curating the 44 Wikimedia URLs for isolated phonemes. Everything else can be automated by the scraper.
