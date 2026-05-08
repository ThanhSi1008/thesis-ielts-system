# Gamification Suggestions for IELTS Learning Platform

After reading through the entire codebase — the Prisma schema, all frontend routes, backend services, and UI components — here are targeted gamification ideas ranked by **impact vs. implementation effort**, grounded in what your codebase already supports.

---

## 1. 🔥 Daily Streak System
**Effort: Low** · **Impact: Very High**

Your app already tracks `createdAt` on every session, progress record, and flashcard review. A streak counter is essentially free.

### What to build
- A new `UserStreak` model (or fields on `User`/`IeltsProfile`): `currentStreak`, `longestStreak`, `lastActiveDate`
- Backend middleware that bumps the streak on any authenticated activity (submitting an exercise, reviewing a flashcard, completing a shadowing sentence)
- A **fire icon + streak counter** in the Header next to the user avatar — visible everywhere

### Why it works
The IELTS Basic roadmap already has a "Day 1, Day 2…" structure. A streak directly reinforces that daily cadence. Losing a streak creates *loss aversion* — one of the strongest motivators in behavioral design.

### Where it plugs in
- [Header.tsx](file:///c:/Users/Admin/Desktop/thesis/my%20videos/thesis-toeic-system/frontend-web/src/components/Header.tsx) — display streak badge
- [IeltsProfile](file:///c:/Users/Admin/Desktop/thesis/my%20videos/thesis-toeic-system/backend-core/prisma/schema.prisma#L833-L847) — already has `dailyCommitmentMins`, streak is a natural sibling field

---

## 2. ⭐ XP Points & Level System
**Effort: Medium** · **Impact: Very High**

### What to build
- Award **XP** for every meaningful action:
  | Action | XP |
  |---|---|
  | Complete a Basic roadmap lesson | +20 |
  | Complete a Basic exercise | +30 |
  | Submit an Advanced listening/reading part | +50 |
  | Score 100% on any exercise | +25 bonus |
  | Review 10 flashcards in Vocab Lab | +15 |
  | Complete a shadowing sentence | +5 |
  | Maintain a 7-day streak | +100 bonus |

- **Levels** derived from cumulative XP (e.g., Level 1 = 0 XP, Level 5 = 500 XP, Level 10 = 2000 XP)
- Display a **level badge + XP progress bar** in the Header and on the IELTS hub page

### Where it plugs in
- Add `totalXp Int @default(0)` to the `User` model
- Every service that creates a session/progress record calls a shared `awardXp()` utility
- The IELTS hub page ([ielts/page.tsx](file:///c:/Users/Admin/Desktop/thesis/my%20videos/thesis-toeic-system/frontend-web/src/app/ielts/page.tsx)) can show the level beside the roadmap steps

---

## 3. 🏆 Achievement Badges
**Effort: Medium** · **Impact: High**

### Suggested achievements (mapped to existing features)

| Badge | Trigger | Module |
|---|---|---|
| 🎧 **First Listen** | Complete first Advanced Listening part | `IeltsPracticeSession` |
| 📖 **Bookworm** | Complete all 3 Advanced Reading parts | `IeltsPracticeReadingSession` |
| 🔥 **On Fire** | Maintain a 7-day streak | Streak system |
| 💯 **Perfect Score** | Score 100% on any exercise | Any session |
| 📚 **Vocabulary Hero** | Learn 100 words across all units | `VocabularyProgress.wordsLearned` |
| 🗣️ **Echo Master** | Complete 50 shadowing sentences | `ShadowingDictationProgress` |
| 🎯 **Sharpshooter** | Score >80% across 5 consecutive Advanced tests | `IeltsPracticeSession` |
| 📝 **Grammar Guru** | Complete 20 grammar exercises | `GrammarExercise` progress |
| 🌟 **Road Scholar** | Complete the entire Basic roadmap | `IeltsBasicProgress` |

### Where it plugs in
- New `Achievement` and `UserAchievement` models
- A shared `checkAchievements(userId)` function called after every scoring event
- Toast notification ([Toaster.tsx](file:///c:/Users/Admin/Desktop/thesis/my%20videos/thesis-toeic-system/frontend-web/src/components/Toaster.tsx)) for real-time celebration
- A `/profile/achievements` page to showcase earned badges

---

## 4. 📊 Skill Radar Chart on Statistics Page
**Effort: Low** · **Impact: Medium-High**

Your [Statistics page](file:///c:/Users/Admin/Desktop/thesis/my%20videos/thesis-toeic-system/frontend-web/src/app/ielts/statistics/page.tsx) is currently a placeholder. You already have `scoreData` on every session broken down by question type.

### What to build
- A **radar/spider chart** (using Chart.js or Recharts) plotting accuracy across question types: `form_completion`, `multiple_choice`, `matching`, `true_false_not_given`, `note_completion`, `summary_completion`, etc.
- A **progress-over-time line chart** showing score trends per skill
- **Weakest skill highlight** with a "Practice this" CTA linking directly to the relevant Advanced part

### Why it works
Visualization creates a feedback loop. Students see exactly which skills need work, which drives targeted practice — and more engagement.

---

## 5. 🏅 Leaderboard (Social Competition)
**Effort: Medium** · **Impact: High**

### What to build
- A weekly leaderboard ranked by XP earned that week
- Scoped to students linked to the same teacher (you already have `StudentTeacherLink`!)
- A global top-10 public leaderboard
- Display on the IELTS hub page or as a tab on the Advanced practice page

### Where it plugs in
- The teacher-student linking system ([users.service.ts](file:///c:/Users/Admin/Desktop/thesis/my%20videos/thesis-toeic-system/backend-core/src/modules/users/users.service.ts#L132-L149)) already queries linked students — adding XP ranking is trivial
- Teachers already have a `getStudentStats()` method — extend it to include comparative rankings

---

## 6. 🎯 Daily Challenge / Quest System
**Effort: Medium** · **Impact: High**

### What to build
- 3 daily quests that rotate each day, e.g.:
  - "Complete 1 Advanced Listening part" → +30 bonus XP
  - "Review 15 flashcards in Vocab Lab" → +20 bonus XP
  - "Practice 5 shadowing sentences" → +15 bonus XP
- A small quest tracker widget on the IELTS hub page
- Completing all 3 daily quests awards a **"Daily Champion"** bonus

### Why it works
Quests give students a *reason to return* even when they've finished the roadmap. They cross-pollinate engagement across modules (Vocab Lab, Shadowing, IELTS) that might otherwise be siloed.

---

## 7. 🔓 Unlock System for Advanced Content
**Effort: Low** · **Impact: Medium**

### What to build
Your Basic roadmap already has a `isLocked` gating system. Extend this concept:
- Lock Advanced IELTS behind completing X% of Basic roadmap
- Lock Intensive IELTS behind completing at least 1 Advanced Listening + 1 Advanced Reading
- Show a progress bar: "Complete 3 more exercises to unlock Advanced Practice"

### Where it plugs in
- Already built into [IeltsBasicProgress](file:///c:/Users/Admin/Desktop/thesis/my%20videos/thesis-toeic-system/backend-core/prisma/schema.prisma#L704-L723) and the roadmap step locking logic
- The IELTS hub page's step cards already have hover states — just conditionally grey them out

---

## 8. ⏱️ Timed Challenge Mode
**Effort: Low** · **Impact: Medium**

### What to build
- Add an optional countdown timer to Advanced practice pages
- IELTS real exam timing: ~20 minutes per Reading passage, ~30 minutes per Listening section
- Show time taken on the score report after submission
- Award bonus XP for finishing under the time limit

### Where it plugs in
- [listening/[partId]/page.tsx](file:///c:/Users/Admin/Desktop/thesis/my%20videos/thesis-toeic-system/frontend-web/src/app/ielts/advanced/listening/%5BpartId%5D) and [reading/[partId]/page.tsx](file:///c:/Users/Admin/Desktop/thesis/my%20videos/thesis-toeic-system/frontend-web/src/app/ielts/advanced/reading/%5BpartId%5D/page.tsx) — add a `useState` timer
- `IeltsPracticeSession` and `IeltsPracticeReadingSession` — add `timeTaken Int?` field (mirrors `ExamSession.timeTaken`)

---

## Priority Recommendation

For maximum motivational impact with minimal development cost, I'd implement in this order:

| Priority | Feature | Why |
|---|---|---|
| 🥇 | Daily Streak | Near-zero backend cost, massive retention impact |
| 🥈 | XP + Levels | Creates a universal progress currency across all modules |
| 🥉 | Statistics Radar Chart | Fills an existing placeholder, immediate visual payoff |
| 4th | Achievement Badges | Deepens engagement once XP/streak creates the foundation |
| 5th | Daily Quests | Cross-pollinates module engagement |
| 6th | Leaderboard | Social pressure, leverages teacher-student links |
