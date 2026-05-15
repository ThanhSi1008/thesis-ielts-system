# Dictation & Shadowing — Business Logic Improvement Suggestions

## Current State Summary

After reviewing the full stack — Prisma models, backend services, frontend hooks, and UI components — here's what your system currently does:

| Feature | Current Behavior |
|:---|:---|
| **Dictation** | Plays a sentence → hides words based on difficulty ratio (30%–100%) → user fills blanks → binary check (correct/incorrect) → marks sentence completed → moves to next |
| **Shadowing** | Plays a sentence → user records themselves → Web Speech API compares spoken words → word-by-word green/red coloring → user self-marks "Done" → moves to next |
| **Progress** | Both store a flat `completedSentences: number[]` — no score, no attempt count, no timestamps |
| **Gamification** | XP on sentence completion (+2) and lesson completion (+15). Achievements for dictation Expert mode and shadowing milestones |

---

## 🔴 Category 1: Scoring & Analytics (High Impact)

### 1. Per-Sentence Accuracy Score

**Current gap:** `checkAnswers()` in `useDictation.ts` returns a boolean `isAllCorrect`. There's no per-sentence score stored. The backend only knows *which* sentences were completed, not *how well*.

**Suggestion:** Calculate and persist an accuracy score per sentence.

```
score = correctWords / hiddenWords × 100
```

**Backend schema change:**
```prisma
model DictationProgress {
  // ... existing fields
  sentenceScores  Json?  // { [sentenceIndex: number]: { score: number, attempts: number, lastAttemptAt: string } }
}
```

**Why this matters:** Without scores, a student who gets 2/10 words right and one who gets 9/10 are treated identically after retrying. This makes the completion percentage meaningless as a learning metric.

---

### 2. Attempt Tracking (Retry Count per Sentence)

**Current gap:** The `retry()` function in `useDictation.ts` simply resets `isChecked` — no attempt count is tracked. The backend has zero visibility into how many tries a sentence took.

**Suggestion:** Track `attemptCount` per sentence. This feeds into:
- Adaptive difficulty (sentences that took 5+ attempts → flag as "difficult")
- Completion quality reports ("You completed 20 sentences, but 8 required 3+ attempts")
- Gamification (bonus XP for first-attempt correct)

---

### 3. Shadowing Pronunciation Score (Beyond Word Matching)

**Current gap:** `ActiveSentenceDisplay.tsx` does a naive word-by-word comparison (`normalizeWord(spoken) === normalizeWord(expected)`). This is a binary match with no scoring gradient.

**Suggestion:** Implement a **Levenshtein-based similarity score** for shadowing:

```typescript
// Instead of binary match:
const similarity = 1 - (levenshtein(spoken, expected) / Math.max(spoken.length, expected.length));
// Yellow for partial (0.5-0.8), Green for good (>0.8), Red for poor (<0.5)
```

This also enables a **sentence-level shadowing score** that can be persisted, which currently doesn't exist at all — shadowing progress is purely "done/not done" with no quality metric.

---

## 🟡 Category 2: Spaced Repetition & Adaptive Learning (Medium-High Impact)

### 4. Weak Sentence Review Queue

**Current gap:** Once a sentence is marked completed, it never resurfaces. There is no review mechanism.

**Suggestion:** Introduce a "Review Mode" that resurfaces sentences where:
- Accuracy was below a threshold (e.g., < 80%)
- The sentence took 3+ attempts
- It's been > 7 days since last practice (spaced repetition)

This could reuse your existing FSRS infrastructure from the Flashcard system (`Flashcard` model with stability/difficulty/elapsedDays).

---

### 5. Adaptive Difficulty Adjustment

**Current gap:** Difficulty is user-selected and static for the entire lesson. The ratio mapping is:
```
Beginner: 30%, Intermediate: 50%, Advanced: 70%, Expert: 100%
```

**Suggestion:** Auto-adjust difficulty within a session based on performance:
- 3 consecutive first-attempt correct → increase hidden word ratio by 10%
- 2 consecutive failures → decrease by 10%
- This creates a "flow state" zone where the challenge matches the student's ability

The user-selected difficulty remains as the starting point, but the system dynamically tunes the gap-fill ratio.

---

### 6. Smart Word Selection for Dictation Gaps

**Current gap:** `hiddenIndices` in `useDictation.ts` uses a random shuffle to select which words to hide. This means articles ("a", "the") and content words ("investigation", "subsequently") have equal chance of being hidden.

**Suggestion:** Prioritize hiding **content words** (nouns, verbs, adjectives, adverbs) over function words (articles, prepositions, conjunctions). This is pedagogically more effective because:
- Content words carry meaning and are harder to recall
- Function words are largely guessable from grammar context
- Students practice the words that actually matter for comprehension

**Implementation:** Maintain a `FUNCTION_WORDS` set and weight the shuffle to prefer non-function-word indices.

```typescript
const FUNCTION_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'am',
  'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'and', 'or', 'but', 'so', 'yet', 'nor',
  'i', 'you', 'he', 'she', 'it', 'we', 'they',
  'my', 'your', 'his', 'her', 'its', 'our', 'their',
]);
```

---

## 🟢 Category 3: Shadowing-Specific Enhancements (Medium Impact)

### 7. Multi-Pass Shadowing Workflow

**Current gap:** The shadowing flow is single-pass: listen → record → self-mark done. There's no structured practice loop.

**Suggestion:** Implement a **3-step shadowing workflow** per sentence:

| Step | Action | Purpose |
|:---|:---|:---|
| **1. Listen** | Play sentence, read along (text visible) | Comprehension |
| **2. Shadow** | Play sentence, speak simultaneously (text visible) | Rhythm & intonation |
| **3. Recall** | Text hidden, speak from memory | Production |

The user must pass Step 2 (score ≥ 70%) before unlocking Step 3. This mirrors proven shadowing pedagogy from language teaching methodology.

---

### 8. Playback Comparison (Side-by-Side Audio)

**Current gap:** `useRecording.ts` captures the user's audio via MediaRecorder and provides `recordedAudioUrl` for playback, but there's no structured way to compare it with the original sentence audio.

**Suggestion:** Add an "A/B Compare" button that:
1. Plays the original sentence audio segment
2. Immediately follows with the user's recorded audio
3. Allows toggling back and forth

This is the single most effective technique in shadowing practice — hearing the difference between your pronunciation and the native speaker's.

---

### 9. Speed Progression Tracking

**Current gap:** Playback speed is a user preference (`SPEED_PRESETS = [0.25, 0.5, 0.75, 1.0, 2.0]`) with no tracking or guidance.

**Suggestion:** Track which speed the student successfully practices each sentence at:
- First practice at 0.5x → then 0.75x → then 1.0x
- A sentence is only "truly mastered" when completed at 1.0x speed
- Visual indicator showing the max speed achieved per sentence

This creates a natural difficulty progression within each lesson.

---

## 🔵 Category 4: UX & Engagement (Nice-to-Have)

### 10. Session Statistics Summary

**Current gap:** The completion screen (`DictationCompletionScreen.tsx` / `ShadowingCompletionScreen.tsx`) only shows "Congratulations! You completed X sentences." No stats.

**Suggestion:** Show a rich session summary:
- ⏱ Time spent
- 📊 Average accuracy score
- 🎯 First-attempt success rate
- 🔥 Hardest sentences (lowest score)
- 📈 Improvement vs. last session (if re-practicing)

---

### 11. Sentence Bookmarking for Review

**Current gap:** No way to flag a sentence as "I want to come back to this." The only state is "completed" or "not completed."

**Suggestion:** Add a bookmark/star button per sentence. Bookmarked sentences appear in a dedicated "Review" tab alongside the regular library. This is low-effort but very high-value for self-directed learners.

---

### 12. Dictation Hint System

**Current gap:** When a student is stuck on a word, their only option is to guess or skip. There's no progressive hint system.

**Suggestion:** Allow hints with a penalty:
- **Hint 1:** Show the first letter → score penalty: -25%
- **Hint 2:** Show first + last letter → score penalty: -50%  
- **Hint 3:** Reveal the word → score: 0% for that word

This prevents frustration while maintaining the learning challenge. Track hint usage per sentence for analytics.

---

## Priority Recommendation

If I had to pick the **top 3** changes that would have the most impact on learning effectiveness with reasonable implementation effort:

| Priority | Suggestion | Effort | Impact |
|:---:|:---|:---:|:---:|
| 🥇 | **#1 Per-Sentence Accuracy Score** + **#2 Attempt Tracking** | Medium | Very High |
| 🥈 | **#6 Smart Word Selection** | Low | High |
| 🥉 | **#12 Dictation Hint System** | Low-Medium | High |

These three together transform dictation from a "fill-and-check" exercise into a genuine learning tool with measurable progress and intelligent assistance.

---

> [!NOTE]
> All suggestions are designed to be **incremental** — each can be implemented independently without disrupting the existing system. The Prisma schema changes use `Json?` optional fields so existing data remains compatible.

Let me know which suggestions interest you and I can create a detailed implementation plan for any of them!
