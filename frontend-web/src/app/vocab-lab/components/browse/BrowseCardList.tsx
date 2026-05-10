'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Flashcard } from '@/types';

interface Props {
  cards: Flashcard[];
  selectedCardId: string | null;
  loading: boolean;
  onSelectCard: (card: Flashcard) => void;
  getSortFieldValue: (card: Flashcard) => string;
  onKeyboardNav?: (e: React.KeyboardEvent) => void;
}

const STATE_DOT: Record<string, string> = {
  NEW: 'bg-blue-500',
  LEARNING: 'bg-red-500',
  REVIEW: 'bg-green-500',
  RELEARNING: 'bg-orange-500',
};

const STATE_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  NEW: { bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30', text: 'text-blue-600 dark:text-blue-400', label: 'New' },
  LEARNING: { bg: 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30', text: 'text-red-600 dark:text-red-400', label: 'Learning' },
  REVIEW: { bg: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30', text: 'text-green-600 dark:text-green-400', label: 'Review' },
  RELEARNING: { bg: 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900/30', text: 'text-orange-600 dark:text-orange-400', label: 'Relearning' },
};

export function BrowseCardList({ cards, selectedCardId, loading, onSelectCard, getSortFieldValue, onKeyboardNav }: Props) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'created' | 'due' | 'alpha' | 'state'>('created');
  const [sortAsc, setSortAsc] = useState(true);

  // Client-side search filter
  const filtered = cards.filter(card => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const primary = getSortFieldValue(card).toLowerCase();
    const tagMatch = card.tags?.some(t => t.toLowerCase().includes(q));
    return primary.includes(q) || tagMatch;
  });

  // Client-side sort
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'alpha') {
      cmp = getSortFieldValue(a).localeCompare(getSortFieldValue(b));
    } else if (sortBy === 'due') {
      cmp = new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime();
    } else if (sortBy === 'state') {
      const order: Record<string, number> = { NEW: 0, LEARNING: 1, RELEARNING: 2, REVIEW: 3 };
      cmp = (order[a.cardState] ?? 0) - (order[b.cardState] ?? 0);
    } else {
      // created — use array order (already sorted by createdAt from API)
      cmp = 0;
    }
    return sortAsc ? cmp : -cmp;
  });

  // Scroll selected card into view
  useEffect(() => {
    if (selectedCardId) {
      const el = document.getElementById(`card-row-${selectedCardId}`);
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedCardId]);

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortAsc(prev => !prev);
    else { setSortBy(col); setSortAsc(true); }
  };

  const SortIcon = ({ col }: { col: typeof sortBy }) => (
    <svg
      className={`w-3 h-3 ml-1 transition-colors ${sortBy === col ? 'text-amber-500' : 'text-gray-300 dark:text-gray-600'}`}
      viewBox="0 0 20 20" fill="currentColor"
    >
      {sortBy === col && !sortAsc
        ? <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
        : <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      }
    </svg>
  );

  return (
    <div className="flex flex-col h-full min-w-0">
      {/* ── Search bar ── */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search cards..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 focus:border-amber-300 dark:focus:border-amber-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Table header with sort ── */}
      {!loading && sorted.length > 0 && (
        <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 flex items-center">
          <button
            onClick={() => toggleSort('alpha')}
            className="flex items-center text-[10px] uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 flex-1 transition-colors"
          >
            Field <SortIcon col="alpha" />
          </button>
          <button
            onClick={() => toggleSort('state')}
            className="flex items-center text-[10px] uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 w-24 transition-colors"
          >
            State <SortIcon col="state" />
          </button>
          <button
            onClick={() => toggleSort('due')}
            className="flex items-center text-[10px] uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 w-20 transition-colors"
          >
            Due <SortIcon col="due" />
          </button>
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tabular-nums">
            {filtered.length}
          </span>
        </div>
      )}

      {/* ── Card list ── */}
      <div
        className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300"
        onKeyDown={onKeyboardNav}
        tabIndex={0}
      >
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-amber-500" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 gap-2">
            <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{search ? 'No cards match your search' : 'No cards found'}</p>
            {search && (
              <button onClick={() => setSearch('')} className="text-xs text-amber-600 dark:text-amber-500 hover:underline">Clear search</button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {sorted.map(card => {
              const isSelected = selectedCardId === card.id;
              const badge = STATE_BADGE[card.cardState] ?? STATE_BADGE['NEW'];
              const primaryVal = getSortFieldValue(card);
              const isNew = card.cardState === 'NEW';
              const dueDate = !isNew ? new Date(card.nextReviewDate) : null;
              const isOverdue = dueDate && dueDate < new Date();

              return (
                <li key={card.id} id={`card-row-${card.id}`}>
                  <button
                    onClick={() => onSelectCard(card)}
                    className={`relative w-full text-left px-4 py-3 flex items-center gap-3 transition-all duration-150 group ${isSelected ? 'bg-amber-50/60 dark:bg-amber-900/10' : 'hover:bg-gray-50/80 dark:hover:bg-gray-800/50'}`}
                  >
                    {/* Selected accent bar */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#FFC600] rounded-r-full" />
                    )}

                    {/* State dot */}
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATE_DOT[card.cardState] ?? 'bg-gray-300 dark:bg-gray-600'}`} />

                    {/* Primary field */}
                    <span className={`flex-1 text-[13px] truncate ${isSelected ? 'font-semibold text-gray-900 dark:text-gray-100' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                      {primaryVal || <span className="text-gray-300 dark:text-gray-600 italic">Empty card</span>}
                    </span>

                    {/* State badge */}
                    <span className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text} w-20 justify-center`}>
                      {badge.label}
                    </span>

                    {/* Due date */}
                    <span className={`w-16 text-right text-[11px] tabular-nums ${isNew ? 'text-blue-500 font-semibold' : isOverdue ? 'text-red-500 font-semibold' : 'text-gray-400 dark:text-gray-500'}`}>
                      {isNew ? 'New' : dueDate?.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
