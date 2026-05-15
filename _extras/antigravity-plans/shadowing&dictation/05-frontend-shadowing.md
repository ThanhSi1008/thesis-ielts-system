# Phase 5 — Frontend: Shadowing Page Decomposition

> **Risk**: MEDIUM — Largely mirrors Phase 4, with recording logic instead.  
> **Estimated Effort**: Medium  
> **Dependencies**: Phase 3 (hooks) + Phase 4 (shared components already exist)

---

## 5.1 Current State

`frontend-web/src/app/shadowing-dictation/[id]/shadowing/page.tsx` — **885 lines**

### Key Differences from Dictation

| Feature | Dictation | Shadowing |
|---|---|---|
| Input method | Typing into textarea | Voice recording via MediaRecorder |
| Matching logic | Word-by-word text comparison | Word highlighting during playback |
| Difficulty | Yes (Beginner/Intermediate/Advanced/Expert) | No |
| Recording | No | Yes (record, playback, compare) |
| Completion trigger | All words match | User marks as "done" |

### Responsibility Breakdown

| Lines | Responsibility | Target |
|---|---|---|
| 1-48 | Imports, constants, findLesson | `_constants.ts` + `useLesson` hook (REUSE) |
| 50-180 | State, lesson loading, progress | `useLesson` + `useProgress` hooks (REUSE) |
| 180-240 | YouTube setup | `useYouTubePlayer` hook (REUSE) |
| 240-430 | Audio playback, recording logic | `useAudioPlayer` (REUSE) + `useRecording` (NEW) |
| 430-520 | Handlers, keyboard shortcuts | `useKeyboardShortcuts` (REUSE) |
| 520-885 | **~365 lines of JSX** | **Split into components** |

---

## 5.2 New Hook: `useRecording.ts`

The recording logic is **unique to Shadowing** and doesn't exist in Dictation.

```
frontend-web/src/app/shadowing-dictation/_hooks/useRecording.ts
```

```typescript
interface UseRecordingOptions {
  onRecordingComplete?: (audioBlob: Blob, audioUrl: string) => void;
}

interface UseRecordingReturn {
  isRecording: boolean;
  recordedAudioUrl: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearRecording: () => void;
  recordedAudioRef: React.RefObject<HTMLAudioElement>;
}

export function useRecording(options?: UseRecordingOptions): UseRecordingReturn {
  // 1. Manages MediaRecorder lifecycle
  // 2. Handles getUserMedia() for microphone access
  // 3. Collects audio chunks into Blob
  // 4. Creates object URL for playback
  // 5. Cleanup: revokes object URLs on unmount
}
```

**Source**: Extracted from `shadowing/page.tsx` recording-related state and handlers.

---

## 5.3 New Component: `RecordingControls.tsx`

```
frontend-web/src/app/shadowing-dictation/_components/RecordingControls.tsx
```

```typescript
interface RecordingControlsProps {
  isRecording: boolean;
  hasRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPlayRecording: () => void;
  onClearRecording: () => void;
  recordedAudioRef: React.RefObject<HTMLAudioElement>;
  recordedAudioUrl: string | null;
}
```

**Lines**: ~70

Renders:
- Record button (pulsing red when active)
- Stop button
- Play recording button (appears after recording)
- Clear/re-record button
- Visual recording indicator (waveform or timer)

---

## 5.4 Reused Components from Phase 4

These components created in Phase 4 are **directly reusable** in Shadowing:

| Component | Usage in Shadowing |
|---|---|
| `VideoPlayer.tsx` | Left column — identical YouTube/Audio panel |
| `ProgressBar.tsx` | Same progress bar, label="Shadowing" |
| `PlaybackControls.tsx` | Speed + Repeat (no difficulty/showAll) |
| `TranscriptList.tsx` | Scrollable completed sentences |
| `SentenceRow.tsx` | Individual completed sentence rows |
| `CompletionScreen.tsx` | All-done congratulations screen |

---

## 5.5 Shadowing-Specific Components

### 5.5.1 `ActiveShadowingSentence.tsx`

```typescript
// frontend-web/src/app/shadowing-dictation/_components/ActiveShadowingSentence.tsx

interface ActiveShadowingSentenceProps {
  sentence: {
    english: string;
    vietnamese: string;
    phonetic?: string;
    words: string[];
  };
  highlightedWordIndex: number;  // Which word is currently being spoken
  showTranslation: boolean;
  showPhonetic: boolean;
  onToggleTranslation: () => void;
  onTogglePhonetic: () => void;
}
```

**Lines**: ~60

Renders the current sentence with:
- Word-by-word highlighting synced to audio playback
- Toggle buttons for Vietnamese translation and IPA phonetic
- Visual emphasis on the active word

### 5.5.2 `ShadowingActionBar.tsx`

```typescript
interface ShadowingActionBarProps {
  onMarkDone: () => void;
  onSkip: () => void;
  canMarkDone: boolean;
  isLastSentence: boolean;
}
```

**Lines**: ~40

The bottom action bar with:
- "Mark as Done" button (primary action)
- "Skip" button
- Next sentence button (appears after marking done)

---

## 5.6 Refactored Page Structure

```typescript
// frontend-web/src/app/shadowing-dictation/[id]/shadowing/page.tsx
// TARGET: ~120 lines

'use client';

import { useRef, useState } from 'react';
import { useLesson } from '../../_hooks/useLesson';
import { useProgress } from '../../_hooks/useProgress';
import { useYouTubePlayer } from '../../_hooks/useYouTubePlayer';
import { useAudioPlayer } from '../../_hooks/useAudioPlayer';
import { useRecording } from '../../_hooks/useRecording';
import { useKeyboardShortcuts } from '../../_hooks/useKeyboardShortcuts';

import VideoPlayer from '../../_components/VideoPlayer';
import ProgressBar from '../../_components/ProgressBar';
import PlaybackControls from '../../_components/PlaybackControls';
import TranscriptList from '../../_components/TranscriptList';
import RecordingControls from '../../_components/RecordingControls';
import ActiveShadowingSentence from '../../_components/ActiveShadowingSentence';
import ShadowingActionBar from '../../_components/ShadowingActionBar';
import CompletionScreen from '../../_components/CompletionScreen';

export default function ShadowingPracticePage() {
  // ── Hooks (all reused from Phase 3) ──
  const { lesson, isInitializing, sentences, isYouTube, audioUrl, lessonTitle, totalSentences } = useLesson();
  const { completedSentences, currentIndex, setCurrentIndex, markCompleted, isFinished } = useProgress({
    lessonId: lesson?.id,
    type: 'shadowing',
    totalSentences,
    lessonTitle,
    isInitializing,
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const ytContainerRef = useRef<HTMLDivElement>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  const { playerRef, isReady: ytReady } = useYouTubePlayer({ ... });
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const { isPlaying, playSentence } = useAudioPlayer({ ... });
  const { isRecording, recordedAudioUrl, startRecording, stopRecording, ... } = useRecording();

  // ── Handlers ──
  const handleNext = () => { setCurrentIndex(i => i + 1); };
  const handleMarkDone = () => { markCompleted(currentIndex); };
  const handleRepeat = () => playSentence(sentences[currentIndex]);

  useKeyboardShortcuts({
    onNext: handleNext,
    onRepeat: handleRepeat,
    canGoNext: completedSentences.includes(currentIndex),
  });

  if (isInitializing || !lesson) return <LoadingSpinner />;

  return (
    <div className="h-[calc(100vh-56px)] bg-white overflow-hidden flex flex-col">
      {!isYouTube && <audio ref={audioRef} src={audioUrl} preload="auto" />}
      <div className="flex-1 ... grid grid-cols-3 ...">
        <VideoPlayer ... />
        <div className="col-span-1 ...">
          <ProgressBar current={completedSentences.length} total={totalSentences} label="Shadowing" />
          <PlaybackControls ... />
          <TranscriptList ... />
          {!isFinished ? (
            <>
              <ActiveShadowingSentence sentence={sentences[currentIndex]} ... />
              <RecordingControls ... />
              <ShadowingActionBar ... />
            </>
          ) : (
            <CompletionScreen mode="shadowing" ... />
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 5.7 Implementation Order

1. Create `_hooks/useRecording.ts`
2. Create `_components/RecordingControls.tsx`
3. Create `_components/ActiveShadowingSentence.tsx`
4. Create `_components/ShadowingActionBar.tsx`
5. **Rewrite `shadowing/page.tsx`** to compose hooks + components
6. Verify all functionality works identically

---

## 5.8 Component Reuse Summary

| Component | Created In | Used By |
|---|---|---|
| `VideoPlayer` | Phase 4 | Dictation ✅, Shadowing ✅ |
| `ProgressBar` | Phase 4 | Dictation ✅, Shadowing ✅ |
| `PlaybackControls` | Phase 4 | Dictation ✅, Shadowing ✅ |
| `TranscriptList` | Phase 4 | Dictation ✅, Shadowing ✅ |
| `SentenceRow` | Phase 4 | Dictation ✅, Shadowing ✅ |
| `CompletionScreen` | Phase 4 | Dictation ✅, Shadowing ✅ |
| `WordGrid` | Phase 4 | Dictation ✅ only |
| `DictationInput` | Phase 4 | Dictation ✅ only |
| `RecordingControls` | Phase 5 | Shadowing ✅ only |
| `ActiveShadowingSentence` | Phase 5 | Shadowing ✅ only |
| `ShadowingActionBar` | Phase 5 | Shadowing ✅ only |

---

## Acceptance Criteria

- [ ] `shadowing/page.tsx` is under 150 lines
- [ ] `useRecording` hook created (~60 lines)
- [ ] 3 new shadowing-specific components created
- [ ] 6 components reused from Phase 4 without modification
- [ ] All existing functionality preserved:
  - [ ] Voice recording and playback
  - [ ] Word highlighting during audio playback
  - [ ] Mark-as-done completion flow
  - [ ] Auto-play on sentence advance
  - [ ] Keyboard shortcuts
  - [ ] Progress auto-save
  - [ ] YouTube and audio source support
