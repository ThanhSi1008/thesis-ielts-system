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
