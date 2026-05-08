# Phase 2 — Data Fetching Hook

## Target File
`frontend-web/src/app/ielts/dashboard/_hooks/useDashboardData.ts`

## Purpose
Centralize all data fetching for the dashboard in a single custom hook (**SRP**). Components only receive the data they need — they never call APIs directly (**DIP**).

## Dependencies
- `@/services/learning.api` (vocabularyApi, pronunciationApi — already exist)
- `@/lib/api` (axios instance — already exists)
- `@/services/exams.api` (examsApi — already exists)

---

## Existing API Endpoints to Leverage

Before writing this hook, here are the APIs already used by other pages:

| API | Used By | Returns |
|-----|---------|---------|
| `vocabularyApi.getBooks()` | `VocabularyContent.tsx` | `FoundationVocabBook[]` — count = `books.length` |
| `pronunciationApi.getAllSounds()` | `pronunciation/page.tsx` | `PronunciationData` — count = total consonant + vowel sounds |
| `api.get('/ielts/advanced/listening')` | `AdvancedContent.tsx` | `PracticePart[]` — count = `parts.length` |
| `api.get('/ielts/advanced/reading')` | `AdvancedContent.tsx` | `PracticePart[]` — count = `parts.length` |
| `examsApi.getIntensiveCatalog(skill)` | `IntensiveContent.tsx` | `IeltsIntensiveCatalogResponse` — count = `groups.flatMap(g => g.tests).length` |

For sections where there's no direct count API, use reasonable fallbacks:
- **Grammar topics**: Use `api.get('/grammar/topics')` if available, otherwise hardcode known count.
- **Basic lessons/exercises**: These are server-rendered pages; the hook can use `api.get('/ielts/basic/${skill}/lessons')` if such an endpoint exists. If not, skip count and show a descriptive label like "Lessons & Exercises" instead.
- **Advanced Writing/Speaking**: Use existing catalog endpoints.

---

## Code

```typescript
// frontend-web/src/app/ielts/dashboard/_hooks/useDashboardData.ts

import { useState, useEffect } from "react";
import { vocabularyApi } from "@/services/learning.api";
import api from "@/lib/api";
import { examsApi } from "@/services/exams.api";

export interface DashboardData {
  /** Counts keyed by dataKey from constants */
  counts: Record<string, number | null>;
  loading: boolean;
  error: string | null;
}

/**
 * Fetches summary counts for the dashboard.
 * Each count maps to a `dataKey` in `dashboard.constants.ts`.
 *
 * SRP: This hook only fetches data. It does not render anything.
 * DIP: Components import this hook, not raw API calls.
 */
export function useDashboardData(): DashboardData {
  const [counts, setCounts] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchAll() {
      try {
        setLoading(true);
        setError(null);

        // Fire all requests in parallel for performance
        const [
          vocabBooks,
          grammarTopics,
          advancedListening,
          advancedReading,
          intensiveListening,
          intensiveReading,
        ] = await Promise.allSettled([
          vocabularyApi.getBooks(),
          api.get("/grammar/topics").then((res) => res.data),
          api.get("/ielts/advanced/listening", { withCredentials: true }).then((res) => res.data),
          api.get("/ielts/advanced/reading", { withCredentials: true }).then((res) => res.data),
          examsApi.getIntensiveCatalog("LISTENING"),
          examsApi.getIntensiveCatalog("READING"),
        ]);

        if (!mounted) return;

        const result: Record<string, number | null> = {};

        // Foundation
        result.vocabularyBookCount =
          vocabBooks.status === "fulfilled" ? vocabBooks.value.length : null;
        result.grammarTopicCount =
          grammarTopics.status === "fulfilled"
            ? (Array.isArray(grammarTopics.value) ? grammarTopics.value.length : null)
            : null;
        result.pronunciationSoundCount = 44; // Fixed: 24 consonants + 20 vowels (IPA standard)

        // Basic — lessons are server-rendered, we show descriptive labels
        // Set these to null so the component shows "Lessons & Exercises" instead of a count
        result.basicListeningCount = null;
        result.basicReadingCount = null;
        result.basicWritingCount = null;
        result.basicSpeakingCount = null;

        // Advanced
        result.advancedListeningCount =
          advancedListening.status === "fulfilled"
            ? (Array.isArray(advancedListening.value) ? advancedListening.value.length : null)
            : null;
        result.advancedReadingCount =
          advancedReading.status === "fulfilled"
            ? (Array.isArray(advancedReading.value) ? advancedReading.value.length : null)
            : null;
        // Writing/Speaking counts are not critical; set to null
        result.advancedWritingCount = null;
        result.advancedSpeakingCount = null;

        // Intensive
        result.intensiveListeningCount =
          intensiveListening.status === "fulfilled"
            ? intensiveListening.value.groups.flatMap((g: any) => g.tests).length
            : null;
        result.intensiveReadingCount =
          intensiveReading.status === "fulfilled"
            ? intensiveReading.value.groups.flatMap((g: any) => g.tests).length
            : null;
        result.intensiveWritingCount = null;
        result.intensiveSpeakingCount = null;

        setCounts(result);
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || "Failed to load dashboard data");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    fetchAll();

    return () => {
      mounted = false;
    };
  }, []);

  return { counts, loading, error };
}
```

---

## Important Notes for Implementer

1. **`Promise.allSettled`** is used so that a failure in one API call doesn't prevent the rest from loading. The dashboard should gracefully degrade — missing counts show `null` and components should render a fallback (e.g., a dash or descriptive text).

2. **`pronunciationSoundCount`** is hardcoded to `44` because the IPA chart has a fixed number of sounds (24 consonants + 20 vowels). The API returns structured data, not a simple count.

3. **Basic counts** are set to `null` because the basic page's lessons/exercises are loaded via server-rendered pages with dynamic routes (`/ielts/basic/[skill]/lessons/page.tsx`). There is no simple "count" endpoint. The component should show "Lessons & Exercises" rather than a number.

4. If the model adding advanced writing/speaking count endpoints is desired later, they can be added here without changing any components — just populate the data key. This is **OCP in action**.

---

## Checklist
- [ ] File created at `frontend-web/src/app/ielts/dashboard/_hooks/useDashboardData.ts`
- [ ] Hook only fetches data, does not render JSX (SRP)
- [ ] All API calls use existing services, not raw `fetch` (DIP)
- [ ] `Promise.allSettled` for graceful degradation
- [ ] Cleanup via `mounted` flag to prevent state updates after unmount
