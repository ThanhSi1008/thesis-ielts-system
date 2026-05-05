# Phase 3 — Frontend UI

> **Goal:** Profile achievements section, XP/level bar, leaderboard tab.
> **Dependencies:** Phase 1 + 2. **Effort:** ~3-4 hours.

---

## Step 1: TypeScript Types

**File:** `frontend-web/src/types/index.ts` — append at end:

```typescript
// ==================== GAMIFICATION ====================

export interface AchievementItem {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: number;  // 1=Bronze, 2=Silver, 3=Gold
  earned: boolean;
  earnedAt: string | null;
}

export interface GamificationProfile {
  totalXp: number;
  level: number;
  currentLevelXp: number;
  xpNeeded: number;
  achievementCount: number;
  totalAchievements: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string | null;
  value: number;
}

export interface XpLogEntry {
  id: string;
  amount: number;
  reason: string;
  createdAt: string;
}
```

---

## Step 2: API Client

**File:** `frontend-web/src/services/gamification.api.ts` (create new)

```typescript
import api from '@/lib/api';
import type { AchievementItem, GamificationProfile, LeaderboardEntry, XpLogEntry } from '@/types';

export const gamificationApi = {
  getProfile: async () => {
    const { data } = await api.get<GamificationProfile>('/gamification/profile');
    return data;
  },

  getAchievements: async () => {
    const { data } = await api.get<AchievementItem[]>('/gamification/achievements');
    return data;
  },

  getLeaderboard: async (type: string = 'xp_weekly', limit: number = 20) => {
    const { data } = await api.get<LeaderboardEntry[]>('/gamification/leaderboard', {
      params: { type, limit },
    });
    return data;
  },

  getXpHistory: async () => {
    const { data } = await api.get<XpLogEntry[]>('/gamification/xp-history');
    return data;
  },
};
```

---

## Step 3: XpLevelBar Component

**File:** `frontend-web/src/app/profile/_components/XpLevelBar.tsx` (create new)

This shows the user's level, XP progress bar, and total XP.

```
┌──────────────────────────────────────────┐
│  ⭐ Level 5         420 / 600 XP        │
│  [████████████░░░░░░░░░░░]  Total: 2120 │
└──────────────────────────────────────────┘
```

**Props:**
```typescript
interface XpLevelBarProps {
  level: number;
  currentLevelXp: number;
  xpNeeded: number;
  totalXp: number;
}
```

**Styling:**
- Container: `bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6`
- Level badge: `bg-primary/10 text-primary font-bold rounded-full px-3 py-1`
- Progress bar: `h-3 rounded-full bg-gray-100 dark:bg-gray-800` with inner fill `bg-gradient-to-r from-primary to-amber-400 rounded-full transition-all duration-500`
- Percentage: `width: ${Math.min((currentLevelXp / xpNeeded) * 100, 100)}%`

---

## Step 4: AchievementsSection Component

**File:** `frontend-web/src/app/profile/_components/AchievementsSection.tsx` (create new)

Displays all achievements grouped by category. Earned badges are vibrant; locked badges are grayed out.

```
┌──────────────────────────────────────────────────┐
│  🏆 Achievements  (12 / 35)                     │
│                                                  │
│  ── IELTS Foundation: Vocabulary ──              │
│  [📖✅] [📗✅] [💯🔒] [📕🔒]                   │
│                                                  │
│  ── IELTS Intensive ──                           │
│  [📝✅] [🎯✅] [⭐🔒] [💎🔒] [🏆🔒]           │
│  ...                                             │
└──────────────────────────────────────────────────┘
```

**Props:**
```typescript
interface AchievementsSectionProps {
  achievements: AchievementItem[];
  earnedCount: number;
  totalCount: number;
}
```

**Key behavior:**
- Group achievements by `category` field
- Display category names as readable headings (map `FOUNDATION_VOCAB` → "IELTS Foundation: Vocabulary")
- Each badge: 56×56 rounded-xl card with the `icon` emoji centered
  - Earned: `bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 shadow-sm` + tooltip with name + date
  - Locked: `bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-40 grayscale`
- Tier indicators: bronze/silver/gold ring color
  - Tier 1: `ring-amber-600/40`
  - Tier 2: `ring-gray-400/60` (silver)
  - Tier 3: `ring-yellow-400/80` (gold)

**Category name mapping:**
```typescript
const CATEGORY_LABELS: Record<string, string> = {
  FOUNDATION_VOCAB: "Foundation: Vocabulary",
  FOUNDATION_GRAMMAR: "Foundation: Grammar",
  FOUNDATION_PRONUNCIATION: "Foundation: Pronunciation",
  IELTS_BASIC: "IELTS Basic",
  IELTS_ADVANCED: "IELTS Advanced",
  IELTS_INTENSIVE: "IELTS Intensive",
  SHADOWING: "Shadowing",
  DICTATION: "Dictation",
  VOCAB_LAB: "Vocab Lab",
  COMMUNITY: "Community",
  CROSS_MODULE: "Milestones",
};
```

---

## Step 5: Integrate into ProfileContent

**File:** `frontend-web/src/app/profile/ProfileContent.tsx`

Add after `<ProfileHeader>` and before `<PersonalInfoForm>`:

```tsx
import XpLevelBar from "./_components/XpLevelBar";
import AchievementsSection from "./_components/AchievementsSection";
import { gamificationApi } from "@/services/gamification.api";
import { useEffect, useState } from "react";
import type { GamificationProfile, AchievementItem } from "@/types";

// Inside component, add state + fetch:
const [gamProfile, setGamProfile] = useState<GamificationProfile | null>(null);
const [achievements, setAchievements] = useState<AchievementItem[]>([]);

useEffect(() => {
  gamificationApi.getProfile().then(setGamProfile).catch(() => {});
  gamificationApi.getAchievements().then(setAchievements).catch(() => {});
}, []);

// In JSX, after <ProfileHeader>:
{gamProfile && (
  <XpLevelBar
    level={gamProfile.level}
    currentLevelXp={gamProfile.currentLevelXp}
    xpNeeded={gamProfile.xpNeeded}
    totalXp={gamProfile.totalXp}
  />
)}

{achievements.length > 0 && (
  <AchievementsSection
    achievements={achievements}
    earnedCount={gamProfile?.achievementCount ?? 0}
    totalCount={gamProfile?.totalAchievements ?? 0}
  />
)}
```

---

## Step 6: Level Badge in Navbar

**File:** `frontend-web/src/components/Navbar.tsx`

Add a small level indicator next to the user's name (inside the profile button, ~line 310).

```tsx
{/* After displayName span, add level badge */}
{/* Fetch level from gamification API or pass via context */}
<span className="text-[10px] font-bold bg-primary/15 text-primary rounded-full px-1.5 py-0.5 ml-1">
  Lv.{userLevel}
</span>
```

**Implementation:** Either:
- Fetch from `/gamification/profile` on mount and store in state, OR
- Add `level` to the User object returned by auth (simpler — modify `GET /users/me`)

---

## Step 7: Leaderboard Component

**File:** `frontend-web/src/app/community/components/Leaderboard.tsx` (create new)

A tab or section in the Community page showing rankings.

```
┌────────────────────────────────────────────┐
│  🏅 Leaderboard                            │
│  [XP This Week] [Streak]                   │
│                                            │
│  🥇 Jane Doe          450 XP               │
│  🥈 John Smith        380 XP               │
│  🥉 Alice Wong        320 XP               │
│  4. Bob Lee           290 XP               │
│  ...                                       │
│  ────────────────────────────              │
│  Your rank: #12 (120 XP)                   │
└────────────────────────────────────────────┘
```

**Props:**
```typescript
interface LeaderboardProps {
  currentUserId: string | undefined;
}
```

**Key behavior:**
- Tab selector: `xp_weekly` | `streak`
- Fetch from `gamificationApi.getLeaderboard(type)`
- Top 3: gold/silver/bronze medal emoji + larger row
- Current user highlighted with `bg-primary/5 border-l-2 border-primary`
- Styling: card container matching PostCard style

**Integration:** Add as a section above or beside the feed in `community/page.tsx`, or as a new tab in the filter bar.

---

## Step 8: Verify

1. **Profile page** → shows XP bar (Level 0, 0/100 XP) and all 35 achievement badges (all locked)
2. **Do an action** (review a flashcard, create a post) → refresh profile → XP increases, relevant badge unlocks
3. **Navbar** → level badge shows "Lv.0" next to username
4. **Community page** → leaderboard tab shows rankings
5. **Achievement unlock** → notification bell shows "🏆 Achievement Unlocked!" notification

---

## Files Created/Modified

| Action | File |
|--------|------|
| **Modified** | `frontend-web/src/types/index.ts` — add gamification types |
| **Created** | `frontend-web/src/services/gamification.api.ts` |
| **Created** | `frontend-web/src/app/profile/_components/XpLevelBar.tsx` |
| **Created** | `frontend-web/src/app/profile/_components/AchievementsSection.tsx` |
| **Modified** | `frontend-web/src/app/profile/ProfileContent.tsx` — integrate XP + achievements |
| **Modified** | `frontend-web/src/components/Navbar.tsx` — add level badge |
| **Created** | `frontend-web/src/app/community/components/Leaderboard.tsx` |
| **Modified** | `frontend-web/src/app/community/page.tsx` — add leaderboard section |
