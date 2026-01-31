"use client";

import React, { useState } from "react";

interface GrammarLessonClientProps {
  topicName: string;
  topicSlug: string;
  unitId: string; // e.g. "1"
  unitTitle: string; // e.g. "Present continuous"
}

import { intermediateUnitContent } from '../../data';

const defaultData = {
  theory: '<div class="p-4">Content coming soon...</div>',
  exercises: []
};

export default function GrammarLessonClient({ topicName, topicSlug, unitId, unitTitle }: GrammarLessonClientProps) {
  const [activeTab, setActiveTab] = useState<'theory' | 'exercise'>('theory');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<{ correct: number; total: number; errors: any[] }>({ correct: 0, total: 0, errors: [] });
  const [lessonProgress, setLessonProgress] = useState({ theoryCompleted: false, exerciseCompleted: false });
  const [isLoaded, setIsLoaded] = useState(false);
  const grammarData = intermediateUnitContent[unitId] || defaultData;

  // Load progress
  React.useEffect(() => {
    const savedProgress = localStorage.getItem(`grammar_progress_${topicSlug}_${unitId}`);
    if (savedProgress) {
      setLessonProgress(JSON.parse(savedProgress));
    }
    setIsLoaded(true);
  }, [topicSlug, unitId]);

  // Save progress
  React.useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(`grammar_progress_${topicSlug}_${unitId}`, JSON.stringify(lessonProgress));
    }
  }, [lessonProgress, topicSlug, unitId, isLoaded]);

  const handleInputChange = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const checkAnswers = () => {
    let correctCount = 0;
    let totalCount = 0;
    const errors: any[] = [];

    grammarData.exercises.forEach((ex: any) => {
      if (ex.items) {
        ex.items.forEach((item: any, idx: number) => {
          if (!item.isExample) {
            totalCount++;
            const answerKey = `${ex.id}-${idx}`;
            const userAnswer = answers[answerKey]?.trim().toLowerCase();
            const correctAnswer = item.answer?.trim().toLowerCase();
            if (userAnswer === correctAnswer) {
              correctCount++;
            } else {
              errors.push({
                questionId: ex.id,
                label: item.label.replace(/________/g, '...'),
                userAnswer: userAnswer || '(empty)',
                correctAnswer: item.answer
              });
            }
          }
        });
      }
      if (ex.matches) {
        ex.matches.forEach((m: any, idx: number) => {
          if (!m.isExample) {
            totalCount++;
            const answerKey = `${ex.id}-match-${idx}`; // Input is on the left side
            const userAnswer = answers[answerKey]?.trim().toLowerCase();
            // Extract the letter from the right side answer (e.g., "f. I'm trying..." -> "f")
            const correctAnswerLetter = m.right.split('.')[0].trim().toLowerCase();
            if (userAnswer === correctAnswerLetter) {
              correctCount++;
            } else {
              errors.push({
                questionId: ex.id,
                label: `Match: ${m.left}`,
                userAnswer: userAnswer || '(empty)',
                correctAnswer: m.right
              });
            }
          }
        });
      }
    });

    setResult({ correct: correctCount, total: totalCount, errors });
    if (correctCount === totalCount && totalCount > 0) {
      setLessonProgress(prev => ({ ...prev, exerciseCompleted: true }));
    }
    setShowResult(true);
  };

  const fillCorrectAnswers = () => {
    const devAnswers: Record<string, string> = {};
    grammarData.exercises.forEach((ex: any) => {
      if (ex.items) {
        ex.items.forEach((item: any, idx: number) => {
          if (!item.isExample) {
            devAnswers[`${ex.id}-${idx}`] = item.answer;
          }
        });
      }
      if (ex.matches) {
        ex.matches.forEach((m: any, idx: number) => {
          if (!m.isExample) {
            const letter = m.right.split('.')[0].trim();
            devAnswers[`${ex.id}-match-${idx}`] = letter;
          }
        });
      }
    });
    setAnswers(devAnswers);
  };

  const handleFinishTheory = () => {
    setLessonProgress(prev => ({ ...prev, theoryCompleted: true }));
    setActiveTab('exercise');
  };

  return (
    <div className="container mx-auto max-w-screen-xl px-4 py-8 relative">
      {/* Result Modal */}
      {showResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl max-w-2xl w-full animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4 text-center">Exercise Results</h3>
            <div className="text-center mb-8">
              <div className={`text-6xl font-bold mb-2 ${result.correct === result.total ? 'text-green-500' : 'text-[#FFC600]'}`}>
                {result.correct}/{result.total}
              </div>
              <p className="text-gray-600">
                {result.correct === result.total
                  ? "Perfect! You've mastered this unit."
                  : `You got ${result.correct} correct. Keep practicing to reach 100%!`}
              </p>
            </div>

            {result.errors.length > 0 && (
              <div className="mb-8 overflow-hidden rounded-lg border border-red-100">
                <div className="bg-red-50 px-4 py-2 border-b border-red-100 font-bold text-red-800">Review Mistakes</div>
                <div className="divide-y divide-red-50 max-h-60 overflow-y-auto">
                  {result.errors.map((err, idx) => (
                    <div key={idx} className="p-4 bg-white hover:bg-red-50 transition-colors">
                      <p className="text-sm text-gray-500 mb-1">Ex {err.questionId}: {err.label}</p>
                      <div className="flex flex-wrap gap-4 mt-2">
                        <div className="flex-1">
                          <span className="text-xs font-bold uppercase text-gray-400 block">Your Answer</span>
                          <span className="text-red-600 line-through">{err.userAnswer}</span>
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-bold uppercase text-gray-400 block">Correct Answer</span>
                          <span className="text-green-600 font-bold">{err.correctAnswer}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowResult(false)}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {result.correct === result.total ? "Awesome!" : "Try Again"}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <h1 className="text-4xl font-bold mb-8">Grammar</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar */}
        <div className="w-full lg:w-48 flex-shrink-0">
          <div className="sticky top-8">
            <h3 className="font-bold text-lg mb-4 text-black border-b-2 border-[#FFC600] pb-2 inline-block">Lessons</h3>

            <ul className="space-y-4">
              <li
                className={`flex items-center gap-3 cursor-pointer group transition-all ${activeTab === 'theory' ? 'font-bold text-black' : 'text-gray-500 hover:text-black'}`}
                onClick={() => setActiveTab('theory')}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${lessonProgress.theoryCompleted ? 'bg-green-500 border-green-500 text-white' : activeTab === 'theory' ? 'bg-[#FFC600] border-[#FFC600] text-white' : 'border-gray-200 group-hover:border-gray-400'}`}>
                  {lessonProgress.theoryCompleted ? '✓' : ''}
                </div>
                Theory
              </li>
              <li
                className={`flex items-center gap-3 transition-all ${!lessonProgress.theoryCompleted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:text-black group'} ${activeTab === 'exercise' ? 'font-bold text-black' : 'text-gray-500'}`}
                onClick={() => {
                  if (lessonProgress.theoryCompleted) setActiveTab('exercise');
                }}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${lessonProgress.exerciseCompleted ? 'bg-green-500 border-green-500 text-white' : activeTab === 'exercise' ? 'bg-[#FFC600] border-[#FFC600] text-white' : 'border-gray-200 group-hover:border-gray-400'}`}>
                  {lessonProgress.exerciseCompleted ? '✓' : ''}
                </div>
                Exercise
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white min-h-[600px] border-l border-gray-100 pl-0 lg:pl-12">
          <div className="border-b border-gray-200 pb-4 mb-8 flex justify-between items-center">
            <h2 className="text-xl font-bold">Unit {unitId}: {unitTitle}</h2>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${lessonProgress.theoryCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {lessonProgress.theoryCompleted ? 'Theory Done' : 'Reading Theory'}
              </span>
              {lessonProgress.theoryCompleted && (
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${lessonProgress.exerciseCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {lessonProgress.exerciseCompleted ? 'All Correct' : 'Exercises Incomplete'}
                </span>
              )}
            </div>
          </div>

          {activeTab === 'theory' && (
            <div className="animate-in fade-in duration-300">
              <div dangerouslySetInnerHTML={{ __html: grammarData.theory }} />

              <div className="mt-12 pt-8 border-t border-gray-100 flex justify-center">
                <button
                  onClick={handleFinishTheory}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-3 active:scale-95"
                >
                  Finish Theory & Start Exercises
                  <span className="text-xl">→</span>
                </button>
              </div>
            </div>
          )}


          {activeTab === 'exercise' && (
            <div className="animate-in fade-in duration-300 space-y-12">
              {grammarData.exercises.map((ex: any) => (
                <div key={ex.id}>
                  <h3 className="font-bold text-lg mb-4 text-blue-900">{ex.id} {ex.question}</h3>
                  {ex.verbs && (
                    <div className="bg-gray-50 p-6 rounded-xl mb-6 flex flex-wrap gap-4 font-mono text-sm border border-gray-100">
                      {ex.verbs.map((v: string) => <span key={v} className="px-3 py-1 bg-white rounded shadow-sm border border-gray-100">{v}</span>)}
                    </div>
                  )}

                  <div className="space-y-6">
                    {ex.items && ex.items.map((item: any, idx: number) => {
                      const inputId = `${ex.id}-${idx}`;
                      return (
                        <div key={idx} className="flex flex-col md:flex-row md:items-center gap-3 p-2 hover:bg-blue-50/50 rounded-lg transition-colors">
                          <span className="text-gray-700">{item.label.split('________')[0].replace('________', '')}</span>
                          {!item.isExample ? (
                            <input
                              type="text"
                              value={answers[inputId] || ''}
                              onChange={(e) => handleInputChange(inputId, e.target.value)}
                              className="border-b-2 border-gray-300 bg-transparent px-3 py-1 focus:border-blue-500 outline-none w-56 text-blue-600 font-bold text-center placeholder:font-normal placeholder:text-gray-200"
                              placeholder=".............."
                            />
                          ) : (
                            <span className="font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-md border-b-2 border-blue-200">{item.answer || item.value?.split(' ').slice(1).join(' ')}</span>
                          )}
                          <span className="text-gray-700">{item.label.split('________')[1]}</span>
                        </div>
                      )
                    })}

                    {ex.matches && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                          <h4 className="font-bold text-gray-400 text-xs uppercase tracking-widest pl-2">Left Sentence</h4>
                          {ex.matches.map((m: any, idx: number) => {
                            const inputId = `${ex.id}-match-${idx}`;
                            return (
                              <div key={idx} className="flex items-center gap-3 group">
                                {!m.isExample ? (
                                  <input
                                    type="text"
                                    maxLength={1}
                                    className="w-10 h-10 border-2 rounded-lg text-center uppercase font-bold text-blue-600 focus:border-blue-500 outline-none transition-all shadow-sm"
                                    placeholder="?"
                                    value={answers[inputId] || ''}
                                    onChange={(e) => handleInputChange(inputId, e.target.value)}
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-500">
                                    {m.right.split('.')[0]}
                                  </div>
                                )}
                                <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm flex-1 text-gray-700 group-hover:border-blue-200 transition-colors">
                                  {m.left}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-bold text-gray-400 text-xs uppercase tracking-widest pl-2">Right Sentence</h4>
                          {[...ex.matches].sort((a, b) => a.right.localeCompare(b.right)).map((m: any, idx: number) => (
                            <div key={idx} className="p-3 bg-gray-50 border border-dashed border-gray-200 rounded-xl flex items-center transition-colors">
                              <span className="text-gray-600 font-medium">{m.right}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="pt-12 flex justify-end gap-4">
                <button
                  onClick={fillCorrectAnswers}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-4 px-12 rounded-xl border border-gray-200 transition-all active:scale-95"
                >
                  Fill Correct Answers (Dev)
                </button>
                <button
                  onClick={checkAnswers}
                  className="bg-[#FFC600] hover:bg-[#ffd633] active:scale-95 text-black font-bold py-4 px-12 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Submit Answers
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
