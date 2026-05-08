# Phase 4 — Wiring, Score Penalty, and Keyboard Shortcut

> **Effort**: ~20 minutes  
> **Files**: 3 modified  
> **Dependencies**: Phase 1, 2, 3

---

## Goal

Wire everything together:
1. Integrate `useDictationHints` into the practice page
2. Apply hint penalties to score calculation in `useDictation`
3. Add `Alt+H` keyboard shortcut for hints

---

## 4.1 Score Penalty in `useDictation.ts`

**File:** `frontend-web/src/app/shadowing-dictation/dictation/_hooks/useDictation.ts`

### Current `checkAnswers()` (lines 47-60)

```typescript
const checkAnswers = () => {
  if (!currentSentence?.words) return false;
  let allCorrect = true;
  currentSentence.words.forEach((word, idx) => {
    if (hiddenIndices.has(idx)) {
      if (normalizeWord(userInputs[idx]) !== normalizeWord(word)) {
        allCorrect = false;
      }
    }
  });
  setIsChecked(true);
  setIsAllCorrect(allCorrect);
  return allCorrect;
};
```

### New `checkAnswers()` — accepts hint levels, returns score

The function signature changes to accept a `getHintLevel` function and return a score object instead of a boolean.

```typescript
// NEW import at top of file
import { normalizeWord, HINT_SCORE_MULTIPLIERS } from '../_constants';

// NEW interface (add above the hook function)
export interface CheckResult {
  isAllCorrect: boolean;
  score: number;       // 0-100, after hint penalties
  correctCount: number;
  totalHidden: number;
}

// CHANGED: accept getHintLevel parameter
export function useDictation(
  currentSentence: DictationSentence | undefined,
  difficulty: string,
  getHintLevel: (wordIndex: number) => number,  // NEW PARAMETER
) {
  // ... existing state ...

  const checkAnswers = (): CheckResult => {
    if (!currentSentence?.words) {
      return { isAllCorrect: false, score: 0, correctCount: 0, totalHidden: 0 };
    }

    let correctCount = 0;
    let weightedScore = 0;
    const totalHidden = hiddenIndices.size;

    currentSentence.words.forEach((word, idx) => {
      if (!hiddenIndices.has(idx)) return;

      const isMatch = normalizeWord(userInputs[idx]) === normalizeWord(word);
      if (isMatch) {
        correctCount++;
        // Apply hint penalty: multiply by score multiplier for this word's hint level
        const hintLevel = getHintLevel(idx);
        const multiplier = HINT_SCORE_MULTIPLIERS[Math.min(hintLevel, HINT_SCORE_MULTIPLIERS.length - 1)];
        weightedScore += multiplier;
      }
      // Wrong answer = 0 points regardless of hints
    });

    const score = totalHidden > 0
      ? Math.round((weightedScore / totalHidden) * 100)
      : 100;
    const isAllCorrect = correctCount === totalHidden;

    setIsChecked(true);
    setIsAllCorrect(isAllCorrect);
    return { isAllCorrect, score, correctCount, totalHidden };
  };

  // ... rest unchanged (retry, return) ...

  return {
    userInputs,
    handleInputChange,
    hiddenIndices,
    isChecked,
    isAllCorrect,
    checkAnswers,
    retry,
  };
}
```

### Score Calculation Example

Sentence: `"The quick brown fox jumps"` (5 words)  
Difficulty: `Expert` (100% hidden = 5 hidden words)

| Word | Correct? | Hint Level | Multiplier | Points |
|:---|:---:|:---:|:---:|:---:|
| The | ✅ | 0 | 1.0 | 1.0 |
| quick | ✅ | 1 | 0.75 | 0.75 |
| brown | ✅ | 2 | 0.5 | 0.5 |
| fox | ✅ | 3 (auto-filled) | 0.0 | 0.0 |
| jumps | ❌ | 0 | — | 0.0 |

**Score** = `(1.0 + 0.75 + 0.5 + 0.0 + 0.0) / 5 × 100` = **45%**

---

## 4.2 Keyboard Shortcut

**File:** `frontend-web/src/app/shadowing-dictation/dictation/_hooks/useDictationShortcuts.ts`

### Current shortcuts (lines 1-61)

Add `onHint` callback and `Alt+H` binding.

```diff
 interface DictationShortcutConfig {
   onCheck?: () => void;
   onNext?: () => void;
   onRepeat?: () => void;
   onToggleSpeed?: () => void;
   onCycleDifficulty?: () => void;
   onRetry?: () => void;
+  onHint?: () => void;        // NEW
   canCheck: boolean;
   canGoNext: boolean;
   canRetry?: boolean;
 }

 export function useDictationShortcuts({
   ...
   onRetry,
+  onHint,
   canCheck,
   canGoNext,
   canRetry,
 }: DictationShortcutConfig) {
   useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
       // ... existing Enter logic ...

       // Alt shortcuts
       if (e.altKey) {
         if (e.key.toLowerCase() === 'r') {
           e.preventDefault();
           onRepeat?.();
         } else if (e.key.toLowerCase() === 's') {
           e.preventDefault();
           onToggleSpeed?.();
         } else if (e.key.toLowerCase() === 'm') {
           e.preventDefault();
           onCycleDifficulty?.();
+        } else if (e.key.toLowerCase() === 'h') {  // NEW
+          e.preventDefault();
+          onHint?.();
         }
       }
     };

     window.addEventListener('keydown', handleKeyDown);
     return () => window.removeEventListener('keydown', handleKeyDown);
-  }, [onCheck, onNext, onRepeat, onToggleSpeed, onCycleDifficulty, onRetry, canCheck, canGoNext, canRetry]);
+  }, [onCheck, onNext, onRepeat, onToggleSpeed, onCycleDifficulty, onRetry, onHint, canCheck, canGoNext, canRetry]);
 }
```

---

## 4.3 Practice Page Wiring

**File:** `frontend-web/src/app/shadowing-dictation/dictation/[id]/page.tsx`

### Changes Required

#### 4.3.1 — Import and instantiate `useDictationHints`

```diff
 import { useDictation } from '../_hooks/useDictation';
+import { useDictationHints } from '../_hooks/useDictationHints';
 import { useDictationShortcuts } from '../_hooks/useDictationShortcuts';
```

After the existing `useDictation` call (line 80-88):

```typescript
// EXISTING (line 80-88):
const {
  userInputs,
  handleInputChange,
  hiddenIndices,
  isChecked,
  isAllCorrect,
  checkAnswers,
  retry,
} = useDictation(currentSentence as any, difficulty, getHintLevel); // CHANGED: pass getHintLevel

// NEW: add after useDictation
const {
  getHintLevel,
  requestHint,
  requestHintForFocused,
  totalHintsUsed,
} = useDictationHints({
  words: currentSentence?.words,
  hiddenIndices,
  sentenceId: currentSentence?.id,
  onAutoFill: handleInputChange,
  isChecked,
});
```

> **Important ordering note:** `useDictationHints` needs `hiddenIndices` from `useDictation`, and `useDictation` needs `getHintLevel` from `useDictationHints`. This is a circular dependency.
>
> **Resolution:** Initialize `useDictationHints` first with a no-op `getHintLevel`, then pass the real one. OR simpler: make `useDictation` accept `getHintLevel` as a parameter and call the hooks in this order:
> 1. Call `useDictationHints` first (it only needs `hiddenIndices` which is computed inside `useDictation`)
>
> **Recommended approach:** Extract `hiddenIndices` computation into `useDictation` but keep `checkAnswers` accepting `getHintLevel` as a parameter at call-time instead of hook-time:

```typescript
// CLEANER approach — pass getHintLevel at check-time, not hook-time:

const {
  userInputs, handleInputChange, hiddenIndices,
  isChecked, isAllCorrect, checkAnswers, retry,
} = useDictation(currentSentence as any, difficulty);

const {
  getHintLevel, requestHint, requestHintForFocused, totalHintsUsed,
} = useDictationHints({
  words: currentSentence?.words,
  hiddenIndices,
  sentenceId: currentSentence?.id,
  onAutoFill: handleInputChange,
  isChecked,
});

// Then in handleCheck:
const handleCheck = () => {
  checkAnswers(getHintLevel);  // pass at call-time
};
```

This means `useDictation.checkAnswers` signature becomes:
```typescript
const checkAnswers = (getHintLevel?: (idx: number) => number): CheckResult => { ... }
```

With a fallback: `const hintLevel = getHintLevel?.(idx) ?? 0;`

#### 4.3.2 — Pass hint props to DictationInputRow

```diff
 <DictationInputRow
   sentence={currentSentence as any}
   userInputs={userInputs}
   onInputChange={handleInputChange}
   hiddenIndices={hiddenIndices}
   isChecked={isChecked}
   normalizeWord={normalizeWord}
+  getHintLevel={getHintLevel}
+  onRequestHint={requestHint}
 />
```

#### 4.3.3 — Add hint shortcut

```diff
 useDictationShortcuts({
   onCheck: handleCheck,
   onNext: handleNext,
   onRepeat: playCurrentSentence,
   onToggleSpeed: toggleSpeed,
   onRetry: retry,
+  onHint: requestHintForFocused,
   canCheck: !isChecked,
   canRetry: isChecked && !isAllCorrect,
   canGoNext: isChecked && isAllCorrect && currentIndex < totalSentences - 1,
 });
```

---

## Final Integration Test Scenarios

### Scenario 1: Basic hint flow
1. Start a dictation lesson
2. Focus a hidden word input
3. Click the lightbulb → placeholder shows first letter (e.g., `"i..."`)
4. Click again → placeholder shows first+last (e.g., `"i...n"`)
5. Click again → input auto-fills with the correct word, lightbulb dims
6. Check answer → word is "correct" but score reflects penalty

### Scenario 2: Keyboard shortcut
1. Focus a hidden word input
2. Press `Alt+H` → hint level increases
3. Press `Alt+H` again → next hint level
4. Works across different inputs as focus changes

### Scenario 3: Score penalty
1. Fill 3 words correctly without hints → full credit
2. Use 1 hint on word 4 (level 1) → 75% credit for that word
3. Use 3 hints on word 5 (auto-filled) → 0% credit
4. Final score reflects weighted average

### Scenario 4: Reset on sentence change
1. Use hints on sentence 1
2. Move to sentence 2 → all hint levels reset to 0
3. Lightbulb buttons all appear gray/inactive

### Scenario 5: Disabled after check
1. Click "Check Answer"
2. All lightbulb buttons disappear (not just disabled)
3. Hint state is preserved for score calculation but UI is clean

---

## Acceptance Criteria

- [ ] `useDictation.checkAnswers()` accepts optional `getHintLevel` and returns `CheckResult` with `score`
- [ ] Score correctly applies `HINT_SCORE_MULTIPLIERS` per word
- [ ] `Alt+H` triggers hint on the currently focused input
- [ ] `useDictationHints` is instantiated in the practice page
- [ ] `DictationInputRow` receives and uses `getHintLevel` + `onRequestHint`
- [ ] All 5 test scenarios pass
- [ ] No regressions: existing check/retry/next flow works without hints
- [ ] Practice page stays under 120 lines of JSX (composition only)
