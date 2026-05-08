# Phase 1 — Constants and Types

> **Effort**: ~10 minutes  
> **Files**: 1 modified  
> **Dependencies**: None

---

## Goal

Add hint-related constants and a utility function to the existing dictation constants file.

## File: `frontend-web/src/app/shadowing-dictation/dictation/_constants.ts`

### Current Content (full file, 13 lines)

```typescript
export const SPEED_PRESETS = [0.25, 0.5, 0.75, 1.0, 2.0] as const;
export const WAVEFORM_HEIGHTS = [30, 50, 80, 100, 70, 40, 20];
export const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;

export const normalizeWord = (w: string) =>
  w.toLowerCase().replace(/[.,!?'"]/g, '').trim();

export const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};
```

### What to Add (append after the existing code)

```typescript
// ── Hint System ──

/** Maximum hint level per word (0 = no hint, 3 = fully revealed) */
export const MAX_HINT_LEVEL = 3;

/** Score multiplier per hint level. Applied per-word, not per-sentence.
 *  Level 0 = full credit, Level 1 = 75%, Level 2 = 50%, Level 3 = 0% */
export const HINT_SCORE_MULTIPLIERS = [1.0, 0.75, 0.5, 0.0] as const;

/**
 * Generate the placeholder/hint text for a word at a given hint level.
 *
 * @param word    The correct word (e.g. "investigation")
 * @param level   0 = no hint, 1 = first letter, 2 = first+last, 3 = full word
 * @returns       The hint string to show as placeholder or pre-filled value
 *
 * Examples for "investigation":
 *   level 0 → "_"
 *   level 1 → "i..."
 *   level 2 → "i...n"
 *   level 3 → "investigation"
 */
export const getHintText = (word: string, level: number): string => {
  if (level <= 0 || word.length === 0) return '_';
  if (level >= MAX_HINT_LEVEL) return word;

  const clean = word.replace(/[.,!?'"]/g, ''); // strip punctuation for hint display
  if (level === 1) return `${clean[0]}...`;
  if (level === 2 && clean.length > 1) return `${clean[0]}...${clean[clean.length - 1]}`;

  return '_';
};
```

## Acceptance Criteria

- [ ] `MAX_HINT_LEVEL` is exported and equals `3`
- [ ] `HINT_SCORE_MULTIPLIERS` has 4 entries: `[1.0, 0.75, 0.5, 0.0]`
- [ ] `getHintText("investigation", 0)` returns `"_"`
- [ ] `getHintText("investigation", 1)` returns `"i..."`
- [ ] `getHintText("investigation", 2)` returns `"i...n"`
- [ ] `getHintText("investigation", 3)` returns `"investigation"`
- [ ] `getHintText("I", 1)` returns `"I..."` (single-char word)
- [ ] Existing constants (`SPEED_PRESETS`, `normalizeWord`, etc.) are untouched
