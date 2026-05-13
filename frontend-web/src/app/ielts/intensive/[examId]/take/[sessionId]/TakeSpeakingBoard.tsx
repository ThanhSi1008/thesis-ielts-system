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
}

export default function TakeSpeakingBoard({
  exam,
  sessionInfo,
  secondsLeft,
}: TakeSpeakingBoardProps) {
  const router = useRouter();
  const sessionId = sessionInfo?.id as string;
  const examId = exam.id as string;

  const [submitting, setSubmitting] = useState(false);
  const [isConfirmingSubmit, setIsConfirmingSubmit] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const { submitAndTrack, jobs } = useGrading();
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

      <main className="flex-1 min-h-0 bg-white shadow-inner relative flex overflow-hidden">
        <SpeakingTaskBoard
          key="speaking-board"
          exam={exam}
          submitting={submitting || isAiProcessing}
          onSubmit={handleSubmit}
          onAnswersChange={(ans) => setAnswers(ans)}
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
