"use client";

import React, { useState, useEffect } from "react";
import { grammarApi } from "@/services/learning.api";
import { TheoryView } from "@/components/grammar/TheoryView";
import { ExerciseImageView, AnswerSheetView } from "@/components/grammar/ExerciseView";
import { ResultModal } from "@/components/grammar/ResultModal";
import type { GrammarUnitWithContent, GrammarUnitProgress } from '@/types';

interface GrammarLessonClientProps {
  topicName: string;
  topicSlug: string;
  unitId: string; // e.g. "1" (This is actually the unit order in the URL)
  unitTitle: string; // e.g. "Present continuous"
}

export default function GrammarLessonClient({ topicName, topicSlug, unitId, unitTitle }: GrammarLessonClientProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [showAnswerSheet, setShowAnswerSheet] = useState(false);
  const [ieltsIntensiveResult, setResult] = useState<{ correct: number; total: number; errors: any[] }>({ correct: 0, total: 0, errors: [] });
  const [lessonProgress, setLessonProgress] = useState({ theoryCompleted: false, exerciseCompleted: false });

  const [unitContent, setUnitContent] = useState<GrammarUnitWithContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      grammarApi.getUnitByOrder(topicSlug, unitId),
      grammarApi.getProgress(topicSlug)
    ]).then(([unit, progressList]) => {
      setUnitContent(unit);
      const p = progressList.find((x: GrammarUnitProgress) => x.unitOrder === parseInt(unitId, 10));
      if (p) {
        setLessonProgress({
          theoryCompleted: p.theoryCompleted,
          exerciseCompleted: p.isCompleted,
        });
      }
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsError(true);
      setIsLoading(false);
    });
  }, [topicSlug, unitId]);

  const mutateProgress = (payload: { theoryCompleted?: boolean; exerciseScore?: number; exerciseTotal?: number }) => {
    if (!unitContent?.id) return;
    grammarApi.updateProgress(unitContent.id, payload).catch(console.error);
  };

  const handleInputChange = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const checkAnswers = () => {
    if (!unitContent?.exercises) return;

    let correctCount = 0;
    let totalCount = 0;
    const reviewItems: any[] = [];

    unitContent.exercises.forEach((ex: any, exIndex: number) => {
      if (ex.type === 'fill_blank' && ex.items) {
        ex.items.forEach((item: any, idx: number) => {
          if (!item.isExample) {
            totalCount++;
            const answerKey = `${ex.id}-${idx}`;
            const userAnswer = answers[answerKey]?.trim().toLowerCase() || '';
            const correctAnswer = item.answer?.trim().toLowerCase() || '';
            const isCorrect = userAnswer === correctAnswer;
            if (isCorrect) correctCount++;
            
            reviewItems.push({
              questionId: `${unitContent.order}.${exIndex + 1}, Q${idx + 1}`,
              label: item.label.replace(/________/g, '...'),
              userAnswer: userAnswer || '(empty)',
              correctAnswer: item.answer,
              isCorrect
            });
          }
        });
      }
      if (ex.type === 'match' && ex.items) {
        const validItems = ex.items.filter((m: any) => m.label && m.label.length > 2);
        validItems.forEach((m: any, idx: number) => {
          if (!m.isExample) {
            totalCount++;
            const answerKey = `${ex.id}-match-${idx}`; // Input is on the left side
            const userAnswer = answers[answerKey]?.trim().toLowerCase() || '';
            const correctAnswerLetter = (m.answer || '').split('.')[0].trim().toLowerCase();
            const isCorrect = userAnswer === correctAnswerLetter;
            if (isCorrect) correctCount++;
            
            reviewItems.push({
              questionId: `${unitContent.order}.${exIndex + 1}, Q${idx + 1}`,
              label: `Match: ${m.label || ''}`,
              userAnswer: userAnswer || '(empty)',
              correctAnswer: m.answer || '',
              isCorrect
            });
          }
        });
      }
    });

    setResult({ correct: correctCount, total: totalCount, errors: reviewItems });
    setShowResult(true);

    // Save to DB
    mutateProgress({
      theoryCompleted: true,
      exerciseScore: correctCount,
      exerciseTotal: totalCount,
    });

    if (correctCount === totalCount && totalCount > 0) {
      setLessonProgress(prev => ({ ...prev, theoryCompleted: true, exerciseCompleted: true }));
    } else {
      setLessonProgress(prev => ({ ...prev, theoryCompleted: true }));
    }
  };

  const fillCorrectAnswers = () => {
    if (!unitContent?.exercises) return;
    const devAnswers: Record<string, string> = {};
    unitContent.exercises.forEach((ex: any) => {
      if (ex.type === 'fill_blank' && ex.items) {
        ex.items.forEach((item: any, idx: number) => {
          if (!item.isExample) {
            devAnswers[`${ex.id}-${idx}`] = item.answer;
          }
        });
      }
      if (ex.type === 'match' && ex.items) {
        const validItems = ex.items.filter((m: any) => m.label && m.label.length > 2);
        validItems.forEach((m: any, idx: number) => {
          if (!m.isExample) {
            devAnswers[`${ex.id}-match-${idx}`] = m.answer ? m.answer.split('.')[0].trim().toLowerCase() : '';
          }
        });
      }
    });
    setAnswers(devAnswers);
  };

  const handleFinishTheory = () => {
    setLessonProgress(prev => ({ ...prev, theoryCompleted: true }));
    mutateProgress({ theoryCompleted: true });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-screen-xl px-4 py-16 flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (isError || !unitContent) {
    return (
      <div className="container mx-auto max-w-screen-xl px-4 py-16 flex justify-center items-center h-96">
        <p className="text-xl text-red-500">Failed to load grammar unit.</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col flex-1 min-h-0 w-full">
      {/* IeltsIntensiveResult Modal */}
      {showResult && (
        <ResultModal ieltsIntensiveResult={ieltsIntensiveResult} onClose={() => setShowResult(false)} />
      )}

      {/* Main Content: Side by Side */}
      <div className="flex gap-8 w-full flex-1 min-h-0">
        {/* Left Column: Theory or Answer Sheet */}
        <div className="w-1/2 h-full overflow-y-auto custom-scrollbar rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm relative">
          {showAnswerSheet ? (
            <div className="animate-in slide-in-from-right-4 duration-300 h-full">
              {unitContent.exercises && (
                <AnswerSheetView
                  exercises={unitContent.exercises}
                  answers={answers}
                  onInputChange={handleInputChange}
                  onSubmit={checkAnswers}
                  onFillDevAnswers={fillCorrectAnswers}
                  unitOrder={unitContent.order}
                />
              )}
            </div>
          ) : (
            <div className="animate-in fade-in duration-300 h-full">
              {unitContent.theoryContent && (
                <div 
                  dangerouslySetInnerHTML={{ __html: unitContent.theoryContent }} 
                  className="w-full prose dark:prose-invert max-w-none p-8 lg:p-10 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-table:min-w-full prose-td:border prose-td:border-gray-200 dark:prose-td:border-gray-800 prose-td:px-4 prose-td:py-2 prose-th:border prose-th:border-gray-200 dark:prose-th:border-gray-800 prose-th:px-4 prose-th:py-2 prose-th:bg-gray-50 dark:prose-th:bg-gray-800/50 prose-p:leading-relaxed prose-li:my-1 prose-img:rounded-xl prose-img:shadow-sm" 
                />
              )}
            </div>
          )}
        </div>

        {/* Right Column: Exercises */}
        <div className="w-1/2 h-full relative rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden flex flex-col">
          <button 
            onClick={() => setShowAnswerSheet(!showAnswerSheet)}
            className="absolute top-4 right-6 z-20 bg-[#FFC600] text-black px-5 py-2.5 rounded-xl font-bold shadow-md hover:opacity-90 flex items-center gap-2 border border-yellow-500 transition-all text-sm"
          >
            {showAnswerSheet ? '📖 Show Theory' : '✍️ Show Answer Sheet'}
          </button>
          
          <div className="w-full h-full overflow-y-auto custom-scrollbar">
            <ExerciseImageView unitOrder={unitContent.order} />
          </div>
        </div>
      </div>
    </div>
  );
}
