# Phase 5: Frontend — Dictation Module

## Target Directory Structure

```
frontend-web/src/app/shadowing-dictation/dictation/
├── page.tsx                      → Library page (list of system lessons)
├── my-videos/
│   └── page.tsx                  → User video management
├── [id]/
│   └── page.tsx                  → Dictation practice page
├── _hooks/
│   ├── useDictationLesson.ts     → Fetch lesson from dictationApi
│   ├── useDictationProgress.ts   → Fetch/save progress (WITH difficulty)
│   ├── useDictation.ts           → Core dictation logic (word matching, reveal, auto-check)
│   ├── useYouTubePlayer.ts       → YouTube IFrame API lifecycle
│   ├── useAudioPlayer.ts         → HTML5/YT segment playback
│   └── useDictationShortcuts.ts  → Keyboard shortcuts (Enter, Alt+R, Alt+S, Alt+A, Alt+M)
├── _components/
│   ├── DictationVideoPlayer.tsx
│   ├── DictationProgressBar.tsx
│   ├── DictationPlaybackControls.tsx  → Speed selector + Repeat + Difficulty dropdown
│   ├── DictationTranscriptList.tsx
│   ├── DictationSentenceRow.tsx
│   ├── WordGrid.tsx                   → Visual word blanks with status coloring
│   ├── DictationInput.tsx             → Textarea for typing answers
│   └── DictationCompletionScreen.tsx
└── _constants.ts               → SPEED_PRESETS, DIFFICULTY_LEVELS, normalizeWord, formatTime
```

---

## Step 5.1: Create `_constants.ts`

Dictation constants — includes difficulty system:

```ts
export const SPEED_PRESETS = [0.25, 0.5, 0.75, 1.0, 2.0] as const;

export const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];

export const DIFFICULTY_REVEAL_PERCENT: Record<DifficultyLevel, number> = {
  Beginner: 0.7,
  Intermediate: 0.5,
  Advanced: 0.3,
  Expert: 0,
};

export const normalizeWord = (w: string) =>
  w.toLowerCase().replace(/[.,!?'"]/g, '').trim();

export const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};
```

## Step 5.2: Create `useDictationLesson.ts`

```ts
// Imports dictationApi (NOT shadowingApi)
// Calls dictationApi.getLessonById(id) then falls back to dictationApi.getVideoById(id)
// Returns: { lesson, isInitializing, sentences, isYouTube, audioUrl, lessonTitle, totalSentences }
```

Logic mirrors `useShadowingLesson.ts` but targets `dictationApi`.

## Step 5.3: Create `useDictationProgress.ts`

Key differences from `useShadowingProgress.ts`:
- HAS `difficulty` / `setDifficulty` in return value
- Calls `dictationApi.getProgress(lessonId)` → returns `{ completedSentences, difficulty }`
- Calls `dictationApi.upsertProgress({ lessonId, completedSentences, difficulty, lessonTitle, totalSentences })`
- Persists difficulty changes to backend

```ts
interface UseDictationProgressOptions {
  lessonId: string | undefined;
  totalSentences: number;
  lessonTitle: string;
  isInitializing: boolean;
}

interface UseDictationProgressReturn {
  completedSentences: number[];
  currentIndex: number;
  setCurrentIndex: (i: number) => void;
  difficulty: string;
  setDifficulty: (d: string) => void;
  markCompleted: (index: number) => void;
  isFinished: boolean;
}
```

## Step 5.4: Create `useDictation.ts` ⭐ (NEW — extracted from page)

This is the **critical new hook** that encapsulates ALL the dictation-specific logic currently embedded inline in `dictation/page.tsx` (lines 60–133). This is the biggest SRP win in the entire plan.

```ts
interface UseDictationOptions {
  sentences: any[];
  currentIndex: number;
  difficulty: string;
  markCompleted: (index: number) => void;
}

interface UseDictationReturn {
  // Input state
  userInput: string;
  setUserInput: (v: string) => void;
  sentenceCorrect: boolean;

  // Word grid state
  wordStatuses: ('revealed' | 'correct' | 'incorrect' | 'pending')[];
  showAllWords: boolean;
  revealWord: (index: number) => void;
  revealAllWords: () => void;

  // Current sentence (with computed words array)
  currentSentence: { english: string; words: string[]; audioStart: number; audioEnd: number };

  // Reset (called when advancing to next sentence)
  resetForNext: () => void;
}
```

**What this hook encapsulates**:
1. `userInput` state + `userWords` memo (split by whitespace)
2. `revealedWords` Set + `showAllWords` flag
3. Difficulty-based auto-reveal logic (the `useEffect` that calculates which words to pre-reveal based on difficulty level and word length)
4. `wordStatuses` computation (comparing each `userWord` against `sentence.words[i]`)
5. Auto-check effect (when all words typed correctly → `markCompleted`)
6. `currentSentence` memo (ensuring `words` array is always populated)
7. `resetForNext()` — clears all state for the next sentence

**This extracts ~75 lines of logic from the page component into a testable hook.**

## Step 5.5: Copy Shared Hooks

Copy these hooks directly into `dictation/_hooks/` with no changes:
- `useYouTubePlayer.ts` (identical to shadowing copy)
- `useAudioPlayer.ts` (identical to shadowing copy)

## Step 5.6: Create `useDictationShortcuts.ts`

Full version — includes `onShowAll` + `onToggleDifficulty`:

```ts
interface DictationShortcutConfig {
  onNext?: () => void;
  onRepeat?: () => void;
  onToggleSpeed?: () => void;
  onShowAll?: () => void;
  onToggleDifficulty?: () => void;
  canGoNext: boolean;
}
```

Shortcuts:
- `Enter` → advance to next sentence (if correct)
- `Alt+R` → repeat current sentence audio
- `Alt+S` → cycle playback speed
- `Alt+A` → reveal all hidden words
- `Alt+M` → cycle difficulty level

## Step 5.7: Create Components

### `DictationPlaybackControls.tsx`
- Speed dropdown (select element, not button row)
- Repeat button
- Difficulty dropdown (Beginner/Intermediate/Advanced/Expert)
- All on a single compact row

### `WordGrid.tsx`
- Renders word array as flex-wrap grid
- Each word shows status via color: green (correct), red background but hidden text (incorrect), gray (revealed), transparent (pending)
- **Incorrect words do NOT reveal the answer** — they just turn the block red
- Click a pending block to manually reveal it
- `max-h-[35vh]` with `overflow-y-auto` to prevent layout blowout on long sentences

### `DictationInput.tsx`
- Textarea with `h-24`
- "Press Enter to advance" hint below (not overlapping)
- Disabled when sentence is fully correct

### Other Components
Identical structure to shadowing counterparts but using `dictationApi` types.

## Step 5.8: Create Practice Page `[id]/page.tsx`

This is the main dictation practice page. It composes:
1. `DictationVideoPlayer`
2. `DictationProgressBar`
3. `DictationPlaybackControls`
4. `DictationTranscriptList`
5. `WordGrid`
6. `DictationInput`
7. `DictationCompletionScreen` (when finished)

Uses `useDictation` hook for all word-matching logic.

Target: **~100 lines** (composition only, all logic in hooks).

```tsx
export default function DictationPracticePage() {
  const { lesson, sentences, ... } = useDictationLesson();
  const { completedSentences, currentIndex, difficulty, ... } = useDictationProgress({ ... });
  const { userInput, setUserInput, wordStatuses, sentenceCorrect, ... } = useDictation({ sentences, currentIndex, difficulty, markCompleted });
  const { playSentence, isPlaying } = useAudioPlayer({ ... });

  // Compose UI from components — no inline logic
  return ( ... );
}
```

## Step 5.9: Create Library Page `page.tsx`

Displays system lessons as video cards. Each card has a single "Dictate (X%)" button (NO shadowing button). Fetches `dictationApi.getLessons()` + `dictationApi.getAllProgress()`.

## Step 5.10: Create My Videos Page `my-videos/page.tsx`

User video management with folders. Uses `dictationApi.getVideos()`, `dictationApi.getFolders()`, etc. Only shows "Dictate" action per video.
