"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { type ExamDetail } from "@/types";
import SpeakingTaskBoard from "@/components/SpeakingTaskBoard";
import { useGrading } from "@/contexts/GradingContext";

interface TakeSpeakingBoardProps {
  exam: ExamDetail;
  sessionInfo: any;
  secondsLeft: number;
  submitAndTrack?: (data: any) => Promise<any>;
}

export default function TakeSpeakingBoard({
  exam,
  sessionInfo,
  secondsLeft,
  submitAndTrack: propSubmitAndTrack,
}: TakeSpeakingBoardProps) {
  const router = useRouter();
  const sessionId = sessionInfo?.id as string;
  const examId = exam.id as string;

  const [submitting, setSubmitting] = useState(false);
  const [isConfirmingSubmit, setIsConfirmingSubmit] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const { submitAndTrack: contextSubmit, jobs } = useGrading();
  const submitAndTrack = propSubmitAndTrack || contextSubmit;
  const activeJob = jobs.find((j) => j.sessionId === sessionId);
  const isAiProcessing =
    !!activeJob &&
    (activeJob.status === "SUBMITTING" || activeJob.status === "GRADING");

  const handleSubmit = (submittedAnswers: Record<string, any>) => {
    setSubmitting(true);
    submitAndTrack({
      sessionId,
      examId,
      examType: "SPEAKING",
      answers: submittedAnswers,
      timeTaken: exam.duration * 60 - secondsLeft,
      resultUrl: `/ielts/intensive/${examId}/result/${sessionId}`,
    });
  };

  useEffect(() => {
    if (activeJob?.status === "DONE" && activeJob.resultUrl) {
      router.replace(activeJob.resultUrl);
    } else if (activeJob?.status === "ERROR") {
      setSubmitting(false);
    }
  }, [activeJob?.status, activeJob?.resultUrl, router]);

  return (
    <div className="h-screen flex flex-col font-sans bg-[#F3F4F6] overflow-hidden text-[#1A1A1A]">
      <header className="h-[60px] flex-shrink-0 bg-white border-b border-gray-300 flex items-center justify-between px-6 z-20 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-6">
          <div className="text-3xl font-extrabold tracking-tighter text-[#D51025]">IELTS</div>
          <div className="flex flex-col justify-center">
            <div className="text-sm font-bold text-gray-900 leading-tight">Test taker ID<span className="text-[#1a1a1a] ml-1"></span></div>
            <div className={`text-[13px] mt-0.5 leading-tight ${(secondsLeft !== null && secondsLeft < 600) ? 'text-red-600 animate-pulse' : 'text-gray-500'}`}>
              {secondsLeft !== null ? formatTime(secondsLeft) : '--:--'}  minutes remaining
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-gray-700">
          <button
            onClick={() => setIsMuted(m => !m)}
            className="hover:text-black transition-colors"
            title={isMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {isMuted ? (
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current text-red-500">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current text-black">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </button>
          <button className="hover:text-black transition-colors" title="Connection status">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current text-black">
              <path d="M1 9l2 2c5-4 13-4 18 0l2-2C16.9 3.9 7.1 3.9 1 9zm8 8l3 4 3-4c-1.7-2.2-4.3-2.2-6 0zm-4-4l2 2c2.5-2.2 6.5-2.2 9 0l2-2C14.3 9.4 9.7 9.4 5 13z" />
            </svg>
          </button>
          <button className="hover:text-black transition-colors">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-[2]" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>
          <button className="hover:text-black transition-colors pl-2 mr-2">
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          </button>
          <button
            onClick={() => setIsConfirmingSubmit(true)}
            disabled={submitting || isAiProcessing}
            className="ml-2 px-4 py-1.5 text-xs font-bold rounded bg-[#D51025] hover:bg-red-700 text-white transition-colors disabled:opacity-60 uppercase"
          >
            {submitting ? "..." : "Finish"}
          </button>
        </div>
      </header>

      <main className="flex-1 min-h-0 bg-white shadow-inner relative flex flex-col overflow-hidden">
        {activeJob?.status === "ERROR" && (
          <div className="bg-red-50 border-b border-red-200 p-3 text-center text-red-700 font-medium z-10 shadow-sm flex items-center justify-center gap-2 text-sm">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            {activeJob.error || "An error occurred during grading. Please try submitting again."}
          </div>
        )}
        <SpeakingTaskBoard
          key="speaking-board"
          exam={exam}
          submitting={submitting || isAiProcessing}
          onSubmit={handleSubmit}
          onAnswersChange={(ans) => setAnswers(ans)}
          muted={isMuted}
        />
      </main>

      {/* Confirm Submit Overlay */}
      {isConfirmingSubmit && !submitting && !isAiProcessing && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-sm w-full mx-auto animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Submit Test?</h3>
              <p className="text-gray-600">Are you sure you want to finish and submit the test? You will not be able to change your answers afterward.</p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100">
              <button
                onClick={() => setIsConfirmingSubmit(false)}
                className="px-4 py-2 font-semibold text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsConfirmingSubmit(false);
                  handleSubmit(answers);
                }}
                className="px-4 py-2 font-bold text-white bg-[#D51025] rounded hover:bg-red-700 transition-colors"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Grading Overlay (Speaking & Writing) ── */}
      {isAiProcessing && (
        <div className="fixed inset-0 z-[200] bg-[#0a0a0a]/90 backdrop-blur-md flex flex-col items-center justify-center px-4">
          <div className="relative mb-10">
            <div className="w-24 h-24 rounded-full border-[3px] border-white/10" />
            <div className="absolute inset-0 w-24 h-24 rounded-full border-[3px] border-transparent border-t-[#D51025] animate-spin" />
            <div className="absolute inset-[10px] w-[72px] h-[72px] rounded-full border-[2px] border-transparent border-t-white/30 animate-spin" style={{ animationDuration: "1.4s", animationDirection: "reverse" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-white fill-current opacity-60">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
          </div>

          <h2 className="text-white text-2xl font-extrabold tracking-tight mb-2">
            {activeJob?.status === "SUBMITTING" ? "Submitting your test…" : "Calculating your score…"}
          </h2>
          <p className="text-white/50 text-sm font-medium mb-2 text-center max-w-xs">
            {activeJob?.status === "SUBMITTING"
              ? "Uploading your recordings and submitting…"
              : "Our AI examiner is grading your responses. This may take a minute."}
          </p>

          <div className="flex items-center gap-2 mb-10">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>

          <div className="w-[240px] border-t border-white/10 mb-8" />

          <div className="flex flex-col items-center gap-3 w-[280px]">
            <p className="text-white/40 text-xs text-center mb-1">
              You can leave now — we'll send a notification when your score is ready.
            </p>
            <Link
              href="/ielts/intensive"
              className="flex items-center justify-center gap-2 w-full py-3 bg-white/10 hover:bg-white/15 text-white/80 hover:text-white rounded-xl font-semibold text-[14px] transition-colors border border-white/10"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Go back to mock tests
            </Link>
            <p className="text-white/25 text-[11px] text-center">
              Or stay here — you'll be automatically redirected when done.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
