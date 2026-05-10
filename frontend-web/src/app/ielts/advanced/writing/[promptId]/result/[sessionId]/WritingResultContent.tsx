"use client";

import { useWritingSession } from "@/hooks/useIeltsAdvancedWriting";
import { ChevronLeft, CheckCircle2, AlertTriangle, ArrowRight, BookOpen, PenTool, Layout, FileText, Loader2, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function WritingResultContent({ promptId, sessionId }: { promptId: string, sessionId: string }) {
  const { data: session, isLoading, refetch } = useWritingSession(sessionId);
  const [activeTab, setActiveTab] = useState<"overview" | "mistakes" | "essay">("overview");
  const [selectedCriterion, setSelectedCriterion] = useState<string>("task_achievement");

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
        <div className="relative">
          <div className="w-24 h-24 border-4 border-primary/20 rounded-full animate-[spin_3s_linear_infinite]" />
          <div className="w-24 h-24 border-4 border-primary rounded-full animate-spin absolute inset-0 border-t-transparent" />
          <div className="absolute inset-0 flex items-center justify-center text-primary font-bold">
            <PenTool className="w-8 h-8 animate-pulse" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Grading in Progress</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Our AI examiner is currently reviewing your essay. This usually takes about 10-20 seconds. 
            The page will refresh automatically.
          </p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-sm font-bold transition-all">
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
        <Link href={`/ielts/advanced/writing/${promptId}`} className="mt-4 px-6 py-3 bg-primary text-gray-900 font-bold rounded-xl">
          Try Again
        </Link>
      </div>
    );
  }

  const feedback = session.feedback || {};
  const criteriaData = feedback.criteria || {};

  const CRITERIA_MAP = [
    { key: "task_achievement", label: session.prompt?.taskType === "TASK_1" ? "Task Achievement" : "Task Response", icon: <FileText className="w-5 h-5" /> },
    { key: "coherence_and_cohesion", label: "Coherence & Cohesion", icon: <Layout className="w-5 h-5" /> },
    { key: "lexical_resource", label: "Lexical Resource", icon: <BookOpen className="w-5 h-5" /> },
    { key: "grammatical_range_and_accuracy", label: "Grammar & Accuracy", icon: <PenTool className="w-5 h-5" /> }
  ];

  // Collect all mistakes
  const allMistakes: any[] = [];
  Object.keys(criteriaData).forEach(k => {
    if (criteriaData[k].mistakes && Array.isArray(criteriaData[k].mistakes)) {
      criteriaData[k].mistakes.forEach((m: any) => {
        allMistakes.push({ ...m, criterion: k });
      });
    }
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 animate-fade-up">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/ielts/advanced"
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-gray-900 dark:text-white">AI Feedback Report</h1>
              <p className="text-sm font-medium text-gray-500">{session.prompt?.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-gray-50 dark:bg-slate-800 px-6 py-3 rounded-2xl border border-gray-100 dark:border-slate-700">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Overall Band</span>
              <span className="text-3xl font-black text-primary leading-none">{feedback.overall_band?.toFixed(1) || "N/A"}</span>
            </div>
            {session.timeTaken && (
              <div className="flex flex-col items-end border-l border-gray-200 dark:border-slate-600 pl-6">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time Taken</span>
                <span className="text-xl font-black text-gray-700 dark:text-slate-200">
                  {Math.floor(session.timeTaken / 60)}m {session.timeTaken % 60}s
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-6 flex items-center gap-8 border-b border-gray-100 dark:border-slate-800">
          <button onClick={() => setActiveTab("overview")} className={`py-4 font-bold text-sm border-b-2 transition-colors ${activeTab === "overview" ? "border-primary text-gray-900 dark:text-white" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
            Detailed Feedback
          </button>
          <button onClick={() => setActiveTab("mistakes")} className={`py-4 font-bold text-sm border-b-2 transition-colors ${activeTab === "mistakes" ? "border-primary text-gray-900 dark:text-white" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
            Mistakes ({allMistakes.length})
          </button>
          <button onClick={() => setActiveTab("essay")} className={`py-4 font-bold text-sm border-b-2 transition-colors ${activeTab === "essay" ? "border-primary text-gray-900 dark:text-white" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
            Your Essay
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 w-full">
        {activeTab === "overview" && (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left: Criteria Selector */}
            <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
              {CRITERIA_MAP.map((c) => {
                const data = criteriaData[c.key];
                if (!data) return null;
                const isActive = selectedCriterion === c.key;
                
                return (
                  <button 
                    key={c.key}
                    onClick={() => setSelectedCriterion(c.key)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isActive ? 'bg-white dark:bg-slate-900 border-primary shadow-sm' : 'bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-slate-800'}`}>
                        {c.icon}
                      </div>
                      <span className={`font-bold text-sm ${isActive ? 'text-gray-900 dark:text-white' : ''}`}>{c.label}</span>
                    </div>
                    <span className={`font-black ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                      {data.band?.toFixed(1)}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Right: Detailed View */}
            <div className="flex-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-8">
              {(() => {
                const data = criteriaData[selectedCriterion];
                if (!data) return <p>No data</p>;

                return (
                  <div className="space-y-8 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-6">
                      <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                        {CRITERIA_MAP.find(c => c.key === selectedCriterion)?.label}
                      </h2>
                      <div className="px-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-xl font-black text-xl text-primary">
                        Band {data.band?.toFixed(1)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-green-50 dark:bg-green-900/10 rounded-2xl p-6 border border-green-100 dark:border-green-900/30">
                        <div className="flex items-center gap-2 mb-4 text-green-700 dark:text-green-500 font-bold uppercase tracking-wider text-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          Strengths
                        </div>
                        <ul className="space-y-3">
                          {data.strengths?.map((s: string, i: number) => (
                            <li key={i} className="text-sm text-green-900 dark:text-green-300 font-medium leading-relaxed">{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-6 border border-red-100 dark:border-red-900/30">
                        <div className="flex items-center gap-2 mb-4 text-red-700 dark:text-red-500 font-bold uppercase tracking-wider text-xs">
                          <AlertTriangle className="w-4 h-4" />
                          Areas to Improve
                        </div>
                        <ul className="space-y-3">
                          {data.weak_areas?.map((s: string, i: number) => (
                            <li key={i} className="text-sm text-red-900 dark:text-red-300 font-medium leading-relaxed">{s}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-6 border border-amber-100 dark:border-amber-900/30">
                      <div className="flex items-center gap-2 mb-4 text-amber-700 dark:text-amber-500 font-bold uppercase tracking-wider text-xs">
                        <ArrowRight className="w-4 h-4" />
                        Actionable Advice
                      </div>
                      <ul className="space-y-3">
                        {data.how_to_improve?.map((s: string, i: number) => (
                          <li key={i} className="text-sm text-amber-900 dark:text-amber-300 font-medium leading-relaxed">{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        )}

        {activeTab === "mistakes" && (
          <div className="space-y-6">
            {allMistakes.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No major mistakes found!</h3>
                <p className="text-gray-500">Great job on your essay.</p>
              </div>
            ) : (
              allMistakes.map((m, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 hover:shadow-lg transition-shadow">
                  <div className="flex-1 space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1 block">Original</span>
                      <p className="text-gray-700 dark:text-slate-300 font-medium bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/20 line-through decoration-red-300">
                        {m.original}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest mb-1 block">Correction</span>
                      <p className="text-gray-900 dark:text-white font-bold bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-900/20">
                        {m.correction}
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 bg-gray-50 dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Explanation</span>
                    <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed">
                      {m.explanation}
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                      <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-lg">
                        {CRITERIA_MAP.find(c => c.key === m.criterion)?.label || m.criterion}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "essay" && (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-8 max-w-4xl mx-auto">
             <div className="prose dark:prose-invert max-w-none">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider text-center border-b border-gray-100 dark:border-slate-800 pb-4">
                Your Submission
              </h3>
              <p className="text-gray-700 dark:text-slate-300 text-base leading-loose whitespace-pre-wrap font-medium">
                {session.essay}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
