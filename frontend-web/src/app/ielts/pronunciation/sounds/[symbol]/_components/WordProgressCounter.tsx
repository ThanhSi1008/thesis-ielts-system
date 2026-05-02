import React from 'react';
import type { WordProgress } from '@/types';

interface WordProgressCounterProps {
  wordProgress: WordProgress[];
  total: number;
}

const STATUS_DOT: Record<WordProgress['status'], string> = {
  MASTERED: 'bg-green-500',
  PRACTICING: 'bg-amber-400',
  NEW: 'bg-slate-200 dark:bg-slate-700',
};

export default function WordProgressCounter({ wordProgress, total }: WordProgressCounterProps) {
  const masteredCount = wordProgress.filter(w => w.status === 'MASTERED').length;
  const practicingCount = wordProgress.filter(w => w.status === 'PRACTICING').length;

  const allNew = masteredCount === 0 && practicingCount === 0;

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 shadow-sm mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex items-center justify-between gap-4">
      {/* Counter */}
      <div className="flex items-center gap-2">
        {masteredCount === total && total > 0 ? (
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${allNew ? 'bg-slate-300 dark:bg-slate-700' : practicingCount > 0 ? 'bg-amber-400' : 'bg-green-500'}`} />
        )}

        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {allNew
            ? `0/${total} words practiced`
            : masteredCount === total && total > 0
              ? `All ${total} words mastered!`
              : `${masteredCount}/${total} words mastered`}
        </span>

        {practicingCount > 0 && masteredCount < total && (
          <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full font-medium">
            {practicingCount} practicing
          </span>
        )}
      </div>

      {/* Dot row — one dot per word */}
      {total > 0 && (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {wordProgress.map((wp, idx) => (
            <div
              key={idx}
              title={`${wp.word}: ${wp.status.toLowerCase()}${wp.bestScore != null ? ` (best: ${wp.bestScore})` : ''}`}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${STATUS_DOT[wp.status]}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
