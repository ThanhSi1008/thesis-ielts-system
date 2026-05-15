# Phase 2 — Integration Hooks

> **Goal:** Wire `gamificationService.onEvent()` into every existing service.
> **Dependencies:** Phase 1 completed. **Effort:** ~2-3 hours.

---

## Pattern

Every existing service gets:
1. `GamificationModule` added to its parent module's `imports`
2. `GamificationService` injected via constructor
3. `this.gamificationService.onEvent()` called after the relevant action

**Important:** All `onEvent` calls must be **non-blocking** (fire-and-forget with `.catch(() => {})`). Gamification must never break a core learning flow.

```typescript
// Example pattern for any service:
this.gamificationService
  .onEvent(userId, { xp: 15, reason: "VOCAB_UNIT_COMPLETE", achievementKeys: ["FV_FIRST_WORDS"] })
  .catch(() => {});
```

---

## Hook 1: Vocabulary Service

**File:** `backend-core/src/modules/vocabulary/vocabulary.service.ts`

**When:** `VocabularyProgress.isCompleted` is set to `true`

```typescript
// After marking unit complete:
this.gamificationService.onEvent(userId, {
  xp: 15,
  reason: "VOCAB_UNIT_COMPLETE",
  achievementKeys: ["FV_FIRST_WORDS"],  // always check; service handles dedup
}).catch(() => {});

// After exercise score = 100:
this.gamificationService.onEvent(userId, {
  xp: 5,
  reason: "VOCAB_PERFECT_SCORE",
  achievementKeys: ["FV_PERFECT"],
}).catch(() => {});
```

**Module change:** Add `GamificationModule` to `VocabularyModule` imports.

---

## Hook 2: Grammar Service

**File:** `backend-core/src/modules/grammar/grammar.service.ts`

**When:** `GrammarProgress` is updated with `theoryCompleted = true` AND `exerciseScore` set

```typescript
this.gamificationService.onEvent(userId, {
  xp: 15,
  reason: "GRAMMAR_UNIT_COMPLETE",
  achievementKeys: ["FG_STARTER"],
}).catch(() => {});
```

**Module change:** Add `GamificationModule` to `GrammarModule` imports.

---

## Hook 3: Pronunciation Service

**File:** `backend-core/src/modules/pronunciation/pronunciation.service.ts`

**When:** `PronunciationProgress` is created/updated

```typescript
// On any practice:
this.gamificationService.onEvent(userId, {
  xp: 5,
  reason: "PRONUNCIATION_PRACTICE",
  achievementKeys: ["FP_FIRST_SOUND"],
}).catch(() => {});

// When status changes to MASTERED:
this.gamificationService.onEvent(userId, {
  xp: 10,
  reason: "PRONUNCIATION_MASTERY",
  achievementKeys: ["FP_SHARP_EAR"],  // Service checks count internally
}).catch(() => {});
```

**Module change:** Add `GamificationModule` to `PronunciationModule` imports.

---

## Hook 4: IELTS Service (Basic + Intensive)

**File:** `backend-core/src/modules/ielts/ielts.service.ts`

**When Basic lesson/exercise completed:** `IeltsBasicProgress.isCompleted = true`

```typescript
// Basic lesson complete:
this.gamificationService.onEvent(userId, {
  xp: 10,
  reason: "IELTS_BASIC_LESSON",
  achievementKeys: ["IB_LESSON_5"],
}).catch(() => {});

// Basic listening exercise complete:
this.gamificationService.onEvent(userId, {
  xp: 15,
  reason: "IELTS_BASIC_EXERCISE",
  achievementKeys: ["IB_LISTENING_3"],
}).catch(() => {});
```

**When exam graded:** `Result` is created

```typescript
// Exam submitted:
this.gamificationService.onEvent(userId, {
  xp: 50,
  reason: "IELTS_INTENSIVE_SUBMIT",
  achievementKeys: ["II_FIRST_EXAM", "II_VETERAN"],
}).catch(() => {});

// Score-based achievements (check the score):
if (result.totalScore >= 8.0) {
  this.gamificationService.onEvent(userId, { xp: 30, reason: "IELTS_INTENSIVE_HIGH_SCORE", achievementKeys: ["II_BAND_6", "II_BAND_7", "II_BAND_8"] }).catch(() => {});
} else if (result.totalScore >= 7.0) {
  this.gamificationService.onEvent(userId, { xp: 30, reason: "IELTS_INTENSIVE_HIGH_SCORE", achievementKeys: ["II_BAND_6", "II_BAND_7"] }).catch(() => {});
} else if (result.totalScore >= 6.0) {
  this.gamificationService.onEvent(userId, { xp: 15, reason: "IELTS_INTENSIVE_HIGH_SCORE", achievementKeys: ["II_BAND_6"] }).catch(() => {});
}
```

**Module change:** Add `GamificationModule` to `IeltsModule` imports.

---

## Hook 5: IELTS Advanced Service

**File:** `backend-core/src/modules/ielts/ielts-advanced.service.ts`

**When:** `IeltsPracticeSession` or `IeltsPracticeReadingSession` is created

```typescript
// Listening practice submitted:
this.gamificationService.onEvent(userId, {
  xp: 20,
  reason: "IELTS_ADVANCED_SUBMIT",
  achievementKeys: ["IA_LISTENER_5"],
}).catch(() => {});

// If score >= 80%:
if (totalScore / totalQuestions >= 0.8) {
  this.gamificationService.onEvent(userId, {
    xp: 10,
    reason: "IELTS_ADVANCED_HIGH_SCORE",
    achievementKeys: ["IA_HIGH_ACHIEVER"],
  }).catch(() => {});
}

// Reading practice submitted:
this.gamificationService.onEvent(userId, {
  xp: 20,
  reason: "IELTS_ADVANCED_SUBMIT",
  achievementKeys: ["IA_READER_5"],
}).catch(() => {});
```

**Module change:** Already handled by `IeltsModule` above.

---

## Hook 6: Streak Service

**File:** `backend-core/src/modules/ielts/streak.service.ts`

**When:** Streak increments (L58-76 in `recordActivity()`)

```typescript
// After streak increment (diffDays === 1 block):
this.gamificationService.onEvent(userId, {
  xp: 5 * newStreak,
  reason: "STREAK_DAILY",
  achievementKeys: newStreak >= 100 ? ["XM_ON_FIRE", "XM_MARATHON", "XM_UNSTOPPABLE"]
    : newStreak >= 30 ? ["XM_ON_FIRE", "XM_MARATHON"]
    : newStreak >= 7 ? ["XM_ON_FIRE"]
    : [],
}).catch(() => {});
```

**Module change:** Already handled by `IeltsModule` above.

---

## Hook 7: Shadowing Service

**File:** `backend-core/src/modules/shadowing/shadowing.service.ts`

**When:** `ShadowingProgress.completedSentences` is updated

```typescript
// Per sentence completed:
this.gamificationService.onEvent(userId, {
  xp: 2,
  reason: "SHADOWING_SENTENCE",
  achievementKeys: [],
}).catch(() => {});

// When all sentences completed (full lesson):
this.gamificationService.onEvent(userId, {
  xp: 15,
  reason: "SHADOWING_LESSON_COMPLETE",
  achievementKeys: ["SH_ECHO", "SH_PARROT", "SH_VOICE_ACTOR"],
}).catch(() => {});
```

**Module change:** Add `GamificationModule` to `ShadowingModule` imports.

---

## Hook 8: Dictation Service

**File:** `backend-core/src/modules/dictation/dictation.service.ts`

**When:** `DictationProgress.completedSentences` is updated

```typescript
// Per sentence completed:
this.gamificationService.onEvent(userId, {
  xp: 2,
  reason: "DICTATION_SENTENCE",
  achievementKeys: [],
}).catch(() => {});

// When all sentences completed:
const achievementKeys = ["DI_FIRST", "DI_REGULAR"];
if (difficulty === "Expert") achievementKeys.push("DI_EXPERT");

this.gamificationService.onEvent(userId, {
  xp: 15,
  reason: "DICTATION_LESSON_COMPLETE",
  achievementKeys,
}).catch(() => {});
```

**Module change:** Add `GamificationModule` to `DictationModule` imports.

---

## Hook 9: Vocab Lab Service

**File:** `backend-core/src/modules/vocab-lab/vocab-lab.service.ts`

**When:** Card reviewed, deck created, deck published

```typescript
// After card review (FlashcardReview created):
this.gamificationService.onEvent(userId, {
  xp: 2,
  reason: "VOCAB_LAB_REVIEW",
  achievementKeys: [],
}).catch(() => {});

// After card state → REVIEW:
this.gamificationService.onEvent(userId, {
  xp: 5,
  reason: "VOCAB_LAB_CARD_GRADUATED",
  achievementKeys: ["VL_MEMORY_MASTER"],
}).catch(() => {});

// After deck created:
this.gamificationService.onEvent(userId, {
  xp: 0,
  reason: "VOCAB_LAB_DECK_CREATED",
  achievementKeys: ["VL_DECK_BUILDER"],
}).catch(() => {});

// After deck published (SharedDeck created):
this.gamificationService.onEvent(userId, {
  xp: 15,
  reason: "VOCAB_LAB_PUBLISH",
  achievementKeys: ["VL_PUBLISHER"],
}).catch(() => {});
```

**Module change:** Add `GamificationModule` to `VocabLabModule` imports.

---

## Hook 10: Posts Service

**File:** `backend-core/src/modules/posts/posts.service.ts`

**When:** Post created, like received

```typescript
// After createPost():
this.gamificationService.onEvent(userId, {
  xp: 10,
  reason: "COMMUNITY_POST",
  achievementKeys: ["CM_FIRST_POST"],
}).catch(() => {});

// After createComment():
this.gamificationService.onEvent(userId, {
  xp: 0,
  reason: "COMMUNITY_COMMENT",
  achievementKeys: ["CM_CONVERSATIONALIST"],
}).catch(() => {});

// After toggleLike() — award to POST AUTHOR (not the liker):
if (!existing) {
  // Only on like (not unlike)
  this.gamificationService.onEvent(post.authorId, {
    xp: 2,
    reason: "COMMUNITY_LIKE_RECEIVED",
    achievementKeys: ["CM_CROWD_FAVORITE"],
  }).catch(() => {});
}
```

**Module change:** Add `GamificationModule` to `PostsModule` imports.

---

## Achievement Threshold Checking

The `tryGrantAchievement` method in `GamificationService` only checks if the achievement is already earned. For **count-based achievements** (e.g., "Complete 10 lessons"), the service needs to verify the threshold before granting.

Add this method to `GamificationService`:

```typescript
/**
 * Check count-based achievement thresholds before granting.
 * Called by onEvent when achievementKeys include count-based badges.
 */
async checkCountAchievements(userId: string, keys: string[]) {
  for (const key of keys) {
    const existing = await this.prisma.userAchievement.findFirst({
      where: { userId, achievement: { key } },
    });
    if (existing) continue;

    let shouldGrant = false;

    switch (key) {
      // Vocab Foundation
      case "FV_FIRST_WORDS":
        shouldGrant = (await this.prisma.vocabularyProgress.count({ where: { userId, isCompleted: true } })) >= 1;
        break;
      case "FV_BOOKWORM": {
        // Check if any book has all units completed
        const books = await this.prisma.vocabularyBook.findMany({ include: { units: true } });
        for (const book of books) {
          const completed = await this.prisma.vocabularyProgress.count({
            where: { userId, isCompleted: true, unitId: { in: book.units.map(u => u.id) } },
          });
          if (completed === book.units.length && book.units.length > 0) { shouldGrant = true; break; }
        }
        break;
      }

      // Grammar
      case "FG_STARTER":
        shouldGrant = (await this.prisma.grammarProgress.count({ where: { userId, theoryCompleted: true, exerciseScore: { not: null } } })) >= 1;
        break;

      // Pronunciation
      case "FP_SHARP_EAR":
        shouldGrant = (await this.prisma.pronunciationProgress.count({ where: { userId, status: "MASTERED" } })) >= 10;
        break;

      // IELTS Basic
      case "IB_LESSON_5":
        shouldGrant = (await this.prisma.ieltsBasicProgress.count({ where: { userId, isCompleted: true, lessonId: { not: null } } })) >= 5;
        break;
      case "IB_LISTENING_3":
        shouldGrant = (await this.prisma.ieltsBasicProgress.count({ where: { userId, isCompleted: true, listeningExerciseId: { not: null } } })) >= 3;
        break;

      // IELTS Advanced
      case "IA_LISTENER_5":
        shouldGrant = (await this.prisma.ieltsPracticeSession.count({ where: { userId } })) >= 5;
        break;
      case "IA_READER_5":
        shouldGrant = (await this.prisma.ieltsPracticeReadingSession.count({ where: { userId } })) >= 5;
        break;

      // IELTS Intensive
      case "II_FIRST_EXAM":
        shouldGrant = (await this.prisma.examSession.count({ where: { userId, status: { in: ["COMPLETED", "GRADED"] } } })) >= 1;
        break;
      case "II_VETERAN":
        shouldGrant = (await this.prisma.examSession.count({ where: { userId, status: { in: ["COMPLETED", "GRADED"] } } })) >= 10;
        break;

      // Shadowing
      case "SH_ECHO":
        shouldGrant = true; // Triggered only when a full lesson is completed
        break;
      case "SH_PARROT":
        shouldGrant = (await this.prisma.shadowingProgress.count({ where: { userId } })) >= 10;
        break;

      // Dictation
      case "DI_FIRST":
        shouldGrant = true; // Triggered only when a full lesson is completed
        break;
      case "DI_REGULAR":
        shouldGrant = (await this.prisma.dictationProgress.count({ where: { userId } })) >= 10;
        break;

      // Vocab Lab
      case "VL_DECK_BUILDER":
        shouldGrant = (await this.prisma.deck.count({ where: { userId } })) >= 1;
        break;
      case "VL_COLLECTOR":
        shouldGrant = (await this.prisma.flashcard.count({ where: { deck: { userId } } })) >= 100;
        break;
      case "VL_MEMORY_MASTER":
        shouldGrant = (await this.prisma.flashcard.count({ where: { deck: { userId }, cardState: "REVIEW" } })) >= 50;
        break;

      // Community
      case "CM_FIRST_POST":
        shouldGrant = (await this.prisma.post.count({ where: { authorId: userId } })) >= 1;
        break;
      case "CM_CONVERSATIONALIST":
        shouldGrant = (await this.prisma.comment.count({ where: { authorId: userId } })) >= 10;
        break;

      // Streak
      case "XM_ON_FIRE":
      case "XM_MARATHON":
      case "XM_UNSTOPPABLE":
        shouldGrant = true; // Triggered only at the right streak count
        break;

      default:
        shouldGrant = true; // For score-based achievements already checked by caller
    }

    if (shouldGrant) {
      await this.tryGrantAchievement(userId, key);
    }
  }
}
```

Then update the `onEvent` method to call `checkCountAchievements` instead of `tryGrantAchievement` directly:

```typescript
// In onEvent(), replace the achievement check block:
if (event.achievementKeys?.length) {
  await this.checkCountAchievements(userId, event.achievementKeys);
}
```

---

## Verify

After wiring all hooks:
1. Create a vocab deck → should grant `VL_DECK_BUILDER` achievement + notification
2. Review 1 flashcard → should see +2 XP in `xp_logs` table
3. Check profile: `GET /gamification/profile` → `totalXp > 0`
4. Check achievements: `GET /gamification/achievements` → earned badges visible
