# Gamification — Master Plan

> **Entry point** for implementing achievements, XP & levels, and leaderboards in the IELTS/TOEIC learning platform.
> Each phase is in its own file for independent implementation.

---

## Current Architecture Snapshot

| Layer | Technology | Key Files |
|-------|-----------|-----------|
| **Backend** | NestJS + Prisma + PostgreSQL | `backend-core/src/modules/` |
| **Frontend** | Next.js 14 (App Router) | `frontend-web/src/app/` |
| **Cache** | Redis (via `RedisModule`) | `backend-core/src/common/redis/` |
| **Notifications** | `NotificationsService` | Already has `ACHIEVEMENT` in `NotificationType` enum |
| **Streak** | `StreakService` → `IeltsProfile` | Milestones at 3/7/14/30/60/100 |

### Existing Module Pattern
- Backend: `module.ts` → `controller.ts` → `service.ts` → `dto/*.dto.ts`
- Frontend API: `frontend-web/src/services/*.api.ts` using `api` from `@/lib/api`
- Types: `frontend-web/src/types/index.ts`

---

## Feature Summary

### Phase 1 — Backend Foundation
Schema + GamificationService + Achievement seed data + XP system + Controller

### Phase 2 — Integration Hooks
Wire `gamificationService.onEvent()` into every existing service that produces a gamifiable action.

### Phase 3 — Frontend UI
Profile achievements section, XP/level bar in Navbar, leaderboard tab in Community.

---

## Prisma Models (New)

```prisma
model Achievement {
  id          String   @id @default(uuid())
  key         String   @unique    // "VOCAB_FIRST_WORDS", "IELTS_BAND_7"
  name        String              // "First Words"
  description String              // "Complete your first vocabulary unit"
  icon        String              // Emoji
  category    String              // "FOUNDATION_VOCAB", "IELTS_INTENSIVE", etc.
  tier        Int      @default(1) // 1=Bronze, 2=Silver, 3=Gold
  xpReward    Int      @default(0)
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

model XpLog {
  id        String   @id @default(uuid())
  userId    String
  amount    Int
  reason    String   // "VOCAB_REVIEW", "EXAM_SUBMIT", etc.
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@map("xp_logs")
}
```

### IeltsProfile additions
```prisma
// Add to existing IeltsProfile model
totalXp     Int @default(0)
level       Int @default(0)
```

### User model additions
```prisma
// Add to existing User model
userAchievements UserAchievement[]
xpLogs           XpLog[]
```

---

## Achievement Categories & Keys

| Category | Key Prefix | Example Keys |
|----------|-----------|-------------|
| `FOUNDATION_VOCAB` | `FV_` | `FV_FIRST_WORDS`, `FV_BOOKWORM`, `FV_PERFECT` |
| `FOUNDATION_GRAMMAR` | `FG_` | `FG_STARTER`, `FG_GRADUATE`, `FG_MASTER` |
| `FOUNDATION_PRONUNCIATION` | `FP_` | `FP_FIRST_SOUND`, `FP_SHARP_EAR`, `FP_NATIVE` |
| `IELTS_BASIC` | `IB_` | `IB_LESSON_5`, `IB_LISTENING_3`, `IB_READING_3`, `IB_WRITING_3` |
| `IELTS_ADVANCED` | `IA_` | `IA_LISTENER_5`, `IA_READER_5`, `IA_HIGH_ACHIEVER` |
| `IELTS_INTENSIVE` | `II_` | `II_FIRST_EXAM`, `II_BAND_6`, `II_BAND_7`, `II_BAND_8`, `II_VETERAN` |
| `SHADOWING` | `SH_` | `SH_ECHO`, `SH_PARROT`, `SH_VOICE_ACTOR` |
| `DICTATION` | `DI_` | `DI_FIRST`, `DI_REGULAR`, `DI_EXPERT` |
| `VOCAB_LAB` | `VL_` | `VL_DECK_BUILDER`, `VL_COLLECTOR`, `VL_PUBLISHER`, `VL_MEMORY_MASTER` |
| `COMMUNITY` | `CM_` | `CM_FIRST_POST`, `CM_CONVERSATIONALIST`, `CM_CROWD_FAVORITE` |
| `CROSS_MODULE` | `XM_` | `XM_ON_FIRE`, `XM_MARATHON`, `XM_WELL_ROUNDED`, `XM_DEDICATED` |

---

## XP Values

| Action | XP | Reason Key |
|--------|----|-----------|
| Complete vocab unit | 15 | `VOCAB_UNIT_COMPLETE` |
| Complete grammar unit | 15 | `GRAMMAR_UNIT_COMPLETE` |
| Practice pronunciation | 5 | `PRONUNCIATION_PRACTICE` |
| Master pronunciation sound | 10 | `PRONUNCIATION_MASTERY` |
| Complete IELTS basic lesson | 10 | `IELTS_BASIC_LESSON` |
| Complete IELTS basic exercise | 15 | `IELTS_BASIC_EXERCISE` |
| Submit advanced practice | 20 | `IELTS_ADVANCED_SUBMIT` |
| Score ≥80% advanced | 10 | `IELTS_ADVANCED_HIGH_SCORE` |
| Submit intensive exam | 50 | `IELTS_INTENSIVE_SUBMIT` |
| Score ≥7.0 intensive | 30 | `IELTS_INTENSIVE_HIGH_SCORE` |
| Complete shadowing sentence | 2 | `SHADOWING_SENTENCE` |
| Complete shadowing lesson | 15 | `SHADOWING_LESSON_COMPLETE` |
| Complete dictation sentence | 2 | `DICTATION_SENTENCE` |
| Complete dictation lesson | 15 | `DICTATION_LESSON_COMPLETE` |
| Review flashcard | 2 | `VOCAB_LAB_REVIEW` |
| Card → REVIEW state | 5 | `VOCAB_LAB_CARD_GRADUATED` |
| Publish deck | 15 | `VOCAB_LAB_PUBLISH` |
| Create community post | 10 | `COMMUNITY_POST` |
| Receive like | 2 | `COMMUNITY_LIKE_RECEIVED` |
| Daily streak | 5×day | `STREAK_DAILY` |

---

## Level Formula

```
XP to reach Level N = 100 × N
Level 1 = 100, Level 5 = 500, Level 10 = 1000, Level 20 = 2000
```

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/gamification/achievements` | JWT | All achievement definitions + user's earned status |
| `GET` | `/api/v1/gamification/profile` | JWT | User's XP, level, achievement count |
| `GET` | `/api/v1/gamification/leaderboard` | JWT | Weekly/all-time rankings |
| `GET` | `/api/v1/gamification/xp-history` | JWT | Recent XP log entries |

---

## Phase Map

```
Phase 1 (Backend) ──▶ Phase 2 (Hooks) ──▶ Phase 3 (Frontend)
```

| Phase | File | Scope | Dependencies |
|-------|------|-------|-------------|
| **Phase 1** | `02_phase1_backend.md` | Prisma schema, seed data, GamificationService, controller | None |
| **Phase 2** | `03_phase2_hooks.md` | Wire onEvent() into all existing services | Phase 1 |
| **Phase 3** | `04_phase3_frontend.md` | Profile achievements, XP bar, leaderboard UI | Phase 1 + 2 |

---

## Files Created/Modified Summary

### Phase 1
| Action | File |
|--------|------|
| **Modified** | `schema.prisma` — add Achievement, UserAchievement, XpLog; update IeltsProfile + User |
| **Created** | `modules/gamification/gamification.module.ts` |
| **Created** | `modules/gamification/gamification.service.ts` |
| **Created** | `modules/gamification/gamification.controller.ts` |
| **Created** | `modules/gamification/dto/gamification.dto.ts` |
| **Created** | `prisma/seed-achievements.ts` — seed script for achievement definitions |
| **Modified** | `app.module.ts` — register GamificationModule |

### Phase 2
| Action | File |
|--------|------|
| **Modified** | `modules/vocab-lab/vocab-lab.service.ts` |
| **Modified** | `modules/ielts/ielts.service.ts` |
| **Modified** | `modules/ielts/ielts-advanced.service.ts` |
| **Modified** | `modules/ielts/streak.service.ts` |
| **Modified** | `modules/shadowing/shadowing.service.ts` |
| **Modified** | `modules/dictation/dictation.service.ts` |
| **Modified** | `modules/vocabulary/vocabulary.service.ts` |
| **Modified** | `modules/grammar/grammar.service.ts` |
| **Modified** | `modules/pronunciation/pronunciation.service.ts` |
| **Modified** | `modules/posts/posts.service.ts` |

### Phase 3
| Action | File |
|--------|------|
| **Created** | `frontend: services/gamification.api.ts` |
| **Modified** | `frontend: types/index.ts` — add Achievement, XpLog, LeaderboardEntry types |
| **Created** | `frontend: app/profile/_components/AchievementsSection.tsx` |
| **Created** | `frontend: app/profile/_components/XpLevelBar.tsx` |
| **Modified** | `frontend: app/profile/ProfileContent.tsx` — integrate new sections |
| **Created** | `frontend: app/community/components/Leaderboard.tsx` |
| **Modified** | `frontend: components/Navbar.tsx` — add level badge |
