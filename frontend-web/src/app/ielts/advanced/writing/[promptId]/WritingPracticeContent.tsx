"use client";

import { useEffect, useState, useRef } from "react";
import { useWritingSession, useSaveWritingDraft, useSubmitWriting, useWritingPromptDetail, useStartWritingSession } from "@/hooks/useIeltsAdvancedWriting";
import { ChevronLeft, Save, Send, Clock, AlertCircle, PlayCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/components/Toaster";

export default function WritingPracticeContent({ promptId }: { promptId: string }) {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session") || "";
  const router = useRouter();

  const { data: prompt, isLoading: isPromptLoading } = useWritingPromptDetail(promptId);
  const { data: session, isLoading: isSessionLoading } = useWritingSession(sessionId);
  const startSession = useStartWritingSession();
  const saveDraft = useSaveWritingDraft();
  const submitWriting = useSubmitWriting();

  const [essay, setEssay] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const lastSavedRef = useRef<string>("");

  // If no session param, show the prompt overview with Start/Resume button
  if (!sessionId) {
    if (isPromptLoading) {
      return <div className="p-10 font-bold text-gray-500">Loading...</div>;
    }
    if (!prompt) {
      return <div className="p-10 font-bold text-red-500">Prompt not found.</div>;
    }

    const handleStart = async () => {
      try {
        const s = await startSession.mutateAsync(promptId);
        router.push(`/ielts/advanced/writing/${promptId}?session=${s.id}`);
      } catch {
        toast.error("Failed to start practice session");
      }
    };

    return (
      <div className="max-w-3xl mx-auto py-8 px-4 flex flex-col gap-6">
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm font-medium text-amber-800 dark:text-amber-400">
            You should spend about {prompt.suggestedTime} minutes on this task. Write at least {prompt.minimumWords} words.
          </div>
        </div>

        {prompt.imageUrl && (
          <div className="rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden bg-white p-4">
            <img src={prompt.imageUrl} alt="Writing Prompt" className="w-full h-auto object-contain max-h-[400px]" />
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-8">
          <p className="text-gray-800 dark:text-slate-200 text-lg leading-relaxed font-medium whitespace-pre-wrap">
            {prompt.prompt}
          </p>
        </div>

        <div className="flex items-center justify-between">
          {prompt.activeSession ? (
            <button
              onClick={() => router.push(`/ielts/advanced/writing/${promptId}?session=${prompt.activeSession!.id}`)}
              className="flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-base transition-all shadow-sm"
            >
              <PlayCircle className="w-5 h-5" />
              Resume Practice
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={startSession.isPending}
              className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-gray-900 rounded-xl font-black text-base transition-all shadow-sm disabled:opacity-50"
            >
              <PlayCircle className="w-5 h-5" />
              {startSession.isPending ? "Starting..." : "Start Practice"}
            </button>
          )}
          <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
            <Clock className="w-4 h-4" />
            {prompt.suggestedTime} min · {prompt.minimumWords} words minimum
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (session && session.draftEssay && !essay) {
      setEssay(session.draftEssay);
      lastSavedRef.current = session.draftEssay;
    }
  }, [session, essay]);

  useEffect(() => {
    if (prompt && timeRemaining === 0) {
      setTimeRemaining(prompt.suggestedTime * 60);
    }
  }, [prompt, timeRemaining]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-save every 30s
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (essay !== lastSavedRef.current && sessionId) {
        setIsAutoSaving(true);
        saveDraft.mutateAsync({ sessionId, draftEssay: essay })
          .then(() => {
            lastSavedRef.current = essay;
            setIsAutoSaving(false);
          })
          .catch(() => setIsAutoSaving(false));
      }
    }, 30000);
    return () => clearInterval(autoSave);
  }, [essay, sessionId, saveDraft]);

  const handleManualSave = async () => {
    if (!sessionId) return;
    try {
      setIsAutoSaving(true);
      await saveDraft.mutateAsync({ sessionId, draftEssay: essay });
      lastSavedRef.current = essay;
      setIsAutoSaving(false);
    } catch (e) {
      setIsAutoSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!sessionId) return;
    if (essay.trim().length < 50) {
      toast.error("Your essay is too short. Please write more before submitting.");
      return;
    }
    const timeTaken = prompt ? prompt.suggestedTime * 60 - timeRemaining : 0;

    const loadingToastId = toast.loading("Scoring your essay... This may take a moment.");

    try {
      await submitWriting.mutateAsync({ sessionId, essay, timeTaken });
      toast.update(loadingToastId, 'success', "Scoring complete!");
      router.push(`/ielts/advanced/writing/${promptId}/result/${sessionId}`);
    } catch (e: any) {
      console.error(e);
      toast.update(loadingToastId, 'error', e?.response?.data?.message || "Failed to score the test. Please try again.");
    }
  };

  if (isPromptLoading || isSessionLoading) {
    return <div className="p-10 font-bold text-gray-500">Loading Practice...</div>;
  }

  if (!prompt || !session) {
    return <div className="p-10 font-bold text-red-500">Practice session not found</div>;
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const wordCount = essay.trim() === "" ? 0 : essay.trim().split(/\s+/).length;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Link
            href="/ielts/advanced"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-black text-gray-900 dark:text-white">{prompt.title}</h1>
            <div className="flex gap-2 items-center text-xs font-bold text-gray-400">
              <span className="uppercase">{prompt.taskType.replace('_', ' ')}</span>
              <span>•</span>
              <span>Min {prompt.minimumWords} words</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold font-mono ${timeRemaining < 300 ? 'bg-red-50 text-red-600 dark:bg-red-900/20' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300'}`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeRemaining)}
          </div>
          <button
            onClick={handleManualSave}
            disabled={isAutoSaving || essay === lastSavedRef.current}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isAutoSaving ? "Saving..." : "Save Draft"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitWriting.isPending || wordCount === 0}
            className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-gray-900 rounded-xl text-sm font-black transition-all disabled:opacity-50"
          >
            {submitWriting.isPending ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Send className="w-4 h-4" />
            )}
            {submitWriting.isPending ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>

      {/* Split Pane */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: Prompt */}
        <div className="w-1/2 overflow-y-auto border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 custom-scrollbar">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm font-medium text-amber-800 dark:text-amber-400">
                You should spend about {prompt.suggestedTime} minutes on this task.
              </div>
            </div>

            {prompt.imageUrl && (
              <div className="rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden bg-white p-4">
                <img src={prompt.imageUrl} alt="Writing Prompt Reference" className="w-full h-auto object-contain max-h-[400px]" />
              </div>
            )}

            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-slate-300 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                {prompt.prompt}
              </p>
            </div>

            <div className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest pt-4 border-t border-gray-100 dark:border-slate-800">
              Write at least {prompt.minimumWords} words.
            </div>
          </div>
        </div>

        {/* Right: Editor */}
        <div className="w-1/2 flex flex-col bg-gray-50 dark:bg-slate-950 p-6 relative min-h-0">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="font-bold text-gray-500 dark:text-slate-400 text-sm uppercase tracking-wider">Your Essay</h2>
            <div className={`text-sm font-bold ${wordCount < prompt.minimumWords ? 'text-amber-500' : 'text-green-500'}`}>
              {wordCount} words
            </div>
          </div>

          <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
            <textarea
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              placeholder="Start typing your essay here..."
              className="flex-1 w-full bg-transparent p-6 outline-none resize-none text-gray-800 dark:text-slate-200 leading-relaxed text-base custom-scrollbar"
              spellCheck="false"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
