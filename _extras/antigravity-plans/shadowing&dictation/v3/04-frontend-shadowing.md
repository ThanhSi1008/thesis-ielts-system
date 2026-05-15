# Phase 4: Frontend — Shadowing Module

## Target Directory Structure

```
frontend-web/src/app/shadowing-dictation/shadowing/
├── page.tsx                    → Library page (list of system lessons)
├── my-videos/
│   └── page.tsx                → User video management
├── [id]/
│   └── page.tsx                → Shadowing practice page
├── _hooks/
│   ├── useShadowingLesson.ts   → Fetch lesson from shadowingApi
│   ├── useShadowingProgress.ts → Fetch/save progress (no difficulty, no type field)
│   ├── useYouTubePlayer.ts     → YouTube IFrame API lifecycle
│   ├── useAudioPlayer.ts       → HTML5/YT segment playback
│   ├── useRecording.ts         → SpeechRecognition + MediaRecorder
│   └── useShadowingShortcuts.ts→ Keyboard shortcuts (Enter, Alt+R, Alt+S)
├── _components/
│   ├── ShadowingVideoPlayer.tsx
│   ├── ShadowingProgressBar.tsx
│   ├── ShadowingPlaybackControls.tsx  → Speed selector + Repeat (NO difficulty dropdown)
│   ├── ShadowingTranscriptList.tsx
│   ├── ShadowingSentenceRow.tsx
│   ├── ActiveSentenceDisplay.tsx      → Current sentence with translation/phonetic toggles
│   ├── RecordingControls.tsx          → Start/Stop/Play/Clear recording buttons
│   ├── ShadowingActionBar.tsx         → Mark Done + Next buttons
│   └── ShadowingCompletionScreen.tsx
└── _constants.ts               → SPEED_PRESETS, normalizeWord, formatTime (NO difficulty)
```

---

## Step 4.1: Create `_constants.ts`

Shadowing constants only — NO difficulty levels:

```ts
export const SPEED_PRESETS = [0.25, 0.5, 0.75, 1.0, 2.0] as const;

export const normalizeWord = (w: string) =>
  w.toLowerCase().replace(/[.,!?'"]/g, '').trim();

export const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};
```

## Step 4.2: Create `useShadowingLesson.ts`

```ts
// Imports shadowingApi (NOT dictationApi)
// Calls shadowingApi.getLessonById(id) then falls back to shadowingApi.getVideoById(id)
// Returns: { lesson, isInitializing, sentences, isYouTube, audioUrl, lessonTitle, totalSentences }
```

Logic is identical to current `useLesson.ts` but imports from `@/services/shadowing.api`.

## Step 4.3: Create `useShadowingProgress.ts`

Key differences from current `useProgress.ts`:
- NO `type` parameter (it's always shadowing)
- NO `difficulty` / `setDifficulty` in return value
- Calls `shadowingApi.getProgress(lessonId)` → returns `{ completedSentences }` (flat)
- Calls `shadowingApi.upsertProgress({ lessonId, completedSentences })` — NO `type`, NO `dictationDifficulty`
- NO notification on completion

```ts
interface UseShadowingProgressOptions {
  lessonId: string | undefined;
  totalSentences: number;
  isInitializing: boolean;
}

interface UseShadowingProgressReturn {
  completedSentences: number[];
  currentIndex: number;
  setCurrentIndex: (i: number) => void;
  markCompleted: (index: number) => void;
  isFinished: boolean;
}
```

## Step 4.4: Copy Shared Hooks

Copy these hooks directly into `shadowing/_hooks/` with no changes:
- `useYouTubePlayer.ts` (identical)
- `useAudioPlayer.ts` (identical)
- `useRecording.ts` (identical — shadowing-exclusive)

## Step 4.5: Create `useShadowingShortcuts.ts`

Simplified version — NO `onShowAll`, NO `onToggleDifficulty`:

```ts
interface ShadowingShortcutConfig {
  onNext?: () => void;
  onRepeat?: () => void;
  onToggleSpeed?: () => void;
  canGoNext: boolean;
}
```

## Step 4.6: Create Components

All components are self-contained copies. Key notes:

- `ShadowingPlaybackControls.tsx` — Has speed selector + repeat button. NO difficulty dropdown.
- `ActiveSentenceDisplay.tsx` — Shows current sentence text, with toggle buttons for Vietnamese translation and phonetic overlay. Uses word-by-word coloring comparing `spokenWords` vs sentence words.
- `RecordingControls.tsx` — Start/Stop mic, Play recorded audio, Clear. Same as current.
- `ShadowingActionBar.tsx` — "Mark Done" + "Next" buttons. Same as current.

## Step 4.7: Create Practice Page `[id]/page.tsx`

This is the main shadowing practice page. It composes:
1. `ShadowingVideoPlayer`
2. `ShadowingProgressBar`
3. `ShadowingPlaybackControls`
4. `ShadowingTranscriptList`
5. `ActiveSentenceDisplay`
6. `RecordingControls`
7. `ShadowingActionBar`
8. `ShadowingCompletionScreen` (when finished)

Target: **~120 lines** (composition only, all logic in hooks).

## Step 4.8: Create Library Page `page.tsx`

Displays system lessons as video cards. Each card has a single "Shadow (X%)" button (NO dictation button). Fetches `shadowingApi.getLessons()` + `shadowingApi.getAllProgress()`.

## Step 4.9: Create My Videos Page `my-videos/page.tsx`

User video management with folders. Uses `shadowingApi.getVideos()`, `shadowingApi.getFolders()`, etc. Only shows "Shadow" action per video.
