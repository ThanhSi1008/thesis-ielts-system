"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { ChevronLeft, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormCompletionGroup } from "../../../basic/components/listening-renders/FormCompletionGroup";
import { MCQuestionItem } from "../../../basic/components/listening-renders/MCQuestionItem";
import { MCMultipleQuestionItem } from "../../../basic/components/listening-renders/MCMultipleQuestionItem";
import { MatchingCompletionGroup } from "../../../basic/components/listening-renders/MatchingGroup";

export default function IeltsAdvancedListeningPractice({ params }: { params: { partId: string } }) {
  const [part, setPart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
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

  const handleAnswer = (key: string | number, currentVal: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [key]: currentVal }));
  };

  const handleToggleMCM = (groupIndex: number, letter: string, numCorrect: number) => {
    if (submitted) return;
    const key = `mcm-${groupIndex}`;
    const rawSelected = answers[key] || "";
    const selectedLetters = rawSelected ? rawSelected.split(",") : [];
    
    const upper = letter.toUpperCase();
    let next;
    if (selectedLetters.includes(upper)) {
      next = selectedLetters.filter(l => l !== upper);
    } else {
      if (selectedLetters.length >= numCorrect) return;
      next = [...selectedLetters, upper];
    }
    handleAnswer(key, next.join(","));
  };

  const handleLocate = (qNum: number) => {
    // Just a placeholder, audio locating uses timestamp usually
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

          <div className="p-8 pt-4">
             <div className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500 mb-8 flex items-center gap-3">
                <div className="h-px bg-gray-100 dark:bg-slate-800 flex-1" />
                Questions
                <div className="h-px bg-gray-100 dark:bg-slate-800 flex-1" />
             </div>
            {part.content?.map((group: any, idx: number) => {
               if (group.type === 'form_completion' || (!group.type && group.points)) {
                 return (
                   <FormCompletionGroup 
                     key={idx}
                     heading={group.heading}
                     points={group.points}
                     answers={answers}
                     onAnswer={handleAnswer}
                     submitted={submitted}
                     showAnswers={submitted}
                     audioRef={audioRef}
                     onLocate={handleLocate}
                   />
                 );
               }

               if (group.type === 'multiple_choice_multiple') {
                 const key = `mcm-${idx}`;
                 const rawSelected = answers[key] || "";
                 const selectedLetters = rawSelected ? rawSelected.split(",") : [];
                 const numCorrect = group.num_correct || (group.answers?.length) || 1;

                 return (
                    <MCMultipleQuestionItem
                      key={idx}
                      group={group}
                      selectedLetters={selectedLetters}
                      onToggle={(letter) => handleToggleMCM(idx, letter, numCorrect)}
                      submitted={submitted}
                      showAnswers={submitted}
                      audioRef={audioRef}
                      onLocate={handleLocate}
                    />
                 );
               }

               if (group.type === 'matching') {
                 return (
                    <MatchingCompletionGroup
                      key={idx}
                      group={group}
                      answers={answers}
                      onAnswer={handleAnswer}
                      submitted={submitted}
                      showAnswers={submitted}
                      audioRef={audioRef}
                      onLocate={handleLocate}
                    />
                 );
               }

               if (group.type === 'multiple_choice') {
                 return (
                     <div key={idx} className="space-y-4">
                       {group.heading && <h3 className="text-[15px] font-extrabold text-gray-900 dark:text-white mb-2">{group.heading}</h3>}
                      {group.questions?.map((q: any) => (
                        <MCQuestionItem
                          key={q.question_number}
                          q={q}
                          selected={answers[q.question_number] || ""}
                          onSelect={(letter) => handleAnswer(q.question_number, letter)}
                          submitted={submitted}
                          showAnswers={submitted}
                          audioRef={audioRef}
                          onLocate={handleLocate}
                        />
                      ))}
                    </div>
                 );
               }

               return <div key={idx} className="p-4 border border-dashed dark:border-slate-700 rounded-lg text-gray-500 dark:text-slate-400 italic text-sm">Unsupported question type: {group.type}</div>
            })}
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
