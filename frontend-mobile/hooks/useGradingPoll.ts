/**
 * useGradingPoll — polls the session endpoint until AI grading is complete.
 *
 * Mirrors the web GradingContext polling logic but as a standalone hook.
 *
 * Usage:
 *  const { isGrading, isDone, error } = useGradingPoll({
 *    sessionId: session.id,
 *    enabled: submitted && isAiType,
 *    onDone: (sessionId) => router.replace(`/ielts/intensive/result/${sessionId}`),
 *  });
 */

import { useEffect, useRef, useCallback } from 'react';
import { ieltsExamsApi } from '@/services/ielts.api';

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 60; // 5 min ceiling

interface UseGradingPollOptions {
  /** Session ID to poll. */
  sessionId: string | null;
  /** Only start polling when true (set after submitSession resolves). */
  enabled: boolean;
  /** Called once when the session reaches GRADED state. */
  onDone: (sessionId: string) => void;
  /** Called if polling detects GRADING_FAILED or max attempts exceeded. */
  onError?: (message: string) => void;
  /** Optional custom polling function (defaults to ieltsExamsApi.getSession). */
  pollFn?: (sessionId: string) => Promise<any>;
}

export function useGradingPoll({
  sessionId,
  enabled,
  onDone,
  onError,
  pollFn,
}: UseGradingPollOptions) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptsRef = useRef(0);
  const doneCalledRef = useRef(false);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled || !sessionId) return;

    attemptsRef.current = 0;
    doneCalledRef.current = false;

    const tick = async () => {
      if (doneCalledRef.current) return;
      attemptsRef.current += 1;

      // Safety ceiling: stop after MAX_POLL_ATTEMPTS
      if (attemptsRef.current > MAX_POLL_ATTEMPTS) {
        stopPolling();
        onError?.('Grading is taking longer than expected. Please check results later.');
        return;
      }

      try {
        const session = pollFn
          ? await pollFn(sessionId)
          : await ieltsExamsApi.getSession(sessionId);

        // Terminal failure state
        if (session.status === 'GRADING_FAILED') {
          stopPolling();
          onError?.('AI grading failed. Please retry from your history.');
          return;
        }

        const result = session?.result;
        const isGraded =
          (result &&
            (result.speakingScore != null ||
              result.writingScore != null ||
              session.status === 'GRADED')) ||
          session.status === 'GRADED';

        if (isGraded) {
          stopPolling();
          if (!doneCalledRef.current) {
            doneCalledRef.current = true;
            onDone(sessionId);
          }
        }
      } catch (e) {
        // Silent retry — don't stop polling on transient network errors
      }
    };

    // First check immediately, then every POLL_INTERVAL_MS
    tick();
    intervalRef.current = setInterval(tick, POLL_INTERVAL_MS);

    return stopPolling;
  }, [enabled, sessionId, onDone, onError, stopPolling, pollFn]);
}
