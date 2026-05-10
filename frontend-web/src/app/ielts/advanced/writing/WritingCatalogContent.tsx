"use client";

import { useState, useEffect } from "react";
import { useWritingPrompts, useStartWritingSession } from "@/hooks/useIeltsAdvancedWriting";
import { Loader2, Search, Filter, AlertCircle, PlayCircle, Clock } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function WritingCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [page, setPage] = useState(1);
  const [taskType, setTaskType] = useState<string>(searchParams.get("task") || "TASK_1");
  const [subType, setSubType] = useState<string>(searchParams.get("subType") || "");
  const limit = 12;

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("task", taskType);
    if (subType) {
      params.set("subType", subType);
    } else {
      params.delete("subType");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [taskType, subType, pathname, router]);

  const { data, isLoading, isError } = useWritingPrompts({ page, limit, taskType, subType });
  const startSession = useStartWritingSession();

  const handleStartPractice = async (promptId: string) => {
    try {
      const session = await startSession.mutateAsync(promptId);
      router.push(`/ielts/advanced/writing/${promptId}?session=${session.id}`);
    } catch (error) {
      console.error("Failed to start session", error);
      alert("Failed to start practice session");
    }
  };

  const handleResumePractice = (promptId: string, sessionId: string) => {
    router.push(`/ielts/advanced/writing/${promptId}?session=${sessionId}`);
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-fit shrink-0">
          <button
            onClick={() => { setTaskType("TASK_1"); setSubType(""); setPage(1); }}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${taskType === "TASK_1" ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-gray-500 dark:text-slate-400 hover:text-gray-700"}`}
          >
            Task 1 (Report)
          </button>
          <button
            onClick={() => { setTaskType("TASK_2"); setSubType(""); setPage(1); }}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${taskType === "TASK_2" ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-gray-500 dark:text-slate-400 hover:text-gray-700"}`}
          >
            Task 2 (Essay)
          </button>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={subType}
            onChange={(e) => { setSubType(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold text-gray-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer appearance-none pr-8 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_12px_center] bg-no-repeat"
          >
            <option value="">All types</option>
            {taskType === "TASK_1" ? (
              <>
                <option value="bar_chart">Writing Task 1: Bar Chart</option>
                <option value="line_graph">Writing Task 1: Line Graph</option>
                <option value="pie_chart">Writing Task 1: Pie Chart</option>
                <option value="table">Writing Task 1: Table Chart</option>
                <option value="map">Writing Task 1: Map</option>
                <option value="process">Writing Task 1: Process Diagram</option>
                <option value="mixed">Writing Task 1: Multiple Graphs</option>
              </>
            ) : (
              <>
                <option value="opinion">Writing Task 2: Opinion Essay</option>
                <option value="discussion">Writing Task 2: Discussion Essay</option>
                <option value="problem_solution">Writing Task 2: Problem Solution</option>
                <option value="advantages_disadvantages">Writing Task 2: Advantage Disadvantage</option>
                <option value="two_part">Writing Task 2: Direct Question</option>
              </>
            )}
          </select>
          <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-red-500 gap-2">
          <AlertCircle className="w-10 h-10" />
          <p className="font-bold">Failed to load writing prompts.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.data.map((prompt) => (
              <div key={prompt.id} className="group bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 hover:shadow-xl hover:border-primary/50 transition-all duration-300 flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2 items-center flex-wrap">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-wider">
                      {prompt.subType.replace('_', ' ')}
                    </span>
                    {prompt.bookNumber && (
                      <span className="px-3 py-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                        Cam {prompt.bookNumber}
                      </span>
                    )}
                  </div>
                  {prompt.bestScore ? (
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-black text-green-600 dark:text-green-400 leading-none">{prompt.bestScore.toFixed(1)}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Best</span>
                    </div>
                  ) : null}
                </div>

                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {prompt.title}
                </h3>
                
                <p className="text-gray-500 dark:text-slate-400 text-sm line-clamp-3 mb-6 flex-1">
                  {prompt.prompt}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-slate-800">
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-400 dark:text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {prompt.suggestedTime}m
                    </div>
                    <div>{prompt.minimumWords} words</div>
                  </div>
                  
                  {prompt.activeSession ? (
                    <button 
                      onClick={() => handleResumePractice(prompt.id, prompt.activeSession!.id)}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold shadow-sm shadow-amber-500/20 transition-all"
                    >
                      Resume
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleStartPractice(prompt.id)}
                      disabled={startSession.isPending}
                      className="px-5 py-2.5 bg-gray-900 dark:bg-white hover:bg-primary hover:text-white dark:text-gray-900 text-white rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-50"
                    >
                      Practice
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {data?.data.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <p className="text-gray-500 font-medium">No prompts found for this category.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-bold disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm font-bold text-gray-600 dark:text-slate-400 px-4">
                Page {page} of {data.totalPages}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-bold disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
