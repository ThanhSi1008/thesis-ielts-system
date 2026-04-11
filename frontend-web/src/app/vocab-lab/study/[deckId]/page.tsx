'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { vocabLabApi } from '@/services/vocabLab.api';
import type { StudyCard } from '@/types';
import PageHeader from '@/components/PageHeader';

// ── Style helpers ─────────────────────────────────────────────────────────────
const FONT_SIZE_MAP: Record<string, string> = { sm: '12px', md: '14px', lg: '18px', xl: '24px', '2xl': '30px' };
const FONT_FAMILY_MAP: Record<string, string> = {
  sans: 'ui-sans-serif, system-ui, sans-serif',
  serif: 'Georgia, serif',
  mono: 'ui-monospace, monospace',
};

function fieldStyleToCSS(s: Record<string, string> | undefined): React.CSSProperties {
  if (!s) return {};
  const alignItems = s.textAlign === 'left' ? 'flex-start' : s.textAlign === 'right' ? 'flex-end' : 'center';
  return {
    fontSize: FONT_SIZE_MAP[s.fontSize || 'lg'],
    fontWeight: s.fontWeight === 'bold' ? 'bold' : undefined,
    fontStyle: s.fontStyle === 'italic' ? 'italic' : undefined,
    textDecoration: s.textDecoration === 'underline' ? 'underline' : undefined,
    color: s.color || undefined,
    textAlign: (s.textAlign as React.CSSProperties['textAlign']) || undefined,
    display: alignItems ? 'flex' : undefined,
    flexDirection: alignItems ? 'column' : undefined,
    alignItems,
  };
}

function cardStyleToCSS(s: Record<string, string> | undefined): React.CSSProperties {
  if (!s) return {};
  return {
    backgroundColor: s.backgroundColor || undefined,
    fontFamily: s.fontFamily ? FONT_FAMILY_MAP[s.fontFamily] : undefined,
    color: s.textColor || undefined,
  };
}

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
  const tabs = [
    { id: 'decks', label: 'Decks' },
    { id: 'add', label: 'Add' },
    { id: 'browse', label: 'Browse' },
    { id: 'stats', label: 'Stats' },
  ];

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-32 sm:pb-40">

      {/* Banner — collapsible (same localStorage key as vocab-lab main page) */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out relative ${bannerCollapsed
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
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-2xl p-1.5 flex gap-1 shadow-md border border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => router.push('/vocab-lab')}
                className={`px-6 py-2 rounded-xl text-[14px] font-bold tracking-wide transition-all ${tab.id === 'decks'
                  ? 'bg-primary text-gray-900 shadow-sm scale-100'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 scale-[0.98]'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        {!loading && !isComplete && !isNoCards && (
          <div className="h-1.5 w-full bg-gray-200 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${(currentIndex / cards.length) * 100}%` }}
            ></div>
          </div>
        )}

        <main className="w-full mx-auto relative flex justify-center">

          {loading ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center w-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-500 font-medium">Loading your flashcards...</p>
            </div>
          ) : isNoCards ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center max-w-md w-full self-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎉</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">You're all caught up!</h2>
              <p className="text-sm text-gray-600 mb-6">There are no cards left to study in this deck right now.</p>
              <button
                onClick={() => router.push('/vocab-lab')}
                className="px-5 py-2.5 text-sm bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors w-full"
              >
                Return to Decks
              </button>
            </div>
          ) : isComplete ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center max-w-md w-full self-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Session Complete!</h2>
              <p className="text-sm text-gray-600 mb-6">You have reviewed all {cards.length} cards scheduled for this session.</p>
              <button
                onClick={() => router.push('/vocab-lab')}
                className="px-5 py-2.5 text-sm bg-primary text-gray-900 rounded-xl font-medium hover:bg-primary/80 transition-colors w-full"
              >
                Back to Decks
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col">

              {/* Flashcard */}
              <div
                className={`relative rounded-2xl shadow-md border border-gray-100 border-t-4 border-t-primary p-6 sm:p-8 min-h-[300px] flex flex-col items-center justify-center text-center transition-[opacity,transform] duration-300 ${isSubmitting ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}
                style={cardStyleToCSS({
                  ...(currentCard.cardType?.templates[0]?.cardStyle as Record<string, string> || {}),
                  ...(currentCard.cardStyle as Record<string, string> || {})
                })}
              >

                {/* Tags display */}
                {currentCard.tags && currentCard.tags.length > 0 && (
                  <div className="absolute -top-2 flex space-x-2">
                    {currentCard.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs font-medium uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Front side */}
                <div className="flex flex-col gap-4 w-full">
                  {!currentCard.cardType ? (
                    // Legacy fallback
                    <div className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6 leading-tight w-full whitespace-pre-wrap">
                      {currentCard.front}
                    </div>
                  ) : (
                    // New dynamic fields for front
                    currentCard.cardType.templates[0]?.frontFields.map((fieldId) => {
                      const field = currentCard.cardType?.fields.find(f => f.id === fieldId);
                      const value = currentCard.fieldValues[fieldId] || (field?.name === 'Front' ? currentCard.front : '');
                      if (!value) return null;
                      const baseStyle = (currentCard.cardType?.templates[0]?.fieldStyles as Record<string, Record<string, string>> | undefined)?.[fieldId] || {};
                      const overrideStyle = currentCard.fieldStyles?.[fieldId] as Record<string, string> || {};
                      const css = fieldStyleToCSS({ ...baseStyle, ...overrideStyle });
                      const isHtml = /<[a-z]/i.test(value);
                      return isHtml ? (
                        <div key={fieldId} className="text-xl sm:text-2xl font-semibold leading-tight w-full prose max-w-none prose-sm sm:prose-base [&_img]:max-w-[280px] [&_img]:max-h-[280px] [&_img]:w-auto [&_img]:mx-auto [&_img]:rounded-xl [&_video]:max-w-[280px] [&_video]:max-h-[280px] [&_video]:w-auto [&_video]:mx-auto [&_video]:rounded-xl"
                          style={css} dangerouslySetInnerHTML={{ __html: value }} />
                      ) : (
                        <div key={fieldId} className="text-xl sm:text-2xl font-semibold leading-tight w-full whitespace-pre-wrap"
                          style={css}>{value}</div>
                      );
                    })
                  )}
                </div>

                {/* Back side (conditionally rendered) */}
                {showAnswer && (
                  <div className="w-full animate-fade-in">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-8 opacity-60"></div>
                    <div className="flex flex-col gap-5 w-full">
                      {!currentCard.cardType ? (
                        // Legacy fallback
                        <div className="text-lg sm:text-xl text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {currentCard.back}
                        </div>
                      ) : (
                        // New dynamic fields for back
                        currentCard.cardType.templates[0]?.backFields.map((fieldId) => {
                          const field = currentCard.cardType?.fields.find(f => f.id === fieldId);
                          let value = currentCard.fieldValues[fieldId];
                          if (!value && field?.name === 'Back') value = currentCard.back;
                          if (!value) return null;
                          const baseStyle = (currentCard.cardType?.templates[0]?.fieldStyles as Record<string, Record<string, string>> | undefined)?.[fieldId] || {};
                          const overrideStyle = currentCard.fieldStyles?.[fieldId] as Record<string, string> || {};
                          const css = fieldStyleToCSS({ ...baseStyle, ...overrideStyle });
                          const isHtml = /<[a-z]/i.test(value);
                          return isHtml ? (
                            <div key={fieldId} className="text-lg sm:text-xl leading-relaxed prose max-w-none prose-sm sm:prose-base [&_img]:max-w-[280px] [&_img]:max-h-[280px] [&_img]:w-auto [&_img]:mx-auto [&_img]:rounded-xl [&_video]:max-w-[280px] [&_video]:max-h-[280px] [&_video]:w-auto [&_video]:mx-auto [&_video]:rounded-xl"
                              style={css} dangerouslySetInnerHTML={{ __html: value }} />
                          ) : (
                            <div key={fieldId} className="text-lg sm:text-xl leading-relaxed whitespace-pre-wrap"
                              style={css}>{value}</div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* Controls */}
              <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-t border-gray-200 p-3 sm:p-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
                <div className="max-w-md mx-auto">
                  {!showAnswer ? (
                    <button
                      onClick={() => setShowAnswer(true)}
                      className="w-full max-w-[200px] mx-auto py-2 sm:py-2 bg-primary border border-primary/30 rounded-lg shadow-sm text-sm font-medium text-gray-900 hover:bg-primary/80 transition-all hover:shadow text-center flex items-center justify-center group"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Show Answer
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 animate-fade-in-up">
                      <button
                        onClick={() => handleRating(0)}
                        disabled={isSubmitting}
                        className="flex flex-col items-center justify-center py-1.5 sm:py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200 transition-colors disabled:opacity-50 group"
                      >
                        <span className="font-bold text-sm mb-0.5">Again</span>
                        <div className="flex items-center text-[10px] opacity-70">
                          <span>&lt;10m</span>
                          <span className="ml-1.5 px-1 py-px bg-red-100 group-hover:bg-red-200 rounded hidden sm:block">1</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleRating(3)}
                        disabled={isSubmitting}
                        className="flex flex-col items-center justify-center py-1.5 sm:py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg border border-orange-200 transition-colors disabled:opacity-50 group"
                      >
                        <span className="font-bold text-sm mb-0.5">Hard</span>
                        <div className="flex items-center text-[10px] opacity-70">
                          <span>{currentCard.interval > 0 ? `${Math.round(currentCard.interval * 1.2)}d` : '1.2d'}</span>
                          <span className="ml-1.5 px-1 py-px bg-orange-100 group-hover:bg-orange-200 rounded hidden sm:block">2</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleRating(4)}
                        disabled={isSubmitting}
                        className="flex flex-col items-center justify-center py-1.5 sm:py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors disabled:opacity-50 group"
                      >
                        <span className="font-bold text-sm mb-0.5">Good</span>
                        <div className="flex items-center text-[10px] opacity-70">
                          <span>{currentCard.interval > 0 ? `${Math.round(currentCard.interval * 2.5)}d` : '2.5d'}</span>
                          <span className="ml-1.5 px-1 py-px bg-blue-100 group-hover:bg-blue-200 rounded hidden sm:block">3</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleRating(5)}
                        disabled={isSubmitting}
                        className="flex flex-col items-center justify-center py-1.5 sm:py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg border border-green-200 transition-colors disabled:opacity-50 group"
                      >
                        <span className="font-bold text-sm mb-0.5">Easy</span>
                        <div className="flex items-center text-[10px] opacity-70">
                          <span>{currentCard.interval > 0 ? `${Math.round(currentCard.interval * 3.5)}d` : '4d'}</span>
                          <span className="ml-1.5 px-1 py-px bg-green-100 group-hover:bg-green-200 rounded hidden sm:block">4</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
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
