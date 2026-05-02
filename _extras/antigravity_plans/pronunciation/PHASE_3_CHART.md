# Phase 3 — Frontend: IPA Chart Redesign

## Goal
Replace the hardcoded frontend IPA chart with an API-driven, progress-aware version. The chart tiles show mastery status (color-coded) and the data comes from the backend instead of `data.ts`.

---

## 3.1 Update Frontend Types (`frontend-web/src/types/index.ts`)

Add/update these types:

```ts
// Update existing PronunciationSound interface
export interface PronunciationSound {
  id: string;
  symbol: string;
  name?: string;
  type: string;
  word: string;
  description?: string;
  tip?: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  voiced?: boolean;
  order: number;
  exampleWords: SoundExampleWord[];
}

export interface SoundExampleWord {
  id: string;
  word: string;
  ipa?: string;
  audioUrl?: string;
  order: number;
}

// New: progress types
export interface SoundProgress {
  soundId: string;
  symbol: string;
  type: string;
  status: 'NEW' | 'PRACTICING' | 'MASTERED';
  practiceCount: number;
  bestScore: number | null;
  lastPracticedAt: string | null;
}

export interface PronunciationStats {
  totalSounds: number;
  masteredCount: number;
  practicingCount: number;
  newCount: number;
  overallMastery: number;
}
```

---

## 3.2 Update Frontend API (`frontend-web/src/services/learning.api.ts`)

Add progress methods to `pronunciationApi`:

```ts
export const pronunciationApi = {
  // Existing
  getAllSounds: async () => {
    const { data } = await api.get<PronunciationData>('/pronunciation/sounds');
    return data;
  },
  getSound: async (symbol: string) => {
    const { data } = await api.get<PronunciationSound>(`/pronunciation/sounds/${encodeURIComponent(symbol)}`);
    return data;
  },

  // New: progress
  getProgress: async () => {
    const { data } = await api.get<SoundProgress[]>('/pronunciation/progress');
    return data;
  },
  getStats: async () => {
    const { data } = await api.get<PronunciationStats>('/pronunciation/progress/stats');
    return data;
  },
  updateProgress: async (soundId: string, score: number) => {
    const { data } = await api.post('/pronunciation/progress', { soundId, score });
    return data;
  },
};
```

---

## 3.3 Create `IpaChart` Component

**File**: `frontend-web/src/app/ielts/pronunciation/_components/IpaChart.tsx`

This replaces the inline chart grid from `PronunciationContent.tsx`.

### Props

```ts
interface IpaChartProps {
  sounds: PronunciationData;      // From API
  progress?: SoundProgress[];     // From API (null if not logged in)
  basePath: string;               // "/ielts/pronunciation" or "/pronunciation"
}
```

### Behavior

1. Render the same grid layout as existing (12-col, vowels/consonants sections)
2. Each tile receives a `mastery` status from the progress map
3. Tile colors by mastery:
   - `NEW` (no progress): original colors (yellow for monophthongs, red for diphthongs, gray for consonants)
   - `PRACTICING`: original color + a small orange dot indicator in the corner
   - `MASTERED`: original color + a small green checkmark indicator in the corner
4. Clicking a tile navigates to `${basePath}/sounds/${encodeURIComponent(symbol)}`

### Tile Sub-component

```ts
interface SoundTileProps {
  symbol: string;
  word: string;
  type: 'monophthong' | 'diphthong' | 'consonant';
  voiced?: boolean;
  mastery: 'NEW' | 'PRACTICING' | 'MASTERED';
  href: string;
}
```

The tile should:
- Show the IPA symbol prominently
- Show the example word below it
- Show a small mastery indicator badge (top-right corner):
  - `NEW`: nothing
  - `PRACTICING`: small orange circle with practice count
  - `MASTERED`: small green checkmark circle

---

## 3.4 Update `/ielts/pronunciation/page.tsx`

Replace the simple `<PronunciationContent embedded basePath="..." />` with:

```tsx
"use client";

import React, { useEffect, useState } from "react";
import { pronunciationApi } from "@/services/learning.api";
import { useAuth } from "@/contexts/AuthContext";
import IpaChart from "./_components/IpaChart";
import ProgressSummary from "./_components/ProgressSummary";
import type { PronunciationData, SoundProgress, PronunciationStats } from "@/types";

export default function IeltsPronunciationPage() {
  const { user } = useAuth();
  const [sounds, setSounds] = useState<PronunciationData | null>(null);
  const [progress, setProgress] = useState<SoundProgress[] | null>(null);
  const [stats, setStats] = useState<PronunciationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const soundsData = await pronunciationApi.getAllSounds();
        setSounds(soundsData);

        if (user) {
          const [progressData, statsData] = await Promise.all([
            pronunciationApi.getProgress(),
            pronunciationApi.getStats(),
          ]);
          setProgress(progressData);
          setStats(statsData);
        }
      } catch (err) {
        console.error("Failed to fetch pronunciation data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading || !sounds) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 bg-white overflow-y-auto p-6 md:p-8">
      {/* Progress Summary (only if logged in) */}
      {user && stats && <ProgressSummary stats={stats} />}

      {/* IPA Chart */}
      <IpaChart
        sounds={sounds}
        progress={progress ?? undefined}
        basePath="/ielts/pronunciation"
      />
    </div>
  );
}
```

---

## 3.5 Update Standalone `/pronunciation/page.tsx`

The standalone pronunciation page should also use `IpaChart` but **without** progress (no auth required for the public chart):

```tsx
"use client";
import React, { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import IpaChart from '@/app/ielts/pronunciation/_components/IpaChart';
import { pronunciationApi } from '@/services/learning.api';
import type { PronunciationData } from '@/types';

export default function PronunciationPage() {
  const [sounds, setSounds] = useState<PronunciationData | null>(null);

  useEffect(() => {
    pronunciationApi.getAllSounds().then(setSounds).catch(console.error);
  }, []);

  return (
    <>
      <PageHeader
        title="Pronunciation"
        backgroundImage="https://res.cloudinary.com/dalaaegob/image/upload/v1772715265/788c018d-403b-4260-8b8d-710d0a3db342.png"
        breadcrumbs={[
          { label: 'Homepage', href: '/' },
          { label: 'Pronunciation' },
        ]}
      />
      <div className="container mx-auto max-w-screen-xl px-4 py-8">
        {sounds ? (
          <IpaChart sounds={sounds} basePath="/pronunciation" />
        ) : (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </>
  );
}
```

---

## 3.6 Deprecate `data.ts`

After this phase, the file `frontend-web/src/app/pronunciation/data.ts` is **no longer used**. Leave it in place for reference but add a comment at the top:

```ts
// @deprecated — This file is no longer used. Sound data is now fetched from the API.
// Kept for reference only. See pronunciationApi.getAllSounds()
```

Also update `PronunciationContent.tsx` to re-export `IpaChart` or remove it entirely if no longer used.

---

## 3.7 Verification Checklist

- [ ] `/ielts/pronunciation` loads the IPA chart from the API (no hardcoded data)
- [ ] Chart tiles show correct symbols and words from the database
- [ ] Logged-in users see a progress summary at the top (e.g. "0/44 sounds mastered")
- [ ] Chart tiles show mastery indicators for logged-in users
- [ ] Not-logged-in users see the chart without progress indicators
- [ ] `/pronunciation` standalone page still works (no progress, public)
- [ ] Clicking a tile navigates to `/ielts/pronunciation/sounds/{symbol}`
- [ ] Loading spinner shows while data is being fetched
- [ ] Grid layout matches the existing design (12-col, vowels left, consonants below)
