# Phase 2 — `useDictationHints` Hook

> **Effort**: ~20 minutes  
> **Files**: 1 new file  
> **Dependencies**: Phase 1 (constants)

---

## Goal

Create a new custom hook that manages per-word hint state for the current sentence. This hook is responsible for:
1. Tracking the hint level (0–3) for each hidden word index
2. Providing a `requestHint(wordIndex)` function to increment the hint level
3. Auto-filling the input when hint level reaches 3 (full reveal)
4. Resetting all hints when the sentence changes

## File: `frontend-web/src/app/shadowing-dictation/dictation/_hooks/useDictationHints.ts`

**NEW FILE** — create from scratch.

### Interface

```typescript
interface UseDictationHintsOptions {
  /** The current sentence's words array */
  words: string[] | undefined;
  /** Which word indices are hidden (from useDictation) */
  hiddenIndices: Set<number>;
  /** Current sentence ID — used to reset hints on sentence change */
  sentenceId: string | undefined;
  /** Callback to auto-fill a word input when fully revealed (level 3) */
  onAutoFill: (index: number, value: string) => void;
  /** Whether answers have been checked (disable hints after check) */
  isChecked: boolean;
}

interface UseDictationHintsReturn {
  /** Map of word index → current hint level (0–3). Only contains entries for hidden words that have been hinted. */
  hintLevels: Map<number, number>;
  /** Request the next hint level for a specific word. No-op if already at MAX_HINT_LEVEL or word is not hidden. */
  requestHint: (wordIndex: number) => void;
  /** Request a hint for the currently focused word (for keyboard shortcut). Uses document.activeElement to find the focused input index. */
  requestHintForFocused: () => void;
  /** Total number of hints used in this sentence (sum of all hint levels). Useful for analytics. */
  totalHintsUsed: number;
  /** Get the hint level for a specific word index. Returns 0 if no hint has been requested. */
  getHintLevel: (wordIndex: number) => number;
}
```

### Implementation Specification

```typescript
// File: frontend-web/src/app/shadowing-dictation/dictation/_hooks/useDictationHints.ts

import { useState, useCallback, useEffect, useMemo } from 'react';
import { MAX_HINT_LEVEL } from '../_constants';

export function useDictationHints({
  words,
  hiddenIndices,
  sentenceId,
  onAutoFill,
  isChecked,
}: UseDictationHintsOptions): UseDictationHintsReturn {

  // State: Map<wordIndex, hintLevel>
  const [hintLevels, setHintLevels] = useState<Map<number, number>>(new Map());

  // Reset on sentence change
  useEffect(() => {
    setHintLevels(new Map());
  }, [sentenceId]);

  // requestHint: increment hint level for a word
  const requestHint = useCallback((wordIndex: number) => {
    // Guard: don't hint if checked, not hidden, or no words
    if (isChecked) return;
    if (!hiddenIndices.has(wordIndex)) return;
    if (!words?.[wordIndex]) return;

    setHintLevels(prev => {
      const currentLevel = prev.get(wordIndex) ?? 0;
      if (currentLevel >= MAX_HINT_LEVEL) return prev; // already max

      const nextLevel = currentLevel + 1;
      const next = new Map(prev);
      next.set(wordIndex, nextLevel);

      // If fully revealed (level 3), auto-fill the input
      if (nextLevel >= MAX_HINT_LEVEL) {
        onAutoFill(wordIndex, words[wordIndex]);
      }

      return next;
    });
  }, [isChecked, hiddenIndices, words, onAutoFill]);

  // requestHintForFocused: keyboard shortcut support
  const requestHintForFocused = useCallback(() => {
    // Find the currently focused input's word index
    // DictationInputRow stores refs as inputsRef.current[idx]
    // The focused element should have a data attribute or we can match by DOM position
    const activeEl = document.activeElement as HTMLInputElement | null;
    if (!activeEl || activeEl.tagName !== 'INPUT') return;

    // Strategy: find the input's index from its parent's data attribute
    // We'll add data-word-index to each input in Phase 3
    const indexStr = activeEl.getAttribute('data-word-index');
    if (indexStr === null) return;

    const wordIndex = parseInt(indexStr, 10);
    if (!isNaN(wordIndex)) {
      requestHint(wordIndex);
    }
  }, [requestHint]);

  // Computed: total hints used
  const totalHintsUsed = useMemo(() => {
    let total = 0;
    hintLevels.forEach(level => { total += level; });
    return total;
  }, [hintLevels]);

  // Helper: get hint level for a word
  const getHintLevel = useCallback((wordIndex: number): number => {
    return hintLevels.get(wordIndex) ?? 0;
  }, [hintLevels]);

  return {
    hintLevels,
    requestHint,
    requestHintForFocused,
    totalHintsUsed,
    getHintLevel,
  };
}
```

### Key Design Decisions

1. **`Map<number, number>` over `Record`** — The map only contains entries for words that have been hinted. This makes it trivial to check "has this word been hinted?" and avoids sparse array issues.

2. **`onAutoFill` callback** — When a word reaches hint level 3, we call back into `useDictation`'s `handleInputChange` to fill the input. This keeps the hint hook decoupled from the input state (DIP).

3. **`requestHintForFocused`** — Uses `document.activeElement` to find which input is focused, reads a `data-word-index` attribute (added in Phase 3), and calls `requestHint`. This enables the `Alt+H` keyboard shortcut without the page needing to track "which word is focused."

4. **No persistence** — Hint state is ephemeral. It resets on sentence change and is never sent to the backend. The score penalty is calculated at check-time in `useDictation` (Phase 4).

## Acceptance Criteria

- [ ] File created at `dictation/_hooks/useDictationHints.ts`
- [ ] Hook exports `useDictationHints` function
- [ ] `hintLevels` starts as empty Map and resets on `sentenceId` change
- [ ] `requestHint(idx)` increments from 0→1→2→3, no-ops at 3+
- [ ] `requestHint(idx)` no-ops when `isChecked === true`
- [ ] `requestHint(idx)` no-ops when `idx` is not in `hiddenIndices`
- [ ] When hint reaches level 3, `onAutoFill(idx, word)` is called
- [ ] `totalHintsUsed` returns sum of all hint levels
- [ ] `getHintLevel(idx)` returns 0 for un-hinted words
- [ ] Hook stays under 80 lines (SRP)
