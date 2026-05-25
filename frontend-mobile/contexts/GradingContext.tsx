import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import { router } from 'expo-router';
import { ieltsExamsApi, ieltsAdvancedApi } from '@/services/ielts.api';
import { toast } from '@/components/ui/index';

export type JobStatus = 'SUBMITTING' | 'GRADING' | 'DONE' | 'ERROR';

export interface GradingJob {
  sessionId: string;
  examId?: string;
  examType: 'SPEAKING' | 'WRITING' | 'INTENSIVE';
  status: JobStatus;
  resultUrl: string;
  error?: string;
}

export interface SubmitAndTrackParams {
  sessionId: string;
  examId?: string;
  examType: 'SPEAKING' | 'WRITING' | 'INTENSIVE';
  answers: any;
  timeTaken?: number;
  resultUrl: string;
}

interface GradingContextType {
  jobs: GradingJob[];
  submitAndTrack: (params: SubmitAndTrackParams) => Promise<void>;
  setSilencedSessionId: (id: string | null) => void;
}

const GradingContext = createContext<GradingContextType | undefined>(undefined);

export function GradingProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<GradingJob[]>([]);
  const [silencedSessionId, setSilencedSessionId] = useState<string | null>(null);
  const pollIntervals = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  // Clean up all intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(pollIntervals.current).forEach((interval) => clearInterval(interval));
    };
  }, []);

  const patchJob = useCallback((sessionId: string, patch: Partial<GradingJob>) => {
    setJobs((prev) => prev.map((j) => (j.sessionId === sessionId ? { ...j, ...patch } : j)));
  }, []);

  const startPolling = useCallback(
    (sessionId: string, examType: 'SPEAKING' | 'WRITING' | 'INTENSIVE', resultUrl: string) => {
      if (pollIntervals.current[sessionId]) return;

      let attempts = 0;
      const maxAttempts = 60; // 5 mins cap

      const poll = async () => {
        attempts++;
        if (attempts > maxAttempts) {
          if (pollIntervals.current[sessionId]) {
            clearInterval(pollIntervals.current[sessionId]);
            delete pollIntervals.current[sessionId];
          }
          patchJob(sessionId, { status: 'ERROR', error: 'Grading timed out' });

          if (sessionId !== silencedSessionId) {
            toast.error(
              'Grading Timeout',
              'AI grading is taking longer than expected. Please check your history later.',
            );
          }
          return;
        }

        try {
          let session: any;
          if (examType === 'WRITING') {
            session = await ieltsAdvancedApi.getWritingSession(sessionId);
          } else if (examType === 'SPEAKING') {
            session = await ieltsAdvancedApi.getSpeakingSession(sessionId);
          } else {
            session = await ieltsExamsApi.getSession(sessionId);
          }

          if (session.status === 'GRADING_FAILED') {
            if (pollIntervals.current[sessionId]) {
              clearInterval(pollIntervals.current[sessionId]);
              delete pollIntervals.current[sessionId];
            }
            patchJob(sessionId, { status: 'ERROR', error: 'AI grading failed' });

            if (sessionId !== silencedSessionId) {
              toast.error(
                'AI Grading Failed',
                'The AI was unable to score your submission. Please try again.',
              );
            }
            return;
          }

          const isGraded =
            session.status === 'GRADED' ||
            (session.ieltsIntensiveResult &&
              (session.ieltsIntensiveResult.speakingScore != null ||
                session.ieltsIntensiveResult.writingScore != null));

          if (isGraded) {
            if (pollIntervals.current[sessionId]) {
              clearInterval(pollIntervals.current[sessionId]);
              delete pollIntervals.current[sessionId];
            }
            patchJob(sessionId, { status: 'DONE' });

            if (sessionId !== silencedSessionId) {
              const isSpeaking =
                examType === 'SPEAKING' ||
                session?.exam?.type === 'SPEAKING' ||
                session?.ieltsIntensiveResult?.speakingScore != null;
              const skillLabel = isSpeaking ? 'Speaking' : 'Writing';

              toast.success(
                'AI Score is Ready! 🎉',
                `Your ${skillLabel} test has been successfully graded. Tap to view.`,
                () => {
                  router.push(resultUrl as any);
                },
              );
            }
          }
        } catch (err) {
          // silent retry on network/transient failures
        }
      };

      // run immediately, then every 5 seconds
      poll();
      pollIntervals.current[sessionId] = setInterval(poll, 5000);
    },
    [patchJob, silencedSessionId],
  );

  const submitAndTrack = useCallback(
    async (params: SubmitAndTrackParams) => {
      const { sessionId, examId, examType, answers, timeTaken, resultUrl } = params;

      // Check if already tracking
      if (jobs.some((j) => j.sessionId === sessionId)) return;

      // Add to jobs array
      const newJob: GradingJob = {
        sessionId,
        examId,
        examType,
        status: 'SUBMITTING',
        resultUrl,
      };
      setJobs((prev) => [...prev, newJob]);

      // Show initial submitting toast
      if (sessionId !== silencedSessionId) {
        const testName = examType === 'SPEAKING' ? 'Speaking' : examType === 'WRITING' ? 'Writing' : 'Intensive';
        toast.loading(
          `Submitting your ${testName} test...`,
          'Sending your answers to the evaluation engine...',
        );
      }

      // Run pipeline asynchronously so caller is unblocked
      (async () => {
        try {
          // Submit depending on examType
          if (examType === 'WRITING') {
            await ieltsAdvancedApi.submitWritingSession(sessionId, {
              essay: answers,
              timeTaken,
            });
          } else if (examType === 'SPEAKING') {
            await ieltsAdvancedApi.submitSpeakingSession(sessionId, {
              audioAnswers: answers,
              timeTaken,
            });
          } else {
            await ieltsExamsApi.submitSession(sessionId, answers, timeTaken);
          }

          // Successfully submitted, transition to GRADING
          patchJob(sessionId, { status: 'GRADING' });

          if (sessionId !== silencedSessionId) {
            const testName = examType === 'SPEAKING' ? 'Speaking' : examType === 'WRITING' ? 'Writing' : 'Intensive';
            toast.loading(
              `Grading your ${testName} test...`,
              "AI scoring in progress. We'll notify you when it's done.",
            );
          }

          // Start polling loop
          startPolling(sessionId, examType, resultUrl);
        } catch (err: any) {
          console.error('Error submitting and tracking job:', err);
          patchJob(sessionId, { status: 'ERROR', error: err?.message || 'Submission failed' });

          if (sessionId !== silencedSessionId) {
            toast.error(
              'Submission Failed',
              err?.message || 'Could not submit your test. Please try again.',
            );
          }
        }
      })();
    },
    [jobs, startPolling, silencedSessionId, patchJob],
  );

  return (
    <GradingContext.Provider value={{ jobs, submitAndTrack, setSilencedSessionId }}>
      {children}
    </GradingContext.Provider>
  );
}

export function useGrading() {
  const context = useContext(GradingContext);
  if (context === undefined) {
    throw new Error('useGrading must be used within a GradingProvider');
  }
  return context;
}
