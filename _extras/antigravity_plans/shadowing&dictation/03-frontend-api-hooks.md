# Phase 3 — Frontend API & Hooks Layer

> **Risk**: MEDIUM — Hooks are the foundation for Phases 4-6.  
> **Estimated Effort**: Medium  
> **Dependencies**: Phase 2 (backend split, but technically not required — same API)

---

## 3.1 API Client — No Changes

The current `frontend-web/src/services/shadowing.api.ts` (132 lines) is already a thin abstraction over the HTTP layer. It follows DIP correctly — components never call `fetch` directly.

**Decision**: Keep it as-is. The backend split (Phase 2) does not change the API URLs or response shapes.

---

## 3.2 Custom Hooks — Extract from Page Components

Both `dictation/page.tsx` (894 lines) and `shadowing/page.tsx` (885 lines) contain **identical or near-identical** logic for:

1. Lesson loading + resolution (system vs user video)
2. Progress fetching + auto-saving
3. YouTube IFrame API lifecycle
4. HTML5 Audio segment playback
5. Keyboard shortcuts

These will be extracted into **shared hooks** under `_hooks/`.

### Target Directory

```
frontend-web/src/app/shadowing-dictation/_hooks/
├── useLesson.ts              # Fetch lesson, resolve system vs user
├── useProgress.ts            # Fetch/save progress with debouncing
├── useYouTubePlayer.ts       # YouTube IFrame API lifecycle
├── useAudioPlayer.ts         # HTML5 audio segment playback
└── useKeyboardShortcuts.ts   # Keyboard event handler registration
```

---

## 3.3 Hook Specifications

### 3.3.1 `useLesson.ts`

**Source**: Extracted from `dictation/page.tsx` lines 28-47, 62-111 and identical code in `shadowing/page.tsx`.

```typescript
// frontend-web/src/app/shadowing-dictation/_hooks/useLesson.ts

import { useState, useCallback, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { shadowingApi, ShadowingVideo } from '@/services/shadowing.api';
import { useAuth } from '@/contexts/AuthContext';

interface UseLessonReturn {
  lesson: ShadowingVideo | null;
  isInitializing: boolean;
  sentences: any[];          // Typed shortcut
  isYouTube: boolean;        // !!lesson.youtubeVideoId
  audioUrl: string;          // lesson.audioUrl || ''
  lessonTitle: string;       // lesson.title || ''
  totalSentences: number;    // sentences.length
}

export function useLesson(): UseLessonReturn {
  // 1. Get params.id
  // 2. Wait for auth to load
  // 3. Try shadowingApi.getSystemLessonById(id) first
  // 4. If 404, try shadowingApi.getVideoById(id)
  // 5. If both fail, call notFound()
  // 6. Return lesson data with derived fields
}
```

**Key details**:
- The `findLesson()` helper function that currently exists at the top-level of both pages gets inlined here.
- The hook calls `notFound()` if the lesson doesn't exist — same behavior as today.
- Returns derived values (`isYouTube`, `audioUrl`, etc.) so the page never computes them.

### 3.3.2 `useProgress.ts`

**Source**: Extracted from `dictation/page.tsx` lines 66-143 and similar in `shadowing/page.tsx`.

```typescript
// frontend-web/src/app/shadowing-dictation/_hooks/useProgress.ts

interface UseProgressOptions {
  lessonId: string | undefined;
  type: 'shadowing' | 'dictation';
  totalSentences: number;
  lessonTitle: string;
  isInitializing: boolean;
}

interface UseProgressReturn {
  completedSentences: number[];
  setCompletedSentences: React.Dispatch<React.SetStateAction<number[]>>;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  difficulty: string;                   // Dictation only
  setDifficulty: (d: string) => void;  // Dictation only
  markCompleted: (index: number) => void;
  isFinished: boolean;
}

export function useProgress(options: UseProgressOptions): UseProgressReturn {
  // 1. Fetch progress on mount via shadowingApi.getProgress(lessonId)
  // 2. Set initialIndex from max completed index + 1
  // 3. Auto-save via useEffect when completedSentences or difficulty changes
  //    (skip first render using useRef flag — same pattern as current code)
  // 4. markCompleted() adds index to completedSentences if not already present
  // 5. isFinished = completedSentences.length === totalSentences
}
```

**Key details**:
- The `isFirstLoad` ref pattern is preserved to avoid saving on initial mount.
- `difficulty` state is only relevant for dictation, but it's always present (default "Intermediate"). Shadowing pages simply don't use it.

### 3.3.3 `useYouTubePlayer.ts`

**Source**: Extracted from `dictation/page.tsx` lines 183-237 and identical code in `shadowing/page.tsx`.

```typescript
// frontend-web/src/app/shadowing-dictation/_hooks/useYouTubePlayer.ts

interface UseYouTubePlayerOptions {
  videoId: string | null;      // lesson.youtubeVideoId
  containerRef: React.RefObject<HTMLDivElement>;
}

interface UseYouTubePlayerReturn {
  playerRef: React.MutableRefObject<any>;
  isReady: boolean;
}

export function useYouTubePlayer(options: UseYouTubePlayerOptions): UseYouTubePlayerReturn {
  // 1. Load YouTube IFrame API script if not already loaded
  // 2. Poll for window.YT.Player availability
  // 3. Create player instance with containerRef
  // 4. Set isReady = true on onReady event
  // 5. Cleanup: destroy player on unmount
}
```

**Key details**:
- The `youtube-iframe-script` deduplication check is preserved.
- The polling interval pattern (`setInterval` checking for `window.YT`) is preserved.
- The `isMounted` cleanup flag is preserved.

### 3.3.4 `useAudioPlayer.ts`

**Source**: Extracted from `dictation/page.tsx` lines 389-436 and identical code in `shadowing/page.tsx`.

```typescript
// frontend-web/src/app/shadowing-dictation/_hooks/useAudioPlayer.ts

interface UseAudioPlayerOptions {
  isYouTube: boolean;
  ytPlayerRef: React.MutableRefObject<any>;
  ytReady: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  playbackSpeed: number;
}

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  playSentence: (sentence: { audioStart: number; audioEnd: number }) => void;
  stopPlayback: () => void;
}

export function useAudioPlayer(options: UseAudioPlayerOptions): UseAudioPlayerReturn {
  // 1. Maintains isPlaying state
  // 2. playSentence() handles both YouTube and HTML5 audio:
  //    - Clears existing timer
  //    - Seeks to audioStart
  //    - Starts polling to stop at audioEnd
  // 3. stopPlayback() clears timer and pauses
  // 4. Cleanup: clears timer on unmount
}
```

**Key details**:
- Unifies the duplicated `playSentence` logic from both pages.
- The `timerRef` (polling interval) is managed internally.
- Both the "auto-play on index change" and "manual play button" use cases are handled.

### 3.3.5 `useKeyboardShortcuts.ts`

**Source**: Extracted from `dictation/page.tsx` lines 470-505 and similar in `shadowing/page.tsx`.

```typescript
// frontend-web/src/app/shadowing-dictation/_hooks/useKeyboardShortcuts.ts

interface KeyboardShortcutConfig {
  onNext?: () => void;        // Enter key
  onRepeat?: () => void;      // Alt+R
  onToggleSpeed?: () => void; // Alt+S
  onShowAll?: () => void;     // Alt+A (dictation only)
  onToggleDifficulty?: () => void; // Alt+M (dictation only)
  canGoNext: boolean;         // Whether Enter should trigger next
}

export function useKeyboardShortcuts(config: KeyboardShortcutConfig): void {
  // 1. Register global keydown listener
  // 2. Handle Enter → onNext (if canGoNext)
  // 3. Handle Alt+key combos
  // 4. Cleanup on unmount
}
```

**Key details**:
- Config-driven design (OCP) — shadowing and dictation pages pass different handler sets.
- No state — this is a pure side-effect hook.

---

## 3.4 Shared Constants

Extract magic values into a constants file:

```typescript
// frontend-web/src/app/shadowing-dictation/_constants.ts

export const SPEED_PRESETS = [0.25, 0.5, 0.75, 1.0, 2.0] as const;

export const WAVEFORM_HEIGHTS = Array.from(
  { length: 60 },
  () => Math.max(15, Math.random() * 100)
);

export const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];

export const DIFFICULTY_REVEAL_PERCENT: Record<DifficultyLevel, number> = {
  Beginner: 0.7,
  Intermediate: 0.5,
  Advanced: 0.3,
  Expert: 0,
};

// Normalize a word for comparison (strip punctuation, lowercase)
export const normalizeWord = (w: string) =>
  w.toLowerCase().replace(/[.,!?'"]/g, '').trim();

export const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};
```

---

## 3.5 Migration Strategy

These hooks can be created **alongside** the existing monolith pages. Then in Phases 4-5, the pages will be rewritten to consume the hooks. This avoids a big-bang change.

**Order of operations**:
1. Create `_constants.ts`
2. Create `_hooks/useLesson.ts`
3. Create `_hooks/useProgress.ts`
4. Create `_hooks/useYouTubePlayer.ts`
5. Create `_hooks/useAudioPlayer.ts`
6. Create `_hooks/useKeyboardShortcuts.ts`
7. Unit test each hook independently (optional but recommended)
8. **Do not modify existing pages yet** — that happens in Phase 4 and 5

---

## Acceptance Criteria

- [ ] `_constants.ts` created with all extracted constants
- [ ] 5 hooks created in `_hooks/` directory
- [ ] Each hook is under 80 lines
- [ ] Each hook has TypeScript interfaces for options and return values
- [ ] No existing page files modified (hooks are additive)
- [ ] Constants like `SPEED_PRESETS`, `WAVEFORM_HEIGHTS`, `normalizeWord` are no longer hardcoded in pages (after Phase 4/5 integration)
