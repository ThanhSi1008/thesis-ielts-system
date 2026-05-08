# Dictation Hint System — Implementation Plan

> **Goal**: Add a progressive hint system to dictation practice that reveals letter clues when students are stuck, with score penalties to maintain learning challenge.
>
> **Risk**: LOW — purely additive, no breaking changes  
> **Estimated Effort**: Small–Medium (1–2 sessions)  
> **Dependencies**: None (works with current codebase as-is)

---

## Problem Statement

When a student is stuck on a hidden word in dictation, their only options are:
1. Guess blindly
2. Press "Check" to fail and see the answer via the correction tooltip

There is no middle ground. This causes **frustration on hard words** and encourages brute-force checking rather than genuine recall effort.

## Solution: 3-Level Progressive Hints

Each hidden word gets an individual hint button. Hints reveal letters progressively with increasing score penalties:

| Level | What's Revealed | Score Penalty | Example (`"investigation"`) |
|:---:|:---|:---:|:---|
| **0** | Nothing (default) | 0% | `____________` |
| **1** | First letter | −25% | `i___________` |
| **2** | First + last letter | −50% | `i__________n` |
| **3** | Full word (auto-fill) | −100% (0 pts) | `investigation` |

## Phases

| Phase | File | Description |
|:---|:---|:---|
| **Phase 1** | `01-constants-and-types.md` | Add hint constants, types, and utility functions |
| **Phase 2** | `02-hook-logic.md` | Create `useDictationHints` hook |
| **Phase 3** | `03-ui-components.md` | Build HintButton, update DictationInputRow |
| **Phase 4** | `04-wiring-and-shortcuts.md` | Wire into practice page + keyboard shortcut |

> **Phases are sequential** — each builds on the previous.

---

## Files Touched (Summary)

| File | Change |
|:---|:---|
| `dictation/_constants.ts` | Add `HINT_LEVELS`, `HINT_PENALTIES` constants |
| `dictation/_hooks/useDictationHints.ts` | **NEW** — hint state management hook |
| `dictation/_hooks/useDictation.ts` | Import hint penalties into score calculation |
| `dictation/_components/HintButton.tsx` | **NEW** — per-word hint trigger button |
| `dictation/_components/DictationInputRow.tsx` | Add HintButton + placeholder text from hints |
| `dictation/_hooks/useDictationShortcuts.ts` | Add `Alt+H` shortcut for hint on focused word |
| `dictation/[id]/page.tsx` | Wire `useDictationHints` into the page |

---

## Architecture Decision: Frontend-Only

Hints are **purely a frontend feature**. No backend or schema changes needed because:
- Hint state is ephemeral (resets per sentence, not persisted)
- Score penalties are applied client-side before sending the final score to the backend
- If the future `sentenceScores` feature (v4/01) is implemented, hint usage can be included in the score calculation transparently

If analytics tracking of hint usage is desired later, it can be added as an optional field in the progress DTO without changing the hint system itself.
