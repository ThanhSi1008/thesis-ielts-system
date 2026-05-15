# Plan: Per-Word Progress + Circle Score + IPA Feedback

## Goals

1. **Per-word progress badge** on each `ExampleWordCard` — showing mastery status (NEW/PRACTICING/MASTERED).
2. **Replace `SoundProgressBar`** with a compact **x/N counter** (e.g., "3/5 words mastered").
3. **Circle progress score** — after recording, display the score as a **circular progress ring** (SVG donut) with semantic colors:
   - 🔴 **Danger** (0–39): `#EF4444`
   - 🟠 **Warning** (40–64): `#F59E0B`
   - 🔵 **Info** (65–79): `#3B82F6`
   - 🟢 **Success** (80–100): `#22C55E`
4. **Colored IPA feedback** — show the target IPA with per-phoneme coloring:
   - Each phoneme that was correctly pronounced → **green**
   - Each phoneme mispronounced → **red** (danger)
   - Missing phonemes → **gray**

---

## Current Data Flow

```
User records → PronunciationRecorder → learningApi.checkPronunciation() → Backend queues job → 
AI consumer: Whisper transcription → PronunciationService.analyze_pronunciation() → 
Returns: { score, feedback: { level, message, color, details: { targetIPA, transcribedIPA, phonemeAccuracy, ... }, words: [{ word, targetIPA, spokenIPA, phonemeScore, confidence, match }] } }
```

### AI Feedback Shape (already returned per attempt)
```json
{
  "score": 75,
  "feedback": {
    "level": "Good",
    "message": "Good pronunciation...",
    "color": "blue",
    "details": {
      "targetIPA": "boʊt",
      "transcribedIPA": "bɔt",
      "phonemeAccuracy": 78.5,
      "confidenceScore": 82.0,
      "textAccuracy": 100.0
    },
    "words": [{
      "word": "boat",
      "targetIPA": "boʊt",
      "spokenIPA": "bɔt",
      "phonemeScore": 78.5,
      "confidence": 82.0,
      "match": "incorrect"
    }]
  }
}
```

> [!IMPORTANT]
> The AI already returns `targetIPA` and `spokenIPA` per word. We need to **align these phoneme-by-phoneme** on the frontend to color each phoneme correctly.

---

## Implementation Steps

### Step 1: Backend — Add per-word progress endpoint

**File:** `backend-core/src/modules/pronunciation/pronunciation.service.ts`

Add `getWordProgress(userId, soundId)`:
- Fetch all `PronunciationAttempt` records for this user where `targetWord` matches any example word of the given sound.
- Group by `targetWord`, compute `bestScore`, `attemptCount`, and derive `status`.

**File:** `backend-core/src/modules/pronunciation/pronunciation.controller.ts`

Add route: `GET /pronunciation/sounds/:soundId/word-progress` (auth-guarded).

**File:** `backend-core/src/modules/pronunciation/dto/pronunciation.dto.ts`

Add `WordProgressDto`.

### Step 2: Frontend — Types + API

**File:** `frontend-web/src/types/index.ts`
```ts
export interface WordProgress {
  word: string;
  bestScore: number | null;
  attemptCount: number;
  status: 'NEW' | 'PRACTICING' | 'MASTERED';
}
```

**File:** `frontend-web/src/services/learning.api.ts`
```ts
getWordProgress: async (soundId: string) => {
  const { data } = await api.get<WordProgress[]>(`/pronunciation/sounds/${soundId}/word-progress`);
  return data;
},
```

### Step 3: Frontend — Create `ScoreCircle` component (NEW)

**File:** `_components/ScoreCircle.tsx`

A reusable SVG circular progress indicator:
- Renders as a donut ring with animated stroke-dashoffset.
- Score percentage number centered inside.
- Color determined by score thresholds:

| Range | Label | Color |
|:------|:------|:------|
| 0–39 | Danger | `#EF4444` (red) |
| 40–64 | Warning | `#F59E0B` (amber) |
| 65–79 | Info | `#3B82F6` (blue) |
| 80–100 | Success | `#22C55E` (green) |

Props: `score: number`, `size?: number` (default 64px).

### Step 4: Frontend — Create `IpaFeedback` component (NEW)

**File:** `_components/IpaFeedback.tsx`

Renders the target IPA with per-phoneme coloring by comparing `targetIPA` vs `spokenIPA`:
1. Strip stress marks from both IPA strings.
2. Use character-level alignment (Needleman-Wunsch or simple LCS-based) to align target and spoken phonemes.
3. For each target phoneme:
   - **Match** → green (`text-green-600`)
   - **Substitution** (different phoneme spoken) → red (`text-red-500`)
   - **Deletion** (phoneme not spoken) → gray (`text-slate-300`)
4. Display as a horizontal sequence: `/b  oʊ  t/` with each phoneme span colored.

Props: `targetIPA: string`, `spokenIPA: string`.

### Step 5: Frontend — Redesign `PronunciationRecorder` result view

**File:** `frontend-web/src/components/pronunciation/PronunciationRecorder.tsx`

Currently the result section (lines 127-189) shows:
- A big text `score/100` with color
- Sub-scores in a horizontal row
- Per-word analysis list
- "Try Again" button

**Replace with:**
1. **`<ScoreCircle>`** — large (80px) circle progress showing the score percentage.
2. **`<IpaFeedback>`** — shows `targetIPA` vs `spokenIPA` with phoneme-level coloring.
3. **Feedback message** — level text (Excellent/Good/Fair/Needs Improvement) below.
4. Keep sub-scores as secondary info.
5. Keep "Try Again" button.

> [!TIP]
> The `onSuccess` callback currently only passes `score: number`. We should also pass the full `attempt` object to `ExampleWordCard` so it can display the IPA feedback inline.

### Step 6: Update `PronunciationRecorder` callback

**File:** `PronunciationRecorder.tsx`

Change `onSuccess` prop from `(score: number) => void` to `(result: PronunciationResult) => void`:
```ts
interface PronunciationResult {
  score: number;
  feedback: {
    level: string;
    details: {
      targetIPA: string;
      transcribedIPA: string;
      phonemeAccuracy: number;
      confidenceScore: number;
    };
    words: Array<{
      word: string;
      targetIPA: string;
      spokenIPA: string;
      phonemeScore: number;
      confidence: number;
      match: string;
    }>;
  };
}
```

### Step 7: Update `ExampleWordCard` — inline result + progress badge

**File:** `ExampleWordCard.tsx`

1. Accept `progress?: WordProgress` prop → show badge on card:
   - **MASTERED**: Green checkmark + best score
   - **PRACTICING**: Orange dot + best score
   - **NEW**: No badge (or subtle gray "Not practiced")

2. When recording result arrives, replace the current simple text feedback with:
   - **`<ScoreCircle>`** (compact, 56px)
   - **`<IpaFeedback>`** showing the per-phoneme comparison
   - Feedback message

### Step 8: Create `WordProgressCounter` component (NEW)

**File:** `_components/WordProgressCounter.tsx`

Replaces `SoundProgressBar`:
- Compact one-liner: `✅ 3/5 words mastered`
- Row of small colored dots (one per word): green=mastered, orange=practicing, gray=new

### Step 9: Update `SoundDetailContent` — wire everything

**File:** `SoundDetailContent.tsx`

- Accept `wordProgressMap: Record<string, WordProgress>`.
- Replace `<SoundProgressBar>` with `<WordProgressCounter>`.
- Pass per-word progress to each `<ExampleWordCard>`.

### Step 10: Update page — fetch word progress

**File:** `sounds/[symbol]/page.tsx`

- After fetching sound, also call `pronunciationApi.getWordProgress(sound.id)`.
- Re-fetch on `handlePracticeComplete`.

### Step 11: Cleanup

- Remove `SoundProgressBar.tsx` (replaced by `WordProgressCounter`).

---

## IPA Phoneme Alignment Algorithm

For `IpaFeedback`, we need a simple phoneme-by-phoneme comparison:

```
Target:  b  oʊ  t
Spoken:  b   ɔ  t

Result:  b → green (match)
         oʊ → red (substituted with ɔ)
         t → green (match)
```

**Approach:**
1. Parse IPA strings into phoneme arrays (handling digraphs like `oʊ`, `aɪ`, `eɪ`).
2. Use simple position-based comparison (since we're comparing single words, lengths are usually similar).
3. Handle length mismatches with "gap" indicators.

---

## Visual Mockup (ASCII)

### ExampleWordCard — After Recording Result
```
┌──────────────────────────────────────────────┐
│  boat           ▶ 🎙              ✅ 92     │  ← progress badge
│  /baʊt/                                      │
│                                               │
│  ┌────────────────────────────────────────┐   │
│  │   ┌──────┐                             │   │
│  │   │  75% │   /b oʊ t/                  │   │
│  │   │  ○○○ │    🟢🔴🟢                    │   │
│  │   └──────┘                             │   │
│  │   Good · Focus on the vowel            │   │
│  │                                        │   │
│  │         [ Try Again ]                  │   │
│  └────────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

### WordProgressCounter (replaces SoundProgressBar)
```
┌──────────────────────────────────────────────────┐
│  ✅ 3/5 words mastered   🟢 🟢 🟢 🟠 ⚪          │
└──────────────────────────────────────────────────┘
```

---

## Files Summary

| # | File | Action |
|:--|:-----|:-------|
| 1 | `pronunciation.service.ts` (backend) | Add `getWordProgress()` |
| 2 | `pronunciation.controller.ts` (backend) | Add `GET /sounds/:soundId/word-progress` |
| 3 | `pronunciation.dto.ts` (backend) | Add `WordProgressDto` |
| 4 | `types/index.ts` (frontend) | Add `WordProgress`, `PronunciationResult` |
| 5 | `learning.api.ts` (frontend) | Add `getWordProgress()` |
| 6 | `ScoreCircle.tsx` (frontend) | **NEW** — SVG circular progress ring |
| 7 | `IpaFeedback.tsx` (frontend) | **NEW** — per-phoneme colored IPA display |
| 8 | `PronunciationRecorder.tsx` (frontend) | Redesign result view with ScoreCircle + IpaFeedback |
| 9 | `ExampleWordCard.tsx` (frontend) | Add progress badge + inline rich feedback |
| 10 | `WordProgressCounter.tsx` (frontend) | **NEW** — compact x/N counter |
| 11 | `SoundDetailContent.tsx` (frontend) | Wire word progress, swap progress bar |
| 12 | `page.tsx` (sound detail) | Fetch word progress |
| 13 | `SoundProgressBar.tsx` (frontend) | **REMOVE** |

## Color System Reference

| Score Range | Label | Ring Color | IPA Phoneme Color |
|:------------|:------|:-----------|:------------------|
| 80–100 | Success | `#22C55E` | `text-green-600` (correct match) |
| 65–79 | Info | `#3B82F6` | — |
| 40–64 | Warning | `#F59E0B` | — |
| 0–39 | Danger | `#EF4444` | `text-red-500` (wrong phoneme) |
| — | Missing | — | `text-slate-300` (not spoken) |
