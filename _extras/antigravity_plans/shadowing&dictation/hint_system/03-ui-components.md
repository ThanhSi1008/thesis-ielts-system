# Phase 3 — UI Components

> **Effort**: ~30 minutes  
> **Files**: 1 new, 1 modified  
> **Dependencies**: Phase 1 (constants), Phase 2 (hook)

---

## Goal

1. Create a `HintButton` component — a small lightbulb icon button shown next to each hidden word input
2. Update `DictationInputRow` to render `HintButton` and use hint-based placeholder text

---

## 3.1 New File: `HintButton.tsx`

**Path:** `frontend-web/src/app/shadowing-dictation/dictation/_components/HintButton.tsx`

### Specification

A small, unobtrusive button that sits below each hidden word input. Shows a lightbulb icon with a visual indicator of how many hint levels have been used.

```typescript
// File: dictation/_components/HintButton.tsx

import { Lightbulb } from 'lucide-react';
import { MAX_HINT_LEVEL } from '../_constants';

export interface HintButtonProps {
  /** Current hint level for this word (0–3) */
  hintLevel: number;
  /** Callback when user clicks for next hint */
  onRequestHint: () => void;
  /** Whether to disable the button (checked state or max level) */
  disabled: boolean;
}

export default function HintButton({
  hintLevel,
  onRequestHint,
  disabled,
}: HintButtonProps) {
  const isMaxed = hintLevel >= MAX_HINT_LEVEL;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onRequestHint();
      }}
      disabled={disabled || isMaxed}
      className={`
        mt-1 p-1 rounded-md text-xs flex items-center gap-0.5
        transition-all duration-200
        ${isMaxed
          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
          : hintLevel > 0
            ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'
            : 'text-gray-400 dark:text-gray-500 hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-gray-800'
        }
        disabled:opacity-40 disabled:cursor-not-allowed
      `}
      title={isMaxed ? 'Word revealed' : `Hint (${hintLevel}/${MAX_HINT_LEVEL})`}
    >
      <Lightbulb className="w-3.5 h-3.5" />
      {hintLevel > 0 && !isMaxed && (
        <span className="font-medium">{hintLevel}</span>
      )}
    </button>
  );
}
```

### Visual Behavior

| State | Icon Color | Extra |
|:---|:---|:---|
| `hintLevel === 0` | Gray | No badge |
| `hintLevel === 1` | Amber | Shows "1" |
| `hintLevel === 2` | Amber | Shows "2" |
| `hintLevel === 3` | Gray (dimmed) | Disabled, no badge |
| `isChecked === true` | Any | Disabled |

---

## 3.2 Modified File: `DictationInputRow.tsx`

**Path:** `frontend-web/src/app/shadowing-dictation/dictation/_components/DictationInputRow.tsx`

### Changes Required

#### 3.2.1 — Add new props to `DictationInputRowProps`

```typescript
// ADD these to the existing interface (lines 4-11)
export interface DictationInputRowProps {
  sentence: DictationSentence;
  userInputs: string[];
  onInputChange: (index: number, value: string) => void;
  hiddenIndices: Set<number>;
  isChecked: boolean;
  normalizeWord: (w: string) => string;
  // NEW props:
  getHintLevel: (wordIndex: number) => number;        // from useDictationHints
  onRequestHint: (wordIndex: number) => void;          // from useDictationHints.requestHint
}
```

#### 3.2.2 — Add `data-word-index` attribute to each input

This enables the `requestHintForFocused()` function from Phase 2 to identify which word is focused.

**Current** (line 96-114):
```tsx
<input
  ref={(el) => { inputsRef.current[idx] = el; }}
  type="text"
  value={userInput}
  onChange={(e) => onInputChange(idx, e.target.value)}
  onKeyDown={(e) => handleKeyDown(e, idx)}
  disabled={isChecked}
  className={...}
  style={...}
  placeholder="_"
  autoComplete="off"
  spellCheck="false"
/>
```

**New** — add `data-word-index` and dynamic placeholder:
```tsx
<input
  ref={(el) => { inputsRef.current[idx] = el; }}
  type="text"
  value={userInput}
  onChange={(e) => onInputChange(idx, e.target.value)}
  onKeyDown={(e) => handleKeyDown(e, idx)}
  disabled={isChecked}
  data-word-index={idx}                                    // NEW
  className={...}
  style={...}
  placeholder={getHintText(rawCorrect, getHintLevel(idx))} // NEW — dynamic placeholder
  autoComplete="off"
  spellCheck="false"
/>
```

Import `getHintText` from `'../_constants'` at the top of the file.

#### 3.2.3 — Render `HintButton` below each hidden word input

**Current** (lines 94-121, the hidden word render block):
```tsx
return (
  <div key={idx} className="relative flex flex-col items-center">
    <input ... />
    {isChecked && !isMatch && (
      <div className="absolute top-full mt-1 ...">
        {rawCorrect}
      </div>
    )}
  </div>
);
```

**New** — add HintButton between input and correction tooltip:
```tsx
return (
  <div key={idx} className="relative flex flex-col items-center">
    <input ... />
    {/* Hint button — only show when not checked */}
    {!isChecked && (
      <HintButton
        hintLevel={getHintLevel(idx)}
        onRequestHint={() => onRequestHint(idx)}
        disabled={isChecked}
      />
    )}
    {isChecked && !isMatch && (
      <div className="absolute top-full mt-1 ...">
        {rawCorrect}
      </div>
    )}
  </div>
);
```

#### 3.2.4 — Add visual indicator for hinted words (border color)

Update the `stateClass` logic (line 87-92) to show a subtle amber border when a word has been hinted but not yet checked:

```typescript
let stateClass = 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 ...';

const wordHintLevel = getHintLevel(idx);

// If hinted but not checked, show amber border
if (!isChecked && wordHintLevel > 0) {
  stateClass = 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-300 dark:border-amber-700 text-gray-900 dark:text-gray-100 focus:ring-amber-400 focus:border-amber-400';
}

if (isChecked) {
  stateClass = isMatch
    ? 'bg-green-50 dark:bg-green-900/20 border-green-500 ...'
    : 'bg-red-50 dark:bg-red-900/20 border-red-400 ...';
}
```

---

## Full Modified `DictationInputRow.tsx` — Change Summary

```diff
 import React, { useRef, useEffect } from 'react';
 import { DictationSentence } from '@/services/dictation.api';
+import { getHintText } from '../_constants';
+import HintButton from './HintButton';

 export interface DictationInputRowProps {
   sentence: DictationSentence;
   userInputs: string[];
   onInputChange: (index: number, value: string) => void;
   hiddenIndices: Set<number>;
   isChecked: boolean;
   normalizeWord: (w: string) => string;
+  getHintLevel: (wordIndex: number) => number;
+  onRequestHint: (wordIndex: number) => void;
 }

 export default function DictationInputRow({
   ...
   normalizeWord,
+  getHintLevel,
+  onRequestHint,
 }: DictationInputRowProps) {
   // ... existing code ...

   // Inside the hidden word render block:
+  const wordHintLevel = getHintLevel(idx);
+
   let stateClass = '...';
+  if (!isChecked && wordHintLevel > 0) {
+    stateClass = 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-300 ...';
+  }
   if (isChecked) { ... }

   return (
     <div key={idx} className="relative flex flex-col items-center">
       <input
         ...
+        data-word-index={idx}
-        placeholder="_"
+        placeholder={getHintText(rawCorrect, wordHintLevel)}
       />
+      {!isChecked && (
+        <HintButton
+          hintLevel={wordHintLevel}
+          onRequestHint={() => onRequestHint(idx)}
+          disabled={isChecked}
+        />
+      )}
       {isChecked && !isMatch && ( ... )}
     </div>
   );
```

---

## Acceptance Criteria

- [ ] `HintButton.tsx` created at `dictation/_components/HintButton.tsx`
- [ ] HintButton renders a `Lightbulb` icon with proper color states
- [ ] HintButton is disabled when `isChecked` or hint level is maxed
- [ ] HintButton calls `onRequestHint` on click (without propagation)
- [ ] `DictationInputRow` accepts `getHintLevel` and `onRequestHint` props
- [ ] Each hidden input has `data-word-index={idx}` attribute
- [ ] Placeholder dynamically shows hint text (`"_"`, `"i..."`, `"i...n"`, full word)
- [ ] Hinted words show amber border styling before check
- [ ] HintButton is only visible when `!isChecked`
- [ ] Component stays under 120 lines (existing is 127, additions are offset by extraction)
