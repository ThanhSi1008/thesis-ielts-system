"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Lock } from "lucide-react";
import FloatingSelectionManager from "@/components/FloatingSelectionManager";
import { vocabularyApi } from "@/services/learning.api";
import { vocabLabApi } from "@/services/vocabLab.api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/Toaster";
import type { VocabularyUnitWithContent, FoundationVocabItem, SubmitQuestionsResponse } from "@/types";

// ============================================================
// SRS RATING CONSTANTS
// ============================================================

const SRS_RATINGS = [
  { rating: 1, label: 'Again', interval: '<10m', bgColor: 'bg-red-50', hoverBg: 'hover:bg-red-100', textColor: 'text-red-700', borderColor: 'border-red-200', keyBg: 'bg-red-100', keyHoverBg: 'group-hover:bg-red-200' },
  { rating: 2, label: 'Hard', interval: '1d', bgColor: 'bg-orange-50', hoverBg: 'hover:bg-orange-100', textColor: 'text-orange-700', borderColor: 'border-orange-200', keyBg: 'bg-orange-100', keyHoverBg: 'group-hover:bg-orange-200' },
  { rating: 3, label: 'Good', interval: '3d', bgColor: 'bg-blue-50', hoverBg: 'hover:bg-blue-100', textColor: 'text-blue-700', borderColor: 'border-blue-200', keyBg: 'bg-blue-100', keyHoverBg: 'group-hover:bg-blue-200' },
  { rating: 4, label: 'Easy', interval: '5d', bgColor: 'bg-green-50', hoverBg: 'hover:bg-green-100', textColor: 'text-green-700', borderColor: 'border-green-200', keyBg: 'bg-green-100', keyHoverBg: 'group-hover:bg-green-200' },
] as const;

// ============================================================
// SCORE MODAL COMPONENT
// ============================================================

interface ScoreModalProps {
  isOpen: boolean;
  score: number;
  totalQuestions: number;
  isPassed: boolean;
  onRetry: () => void;
  onContinue: () => void;
}

function ScoreModal({ isOpen, score, totalQuestions, isPassed, onRetry, onContinue }: ScoreModalProps) {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full shadow-2xl transform scale-100 animate-in zoom-in-95 duration-300 text-center">
        <div className="mb-6">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl shadow-lg mb-4 ${isPassed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {isPassed ? '🏆' : '💪'}
          </div>
          <h3 className="text-2xl font-bold mb-2">{isPassed ? 'Excellent Job!' : 'Keep Trying!'}</h3>
          <p className="text-gray-600">
            You scored <span className={`font-bold text-xl ${isPassed ? 'text-green-600' : 'text-red-600'}`}>{score}</span> out of {totalQuestions}
          </p>
        </div>

        <div className="space-y-3">
          {isPassed ? (
            <button
              onClick={onContinue}
              className="w-full bg-[#FFC600] hover:bg-yellow-400 text-black font-bold py-4 rounded-xl uppercase tracking-wide transition-colors shadow-md"
            >
              Continue Learning
            </button>
          ) : (
            <button
              onClick={onRetry}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl uppercase tracking-wide transition-colors shadow-md"
            >
              Try Again
            </button>
          )}

          {isPassed && (
            <button
              onClick={onRetry}
              className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-3 rounded-xl transition-colors"
            >
              Review Answers
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}

// ============================================================
// WORD LIST FLIP CARD COMPONENT
// ============================================================

interface WordListFlipCardProps {
  currentWord: FoundationVocabItem;
  currentWordIndex: number;
  totalWords: number;
  onNextWord: (rating?: number) => void;
  onSkip?: () => void;
  bookName: string;
}

function WordListFlipCard({ currentWord, currentWordIndex, totalWords, onNextWord, onSkip, bookName }: WordListFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
    setShowButtons(false);
  }, [currentWordIndex]);

  const handleCardClick = () => {
    if (!isFlipped) {
      setIsFlipped(true);
      setTimeout(() => setShowButtons(true), 300);
    } else {
      setIsFlipped(false);
      setShowButtons(false);
    }
  };

  const handleSpeakWord = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentWord.audioUrl) {
      const audio = new Audio(currentWord.audioUrl);
      audio.play().catch(err => console.error("Error playing audio:", err));
    } else if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  const handleRateAndAdd = async (rating: number) => {
    if (isAdding) return;

    setIsAdding(true);
    try {
      await vocabLabApi.createFlashcardFromVocabularyWithReview({
        bookName,
        word: currentWord,
        rating,
      });
      window.dispatchEvent(new CustomEvent('vocabduechanged'));

      const ratingLabel = SRS_RATINGS.find(r => r.rating === rating)?.label ?? '';
      toast.success(
        <div className="flex flex-col gap-1">
          <span>Added to Vocab Lab as &quot;{ratingLabel}&quot;</span>
          <Link href="/vocab-lab" className="text-blue-500 hover:text-blue-600 hover:underline text-xs font-bold mt-1 inline-block">
            GO TO VOCAB LAB →
          </Link>
        </div>,
        5000
      );
      onNextWord(rating);
    } catch (err) {
      console.error("Failed to add flashcard:", err);
      toast.error("Failed to add flashcard.");
    } finally {
      setIsAdding(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showButtons || isAdding) return;

      switch (e.key) {
        case '1': e.preventDefault(); handleRateAndAdd(1); break;
        case '2': e.preventDefault(); handleRateAndAdd(2); break;
        case '3': e.preventDefault(); handleRateAndAdd(3); break;
        case '4': e.preventDefault(); handleRateAndAdd(4); break;
        case 'Enter':
        case ' ': // Space to skip/know
          e.preventDefault();
          onNextWord();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showButtons, isAdding, currentWord.id]);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-4 gap-4">
        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FFC600] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(currentWordIndex / totalWords) * 100}%` }}
          />
        </div>
        <span className="font-bold text-gray-600 min-w-[3rem] text-right">{currentWordIndex}/{totalWords}</span>
      </div>



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
          <div
            className="absolute inset-0 w-full h-full backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="border-2 border-blue-400 rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center text-center shadow-sm min-h-[450px] bg-white dark:bg-gray-900">
              <div className="w-40 h-40 rounded-full overflow-hidden mb-8 border-4 border-white dark:border-gray-800 shadow-lg bg-gray-100 dark:bg-gray-800">
                {currentWord.imageUrl ? (
                  <img src={currentWord.imageUrl} alt={currentWord.word} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">📚</div>
                )}
              </div>
              <h2 className="text-2xl font-bold mb-2">{currentWord.word}</h2>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <span>[{currentWord.ipa}]</span>
                <span>{currentWord.partOfSpeech}.</span>
                <button
                  onClick={handleSpeakWord}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-8">Click to see meaning</p>
            </div>
          </div>

          <div
            className="absolute inset-0 w-full h-full backface-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="border-2 border-blue-400 rounded-2xl p-8 md:p-12 flex flex-col items-center text-center shadow-sm min-h-[450px] bg-white dark:bg-gray-900">
              <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-white dark:border-gray-800 shadow-md bg-gray-100 dark:bg-gray-800">
                {currentWord.imageUrl ? (
                  <img src={currentWord.imageUrl} alt={currentWord.word} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl">📚</div>
                )}
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl font-bold">{currentWord.word}</span>
                <span className="text-gray-600 dark:text-gray-400">[{currentWord.ipa}]</span>
                <span className="text-gray-600 dark:text-gray-400">{currentWord.partOfSpeech}.</span>
                <button
                  onClick={handleSpeakWord}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </button>
              </div>
              <p className="text-lg text-gray-800 dark:text-gray-200 mb-4">{currentWord.meaning}</p>
              {currentWord.example && (
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  → {currentWord.example.split(currentWord.word).map((part, i, arr) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < arr.length - 1 && <strong className="font-bold">{currentWord.word}</strong>}
                    </React.Fragment>
                  ))}
                </p>
              )}
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Click to flip back</p>
            </div>
          </div>
        </div>
      </div>

      {showButtons && (
        <div className="mt-8 animate-in fade-in duration-300">
          {/* SRS Rating Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SRS_RATINGS.map((srs) => (
              <button
                key={srs.rating}
                onClick={(e) => { e.stopPropagation(); handleRateAndAdd(srs.rating); }}
                disabled={isAdding}
                className={`group flex flex-col items-center justify-center py-3 rounded-xl border transition-colors disabled:opacity-50 ${srs.bgColor} ${srs.hoverBg} ${srs.textColor} ${srs.borderColor}`}
              >
                <span className="font-bold text-sm mb-0.5">{srs.label}</span>
                <div className="flex items-center text-[10px] opacity-70">
                  <span>{srs.interval}</span>
                  <span className={`ml-1.5 px-1 py-px rounded hidden sm:block ${srs.keyBg} ${srs.keyHoverBg}`}>{srs.rating}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Already Know — Skip (subtle secondary action) */}
          <div className="flex justify-center mt-4">
            <button
              onClick={(e) => { e.stopPropagation(); onNextWord(); }}
              className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center gap-1.5 py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {currentWordIndex < totalWords - 1 ? "Already know — skip" : "Already know — go to reading"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================

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
      <div className="w-full p-4 py-8">
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-8 animate-pulse" />
        <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="w-full p-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl">
          {error || "Unit not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 bg-white dark:bg-slate-950 overflow-y-auto p-2 px-5 w-full h-full shrink-0">
      <div className="w-full">
        <UnitLearningClient
          unit={unit}
          bookId={bookId}
        />
      </div>
    </div>
  );
}

// Helper to inject tooltips for bolded vocab words in the story
function processStoryContent(html: string, words: FoundationVocabItem[]) {
  if (!html) return '';
  
  const wordMap = new Map<string, FoundationVocabItem>();
  words.forEach(w => {
    wordMap.set(w.word.toLowerCase().trim(), w);
  });

  return html.replace(/<strong>(.*?)<\/strong>/gi, (match, wordText) => {
    const cleanWord = wordText.toLowerCase().replace(/[^a-z0-9]/g, '');
    let matchedWord = wordMap.get(cleanWord);
    
    // Fallback: try partial matching if exact match fails
    if (!matchedWord) {
      const found = words.find(w => cleanWord.startsWith(w.word.toLowerCase()) || w.word.toLowerCase().startsWith(cleanWord));
      if (found) matchedWord = found;
    }

    if (matchedWord) {
      const ipaStr = matchedWord.ipa ? ` [${matchedWord.ipa}]` : '';
      const tooltipText = `${matchedWord.meaning}${ipaStr}`;
      // Escape quotes
      const safeTooltip = tooltipText.replace(/"/g, '&quot;');
      return `<strong class="vocab-tooltip text-yellow-600 dark:text-yellow-400 cursor-help border-b border-dashed border-yellow-500/50 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition-colors" data-tooltip="${safeTooltip}">${wordText}</strong>`;
    }
    return match;
  });
}

// ============================================================
// UNIT LEARNING CLIENT COMPONENT
// ============================================================

interface UnitLearningClientProps {
  unit: VocabularyUnitWithContent;
  bookId: string;
}

function UnitLearningClient({ unit, bookId }: UnitLearningClientProps) {
  const [activeTab, setActiveTab] = useState<'word-list' | 'reading'>('word-list');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordsLearned, setWordsLearned] = useState(0);
  const [words, setWords] = useState(unit.words);

  // Questions state
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});
  const [questionResult, setQuestionResult] = useState<SubmitQuestionsResponse | null>(null);
  const [questionSubmitting, setQuestionSubmitting] = useState(false);

  // Reading completion state
  const [readingComplete, setReadingComplete] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  const currentWord = words[currentWordIndex];
  const totalWords = words.length;

  // Tooltip Portal State
  const [hoverTooltip, setHoverTooltip] = useState<{ visible: boolean; x: number; y: number; text: string } | null>(null);

  // Global event listener for hover on vocab words inside dangerouslySetInnerHTML
  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.classList && target.classList.contains('vocab-tooltip')) {
        const rect = target.getBoundingClientRect();
        const text = target.getAttribute('data-tooltip');
        if (text) {
          // Calculate safe X to prevent clipping off screen edges
          let safeX = rect.left + rect.width / 2;
          const estimatedWidth = 200; // rough estimate
          if (safeX < estimatedWidth / 2 + 10) safeX = estimatedWidth / 2 + 10;
          if (safeX > window.innerWidth - estimatedWidth / 2 - 10) safeX = window.innerWidth - estimatedWidth / 2 - 10;
          
          setHoverTooltip({
            visible: true,
            x: safeX,
            y: rect.top - 8,
            text
          });
        }
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.classList && target.classList.contains('vocab-tooltip')) {
        setHoverTooltip(null);
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const progressData = await vocabularyApi.getProgress(bookId);
        const unitProgress = progressData.units.find(u => u.id === unit.id);
        if (unitProgress) {
          if (unitProgress.wordsLearned > 0) {
            setWordsLearned(unitProgress.wordsLearned);
            setCurrentWordIndex(Math.min(unitProgress.wordsLearned, totalWords - 1));
          }

          if (unitProgress.questionScore !== undefined && unitProgress.questionScore !== null) {
            setReadingComplete(true);
            const totalQuestions = unit.questions.length;
            const correctCount = Math.round((unitProgress.questionScore / 100) * totalQuestions);
            setQuestionResult({
              score: unitProgress.questionScore,
              correctCount,
              totalQuestions,
              results: [],
            });
          }

          if (unitProgress.isCompleted || (unitProgress.questionScore !== undefined && unitProgress.questionScore !== null)) {
            setReadingComplete(true);
            setActiveTab('reading');
          } else if (unitProgress.wordsLearned >= totalWords) {
            setActiveTab('reading');
          }
        }
      } catch {
        // User not logged in or no progress
      }
    };
    loadProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, unit.id, unit.questions.length]);

  const handleNextWord = async (rating?: number) => {
    let nextTotal = totalWords;

    // Phase 3: Anki-style "Again" Re-insertion
    if (rating === 1) {
      setWords(prev => [...prev, currentWord]);
      nextTotal += 1;
    }

    if (currentWordIndex < nextTotal - 1) {
      setCurrentWordIndex(prev => prev + 1);
      const newLearned = Math.min(wordsLearned + 1, nextTotal);
      setWordsLearned(newLearned);
      try {
        await vocabularyApi.updateWordProgress(unit.id, newLearned);
      } catch (err) {
        console.error("Failed to update progress:", err);
      }
    } else {
      setWordsLearned(nextTotal);
      try {
        await vocabularyApi.updateWordProgress(unit.id, nextTotal);
      } catch (err) {
        console.error("Failed to update progress:", err);
      }
      setActiveTab('reading');
    }
  };

  const handleSkipWordList = async () => {
    setWordsLearned(totalWords);
    try {
      await vocabularyApi.updateWordProgress(unit.id, totalWords);
    } catch (err) {
      console.error("Failed to update progress:", err);
    }
    setActiveTab('reading');
  };

  const handleSubmitQuestions = async () => {
    setQuestionSubmitting(true);
    try {
      const answers = Object.entries(questionAnswers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));
      const res = await vocabularyApi.submitQuestions(unit.id, answers);
      setQuestionResult(res);
      setShowQuestionModal(true);
    } catch (err: any) {
      console.error("Failed to submit questions:", err);
    } finally {
      setQuestionSubmitting(false);
    }
  };

  const isWordListComplete = wordsLearned >= totalWords;
  const isReadingUnlocked = isWordListComplete;
  const isQuestionsComplete = questionResult !== null && questionResult.correctCount === questionResult.totalQuestions;

  const getCompletionIcon = (isComplete: boolean) => {
    if (isComplete) {
      return <span className="text-[#FFC600] text-sm font-bold ml-auto">✓</span>;
    }
    return null;
  };

  return (
    <>
      {/* Portal Tooltip that won't get clipped by containers */}
      {hoverTooltip && hoverTooltip.visible && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed z-[9999] pointer-events-none bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-[13px] font-medium px-3 py-2 rounded-lg shadow-xl max-w-[250px] text-center animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: hoverTooltip.x,
            top: hoverTooltip.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          {hoverTooltip.text}
          {/* Arrow pointing down */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-t-gray-900 dark:border-t-gray-100 border-l-transparent border-r-transparent border-b-transparent"></div>
        </div>,
        document.body
      )}

      <div className="flex flex-col lg:flex-row gap-12 mt-4">
        <aside className="w-full lg:w-[260px] xl:w-[280px] shrink-0 sticky top-6 self-start max-h-[calc(100vh-120px)] overflow-y-auto hide-scrollbar">
          <div className="mb-8 pr-4">
            <h2 className="text-[16px] font-bold text-gray-900 dark:text-gray-100 mb-5 leading-snug">
              Unit {unit.order}: {unit.title}
            </h2>
            <Link href={`/ielts/vocabulary/${bookId}`} className="text-[11px] font-extrabold text-gray-400 dark:text-gray-500 tracking-widest uppercase flex items-center gap-1 hover:text-gray-900 dark:hover:text-gray-300 transition-colors">
              <ChevronLeft className="w-4 h-4 shrink-0 -ml-1" />
              <span className="truncate">{unit.book.name}</span>
            </Link>
          </div>

          <div className="flex flex-col relative border-l border-gray-200 dark:border-gray-800 ml-2 space-y-1">
            <button
              onClick={() => setActiveTab('word-list')}
              className={`flex items-center text-left transition-all py-1.5 border-l-[2px] -ml-[1px] block w-full pl-4 text-[13.5px] ${activeTab === 'word-list'
                ? 'border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100 font-extrabold'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600 font-medium'
                }`}
            >
              <span className="flex-1">Lesson</span>
              {getCompletionIcon(isWordListComplete)}
            </button>
            <button
              onClick={() => isReadingUnlocked && setActiveTab('reading')}
              disabled={!isReadingUnlocked}
              className={`flex items-center text-left transition-all py-1.5 border-l-[2px] -ml-[1px] block w-full pl-4 text-[13.5px] ${activeTab === 'reading'
                ? 'border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100 font-extrabold'
                : isReadingUnlocked
                  ? 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600 font-medium cursor-pointer'
                  : 'border-transparent text-gray-300 dark:text-gray-600 cursor-not-allowed font-medium'
                }`}
            >
              {!isReadingUnlocked && <Lock className="w-3.5 h-3.5 mr-2 shrink-0" />}
              <span className="flex-1">Reading Comprehension</span>
              {getCompletionIcon(isQuestionsComplete)}
            </button>
          </div>
        </aside>

        <div className="flex-1">
          {activeTab === 'word-list' && currentWord && (
            <WordListFlipCard
              currentWord={currentWord}
              currentWordIndex={currentWordIndex}
              totalWords={totalWords}
              onNextWord={handleNextWord}
              onSkip={handleSkipWordList}
              bookName={unit.book.name}
            />
          )}

          {activeTab === 'reading' && (
            <div className="animate-in fade-in duration-300 h-full flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold">{unit.storyTitle || unit.title}</h2>
              </div>

              <div className="flex flex-col xl:flex-row gap-8 items-start relative h-full">
                <div className="flex-1 text-base leading-relaxed text-gray-800 dark:text-gray-200 space-y-4 xl:sticky top-0 overflow-y-auto overflow-x-hidden max-h-[calc(100vh-160px)] pr-6 custom-scrollbar">
                  <FloatingSelectionManager>
                    {unit.storyContent ? (
                      <div dangerouslySetInnerHTML={{ __html: processStoryContent(unit.storyContent, unit.words) }} />
                    ) : (
                      <p className="text-gray-500 italic text-sm">No reading content available for this unit.</p>
                    )}
                  </FloatingSelectionManager>
                </div>

                <div className="flex-1 w-full bg-gray-50/80 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm max-h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold">Questions</h2>
                    {questionResult && (
                      <span className="font-bold text-[#5B9557]">{questionResult.correctCount}/{questionResult.totalQuestions} correct</span>
                    )}
                  </div>

                  <div className="space-y-8 mb-8">
                    {unit.questions.map((q, idx) => {
                      const res = questionResult?.results.find(r => r.questionId === q.id);
                      return (
                        <div key={q.id}>
                          <p className="font-semibold mb-3 text-sm">{idx + 1}. {q.question}</p>
                          {q.type === 'fill_blank' ? (
                            <div className="ml-4">
                              <input
                                type="text"
                                className={`w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#FFC600] outline-none transition-all ${res ? (res.isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-400') : ''}`}
                                placeholder="Type your answer here..."
                                value={questionAnswers[q.id] || ''}
                                onChange={(e) => setQuestionAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                disabled={!!questionResult}
                              />
                              {res && !res.isCorrect && (
                                <p className="text-xs text-green-600 mt-2 font-medium">Correct answer: {res.correctAnswer}</p>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-1 ml-4">
                              {q.options?.map((opt, optIdx) => (
                                <label
                                  key={optIdx}
                                  className={`flex items-start gap-3 text-sm cursor-pointer p-3 rounded-xl border border-transparent transition-all ${res
                                    ? (opt.toLowerCase().includes(res.correctAnswer.toLowerCase())
                                      ? 'bg-green-50 border-green-200'
                                      : questionAnswers[q.id] === opt && !res.isCorrect
                                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                        : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-50')
                                    : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm hover:shadow'}`}
                                >
                                  <input
                                    type="radio"
                                    name={`q-${q.id}`}
                                    value={opt}
                                    checked={questionAnswers[q.id] === opt}
                                    onChange={() => setQuestionAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                    disabled={!!questionResult}
                                    className="mt-1 w-4 h-4 text-[#FFC600] focus:ring-[#FFC600] flex-shrink-0"
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
                      className="w-full bg-[#FFC600] text-black font-bold py-4 px-8 rounded-xl uppercase tracking-wide hover:opacity-90 transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                      onClick={handleSubmitQuestions}
                      disabled={questionSubmitting || Object.keys(questionAnswers).length < unit.questions.length}
                    >
                      {questionSubmitting ? "Submitting..." : "Submit Answers"}
                    </button>
                  )}

                  {questionResult && (
                    <div className="mt-8">
                      <div className={`p-5 rounded-2xl mb-4 border ${isQuestionsComplete ? 'bg-green-50 border-green-200 text-green-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                        <h3 className="font-bold text-lg mb-2">{isQuestionsComplete ? '🎉 Perfect!' : '⚠️ Almost there!'}</h3>
                        <p className="opacity-90">{isQuestionsComplete ? "Excellent! You've mastered this unit." : "Review the correct answers and try again to complete the unit."}</p>
                      </div>
                      {isQuestionsComplete ? (
                        <Link href={`/ielts/vocabulary/${bookId}`} className="w-full block bg-black text-white text-center font-bold py-4 rounded-xl uppercase tracking-wide hover:opacity-90">
                          Return to Unit List
                        </Link>
                      ) : (
                        <button
                          className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl uppercase tracking-wide hover:bg-black"
                          onClick={() => { setQuestionResult(null); setQuestionAnswers({}); }}
                        >
                          Try Again
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showQuestionModal && questionResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className={`p-6 ${isQuestionsComplete ? 'bg-green-500' : 'bg-amber-500'} text-white text-center`}>
              <h2 className="text-2xl font-bold mb-2">Comprehension Results</h2>
              <p className="text-4xl font-bold">{questionResult.correctCount}/{questionResult.totalQuestions}</p>
            </div>
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              <h3 className="font-bold text-lg mb-4">Answer Key</h3>
              <div className="space-y-4">
                {questionResult.results.map((res, idx) => {
                  const q = unit.questions.find(q => q.id === res.questionId);
                  return (
                    <div key={res.questionId} className={`p-4 rounded-lg ${res.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                      <p className="font-medium mb-1">{idx + 1}. {q?.question}</p>
                      <p className="text-green-700 font-bold">Correct: {res.correctAnswer}</p>
                      {!res.isCorrect && <p className="text-red-700">Yours: {res.userAnswer}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-6 bg-gray-50 flex justify-end gap-4">
              <button className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg" onClick={() => setShowQuestionModal(false)}>Close</button>
              {isQuestionsComplete ? (
                <Link href={`/ielts/vocabulary/${bookId}`} className="px-6 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600">Back to Units</Link>
              ) : (
                <button className="px-6 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600" onClick={() => { setShowQuestionModal(false); setQuestionResult(null); setQuestionAnswers({}); }}>Try Again</button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
