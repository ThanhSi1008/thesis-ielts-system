"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import api from "@/lib/api";
import { ChevronLeft, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnswerField } from "@/components/AnswerField";
import { extractAllItemsFromPart } from "@/lib/exam-parser";

export default function IeltsAdvancedListeningPractice({ params }: { params: { partId: string } }) {
  const [part, setPart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);
  const [locatedQuestion, setLocatedQuestion] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const router = useRouter();

  useEffect(() => {
    api.get(`/ielts/advanced/listening/${params.partId}`, {
      withCredentials: true
    })
    .then(res => {
      setPart(res.data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [params.partId]);

  const items = useMemo(() => {
    if (!part) return [];
    const normalizedPart = {
      ...part,
      question_groups: part.question_groups || part.content,
      content: part.question_groups ? part.content : undefined
    };
    return extractAllItemsFromPart(normalizedPart);
  }, [part]);

  const handleLocate = (qNum: number) => {
    // Locate transcript or audio if needed
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    try {
      const res = await api.post(`/ielts/advanced/listening/${params.partId}/submit`, {
         answers
      }) as { data: any };
      
      router.push(`/ielts/advanced/listening/${params.partId}/my-answers/${res.data.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-10 font-bold text-gray-500 dark:text-slate-400">Loading Part...</div>;
  if (!part) return <div className="p-10 font-bold text-red-500">Part not found</div>;

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Link
               href="/ielts/advanced"
               className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-slate-500 transition-all shadow-sm"
               title="Back to all listening parts"
             >
               <ChevronLeft className="w-5 h-5" />
             </Link>
             <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">{part.title}</h1>
          </div>
       </div>

       <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.3)] overflow-hidden">
          {/* Audio Player Container */}
          <div className="p-8 pb-4">
             <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-inner relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <audio ref={audioRef} controls src={part.audioUrl} className="w-full relative z-10" />
                <div className="mt-2 text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest text-center">Practice Audio</div>
             </div>
          </div>

          <div className="p-8 pt-4 space-y-6">
             <div className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500 mb-8 flex items-center gap-3">
                <div className="h-px bg-gray-100 dark:bg-slate-800 flex-1" />
                Questions
                <div className="h-px bg-gray-100 dark:bg-slate-800 flex-1" />
             </div>
             {items.map((it, idx) => (
                <AnswerField
                  key={String(idx)}
                  item={it}
                  variant="official"
                  answers={answers}
                  setAnswers={setAnswers}
                  focusedQn={locatedQuestion}
                  setFocusedQn={setLocatedQuestion}
                  submitted={submitted}
                  showAnswers={submitted}
                  onLocate={handleLocate}
                />
             ))}
          </div>

          {/* Submit Action */}
          <div className="mt-12 mb-4 flex justify-center">
             {!submitted ? (
                <button
                  onClick={handleSubmit}
                  className="group flex items-center justify-between bg-primary hover:brightness-105 px-8 py-4 rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-[1px] w-full max-w-[280px]"
                >
                  <span className="text-[14px] font-black uppercase text-gray-900">Submit Answers</span>
                  <span className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-white stroke-[3]" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
             ) : (
                <Link
                  href="/ielts/advanced/statistics"
                  className="group flex items-center justify-between bg-gray-900 dark:bg-slate-800 hover:bg-black dark:hover:bg-slate-700 px-8 py-4 rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-[1px] w-full max-w-[320px]"
                >
                  <span className="text-[14px] font-black uppercase text-white">View Accuracy Stats</span>
                  <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </span>
                </Link>
             )}
          </div>
       </div>
    </div>
  );
}
