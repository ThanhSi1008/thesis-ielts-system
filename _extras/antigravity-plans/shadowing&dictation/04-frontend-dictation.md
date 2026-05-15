# Phase 4 — Frontend: Dictation Page Decomposition

> **Risk**: HIGH — Largest refactor, most user-visible changes.  
> **Estimated Effort**: Large  
> **Dependencies**: Phase 3 (hooks must exist first)

---

## 4.1 Current State

`frontend-web/src/app/shadowing-dictation/[id]/dictation/page.tsx` — **894 lines**

### Responsibility Breakdown (Current)

| Lines | Responsibility | Target |
|---|---|---|
| 1-27 | Imports, constants, utility functions | `_constants.ts` |
| 28-47 | `findLesson()` helper | `useLesson` hook |
| 49-53 | `formatTime()` utility | `_constants.ts` |
| 55-169 | State declarations, lesson loading, progress saving | `useLesson` + `useProgress` hooks |
| 170-237 | YouTube IFrame API setup | `useYouTubePlayer` hook |
| 240-295 | Difficulty logic, word reveal calculation | `useDictationLogic` (new) or inline |
| 297-329 | Word matching + completion detection | `WordGrid` component logic |
| 331-429 | Audio playback (playSentence, auto-play) | `useAudioPlayer` hook |
| 431-468 | Event handlers (repeat, speed, reveal) | Inline in page |
| 470-505 | Keyboard shortcuts | `useKeyboardShortcuts` hook |
| 507-513 | Loading state JSX | Inline |
| 515-894 | **~380 lines of JSX** | **Split into components** |

---

## 4.2 Target Components

### Component Tree

```
DictationPracticePage (page.tsx, ~120 lines)
├── <audio ref={audioRef} />          # Hidden element
├── VideoPlayer                       # Left column
│   ├── YouTubeEmbed                  # or
│   └── AudioSourcePanel              # Waveform visualization
├── DictationPanel                    # Right column
│   ├── ProgressBar                   # "12/20 completed"
│   ├── PlaybackControls              # Speed, Repeat, Difficulty
│   ├── TranscriptList                # Scrollable sentence history
│   │   └── SentenceRow (×N)          # Completed sentence
│   ├── ActiveSentence                # Current dictation area
│   │   ├── WordGrid                  # Word blanks with status colors
│   │   └── DictationInput            # Textarea
│   ├── ActionButtons                 # Show All, Next
│   └── CompletionScreen              # All sentences done
```

---

## 4.3 Component Specifications

### 4.3.1 `VideoPlayer.tsx` (Shared with Shadowing)

**Location**: `_components/VideoPlayer.tsx`  
**Lines**: ~60

```typescript
interface VideoPlayerProps {
  isYouTube: boolean;
  lessonId: string | undefined;
  ytContainerRef: React.RefObject<HTMLDivElement>;
  isPlaying: boolean;
  onPlay: () => void;
}
```

Renders either:
- YouTube embed (black bg, centered aspect-ratio video)
- Audio source panel (gray bg, waveform visualization, play button)

Uses `WAVEFORM_HEIGHTS` from `_constants.ts`.

### 4.3.2 `ProgressBar.tsx` (Shared)

**Location**: `_components/ProgressBar.tsx`  
**Lines**: ~25

```typescript
interface ProgressBarProps {
  current: number;     // completedSentences.length
  total: number;       // totalSentences
  label?: string;      // "Dictation" or "Shadowing"
}
```

Simple progress indicator with percentage text and colored bar.

### 4.3.3 `PlaybackControls.tsx` (Shared)

**Location**: `_components/PlaybackControls.tsx`  
**Lines**: ~80

```typescript
interface PlaybackControlsProps {
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  onRepeat: () => void;
  isPlaying: boolean;
  // Dictation-specific (optional)
  difficulty?: string;
  onDifficultyChange?: (d: string) => void;
  onShowAll?: () => void;
}
```

Renders:
- Repeat button (Alt+R)
- Speed selector panel (Alt+S)
- Difficulty selector (Alt+M, dictation only)
- Show All button (Alt+A, dictation only)

Uses config-driven rendering (OCP): if `difficulty` prop is provided, show difficulty controls.

### 4.3.4 `TranscriptList.tsx` (Shared)

**Location**: `_components/TranscriptList.tsx`  
**Lines**: ~40

```typescript
interface TranscriptListProps {
  sentences: any[];
  completedSentences: number[];
  currentIndex: number;
  onPlaySentence: (sentence: any) => void;
  scrollAnchorRef: React.RefObject<HTMLDivElement>;
}
```

Scrollable container that maps over completed sentences and renders `SentenceRow` for each.

### 4.3.5 `SentenceRow.tsx` (Shared)

**Location**: `_components/SentenceRow.tsx`  
**Lines**: ~40

```typescript
interface SentenceRowProps {
  index: number;
  sentence: { english: string; vietnamese: string };
  isCompleted: boolean;
  isCurrent: boolean;
  onPlay: () => void;
}
```

Renders a single sentence with:
- Checkmark icon for completed
- Click-to-replay functionality
- Vietnamese translation (if available)

### 4.3.6 `WordGrid.tsx` (Dictation Only)

**Location**: `_components/WordGrid.tsx`  
**Lines**: ~80

```typescript
interface WordGridProps {
  words: string[];
  wordStatuses: ('revealed' | 'correct' | 'incorrect' | 'pending')[];
  revealedWords: Set<number>;
  onRevealWord: (index: number) => void;
  showAllWords: boolean;
}
```

Renders the word-by-word display where:
- Revealed words show the actual text
- Correct words show green text
- Incorrect words show red text
- Pending words show asterisks (`****`)
- Click on a word to reveal it

### 4.3.7 `DictationInput.tsx` (Dictation Only)

**Location**: `_components/DictationInput.tsx`  
**Lines**: ~30

```typescript
interface DictationInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  placeholder?: string;
}
```

Simple textarea wrapper. ISP: only receives the data it needs.

### 4.3.8 `CompletionScreen.tsx` (Shared)

**Location**: `_components/CompletionScreen.tsx`  
**Lines**: ~50

```typescript
interface CompletionScreenProps {
  lessonTitle: string;
  totalSentences: number;
  mode: 'shadowing' | 'dictation';
  onRestart?: () => void;
}
```

Congratulations overlay shown when all sentences are completed.

---

## 4.4 Refactored Page Structure

```typescript
// frontend-web/src/app/shadowing-dictation/[id]/dictation/page.tsx
// TARGET: ~120 lines

'use client';

import { useRef, useState, useMemo, useEffect } from 'react';
import { useLesson } from '../../_hooks/useLesson';
import { useProgress } from '../../_hooks/useProgress';
import { useYouTubePlayer } from '../../_hooks/useYouTubePlayer';
import { useAudioPlayer } from '../../_hooks/useAudioPlayer';
import { useKeyboardShortcuts } from '../../_hooks/useKeyboardShortcuts';
import { normalizeWord, DIFFICULTY_REVEAL_PERCENT } from '../../_constants';

// Components
import VideoPlayer from '../../_components/VideoPlayer';
import ProgressBar from '../../_components/ProgressBar';
import PlaybackControls from '../../_components/PlaybackControls';
import TranscriptList from '../../_components/TranscriptList';
import WordGrid from '../../_components/WordGrid';
import DictationInput from '../../_components/DictationInput';
import CompletionScreen from '../../_components/CompletionScreen';

export default function DictationPracticePage() {
  // ── Hooks ──
  const { lesson, isInitializing, sentences, isYouTube, audioUrl, lessonTitle, totalSentences } = useLesson();
  const { completedSentences, currentIndex, setCurrentIndex, difficulty, setDifficulty, markCompleted, isFinished } = useProgress({
    lessonId: lesson?.id,
    type: 'dictation',
    totalSentences,
    lessonTitle,
    isInitializing,
  });

  // ── Refs ──
  const audioRef = useRef<HTMLAudioElement>(null);
  const ytContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  // ── YouTube + Audio ──
  const { playerRef, isReady: ytReady } = useYouTubePlayer({
    videoId: lesson?.youtubeVideoId ?? null,
    containerRef: ytContainerRef,
  });

  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  const { isPlaying, playSentence } = useAudioPlayer({
    isYouTube,
    ytPlayerRef: playerRef,
    ytReady,
    audioRef,
    playbackSpeed,
  });

  // ── Dictation-specific state ──
  const [userInput, setUserInput] = useState('');
  const [sentenceCorrect, setSentenceCorrect] = useState(false);
  const [revealedWords, setRevealedWords] = useState<Set<number>>(new Set());
  const [showAllWords, setShowAllWords] = useState(false);

  // ── Word matching logic (kept inline, ~30 lines) ──
  // ... difficulty reveal calculation
  // ... wordStatuses memo
  // ... completion detection effect

  // ── Handlers ──
  const handleNext = () => { /* reset state, advance index */ };
  const handleRepeat = () => playSentence(sentences[currentIndex]);
  const handleShowAll = () => setShowAllWords(true);

  // ── Keyboard shortcuts ──
  useKeyboardShortcuts({
    onNext: handleNext,
    onRepeat: handleRepeat,
    onShowAll: handleShowAll,
    canGoNext: sentenceCorrect && currentIndex < totalSentences - 1,
  });

  // ── Render ──
  if (isInitializing || !lesson) return <LoadingSpinner />;

  return (
    <div className="h-[calc(100vh-56px)] bg-white overflow-hidden flex flex-col">
      {!isYouTube && <audio ref={audioRef} src={audioUrl} preload="auto" />}
      <div className="flex-1 ... grid grid-cols-3 ...">
        <VideoPlayer ... />
        <div className="col-span-1 ...">
          <ProgressBar current={completedSentences.length} total={totalSentences} />
          <PlaybackControls ... />
          <TranscriptList ... />
          {!isFinished ? (
            <>
              <WordGrid ... />
              <DictationInput ... />
            </>
          ) : (
            <CompletionScreen ... />
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 4.5 Implementation Order

1. Create `_components/ProgressBar.tsx`
2. Create `_components/SentenceRow.tsx`
3. Create `_components/TranscriptList.tsx`
4. Create `_components/WordGrid.tsx`
5. Create `_components/DictationInput.tsx`
6. Create `_components/VideoPlayer.tsx`
7. Create `_components/PlaybackControls.tsx`
8. Create `_components/CompletionScreen.tsx`
9. **Rewrite `dictation/page.tsx`** to compose the above
10. Verify all functionality works identically

---

## Acceptance Criteria

- [ ] `dictation/page.tsx` is under 150 lines
- [ ] 8 component files created in `_components/`
- [ ] Each component is under 80 lines
- [ ] Each component receives only the props it needs (ISP)
- [ ] All existing functionality preserved:
  - [ ] Word-by-word matching with color feedback
  - [ ] Difficulty-based word revealing
  - [ ] Auto-play on sentence advance
  - [ ] Keyboard shortcuts (Enter, Alt+R, Alt+S, Alt+A, Alt+M)
  - [ ] Progress auto-save
  - [ ] Completion screen
  - [ ] YouTube and audio source support
