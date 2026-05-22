"use client";

import Link from "next/link";
import { AlertTriangle, ChevronLeft, Loader2, RefreshCcw } from "lucide-react";
import SpeakingResultView from "@/components/SpeakingResultView";
import { useSpeakingSession } from "@/hooks/useIeltsAdvancedSpeaking";

export default function SpeakingResultContent({
  partId,
  sessionId,
}: {
  partId: string;
  sessionId: string;
}) {
  const { data: session, isLoading, refetch } = useSpeakingSession(sessionId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-gray-500 font-bold">Loading your results...</p>
      </div>
    );
  }

  if (!session) {
    return <div className="p-10 font-bold text-red-500">Session not found</div>;
  }

  if (session.status === "GRADING") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-6 text-center px-4">
        <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">AI Grading in Progress</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            We are analyzing your speaking responses. This usually takes about 10-30 seconds.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-sm font-bold transition-all"
        >
          <RefreshCcw className="w-4 h-4" />
          Refresh Status
        </button>
      </div>
    );
  }

  if (session.status === "GRADING_FAILED") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Grading Failed</h2>
        <p className="text-gray-500">{session.feedback?.error || "An unknown error occurred during grading."}</p>
        <Link
          href={`/ielts/advanced/speaking/${partId}`}
          className="mt-4 px-6 py-3 bg-primary text-gray-900 font-bold rounded-xl"
        >
          Try Again
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-6">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-4">
          <Link
            href={`/ielts/advanced/speaking/${partId}/my-answers`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 font-bold text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to My Answers
          </Link>
        </div>
        <SpeakingResultView feedback={session.feedback as any} />
      </div>
    </div>
  );
}
