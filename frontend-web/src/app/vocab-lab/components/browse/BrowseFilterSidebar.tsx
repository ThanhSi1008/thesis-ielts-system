'use client';

import React, { useState } from 'react';
import type { DeckWithCounts, CardType } from '@/types';
import type { BrowseFilter, BrowseFilterData } from './useBrowseCards';

interface Props {
  decks: DeckWithCounts[];
  cardTypes: CardType[];
  tags: string[];
  filter: BrowseFilter;
  onFilterChange: (type: BrowseFilterData['type'], value: string) => void;
  onClearFilter: () => void;
  // Card counts per deck/state for display
  cardCountByDeck?: Record<string, number>;
  cardCountByState?: Record<string, number>;
}

const STATE_COLORS: Record<string, string> = {
  NEW: 'bg-blue-500',
  LEARNING: 'bg-red-500',
  REVIEW: 'bg-green-500',
  RELEARNING: 'bg-orange-500',
};

function SectionHeader({
  label, icon, sectionKey, collapsed, onToggle, isActive, onActivate, count,
}: {
  label: string;
  icon: React.ReactNode;
  sectionKey: string;
  collapsed: boolean;
  onToggle: () => void;
  isActive?: boolean;
  onActivate?: () => void;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <button
        onClick={onToggle}
        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-0.5 rounded flex-shrink-0"
      >
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`}
          viewBox="0 0 20 20" fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      <button
        onClick={onActivate}
        className={`flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold transition-colors flex-1 ${isActive ? 'text-amber-600 dark:text-amber-500' : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
      >
        {icon}
        <span>{label}</span>
      </button>
      {count !== undefined && (
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tabular-nums">{count}</span>
      )}
    </div>
  );
}

function FilterItem({
  label, isActive, onClick, dot, count,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  dot?: string;
  count?: number;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all flex items-center gap-2 group ${isActive ? 'bg-amber-50 dark:bg-amber-900/20 text-gray-900 dark:text-gray-100 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'}`}
      >
        {dot ? (
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
        ) : (
          <svg
            className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${isActive ? 'text-amber-500' : 'text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500'}`}
            viewBox="0 0 20 20" fill="currentColor"
          >
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
        )}
        <span className="flex-1 truncate">{label}</span>
        {count !== undefined && (
          <span className={`text-[10px] font-bold tabular-nums ${isActive ? 'text-amber-600 dark:text-amber-500' : 'text-gray-400 dark:text-gray-500'}`}>{count}</span>
        )}
      </button>
    </li>
  );
}

const STORAGE_KEY = 'browseTab_collapsed';
const readCollapsed = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'); } catch { return {}; }
};

export function BrowseFilterSidebar({ decks, cardTypes, tags, filter, onFilterChange, onClearFilter, cardCountByDeck, cardCountByState }: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() =>
    typeof window !== 'undefined' ? readCollapsed() : {}
  );

  const toggleSection = (key: string) =>
    setCollapsed(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });

  const hasActiveFilter = filter !== null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Filters</span>
        {hasActiveFilter && (
          <button
            onClick={onClearFilter}
            className="text-[11px] text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 font-semibold transition-colors flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">

        {/* ── Decks ── */}
        <div>
          <SectionHeader
            label="Decks" sectionKey="decks"
            collapsed={!!collapsed['decks']}
            onToggle={() => toggleSection('decks')}
            isActive={filter?.type === 'deck' && filter.value === '__all'}
            onActivate={() => onFilterChange('deck', '__all')}
            icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
          />
          {!collapsed['decks'] && (
            <ul className="space-y-0.5">
              {decks.map(deck => (
                <FilterItem
                  key={deck.id}
                  label={deck.name}
                  isActive={filter?.type === 'deck' && filter.value === deck.id}
                  onClick={() => onFilterChange('deck', deck.id)}
                  count={cardCountByDeck?.[deck.id]}
                />
              ))}
            </ul>
          )}
        </div>

        {/* ── Card State ── */}
        <div>
          <SectionHeader
            label="Card State" sectionKey="state"
            collapsed={!!collapsed['state']}
            onToggle={() => toggleSection('state')}
            isActive={filter?.type === 'state' && filter.value === '__all'}
            onActivate={() => onFilterChange('state', '__all')}
            icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" strokeWidth={2} /></svg>}
          />
          {!collapsed['state'] && (
            <ul className="space-y-0.5">
              {['NEW', 'LEARNING', 'REVIEW', 'RELEARNING'].map(state => (
                <FilterItem
                  key={state}
                  label={state.charAt(0) + state.slice(1).toLowerCase()}
                  isActive={filter?.type === 'state' && filter.value === state}
                  onClick={() => onFilterChange('state', state)}
                  dot={STATE_COLORS[state]}
                  count={cardCountByState?.[state]}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800" />

        {/* ── Card Types ── */}
        <div>
          <SectionHeader
            label="Card Types" sectionKey="cardTypes"
            collapsed={!!collapsed['cardTypes']}
            onToggle={() => toggleSection('cardTypes')}
            icon={<svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
          />
          {!collapsed['cardTypes'] && (
            <ul className="space-y-0.5">
              {cardTypes.map(ct => (
                <FilterItem
                  key={ct.id}
                  label={ct.name}
                  isActive={filter?.type === 'cardType' && filter.value === ct.id}
                  onClick={() => onFilterChange('cardType', ct.id)}
                />
              ))}
            </ul>
          )}
        </div>

        {/* ── Tags ── */}
        <div>
          <SectionHeader
            label="Tags" sectionKey="tags"
            collapsed={!!collapsed['tags']}
            onToggle={() => toggleSection('tags')}
            isActive={filter?.type === 'tag' && filter.value === '__tagged'}
            onActivate={() => onFilterChange('tag', '__tagged')}
            icon={<svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>}
          />
          {!collapsed['tags'] && (
            <ul className="space-y-0.5">
              <FilterItem
                label="Untagged"
                isActive={filter?.type === 'tag' && filter.value === '__untagged'}
                onClick={() => onFilterChange('tag', '__untagged')}
              />
              {tags.map(tag => (
                <FilterItem
                  key={tag}
                  label={tag}
                  isActive={filter?.type === 'tag' && filter.value === tag}
                  onClick={() => onFilterChange('tag', tag)}
                />
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}
