"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { vocabularyApi } from "@/services/learning.api";
import type { VocabularyUnitWithContent, VocabularyWord, SubmitExerciseResponse, SubmitQuestionsResponse } from "@/types";

// ============================================================
// WORD LIST FLIP CARD COMPONENT
// ============================================================

interface WordListFlipCardProps {
  currentWord: VocabularyWord;
  currentWordIndex: number;
  totalWords: number;
  onNextWord: () => void;
  onSkip?: () => void; // Optional skip handler for dev/testing
}

function WordListFlipCard({ currentWord, currentWordIndex, totalWords, onNextWord, onSkip }: WordListFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when word changes
  useEffect(() => {
    setIsFlipped(false);
  }, [currentWordIndex]);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleSpeakWord = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      {/* Progress bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="w-20 h-2 bg-gray-800 rounded-full" />
        <span className="font-bold text-gray-600">{currentWordIndex + 1}/{totalWords}</span>
      </div>
      
      {/* Dev Skip Button */}
      {onSkip && (
        <div className="flex justify-end mb-2">
           <button 
             onClick={(e) => { e.stopPropagation(); onSkip(); }}
             className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-600 px-2 py-1 rounded"
           >
             SKIP (DEV)
           </button>
        </div>
      )}

      {/* Flip Card Container */}
      <div 
        className="perspective-1000 cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={handleCardClick}
      >
        <div 
          className="relative w-full transition-transform duration-500"
          style={{ 
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            minHeight: '450px'
          }}
        >
          {/* FRONT SIDE */}
          <div 
            className="absolute inset-0 w-full h-full backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="border-2 border-blue-400 rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center text-center shadow-sm min-h-[450px] bg-white">
              {/* Image */}
              <div className="w-40 h-40 rounded-full overflow-hidden mb-8 border-4 border-white shadow-lg bg-gray-100">
                {currentWord.imageUrl ? (
                  <img src={currentWord.imageUrl} alt={currentWord.word} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">📚</div>
                )}
              </div>

              {/* Word */}
              <h2 className="text-2xl font-bold mb-2">{currentWord.word}</h2>
              
              {/* IPA + Part of Speech + Speaker */}
              <div className="flex items-center gap-2 text-gray-600">
                <span>[{currentWord.ipa}]</span>
                <span>{currentWord.partOfSpeech}.</span>
                <button 
                  onClick={handleSpeakWord}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  title="Listen to pronunciation"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </button>
              </div>

              {/* Hint to flip */}
              <p className="text-sm text-gray-400 mt-8">Click to see meaning</p>
            </div>
          </div>

          {/* BACK SIDE */}
          <div 
            className="absolute inset-0 w-full h-full backface-hidden"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="border-2 border-blue-400 rounded-2xl p-8 md:p-12 flex flex-col items-center text-center shadow-sm min-h-[450px] bg-white">
              {/* Smaller Image at top */}
              <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-white shadow-md bg-gray-100">
                {currentWord.imageUrl ? (
                  <img src={currentWord.imageUrl} alt={currentWord.word} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl">📚</div>
                )}
              </div>

              {/* Word + IPA + Speaker inline */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl font-bold">{currentWord.word}</span>
                <span className="text-gray-600">[{currentWord.ipa}]</span>
                <span className="text-gray-600">{currentWord.partOfSpeech}.</span>
                <button 
                  onClick={handleSpeakWord}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  title="Listen to pronunciation"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </button>
              </div>

              {/* Meaning */}
              <p className="text-lg text-gray-800 mb-4">{currentWord.meaning}</p>

              {/* Example */}
              {currentWord.example && (
                <p className="text-gray-600">
                  → {currentWord.example.split(currentWord.word).map((part, i, arr) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < arr.length - 1 && <strong className="font-bold">{currentWord.word}</strong>}
                    </React.Fragment>
                  ))}
                </p>
              )}

              {/* Hint to flip back */}
              <p className="text-sm text-gray-400 mt-6">Click to flip back</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - only show when card is flipped */}
      {isFlipped && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <button
            className="bg-[#5B9557] hover:bg-[#4a7a47] text-white font-bold py-4 rounded-xl uppercase tracking-wide transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onNextWord();
            }}
          >
            {currentWordIndex < totalWords - 1 ? "ALREADY KNOW" : "GO TO EXERCISE"}
          </button>
          <button 
            className="bg-[#E74C3C] hover:bg-[#d64132] text-white font-bold py-4 rounded-xl uppercase tracking-wide transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            ADD TO MY FLASHCARD
          </button>
        </div>
      )}
    </div>
  );
}

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
  const [questionResult, setQuestionResult] = useState<SubmitQuestionsResponse | null>(null);
  const [questionSubmitting, setQuestionSubmitting] = useState(false);
  
  // Reading completion state
  const [readingComplete, setReadingComplete] = useState(false);
  
  // Modal state for showing score popups
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

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
      // Completed all words - mark as fully learned and move to exercise
      setWordsLearned(totalWords);
      try {
        await vocabularyApi.updateWordProgress(unit.id, totalWords);
      } catch (err) {
        console.error("Failed to update progress:", err);
      }
      setActiveTab('exercise');
    }
  };

  // Dev skip handler
  const handleSkipWordList = async () => {
    setWordsLearned(totalWords);
    try {
      await vocabularyApi.updateWordProgress(unit.id, totalWords);
    } catch (err) {
      console.error("Failed to update progress:", err);
    }
    setActiveTab('exercise');
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
      console.log("Exercise submission result:", result);
      setExerciseResult(result);
      setShowExerciseModal(true); // Show the score modal
    } catch (err: any) {
      console.error("Failed to submit exercise:", err);
      alert("Failed to submit exercise: " + (err.message || "Unknown error"));
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
      setShowQuestionModal(true); // Show the score modal
    } catch (err: any) {
      console.error("Failed to submit questions:", err);
    } finally {
      setQuestionSubmitting(false);
    }
  };

  // Check if each activity is completed (with ALL CORRECT answers required)
  const isWordListComplete = wordsLearned >= totalWords;
  const isExerciseComplete = exerciseResult !== null && exerciseResult.correctCount === exerciseResult.totalQuestions;
  const isReadingCompleteFlag = readingComplete;
  const isQuestionsComplete = questionResult !== null && questionResult.correctCount === questionResult.totalQuestions;

  // Check if each activity is unlocked (previous one completed with all correct)
  const isExerciseUnlocked = isWordListComplete;
  const isReadingUnlocked = isExerciseComplete;
  const isQuestionsUnlocked = isReadingCompleteFlag;

  const getCompletionIcon = (isComplete: boolean) => {
    if (isComplete) {
      return <div className="w-6 h-6 rounded-full bg-[#FFC600] flex items-center justify-center text-white text-sm font-bold">✓</div>;
    }
    return <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>;
  };

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
              <li className={`flex items-center gap-3 ${activeTab === 'word-list' ? 'text-black font-bold' : 'text-gray-500 font-medium'}`}>
                {getCompletionIcon(isWordListComplete)}
                Word List ({wordsLearned}/{totalWords})
              </li>
              <li className={`flex items-center gap-3 ${activeTab === 'exercise' ? 'text-black font-bold' : isExerciseUnlocked ? 'text-gray-500 font-medium' : 'text-gray-300 font-medium'}`}>
                {getCompletionIcon(isExerciseComplete)}
                Exercise
              </li>
              <li className={`flex items-center gap-3 ${activeTab === 'reading' ? 'text-black font-bold' : isReadingUnlocked ? 'text-gray-500 font-medium' : 'text-gray-300 font-medium'}`}>
                {getCompletionIcon(isReadingCompleteFlag)}
                Reading Comprehension
              </li>
              <li className={`flex items-center gap-3 ${activeTab === 'questions' ? 'text-black font-bold' : isQuestionsUnlocked ? 'text-gray-500 font-medium' : 'text-gray-300 font-medium'}`}>
                {getCompletionIcon(isQuestionsComplete)}
                Answer the questions
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* WORD LIST TAB */}
          {activeTab === 'word-list' && currentWord && (
            <WordListFlipCard
              currentWord={currentWord}
              currentWordIndex={currentWordIndex}
              totalWords={totalWords}
              onNextWord={handleNextWord}
              onSkip={handleSkipWordList}
            />
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
                <div className="mt-8">
                  {/* Score feedback */}
                  <div className={`p-4 rounded-xl mb-4 ${isExerciseComplete ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    <p className="font-bold text-lg">
                      Score: {exerciseResult.correctCount}/{exerciseResult.totalQuestions}
                    </p>
                    {isExerciseComplete ? (
                      <p>🎉 Excellent! All answers correct. You can now proceed to Reading.</p>
                    ) : (
                      <p>⚠️ You must get all answers correct to proceed. Please review and try again.</p>
                    )}
                  </div>
                  
                  {isExerciseComplete ? (
                    <button
                      className="bg-[#5B9557] text-white font-bold py-3 px-8 rounded-xl uppercase tracking-wide hover:opacity-90"
                      onClick={() => setActiveTab('reading')}
                    >
                      Continue to Reading
                    </button>
                  ) : (
                    <button
                      className="bg-[#E74C3C] text-white font-bold py-3 px-8 rounded-xl uppercase tracking-wide hover:opacity-90"
                      onClick={() => {
                        setExerciseResult(null);
                        setExerciseAnswers({});
                      }}
                    >
                      Try Again
                    </button>
                  )}
                </div>
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
                onClick={() => {
                  setReadingComplete(true);
                  setActiveTab('questions');
                }}
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
                <div className="mt-8">
                  {/* Score feedback */}
                  <div className={`p-4 rounded-xl mb-4 ${isQuestionsComplete ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    <p className="font-bold text-lg">
                      Score: {questionResult.correctCount}/{questionResult.totalQuestions}
                    </p>
                    {isQuestionsComplete ? (
                      <p>🎉 Excellent! All answers correct. Unit completed!</p>
                    ) : (
                      <p>⚠️ You must get all answers correct to complete this unit. Please review and try again.</p>
                    )}
                  </div>
                  
                  {isQuestionsComplete ? (
                    <div className="bg-green-50 p-6 rounded-xl">
                      <h3 className="text-xl font-bold text-green-700 mb-2">🎉 Unit Completed!</h3>
                      <p className="text-green-600">
                        Congratulations! You have successfully completed this unit with a perfect score.
                        <Link href={`/vocabulary/${bookId}`} className="underline ml-2 font-bold">
                          Back to Units
                        </Link>
                      </p>
                    </div>
                  ) : (
                    <button
                      className="bg-[#E74C3C] text-white font-bold py-3 px-8 rounded-xl uppercase tracking-wide hover:opacity-90"
                      onClick={() => {
                        setQuestionResult(null);
                        setQuestionAnswers({});
                      }}
                    >
                      Try Again
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* EXERCISE SCORE MODAL */}
      {showExerciseModal && exerciseResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className={`p-6 ${isExerciseComplete ? 'bg-green-500' : 'bg-amber-500'} text-white`}>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Exercise Results</h2>
                  <p className="text-lg opacity-90">
                    Score: {exerciseResult.correctCount}/{exerciseResult.totalQuestions}
                  </p>
                </div>
                <div className="text-5xl">
                  {isExerciseComplete ? '🎉' : '⚠️'}
                </div>
              </div>
            </div>

            {/* Modal Body - Answer Key */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              <h3 className="font-bold text-lg mb-4">Answer Key</h3>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left border">#</th>
                    <th className="p-2 text-left border">Question</th>
                    <th className="p-2 text-left border">Correct Answer</th>
                    <th className="p-2 text-left border">Your Answer</th>
                    <th className="p-2 text-center border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {exerciseResult.results.map((result, idx) => {
                    const exercise = unit.exercises.find(e => e.id === result.exerciseId);
                    return (
                      <tr key={result.exerciseId} className={result.isCorrect ? 'bg-green-50' : 'bg-red-50'}>
                        <td className="p-2 border font-medium">{idx + 1}</td>
                        <td className="p-2 border">{exercise?.question}</td>
                        <td className="p-2 border text-green-700 font-medium">{result.correctAnswer}</td>
                        <td className={`p-2 border ${result.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                          {result.userAnswer}
                        </td>
                        <td className="p-2 border text-center text-lg">
                          {result.isCorrect ? '✅' : '❌'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 flex justify-between items-center">
              <p className={`font-medium ${isExerciseComplete ? 'text-green-700' : 'text-amber-700'}`}>
                {isExerciseComplete 
                  ? '✓ All answers correct! You can proceed to Reading.'
                  : '⚠ You must get all answers correct to proceed.'
                }
              </p>
              <div className="flex gap-4">
                <button
                  className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                  onClick={() => setShowExerciseModal(false)}
                >
                  Close
                </button>
                {isExerciseComplete ? (
                  <button
                    className="px-6 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors"
                    onClick={() => {
                      setShowExerciseModal(false);
                      setActiveTab('reading');
                    }}
                  >
                    Continue to Reading
                  </button>
                ) : (
                  <button
                    className="px-6 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors"
                    onClick={() => {
                      setShowExerciseModal(false);
                      setExerciseResult(null);
                      setExerciseAnswers({});
                    }}
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUESTION SCORE MODAL */}
      {showQuestionModal && questionResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className={`p-6 ${isQuestionsComplete ? 'bg-green-500' : 'bg-amber-500'} text-white`}>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Comprehension Results</h2>
                  <p className="text-lg opacity-90">
                    Score: {questionResult.correctCount}/{questionResult.totalQuestions}
                  </p>
                </div>
                <div className="text-5xl">
                  {isQuestionsComplete ? '🎉' : '⚠️'}
                </div>
              </div>
            </div>

            {/* Modal Body - Answer Key */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              <h3 className="font-bold text-lg mb-4">Answer Key</h3>
              <div className="space-y-4">
                {questionResult.results.map((result, idx) => {
                  const question = unit.questions.find(q => q.id === result.questionId);
                  return (
                    <div key={result.questionId} className={`p-4 rounded-lg ${result.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium">{idx + 1}. {question?.question}</p>
                        <span className="text-xl">{result.isCorrect ? '✅' : '❌'}</span>
                      </div>
                      <p className="text-green-700"><strong>Correct:</strong> {result.correctAnswer}</p>
                      {!result.isCorrect && (
                        <p className="text-red-700"><strong>Your answer:</strong> {result.userAnswer}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 flex justify-between items-center">
              <p className={`font-medium ${isQuestionsComplete ? 'text-green-700' : 'text-amber-700'}`}>
                {isQuestionsComplete 
                  ? '🎉 Congratulations! Unit completed!'
                  : '⚠ You must get all answers correct to complete this unit.'
                }
              </p>
              <div className="flex gap-4">
                <button
                  className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                  onClick={() => setShowQuestionModal(false)}
                >
                  Close
                </button>
                {isQuestionsComplete ? (
                  <Link
                    href={`/vocabulary/${bookId}`}
                    className="px-6 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Back to Units
                  </Link>
                ) : (
                  <button
                    className="px-6 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors"
                    onClick={() => {
                      setShowQuestionModal(false);
                      setQuestionResult(null);
                      setQuestionAnswers({});
                    }}
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
