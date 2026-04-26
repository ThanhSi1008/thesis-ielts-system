'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { vocabLabApi } from '@/services/vocabLab.api';
import type { StudyCard } from '@/types';


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

import { useIeltsSidebar } from '@/contexts/IeltsSidebarContext';
import Link from 'next/link';

type Tab = 'decks' | 'add' | 'browse' | 'stats';

const NAV_ITEMS = [
  { 
    id: 'decks', 
    label: 'Decks',
    shortLabel: 'Decks',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
        <polyline points="2 12 12 17 22 12"></polyline>
        <polyline points="2 17 12 22 22 17"></polyline>
      </svg>
    )
  },
  { 
    id: 'add', 
    label: 'Add',
    shortLabel: 'Add',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
    )
  },
  { 
    id: 'browse', 
    label: 'Browse',
    shortLabel: 'Browse',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    )
  },
  { 
    id: 'stats', 
    label: 'Stats',
    shortLabel: 'Stats',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
    )
  },
];

export default function StudyPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.deckId as string;

  const { mode, isOverlayOpen, closeOverlay } = useIeltsSidebar();

  const [cards, setCards] = useState<StudyCard[]>([]);
  const [deck, setDeck] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // Notify the Header badge to refresh
      window.dispatchEvent(new CustomEvent('vocabduechanged'));

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
          case '1': e.preventDefault(); handleRating(1); break;
          case '2': e.preventDefault(); handleRating(2); break;
          case '3': e.preventDefault(); handleRating(3); break;
          case '4': e.preventDefault(); handleRating(4); break;
          case 'Space':
          case 'Enter':
            e.preventDefault();
            handleRating(3); // Default to Good
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAnswer, currentCard, isComplete, isSubmitting]);

  const isMini = mode === 'mini';
  const width = isMini ? 'w-[72px]' : 'w-[240px]';

  const renderNavItems = (isOverlay = false) => (
    <nav className={`flex flex-col ${isMini && !isOverlay ? 'gap-1 items-center w-full' : 'gap-1'}`}>
      {NAV_ITEMS.map((tab) => {
        const isActive = tab.id === 'decks'; // Decks is active by default in study mode
        if (isMini && !isOverlay) {
          return (
            <button
              key={tab.id}
              onClick={() => {
                router.push('/vocab-lab');
                if (isOverlay) closeOverlay();
              }}
              title={tab.label}
              className={`group relative flex flex-col items-center justify-center w-full py-3 rounded-xl transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              }`}
            >
              {tab.icon}
              <span className="text-[10px] mt-1 font-semibold leading-none truncate max-w-[56px]">
                {tab.shortLabel}
              </span>
              <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-[70]">
                {tab.label}
              </div>
            </button>
          );
        }
        
        return (
          <button
            key={tab.id}
            onClick={() => {
              router.push('/vocab-lab');
              if (isOverlay) closeOverlay();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] transition-colors text-left ${
              isActive
                ? "font-semibold bg-primary/10 text-primary"
                : "font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="h-[calc(100vh-56px)] bg-white font-sans overflow-hidden flex">
      {/* Overlay Drawer */}
      <div
        className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300 md:hidden ${
          isOverlayOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeOverlay}
      />
      <aside
        className={`fixed top-0 left-0 h-full w-[240px] bg-white z-[65] transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          isOverlayOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-[56px] shrink-0 flex items-center px-4 border-b border-gray-100">
          <button
            onClick={closeOverlay}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Link href="/" className="ml-3" onClick={closeOverlay}>
            <img
              src="https://res.cloudinary.com/dalaaegob/image/upload/v1772802715/9a1c3431-a5ce-4470-949b-8318ff2f3911.png"
              alt="Lexon Logo"
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>
        <div className="overflow-y-auto p-3 flex-1">
          {renderNavItems(true)}
        </div>
      </aside>

      {/* Overlay Drawer and Inline Sidebar are hidden on study pages, 
          handled by IeltsSidebarContext. */}

      {/* Main Content */}
      <main className="flex-1 min-w-0 h-full flex flex-col transition-all duration-300 ease-in-out overflow-y-auto relative bg-white pb-32 sm:pb-40">
        


        <div className="max-w-6xl mx-auto px-4 py-2 sm:px-6 lg:px-8 w-full flex flex-col flex-1">
          {/* Progress bar */}
          {!loading && !isComplete && !isNoCards && (
            <div className="h-1.5 w-full bg-gray-200 rounded-full mb-6 overflow-hidden shrink-0">
              <div
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{ width: `${(currentIndex / cards.length) * 100}%` }}
              ></div>
            </div>
          )}

          <div className="w-full mx-auto relative flex justify-center flex-1">
            {loading ? (
              <div className="min-h-[50vh] flex flex-col items-center justify-center w-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500 font-medium">Loading your flashcards...</p>
              </div>
            ) : isNoCards ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center max-w-md w-full self-center mt-12">
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
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center max-w-md w-full self-center mt-12">
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
              <div className="w-full flex flex-col mb-auto">
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
                        // Audio field: render as audio player
                        if (field?.fieldType === 'media' && value && !/<[a-z]/i.test(value)) {
                          return (
                            <div key={fieldId} className="flex justify-center w-full">
                              <audio controls src={value} className="w-full max-w-xs" />
                            </div>
                          );
                        }
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
                            // Audio field: render as audio player
                            if (field?.fieldType === 'media' && value && !/<[a-z]/i.test(value)) {
                              return (
                                <div key={fieldId} className="flex justify-center w-full">
                                  <audio controls src={value} className="w-full max-w-xs" />
                                </div>
                              );
                            }
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
                <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-t border-gray-200 p-3 sm:p-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] transition-all duration-300">
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
                          onClick={() => handleRating(1)}
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
                          onClick={() => handleRating(2)}
                          disabled={isSubmitting}
                          className="flex flex-col items-center justify-center py-1.5 sm:py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg border border-orange-200 transition-colors disabled:opacity-50 group"
                        >
                          <span className="font-bold text-sm mb-0.5">Hard</span>
                          <div className="flex items-center text-[10px] opacity-70">
                            <span>{currentCard.scheduledDays > 0 ? `${Math.max(1, Math.round(currentCard.scheduledDays * 1.2))}d` : '1d'}</span>
                            <span className="ml-1.5 px-1 py-px bg-orange-100 group-hover:bg-orange-200 rounded hidden sm:block">2</span>
                          </div>
                        </button>

                        <button
                          onClick={() => handleRating(3)}
                          disabled={isSubmitting}
                          className="flex flex-col items-center justify-center py-1.5 sm:py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors disabled:opacity-50 group"
                        >
                          <span className="font-bold text-sm mb-0.5">Good</span>
                          <div className="flex items-center text-[10px] opacity-70">
                            <span>{currentCard.scheduledDays > 0 ? `${Math.max(2, Math.round(currentCard.scheduledDays * 2.5))}d` : '3d'}</span>
                            <span className="ml-1.5 px-1 py-px bg-blue-100 group-hover:bg-blue-200 rounded hidden sm:block">3</span>
                          </div>
                        </button>

                        <button
                          onClick={() => handleRating(4)}
                          disabled={isSubmitting}
                          className="flex flex-col items-center justify-center py-1.5 sm:py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg border border-green-200 transition-colors disabled:opacity-50 group"
                        >
                          <span className="font-bold text-sm mb-0.5">Easy</span>
                          <div className="flex items-center text-[10px] opacity-70">
                            <span>{currentCard.scheduledDays > 0 ? `${Math.max(3, Math.round(currentCard.scheduledDays * 3.5))}d` : '5d'}</span>
                            <span className="ml-1.5 px-1 py-px bg-green-100 group-hover:bg-green-200 rounded hidden sm:block">4</span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      </main>

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
