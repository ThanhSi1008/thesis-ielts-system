"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { vocabularyApi } from "@/services/learning.api";
import type { VocabularyUnitWithContent, SubmitExerciseResponse } from "@/types";

export default function UnitPage() {
  const params = useParams();
  const bookId = params?.bookSlug as string;
  const unitId = params?.unitSlug as string;

  const [unit, setUnit] = useState<VocabularyUnitWithContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnit = async () => {
      try {
        const data = await vocabularyApi.getUnit(unitId);
        setUnit(data);
      } catch (err: any) {
        setError(err.message || "Failed to load unit");
      } finally {
        setLoading(false);
      }
    };

    if (unitId) {
      fetchUnit();
    }
  }, [unitId]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-screen-xl px-4 py-8">
        <div className="h-8 w-32 bg-gray-200 rounded mb-8 animate-pulse" />
        <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="container mx-auto max-w-screen-xl px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">
          {error || "Unit not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-screen-xl px-4 py-8">
      <Link
        href={`/vocabulary/${bookId}`}
        className="inline-flex items-center text-gray-500 hover:text-black mb-6 transition-colors font-medium"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Units
      </Link>

      <UnitLearningClient
        unit={unit}
        bookId={bookId}
      />
    </div>
  );
}

// ============================================================
// UNIT LEARNING CLIENT COMPONENT
// ============================================================

interface UnitLearningClientProps {
  unit: VocabularyUnitWithContent;
  bookId: string;
}

function UnitLearningClient({ unit, bookId }: UnitLearningClientProps) {
  const [activeTab, setActiveTab] = useState<'word-list' | 'exercise' | 'reading' | 'questions'>('word-list');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordsLearned, setWordsLearned] = useState(0);
  
  // Exercise state
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, string>>({});
  const [exerciseResult, setExerciseResult] = useState<SubmitExerciseResponse | null>(null);
  const [exerciseSubmitting, setExerciseSubmitting] = useState(false);
  
  // Questions state
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});
  const [questionResult, setQuestionResult] = useState<SubmitExerciseResponse | null>(null);
  const [questionSubmitting, setQuestionSubmitting] = useState(false);

  const currentWord = unit.words[currentWordIndex];
  const totalWords = unit.words.length;

  // Update word progress when moving through words
  const handleNextWord = async () => {
    if (currentWordIndex < totalWords - 1) {
      setCurrentWordIndex(prev => prev + 1);
      const newLearned = Math.min(wordsLearned + 1, totalWords);
      setWordsLearned(newLearned);
      
      // Update progress on server
      try {
        await vocabularyApi.updateWordProgress(unit.id, newLearned);
      } catch (err) {
        console.error("Failed to update progress:", err);
      }
    } else {
      // Completed all words, move to exercise
      setActiveTab('exercise');
    }
  };

  // Submit exercise answers
  const handleSubmitExercise = async () => {
    setExerciseSubmitting(true);
    try {
      const answers = Object.entries(exerciseAnswers).map(([exerciseId, answer]) => ({
        exerciseId,
        answer,
      }));
      const result = await vocabularyApi.submitExercise(unit.id, answers);
      setExerciseResult(result);
    } catch (err: any) {
      console.error("Failed to submit exercise:", err);
    } finally {
      setExerciseSubmitting(false);
    }
  };

  // Submit question answers
  const handleSubmitQuestions = async () => {
    setQuestionSubmitting(true);
    try {
      const answers = Object.entries(questionAnswers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));
      const result = await vocabularyApi.submitQuestions(unit.id, answers);
      setQuestionResult(result);
    } catch (err: any) {
      console.error("Failed to submit questions:", err);
    } finally {
      setQuestionSubmitting(false);
    }
  };

  const getTabIcon = (tab: string) => {
    const isActive = activeTab === tab;
    const isComplete = 
      (tab === 'word-list' && wordsLearned >= totalWords) ||
      (tab === 'exercise' && exerciseResult !== null) ||
      (tab === 'reading' && activeTab === 'questions') ||
      (tab === 'questions' && questionResult !== null);

    if (isActive || isComplete) {
      return <div className="w-5 h-5 rounded-full bg-[#FFC600] flex items-center justify-center text-white text-xs font-bold">✓</div>;
    }
    return <div className="w-5 h-5 rounded-full border-2 border-gray-200"></div>;
  };

  const getTabClass = (tab: string) => 
    activeTab === tab ? "text-black font-bold" : "text-gray-500 font-medium";

  return (
    <>
      <div className="mb-4">
        <h1 className="text-4xl font-bold mb-2">Vocabulary</h1>
        <p className="text-gray-600">{unit.book.name} - Unit {unit.order}: {unit.title}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="sticky top-8">
            <h3 className="font-bold text-lg mb-4 text-black border-b-2 border-[#FFC600] pb-2 inline-block">Lessons</h3>

            <ul className="space-y-6">
              <li className={`flex items-center gap-3 cursor-pointer ${getTabClass('word-list')}`} onClick={() => setActiveTab('word-list')}>
                {getTabIcon('word-list')}
                Word List ({wordsLearned}/{totalWords})
              </li>
              <li className={`flex items-center gap-3 cursor-pointer ${getTabClass('exercise')}`} onClick={() => setActiveTab('exercise')}>
                {getTabIcon('exercise')}
                Exercise
              </li>
              <li className={`flex items-center gap-3 cursor-pointer ${getTabClass('reading')}`} onClick={() => setActiveTab('reading')}>
                {getTabIcon('reading')}
                Reading Comprehension
              </li>
              <li className={`flex items-center gap-3 cursor-pointer ${getTabClass('questions')}`} onClick={() => setActiveTab('questions')}>
                {getTabIcon('questions')}
                Answer the questions
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* WORD LIST TAB */}
          {activeTab === 'word-list' && currentWord && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-2">
                <div className="w-full h-2 bg-gray-200 rounded-full mr-4 relative">
                  <div 
                    className="absolute top-0 left-0 h-full bg-black rounded-full transition-all" 
                    style={{ width: `${((currentWordIndex + 1) / totalWords) * 100}%` }}
                  />
                </div>
                <span className="font-bold text-black">{currentWordIndex + 1}/{totalWords}</span>
              </div>

              <div className="border-2 border-blue-400 rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center text-center shadow-sm min-h-[500px] bg-white">
                {currentWord.imageUrl && (
                  <div className="w-48 h-48 rounded-full overflow-hidden mb-8 border-4 border-white shadow-lg">
                    <img src={currentWord.imageUrl} alt={currentWord.word} className="w-full h-full object-cover" />
                  </div>
                )}

                <h2 className="text-2xl font-bold mb-2">
                  {currentWord.word} <span className="text-gray-600 font-normal">[{currentWord.ipa}] {currentWord.partOfSpeech}</span>
                </h2>
                <div className="w-16 h-1 bg-[#FFC600] mb-8"></div>

                <p className="text-xl font-medium mb-8 text-gray-800">{currentWord.meaning}</p>

                {currentWord.example && (
                  <p className="text-lg text-gray-700">→ {currentWord.example}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <button
                  className="bg-[#5B9557] hover:bg-[#4a7a47] text-white font-bold py-4 rounded-xl uppercase tracking-wide transition-colors"
                  onClick={handleNextWord}
                >
                  {currentWordIndex < totalWords - 1 ? "NEXT WORD" : "GO TO EXERCISE"}
                </button>
                <button className="bg-[#E74C3C] hover:bg-[#d64132] text-white font-bold py-4 rounded-xl uppercase tracking-wide transition-colors">
                  ADD TO MY FLASHCARD
                </button>
              </div>
            </div>
          )}

          {/* EXERCISE TAB */}
          {activeTab === 'exercise' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-8 pb-4 border-b">
                <h2 className="text-xl font-bold">Exercise</h2>
                {exerciseResult && (
                  <span className="font-bold text-[#5B9557]">{exerciseResult.correctCount}/{exerciseResult.totalQuestions} correct</span>
                )}
              </div>

              <h3 className="font-bold text-lg mb-6">Choose the right word for the given definition.</h3>

              <div className="space-y-8">
                {unit.exercises.map((ex, idx) => {
                  const result = exerciseResult?.results.find(r => r.exerciseId === ex.id);
                  return (
                    <div key={ex.id}>
                      <p className="font-semibold mb-3">{idx + 1}. {ex.question}</p>
                      <div className="space-y-1 ml-4">
                        {(ex.options as string[]).map((opt, optIdx) => (
                          <label 
                            key={optIdx} 
                            className={`flex items-center gap-3 cursor-pointer p-2 rounded block ${
                              result 
                                ? (opt.toLowerCase().includes(result.correctAnswer.toLowerCase()) 
                                    ? 'bg-green-100' 
                                    : exerciseAnswers[ex.id] === opt && !result.isCorrect 
                                      ? 'bg-red-100' 
                                      : 'hover:bg-gray-50')
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`ex-${ex.id}`}
                              value={opt}
                              checked={exerciseAnswers[ex.id] === opt}
                              onChange={() => setExerciseAnswers(prev => ({ ...prev, [ex.id]: opt }))}
                              disabled={!!exerciseResult}
                              className="w-4 h-4 text-primary focus:ring-primary"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {!exerciseResult && (
                <button
                  className="mt-8 bg-[#FFC600] text-black font-bold py-3 px-8 rounded-xl uppercase tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
                  onClick={handleSubmitExercise}
                  disabled={exerciseSubmitting || Object.keys(exerciseAnswers).length < unit.exercises.length}
                >
                  {exerciseSubmitting ? "Submitting..." : "Submit"}
                </button>
              )}

              {exerciseResult && (
                <button
                  className="mt-8 bg-[#5B9557] text-white font-bold py-3 px-8 rounded-xl uppercase tracking-wide hover:opacity-90"
                  onClick={() => setActiveTab('reading')}
                >
                  Continue to Reading
                </button>
              )}
            </div>
          )}

          {/* READING TAB */}
          {activeTab === 'reading' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold">{unit.storyTitle || unit.title}</h2>
              </div>

              <div className="flex flex-col-reverse xl:flex-row gap-8">
                <div className="flex-1 text-lg leading-relaxed text-gray-800 space-y-4">
                  {unit.storyContent ? (
                    <div dangerouslySetInnerHTML={{ __html: unit.storyContent }} />
                  ) : (
                    <p className="text-gray-500 italic">No reading content available for this unit.</p>
                  )}
                </div>

                {unit.storyImageUrl && (
                  <div className="w-full xl:w-80 flex-shrink-0">
                    <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                      <img src={unit.storyImageUrl} alt={unit.storyTitle} className="w-full h-auto" />
                    </div>
                  </div>
                )}
              </div>

              <button
                className="mt-8 bg-[#FFC600] text-black font-bold py-3 px-8 rounded-xl uppercase tracking-wide hover:opacity-90"
                onClick={() => setActiveTab('questions')}
              >
                Continue to Questions
              </button>
            </div>
          )}

          {/* QUESTIONS TAB */}
          {activeTab === 'questions' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-8 pb-4 border-b">
                <h2 className="text-xl font-bold">Answer the questions</h2>
                {questionResult && (
                  <span className="font-bold text-[#5B9557]">{questionResult.correctCount}/{questionResult.totalQuestions} correct</span>
                )}
              </div>

              <div className="space-y-8 mb-8">
                {unit.questions.map((q, idx) => {
                  const result = questionResult?.results.find(r => r.questionId === q.id);
                  return (
                    <div key={q.id}>
                      <p className="font-semibold mb-3">{idx + 1}. {q.question}</p>

                      {q.type === 'fill_blank' ? (
                        <div className="ml-4">
                          <input
                            type="text"
                            className={`w-full bg-gray-100 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#FFC600] ${
                              result ? (result.isCorrect ? 'bg-green-100' : 'bg-red-100') : ''
                            }`}
                            placeholder="Type your answer here..."
                            value={questionAnswers[q.id] || ''}
                            onChange={(e) => setQuestionAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                            disabled={!!questionResult}
                          />
                          {result && !result.isCorrect && (
                            <p className="text-sm text-green-600 mt-1">Correct answer: {result.correctAnswer}</p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1 ml-4">
                          {q.options?.map((opt, optIdx) => (
                            <label
                              key={optIdx}
                              className={`flex items-start gap-3 cursor-pointer p-2 rounded block ${
                                result
                                  ? (opt.toLowerCase().includes(result.correctAnswer.toLowerCase())
                                      ? 'bg-green-100'
                                      : questionAnswers[q.id] === opt && !result.isCorrect
                                        ? 'bg-red-100'
                                        : 'hover:bg-gray-50')
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q-${q.id}`}
                                value={opt}
                                checked={questionAnswers[q.id] === opt}
                                onChange={() => setQuestionAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                disabled={!!questionResult}
                                className="mt-1 w-4 h-4 text-primary focus:ring-primary flex-shrink-0"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!questionResult && (
                <button
                  className="bg-[#FFC600] text-black font-bold py-3 px-8 rounded-xl uppercase tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
                  onClick={handleSubmitQuestions}
                  disabled={questionSubmitting || Object.keys(questionAnswers).length < unit.questions.length}
                >
                  {questionSubmitting ? "Submitting..." : "Submit"}
                </button>
              )}

              {questionResult && (
                <div className="bg-green-50 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-green-700 mb-2">🎉 Unit Completed!</h3>
                  <p className="text-green-600">
                    You scored {questionResult.score}% on this unit. 
                    <Link href={`/vocabulary/${bookId}`} className="underline ml-2 font-bold">
                      Back to Units
                    </Link>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
