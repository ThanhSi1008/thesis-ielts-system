"use client";

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { examsApi } from "@/services/exams.api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type JobStatus = "SUBMITTING" | "GRADING" | "DONE" | "ERROR";

export interface GradingJob {
  sessionId: string;
  examId: string;
  examType: "SPEAKING" | "WRITING";
  status: JobStatus;
  resultUrl: string;
  error?: string;
}

export interface SubmitAndTrackParams {
  sessionId: string;
  examId: string;
  examType: "SPEAKING" | "WRITING";
  answers: any;
  timeTaken: number;
  resultUrl: string;
}

interface GradingContextValue {
  jobs: GradingJob[];
  submitAndTrack: (params: SubmitAndTrackParams) => void;
  setSilencedSessionId: (id: string | null) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const GradingContext = createContext<GradingContextValue>({
  jobs: [],
  submitAndTrack: () => { },
  setSilencedSessionId: () => { },
});

export function useGrading() {
  return useContext(GradingContext);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function GradingProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<GradingJob[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [silencedSessionId, setSilencedSessionId] = useState<string | null>(null);
  const pollRefs = useRef<Record<string, number>>({});

  // Helper: patch a single job by sessionId
  const patchJob = useCallback((sessionId: string, patch: Partial<GradingJob>) => {
    setJobs(prev => prev.map(j => j.sessionId === sessionId ? { ...j, ...patch } : j));
  }, []);

  // Polling loop: checks every 5s until score is available
  const startPolling = useCallback((sessionId: string) => {
    if (pollRefs.current[sessionId]) return;
    pollRefs.current[sessionId] = window.setInterval(async () => {
      try {
        const session = await examsApi.getSession(sessionId);
        
        if (session.status === "GRADING_FAILED") {
          window.clearInterval(pollRefs.current[sessionId]);
          delete pollRefs.current[sessionId];
          patchJob(sessionId, { status: "ERROR", error: "AI grading failed. Please retry." });
          return;
        }
        
        const res = session?.result;
        const isGraded =
          res &&
          (res.speakingScore != null ||
            res.writingScore != null ||
            session.status === "GRADED");
        if (isGraded) {
          window.clearInterval(pollRefs.current[sessionId]);
          delete pollRefs.current[sessionId];
          patchJob(sessionId, { status: "DONE" });
        }
      } catch {
        // silent retry
      }
    }, 5000);
  }, [patchJob]);

  // Main entry point — runs the entire pipeline asynchronously in the background
  const submitAndTrack = useCallback((params: SubmitAndTrackParams) => {
    const { sessionId, examId, examType, answers, timeTaken, resultUrl } = params;

    // Register the job immediately (SUBMITTING)
    setJobs(prev => {
      if (prev.some(j => j.sessionId === sessionId)) return prev;
      return [...prev, { sessionId, examId, examType, status: "SUBMITTING", resultUrl }];
    });

    // Run async pipeline — intentionally NOT awaited so the caller is unblocked
    (async () => {
      try {
        let finalAnswers = answers;

        // 1. Upload speaking blobs to Cloudinary
        if (examType === "SPEAKING") {
          const cloudinaryAnswers: Record<string, string> = {};
          for (const [key, value] of Object.entries(answers)) {
            if (value && typeof value === "object" && "blob" in (value as any)) {
              const blob = (value as any).blob as Blob;
              const res = await examsApi.uploadAudio(blob, `speaking-q${key}.webm`);
              cloudinaryAnswers[key] = res.url;
            }
          }
          finalAnswers = cloudinaryAnswers;
        }

        // 2. Submit to backend
        await examsApi.submitSession(sessionId, finalAnswers, timeTaken);

        // 3. Move to GRADING and start polling for AI score
        patchJob(sessionId, { status: "GRADING" });
        startPolling(sessionId);
      } catch (e: any) {
        patchJob(sessionId, { status: "ERROR", error: e?.message || "Submit failed" });
      }
    })();
  }, [patchJob, startPolling]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(pollRefs.current).forEach(id => window.clearInterval(id));
    };
  }, []);

  const dismiss = (sessionId: string) => {
    window.clearInterval(pollRefs.current[sessionId]);
    delete pollRefs.current[sessionId];
    setDismissedIds(prev => new Set([...prev, sessionId]));
    setJobs(prev => prev.filter(j => j.sessionId !== sessionId));
  };

  // Toast: show jobs once they exist (all statuses except ERROR without message)
  // ALSO: hide if the current page is already handling/displaying this session (silencedSessionId)
  const toastJobs = jobs.filter(
    j =>
      !dismissedIds.has(j.sessionId) &&
      j.sessionId !== silencedSessionId &&
      (j.status === "SUBMITTING" || j.status === "GRADING" || j.status === "DONE")
  );

  return (
    <GradingContext.Provider value={{ jobs, submitAndTrack, setSilencedSessionId }}>
      {children}

      {/* ── Global bottom-right toast stack ── */}
      {toastJobs.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
          {toastJobs.map(job => (
            <div
              key={job.sessionId}
              className="w-[340px] rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300"
              style={{
                background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {(job.status === "SUBMITTING" || job.status === "GRADING") ? (
                /* ── Grading in progress ── */
                <div className="flex items-start gap-3 p-4">
                  <div className="flex-shrink-0 w-9 h-9 mt-0.5 rounded-full border-[3px] border-white/10 border-t-[#D51025] animate-spin" />
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-[13.5px] font-bold leading-snug mb-0.5">
                      {job.status === "SUBMITTING"
                        ? `Submitting your ${job.examType === "SPEAKING" ? "Speaking" : "Writing"} test…`
                        : `Grading your ${job.examType === "SPEAKING" ? "Speaking" : "Writing"} test…`}
                    </div>
                    <div className="text-white/50 text-[12px] leading-snug">
                      {job.status === "SUBMITTING"
                        ? (job.examType === "SPEAKING" ? "Uploading recordings and submitting…" : "Sending your answers…")
                        : "AI scoring in progress. We'll notify you when it's done."}
                    </div>
                  </div>
                  <button
                    onClick={() => dismiss(job.sessionId)}
                    className="flex-shrink-0 text-white/30 hover:text-white/70 transition-colors ml-1 mt-0.5"
                    title="Dismiss"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2" strokeLinecap="round">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                /* ── Score ready ── */
                <div>
                  <div className="flex items-start gap-3 p-4 pb-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary border border-primary flex items-center justify-center mt-0.5">
                      <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] text-white fill-current">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-[13.5px] font-bold leading-snug mb-0.5">
                        Your score is ready!
                      </div>
                      <div className="text-white/50 text-[12px] leading-snug">
                        {job.examType === "SPEAKING" ? "Speaking" : "Writing"} test graded by AI examiner.
                      </div>
                    </div>
                    <button
                      onClick={() => dismiss(job.sessionId)}
                      className="flex-shrink-0 text-white/30 hover:text-white/70 transition-colors ml-1 mt-0.5"
                      title="Dismiss"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2" strokeLinecap="round">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="px-4 pb-4">
                    <Link
                      href={job.resultUrl}
                      onClick={() => dismiss(job.sessionId)}
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary hover:bg-primary/50 text-white rounded-xl font-bold text-[13.5px] transition-colors"
                    >
                      View Results
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </GradingContext.Provider>
  );
}
