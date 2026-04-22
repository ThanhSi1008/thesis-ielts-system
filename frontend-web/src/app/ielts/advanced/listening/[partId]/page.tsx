"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { ChevronLeft } from "lucide-react";
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

  if (loading) return <div className="p-10 font-bold text-gray-500">Loading Part...</div>;
  if (!part) return <div className="p-10 font-bold text-red-500">Part not found</div>;

  return (
    <div className="flex flex-col">
       <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
         <div className="flex items-center gap-3">
            <Link href="/ielts/advanced" className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </Link>
            <h2 className="text-xl font-extrabold text-gray-900">{part.title}</h2>
         </div>
       </div>

       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {/* Audio Player */}
          <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
             <audio ref={audioRef} controls src={part.audioUrl} className="w-full" />
          </div>

          {/* Render Groups */}
          <div className="space-y-8">
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
                      {group.heading && <h3 className="text-[15px] font-extrabold text-gray-900 mb-2">{group.heading}</h3>}
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

               return <div key={idx} className="p-4 border border-dashed rounded-lg text-gray-500 italic text-sm">Unsupported question type: {group.type}</div>
            })}
          </div>

          {/* Submit Action */}
          <div className="mt-8 flex justify-end">
             {!submitted ? (
                <button onClick={handleSubmit} className="px-8 py-3 bg-[#FFC107] text-white font-extrabold rounded-xl hover:bg-yellow-500 shadow-sm transition-all transform hover:scale-105">
                  Submit Answers
                </button>
             ) : (
                <Link href="/ielts/advanced/statistics" className="px-6 py-3 bg-gray-900 text-white font-extrabold rounded-xl hover:bg-gray-800 shadow-sm">
                  View Accuracy Statistics
                </Link>
             )}
          </div>
       </div>
    </div>
  );
}
