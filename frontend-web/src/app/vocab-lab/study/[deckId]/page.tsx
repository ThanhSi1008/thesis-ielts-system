'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { vocabLabApi } from '@/services/vocabLab.api';
import type { StudyCard } from '@/types';
import PageHeader from '@/components/PageHeader';

export default function StudyPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.deckId as string;

  const [cards, setCards] = useState<StudyCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerCollapsed, setBannerCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('vocablab-banner-collapsed');
    return stored === null ? true : stored === 'true';
  });

  const toggleBanner = () => {
    setBannerCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('vocablab-banner-collapsed', String(next));
      return next;
    });
  };


  useEffect(() => {
    const fetchStudyCards = async () => {
      try {
        const data = await vocabLabApi.getStudyCards(deckId);
        setCards(data);
      } catch (error) {
        console.error('Failed to fetch study cards:', error);
      } finally {
        setLoading(false);
      }
    };
    if (deckId) fetchStudyCards();
  }, [deckId]);

  const currentCard = cards[currentIndex];
  const isComplete = !loading && cards.length > 0 && currentIndex >= cards.length;
  const isNoCards = !loading && cards.length === 0;

  const handleRating = async (rating: number) => {
    if (!currentCard || isSubmitting) return;
    setIsSubmitting(true);

    try {
      await vocabLabApi.submitReview({
        flashcardId: currentCard.id,
        rating,
      });

      // Move to next card
      setShowAnswer(false);
      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to save review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentCard || isComplete || isSubmitting) return;

      if (!showAnswer) {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          setShowAnswer(true);
        }
      } else {
        switch (e.key) {
          case '1': e.preventDefault(); handleRating(0); break;
          case '2': e.preventDefault(); handleRating(3); break;
          case '3': e.preventDefault(); handleRating(4); break;
          case '4': e.preventDefault(); handleRating(5); break;
          case 'Space':
          case 'Enter':
            e.preventDefault();
            handleRating(4); // Default to Good
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAnswer, currentCard, isComplete, isSubmitting]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#F3F4F6]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500">Loading your flashcards...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'decks', label: 'Decks' },
    { id: 'add', label: 'Add' },
    { id: 'browse', label: 'Browse' },
    { id: 'stats', label: 'Stats' },
  ];

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-20">

      {/* Banner — collapsible (same localStorage key as vocab-lab main page) */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out relative ${
          bannerCollapsed
            ? 'border-b transition-all duration-300 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-light top-0 border-primary/40 shadow-lg shadow-black/30 backdrop-blur-sm'
            : ''
        }`}
        style={{ maxHeight: bannerCollapsed ? '80px' : '260px' }}
      >
        <PageHeader
          title="VOCAB LAB"
          breadcrumbs={[
            { label: 'Homepage', href: '/' },
            { label: 'Vocab Lab' },
          ]}
          backgroundImage="https://res.cloudinary.com/dalaaegob/image/upload/v1773518563/4b145836-e585-4092-852e-2cbd64aec326.png"
        />
        {/* Overlay — solid slate gradient when collapsed */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-500"
          style={{
            opacity: bannerCollapsed ? 1 : 0,
            background: 'linear-gradient(to right, #0f172a, #1e293b, #0f172a)',
          }}
        />
      </div>

      {/* Sticky toggle */}
      <div className="top-0 z-30 bg-transparent">
        <div className="container mx-auto max-w-screen-xl px-4 flex justify-end">
          <button
            onClick={toggleBanner}
            title={bannerCollapsed ? 'Show banner' : 'Hide banner'}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-700 hover:bg-gray-100 px-3 py-1 rounded-full transition-colors select-none"
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-300 ${bannerCollapsed ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-2 sm:px-6 lg:px-8">
        {/* Tab pills — all navigate back to vocab-lab */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full p-2 flex space-x-2 shadow-sm border border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => router.push('/vocab-lab')}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${tab.id === 'decks'
                  ? 'bg-primary text-gray-900'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        {!isComplete && !isNoCards && (
          <div className="h-1.5 w-full bg-gray-200 rounded-full mb-8 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${(currentIndex / cards.length) * 100}%` }}
            ></div>
          </div>
        )}

        <main className="max-w-3xl mx-auto relative flex justify-center">

          {isNoCards ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center max-w-lg w-full self-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all caught up!</h2>
              <p className="text-gray-600 mb-8">There are no cards left to study in this deck right now.</p>
              <button
                onClick={() => router.push('/vocab-lab')}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors w-full"
              >
                Return to Decks
              </button>
            </div>
          ) : isComplete ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center max-w-lg w-full self-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Complete!</h2>
              <p className="text-gray-600 mb-8">You have reviewed all {cards.length} cards scheduled for this session.</p>
              <button
                onClick={() => router.push('/vocab-lab')}
                className="px-6 py-3 bg-primary text-gray-900 rounded-xl font-medium hover:bg-primary/80 transition-colors w-full"
              >
                Back to Decks
              </button>
            </div>
          ) : (
            <div className="w-full max-w-2xl flex flex-col">

              {/* Flashcard */}
              <div className={`bg-white rounded-2xl shadow-md border border-gray-100 border-t-4 border-t-primary p-8 sm:p-12 min-h-[400px] flex flex-col items-center justify-center text-center transition-all duration-300 ${isSubmitting ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>

                {/* Tags display */}
                {currentCard.tags && currentCard.tags.length > 0 && (
                  <div className="absolute top-6 flex space-x-2">
                    {currentCard.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs font-medium uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Front side */}
                <div className="flex flex-col gap-4 w-full">
                  {!currentCard.noteType ? (
                    // Legacy fallback
                    <div className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-8 leading-tight w-full whitespace-pre-wrap">
                      {currentCard.front}
                    </div>
                  ) : (
                    // New dynamic fields for front
                    currentCard.noteType.templates[0]?.frontFields.map((fieldId) => {
                      const field = currentCard.noteType?.fields.find(f => f.id === fieldId);
                      const value = currentCard.fieldValues[fieldId] || (field?.name === 'Front' ? currentCard.front : '');
                      if (!value) return null;
                      const isHtml = /<[a-z]/i.test(value);
                      return isHtml ? (
                        <div
                          key={fieldId}
                          className="text-2xl sm:text-3xl font-semibold text-gray-900 leading-tight w-full prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: value }}
                        />
                      ) : (
                        <div key={fieldId} className="text-2xl sm:text-3xl font-semibold text-gray-900 leading-tight w-full whitespace-pre-wrap">
                          {value}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Back side (conditionally rendered) */}
                {showAnswer && (
                  <div className="w-full animate-fade-in">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-8 opacity-60"></div>
                    <div className="flex flex-col gap-5 w-full">
                      {!currentCard.noteType ? (
                        // Legacy fallback
                        <div className="text-xl sm:text-2xl text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {currentCard.back}
                        </div>
                      ) : (
                        // New dynamic fields for back
                        currentCard.noteType.templates[0]?.backFields.map((fieldId) => {
                          const field = currentCard.noteType?.fields.find(f => f.id === fieldId);
                          let value = currentCard.fieldValues[fieldId];
                          if (!value && field?.name === 'Back') value = currentCard.back;
                          if (!value) return null;
                          const isHtml = /<[a-z]/i.test(value);
                          return isHtml ? (
                            <div
                              key={fieldId}
                              className="text-xl sm:text-2xl text-gray-700 leading-relaxed prose max-w-none"
                              dangerouslySetInnerHTML={{ __html: value }}
                            />
                          ) : (
                            <div key={fieldId} className="text-xl sm:text-2xl text-gray-700 whitespace-pre-wrap leading-relaxed">
                              {value}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* Controls */}
              <div className="mt-8">
                {!showAnswer ? (
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="w-full max-w-xs mx-auto py-4 sm:py-5 bg-primary border border-primary/30 rounded-xl shadow-sm text-lg font-medium text-gray-900 hover:bg-primary/80 transition-all hover:shadow text-center flex items-center justify-center group"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Show Answer
                  </button>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 animate-fade-in-up">
                    <button
                      onClick={() => handleRating(0)}
                      disabled={isSubmitting}
                      className="flex flex-col items-center justify-center py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl border border-red-200 transition-colors disabled:opacity-50 group"
                    >
                      <span className="font-bold text-lg mb-1">Again</span>
                      <div className="flex items-center text-xs opacity-70">
                        <span>&lt;10m</span>
                        <span className="ml-2 px-1.5 py-0.5 bg-red-100 group-hover:bg-red-200 rounded hidden sm:block">1</span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleRating(3)}
                      disabled={isSubmitting}
                      className="flex flex-col items-center justify-center py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl border border-orange-200 transition-colors disabled:opacity-50 group"
                    >
                      <span className="font-bold text-lg mb-1">Hard</span>
                      <div className="flex items-center text-xs opacity-70">
                        <span>{currentCard.interval > 0 ? `${Math.round(currentCard.interval * 1.2)}d` : '1.2d'}</span>
                        <span className="ml-2 px-1.5 py-0.5 bg-orange-100 group-hover:bg-orange-200 rounded hidden sm:block">2</span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleRating(4)}
                      disabled={isSubmitting}
                      className="flex flex-col items-center justify-center py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl border border-blue-200 transition-colors disabled:opacity-50 group"
                    >
                      <span className="font-bold text-lg mb-1">Good</span>
                      <div className="flex items-center text-xs opacity-70">
                        <span>{currentCard.interval > 0 ? `${Math.round(currentCard.interval * 2.5)}d` : '2.5d'}</span>
                        <span className="ml-2 px-1.5 py-0.5 bg-blue-100 group-hover:bg-blue-200 rounded hidden sm:block">3</span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleRating(5)}
                      disabled={isSubmitting}
                      className="flex flex-col items-center justify-center py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl border border-green-200 transition-colors disabled:opacity-50 group"
                    >
                      <span className="font-bold text-lg mb-1">Easy</span>
                      <div className="flex items-center text-xs opacity-70">
                        <span>{currentCard.interval > 0 ? `${Math.round(currentCard.interval * 3.5)}d` : '4d'}</span>
                        <span className="ml-2 px-1.5 py-0.5 bg-green-100 group-hover:bg-green-200 rounded hidden sm:block">4</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

        </main>
      </div>

      {/* Required CSS for animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }
      `}} />
    </div>
  );
}
