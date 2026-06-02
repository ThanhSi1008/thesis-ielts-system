"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import api from "@/lib/api";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReadingPassagePanel } from "../../../basic/[skill]/exercises/[exerciseId]/_components/ui/ReadingPassagePanel";
import { AnswerField } from "@/components/AnswerField";
import { extractAllItemsFromPart } from "@/lib/exam-parser";

export default function IeltsAdvancedReadingPractice({ params }: { params: { partId: string } }) {
  const [part, setPart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);
  const [locatedQuestion, setLocatedQuestion] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    api.get(`/ielts/advanced/reading/${params.partId}`, {
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

  // Lock parent <main> scrollbars to enable independent column scrolls inside layout
  useEffect(() => {
    const mainElements = document.querySelectorAll("main");
    const originalStyles = new Map<Element, string>();
    mainElements.forEach((main) => {
      const htmlMain = main as HTMLElement;
      originalStyles.set(htmlMain, htmlMain.style.overflow);
      htmlMain.style.overflow = "hidden";
    });

    return () => {
      mainElements.forEach((main) => {
        const htmlMain = main as HTMLElement;
        const orig = originalStyles.get(htmlMain);
        if (orig !== undefined) {
          htmlMain.style.overflow = orig;
        }
      });
    };
  }, []);

  const handleLocate = (qNum: number) => {
    setLocatedQuestion(qNum);
    const el = document.getElementById(`passage-q-${qNum}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    try {
      const res = await api.post(`/ielts/advanced/reading/${params.partId}/submit`, {
         answers
      }) as { data: any };
      
      router.push(`/ielts/advanced/reading/${params.partId}/my-answers/${res.data.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-10 font-bold text-gray-500 dark:text-slate-400 flex justify-center mt-20">Loading Reading Part...</div>;
  if (!part) return <div className="p-10 font-bold text-red-500 flex justify-center mt-20">Reading part not found</div>;

  return (
    <div className="flex flex-col h-full min-h-0 flex-1 overflow-hidden">
       <div className="mb-4 flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4 shrink-0 px-4">
         <div className="flex items-center gap-3">
            <Link href="/ielts/advanced" className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800">
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-slate-400" />
            </Link>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">{part.title}</h2>
         </div>
         <div className="flex justify-end pr-4">
            {!submitted ? (
               <button onClick={handleSubmit} className="px-8 py-2.5 bg-[#FFC107] text-white text-sm font-extrabold rounded-xl hover:bg-yellow-500 shadow-sm transition-all transform hover:scale-105">
                 Submit Answers
               </button>
            ) : (
               <Link href="/ielts/advanced/statistics" className="px-6 py-2.5 bg-gray-900 dark:bg-slate-800 text-white text-sm font-extrabold rounded-xl hover:bg-gray-800 dark:hover:bg-slate-700 shadow-sm">
                 View Accuracy Statistics
               </Link>
            )}
         </div>
       </div>

       <div className="flex-1 min-h-0 container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-[0_8px_40px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-slate-800 overflow-hidden">
          {/* Left: Reading Passage */}
          <div className="h-full overflow-hidden border-r border-gray-100 dark:border-slate-800 pl-6 lg:pl-10 pt-6 relative">
            <ReadingPassagePanel
              passageWithLocations={part.passageWithLocations}
              passage={part.passage}
              locatedQuestion={locatedQuestion}
              showAnswers={submitted}
            />
          </div>

          {/* Right: Reading Questions */}
          <div className="h-full overflow-y-auto pr-6 lg:pr-10 pt-6 pb-20 custom-scrollbar space-y-6">
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
       </div>
    </div>
  );
}
