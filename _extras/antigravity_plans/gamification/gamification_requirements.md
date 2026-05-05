# Gamification Requirements — Structured by Core Modules

## App Module Map

```
┌─────────────────────────────────────────────────────────────────┐
│                     IELTS MASTER ENGLISH                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─ IELTS Foundation ──────────────────────────────────────┐    │
│  │  📚 Vocabulary (Books → Units → Words + Exercises)      │    │
│  │  📝 Grammar    (Books → Units → Theory + Exercises)     │    │
│  │  🗣️ Pronunciation (IPA Sounds → Practice → Mastery)    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─ IELTS Exam Tiers ──────────────────────────────────────┐    │
│  │  🟢 Basic     (Lessons + skill exercises: L/R/W/S)      │    │
│  │  🟡 Advanced  (Cambridge practice: Listening + Reading)  │    │
│  │  🔴 Intensive (Full exam simulations with AI grading)    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─ Skills Practice ───────────────────────────────────────┐    │
│  │  🎙️ Shadowing  (Sentence-by-sentence video mimicry)    │    │
│  │  🎧 Dictation  (Listening → typing, difficulty levels)  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─ Vocab Lab ─────────────────────────────────────────────┐    │
│  │  📦 Decks + Flashcards (FSRS spaced repetition)         │    │
│  │  🏪 Community Marketplace (publish/import decks)         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─ Social ────────────────────────────────────────────────┐    │
│  │  💬 Community Posts (tips, achievements, discussions)     │    │
│  │  🔥 Daily Streak (via IeltsProfile)                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## What Already Exists (Gamification Baseline)

| Feature | Data Source | Status |
|---------|-----------|--------|
| Daily Streak | `IeltsProfile.currentStreak` / `longestStreak` | ✅ Working |
| Streak milestones (3/7/14/30/60/100) | `StreakService` → `NotificationsService` | ✅ Working |
| 🔥 Navbar streak badge | `Navbar.tsx` with pulse at 7+ days | ✅ Working |
| Vocab SRS cycle | `Flashcard.cardState` (NEW→LEARNING→REVIEW) | ✅ Working |
| Pronunciation mastery | `PronunciationProgress.status` (NEW→PRACTICING→MASTERED) | ✅ Working |
| IELTS exam scores | `Result.totalScore` with per-skill breakdowns | ✅ Working |
| `ACHIEVEMENT` notification type | `NotificationType` enum (already declared) | ✅ Enum exists, not used yet |

---

## Feature 1: Achievement / Badge System

### 1A — IELTS Foundation Achievements

#### 📚 Vocabulary

| Badge | Name | Trigger | Data Query |
|-------|------|---------|------------|
| 📖 | **First Words** | Complete 1 vocabulary unit | `VocabularyProgress` where `isCompleted = true`, count ≥ 1 |
| 📗 | **Bookworm** | Complete all units in 1 vocabulary book | All `VocabularyProgress` for a book's units are `isCompleted` |
| 📕 | **Word Scholar** | Complete all units across all vocabulary books | All books completed |
| 💯 | **Perfect Vocab** | Score 100% on any vocabulary exercise | `VocabularyProgress.exerciseScore = 100` |

#### 📝 Grammar

| Badge | Name | Trigger | Data Query |
|-------|------|---------|------------|
| ✏️ | **Grammar Starter** | Complete 1 grammar unit (theory + exercises) | `GrammarProgress` where `theoryCompleted = true` AND `exerciseScore IS NOT NULL`, count ≥ 1 |
| 📘 | **Grammar Graduate** | Complete all units in 1 grammar book | All `GrammarProgress` for a book's units completed |
| 🏆 | **Grammar Master** | Complete all 3 grammar levels (Elementary + Intermediate + Advanced) | All `GrammarBook` slugs have completed `GrammarProgress` |

#### 🗣️ Pronunciation

| Badge | Name | Trigger | Data Query |
|-------|------|---------|------------|
| 🔤 | **First Sound** | Practice any pronunciation sound for the first time | `PronunciationProgress` count ≥ 1 |
| 🎯 | **Sharp Ear** | Master 10 pronunciation sounds (score ≥ 80) | `PronunciationProgress` where `status = MASTERED`, count ≥ 10 |
| 👄 | **Native Speaker** | Master all IPA sounds | All `PronunciationSound` IDs have matching `PronunciationProgress` with `status = MASTERED` |

---

### 1B — IELTS Exam Tier Achievements

#### 🟢 IELTS Basic

| Badge | Name | Trigger | Data Query |
|-------|------|---------|------------|
| 📗 | **Lesson Learner** | Complete 5 IELTS basic lessons | `IeltsBasicProgress` where `isCompleted = true` AND `lessonId IS NOT NULL`, count ≥ 5 |
| 🎧 | **Listening Rookie** | Complete 3 listening exercises | `IeltsBasicProgress` where `listeningExerciseId IS NOT NULL`, count ≥ 3 |
| 📖 | **Reading Rookie** | Complete 3 reading exercises | `IeltsBasicProgress` where `readingExerciseId IS NOT NULL`, count ≥ 3 |
| ✍️ | **Writing Rookie** | Submit 3 writing exercises | `IeltsWritingUserAnswer` count ≥ 3 |

#### 🟡 IELTS Advanced

| Badge | Name | Trigger | Data Query |
|-------|------|---------|------------|
| 🎧 | **Cambridge Listener** | Complete 5 advanced listening practice sessions | `IeltsPracticeSession` count ≥ 5 |
| 📖 | **Cambridge Reader** | Complete 5 advanced reading practice sessions | `IeltsPracticeReadingSession` count ≥ 5 |
| 🏅 | **High Achiever** | Score ≥ 80% on any advanced practice session | `IeltsPracticeSession.totalScore / totalQuestions ≥ 0.8` |

#### 🔴 IELTS Intensive

| Badge | Name | Trigger | Data Query |
|-------|------|---------|------------|
| 📝 | **First Exam** | Submit first full IELTS exam | `ExamSession` where `status = COMPLETED/GRADED`, count ≥ 1 |
| 🎯 | **Band 6** | Achieve total score ≥ 6.0 on any exam | `Result.totalScore ≥ 6.0` |
| ⭐ | **Band 7** | Achieve total score ≥ 7.0 on any exam | `Result.totalScore ≥ 7.0` |
| 💎 | **Band 8** | Achieve total score ≥ 8.0 on any exam | `Result.totalScore ≥ 8.0` |
| 🏆 | **Exam Veteran** | Complete 10 full exams | `ExamSession` count ≥ 10 |

---

### 1C — Shadowing & Dictation Achievements

#### 🎙️ Shadowing

| Badge | Name | Trigger | Data Query |
|-------|------|---------|------------|
| 🎙️ | **Echo** | Complete 1 shadowing lesson (all sentences) | `ShadowingProgress` where `completedSentences` array length = lesson sentence count |
| 🗣️ | **Parrot** | Complete 10 shadowing lessons | Fully completed `ShadowingProgress` count ≥ 10 |
| 🎤 | **Voice Actor** | Complete 30 shadowing lessons | Fully completed count ≥ 30 |

#### 🎧 Dictation

| Badge | Name | Trigger | Data Query |
|-------|------|---------|------------|
| 🎧 | **First Dictation** | Complete 1 dictation lesson | `DictationProgress` where fully completed, count ≥ 1 |
| 📝 | **Dictation Regular** | Complete 10 dictation lessons | Fully completed count ≥ 10 |
| 🏆 | **Dictation Expert** | Complete a lesson on Expert difficulty | `DictationProgress` where `difficulty = Expert` and fully completed |

---

### 1D — Vocab Lab Achievements

| Badge | Name | Trigger | Data Query |
|-------|------|---------|------------|
| 📦 | **Deck Builder** | Create first deck | `Deck` count ≥ 1 |
| 📚 | **Card Collector** | Create 100 flashcards across all decks | `Flashcard` count ≥ 100 |
| ⭐ | **Review Streak** | Review cards for 7 consecutive days | Count distinct `FlashcardReview.reviewedAt` dates in last 7 days = 7 |
| 🧠 | **Memory Master** | Have 50 cards in REVIEW state (long-term retention) | `Flashcard` where `cardState = REVIEW`, count ≥ 50 |
| 🏪 | **Deck Publisher** | Publish a deck to the Community Marketplace | `SharedDeck` count ≥ 1 |
| 📥 | **Deck Curator** | Import 5 decks from the Marketplace | Track via import events |

---

### 1E — Community Achievements

| Badge | Name | Trigger | Data Query |
|-------|------|---------|------------|
| ✍️ | **First Post** | Create first community post | `Post` count ≥ 1 |
| 💬 | **Conversationalist** | Leave 10 comments | `Comment` count ≥ 10 |
| ❤️ | **Crowd Favorite** | Receive 25 total likes across all posts | Sum of own `Post.likeCount` ≥ 25 |
| 📌 | **Prolific Writer** | Create 20 posts | `Post` count ≥ 20 |

---

### 1F — Cross-Module Achievements

| Badge | Name | Trigger | Data Query |
|-------|------|---------|------------|
| 🔥 | **On Fire** | Reach a 7-day streak | `IeltsProfile.currentStreak ≥ 7` |
| 🏔️ | **Marathon** | Reach a 30-day streak | `IeltsProfile.currentStreak ≥ 30` |
| 🌋 | **Unstoppable** | Reach a 100-day streak | `IeltsProfile.currentStreak ≥ 100` |
| 🌍 | **Well-Rounded** | Complete at least 1 activity in every module (vocab unit + grammar unit + pronunciation sound + IELTS lesson + shadowing lesson + dictation lesson + vocab lab review + community post) | Cross-query all progress tables |
| 🎓 | **Dedicated Learner** | Reach Level 10 (see XP system below) | `User.level ≥ 10` |

---

### Achievement Data Model

```prisma
model Achievement {
  id          String   @id @default(uuid())
  key         String   @unique    // e.g., "VOCAB_FIRST_WORDS", "IELTS_BAND_7"
  name        String              // "First Words"
  description String              // "Complete your first vocabulary unit"
  icon        String              // Emoji or image URL
  category    String              // "FOUNDATION_VOCAB", "IELTS_INTENSIVE", etc.
  tier        Int      @default(1) // 1=Bronze, 2=Silver, 3=Gold
  xpReward    Int      @default(0) // XP granted when earned
  order       Int      @default(0)
  createdAt   DateTime @default(now())

  userAchievements UserAchievement[]

  @@map("achievements")
}

model UserAchievement {
  id            String   @id @default(uuid())
  userId        String
  achievementId String
  earnedAt      DateTime @default(now())

  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement Achievement @relation(fields: [achievementId], references: [id], onDelete: Cascade)

  @@unique([userId, achievementId])
  @@map("user_achievements")
}
```

---

## Feature 2: XP & Levels

### XP Actions by Module

#### IELTS Foundation

| Action | XP | Data Event |
|--------|----|------------|
| Complete a vocabulary unit | 15 | `VocabularyProgress.isCompleted → true` |
| Score 100% on vocab exercise | 5 bonus | `VocabularyProgress.exerciseScore = 100` |
| Complete a grammar unit | 15 | `GrammarProgress.theoryCompleted + exerciseScore set` |
| Practice a pronunciation sound | 5 | `PronunciationProgress.practiceCount` increments |
| Master a pronunciation sound | 10 bonus | `PronunciationProgress.status → MASTERED` |

#### IELTS Exam Tiers

| Action | XP | Data Event |
|--------|----|------------|
| Complete an IELTS basic lesson | 10 | `IeltsBasicProgress.isCompleted → true` |
| Complete a basic exercise (L/R/W) | 15 | Respective `IeltsBasicProgress` entry |
| Submit an advanced practice session | 20 | `IeltsPracticeSession` or `IeltsPracticeReadingSession` created |
| Score ≥ 80% on advanced practice | 10 bonus | `totalScore / totalQuestions ≥ 0.8` |
| Submit a full intensive exam | 50 | `ExamSession.status → SUBMITTED` |
| Score ≥ 7.0 on intensive exam | 30 bonus | `Result.totalScore ≥ 7.0` |

#### Shadowing & Dictation

| Action | XP | Data Event |
|--------|----|------------|
| Complete a shadowing sentence | 2 | New entry in `ShadowingProgress.completedSentences[]` |
| Complete full shadowing lesson | 15 bonus | All sentences completed |
| Complete a dictation sentence | 2 | New entry in `DictationProgress.completedSentences[]` |
| Complete full dictation lesson | 15 bonus | All sentences completed |
| Complete dictation on Expert | 10 bonus | `difficulty = Expert` and fully completed |

#### Vocab Lab

| Action | XP | Data Event |
|--------|----|------------|
| Review a flashcard | 2 | `FlashcardReview` created |
| Card graduates to REVIEW state | 5 | `Flashcard.cardState → REVIEW` |
| Complete a review session (all due) | 10 bonus | All `due ≤ now()` cards reviewed |
| Publish a deck | 15 | `SharedDeck` created |

#### Community & Cross-Module

| Action | XP | Data Event |
|--------|----|------------|
| Create a post | 10 | `Post` created |
| Receive a like on your post | 2 | `PostLike` where `post.authorId = you` |
| Maintain daily streak | 5 × day | `StreakService.recordActivity()` |
| Unlock an achievement | Achievement's `xpReward` | `UserAchievement` created |

### Level Formula

```
XP to reach Level N = 100 × N
Level 1 = 100 XP, Level 5 = 500 XP, Level 10 = 1000 XP, Level 20 = 2000 XP
```

Simple linear curve is best for a thesis — easy to balance, easy to explain.

### Data Model Addition

Add to `IeltsProfile` (or `User`):

```prisma
// Add to IeltsProfile model
totalXp     Int @default(0)
level       Int @default(0)
```

---

## Feature 3: Leaderboard

### Board Types

| Board | Metric | Query Source | Reset |
|-------|--------|-------------|-------|
| 🔥 **Streak Leaders** | Current streak | `IeltsProfile.currentStreak` ORDER BY DESC | Real-time |
| ⭐ **XP This Week** | XP earned in current week | Sum `XpLog.amount` WHERE `createdAt ≥ startOfWeek` | Weekly (Monday) |
| 📚 **Vocab Champions** | Cards reviewed this week | Count `FlashcardReview` WHERE `reviewedAt ≥ startOfWeek` | Weekly |
| 🎯 **Top Scorers** | Highest exam average | Avg `Result.totalScore` | All-time |

### XP Log Model (for weekly leaderboard)

```prisma
model XpLog {
  id        String   @id @default(uuid())
  userId    String
  amount    Int
  reason    String   // "VOCAB_REVIEW", "EXAM_SUBMIT", "STREAK_3", etc.
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@map("xp_logs")
}
```

### API

```
GET /api/v1/leaderboard?type=xp_weekly&limit=20
```

Response:
```json
{
  "leaderboard": [
    { "rank": 1, "userId": "...", "name": "Jane", "avatar": "...", "value": 450 },
    { "rank": 2, "userId": "...", "name": "John", "avatar": "...", "value": 380 }
  ],
  "currentUser": { "rank": 12, "value": 120 }
}
```

Cache with Redis (you already have `RedisModule`) — refresh every 5 minutes.

---

## Integration Hook Map

Every gamification event must be triggered from the **existing service methods**. Here's where:

| Module | Service File | Method / Event | Hooks |
|--------|-------------|---------------|-------|
| **Vocabulary** | `vocabulary.service.ts` | Complete unit → `VocabularyProgress.isCompleted = true` | XP +15, check achievement |
| **Grammar** | `grammar.service.ts` | Complete unit → `GrammarProgress` updated | XP +15, check achievement |
| **Pronunciation** | `pronunciation.service.ts` | Practice → `PronunciationProgress` updated | XP +5, check mastery achievement |
| **IELTS Basic** | `ielts.service.ts` | Complete lesson/exercise → `IeltsBasicProgress.isCompleted` | XP +10/15, check achievement |
| **IELTS Advanced** | `ielts-advanced.service.ts` | Submit session → `IeltsPracticeSession` created | XP +20, check score achievement |
| **IELTS Intensive** | `ielts.service.ts` | Exam graded → `Result` created | XP +50, check band achievement |
| **Shadowing** | `shadowing.service.ts` | Sentence completed → `ShadowingProgress.completedSentences` | XP +2/15, check achievement |
| **Dictation** | `dictation.service.ts` | Sentence completed → `DictationProgress.completedSentences` | XP +2/15, check achievement |
| **Vocab Lab** | `vocab-lab.service.ts` | Card reviewed → `FlashcardReview` created | XP +2, check achievement |
| **Vocab Lab** | `vocab-lab.service.ts` | Deck published → `SharedDeck` created | XP +15, check achievement |
| **Community** | `posts.service.ts` | Post created / Like received | XP +10/2, check achievement |
| **Streak** | `streak.service.ts` | Milestone reached (L71) | XP bonus, achievement check |

### Implementation Pattern (DIP-compliant)

```typescript
// gamification.service.ts — a single orchestrator
@Injectable()
export class GamificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async onEvent(userId: string, event: GamificationEvent) {
    // 1. Award XP
    await this.awardXp(userId, event.xp, event.reason);
    // 2. Check achievements
    await this.checkAchievements(userId, event.category);
  }
}

// Usage in any service (e.g., vocab-lab.service.ts):
// After card review:
//   this.gamification.onEvent(userId, { xp: 2, reason: 'VOCAB_REVIEW', category: 'VOCAB_LAB' });
```

---

## Thesis Scope Recommendation

| Priority | Feature | Effort | Builds On |
|----------|---------|--------|-----------|
| **P0** | Achievement System (all categories above) | Medium | Existing progress tables |
| **P1** | XP & Levels | Low | Achievements (shares hooks) |
| **P2** | Leaderboard | Low | XP data + existing Redis |
| **P3** | Profile Achievements UI | Low | P0 data |

> [!TIP]
> **P0 + P1 share the same integration hooks.** Once you add `gamificationService.onEvent()` calls into your existing services, both achievements AND XP work simultaneously. The leaderboard (P2) is then just an aggregation query on the `XpLog` table.

### Files to Create/Modify

| Action | File |
|--------|------|
| **Modified** | `schema.prisma` — add `Achievement`, `UserAchievement`, `XpLog` models; add `totalXp`/`level` to `IeltsProfile` |
| **Created** | `modules/gamification/gamification.module.ts` |
| **Created** | `modules/gamification/gamification.service.ts` — XP + Achievement orchestrator |
| **Created** | `modules/gamification/gamification.controller.ts` — GET achievements, GET leaderboard |
| **Created** | `modules/gamification/dto/gamification.dto.ts` |
| **Modified** | Every existing service (add `gamificationService.onEvent()` calls) |
| **Created** | `frontend: services/gamification.api.ts` |
| **Created** | `frontend: app/profile/_components/AchievementsSection.tsx` |
| **Modified** | `frontend: ProfileContent.tsx` — add achievements display |
| **Created** | `frontend: app/community/components/Leaderboard.tsx` (or new tab) |
