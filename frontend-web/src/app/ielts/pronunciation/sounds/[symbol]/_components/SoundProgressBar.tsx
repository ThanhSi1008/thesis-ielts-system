import React from 'react';

interface SoundProgressBarProps {
  status: 'NEW' | 'PRACTICING' | 'MASTERED';
  practiceCount: number;
  bestScore: number | null;
}

export default function SoundProgressBar({ status, practiceCount, bestScore }: SoundProgressBarProps) {
  let barColor = 'bg-slate-200';
  let text = 'Not yet practiced';
  let progressWidth = '0%';

  if (status === 'MASTERED') {
    barColor = 'bg-green-500';
    text = `Mastered! · Best score: ${bestScore} · ${practiceCount} attempts`;
    progressWidth = `${Math.max(15, bestScore ?? 0)}%`;
  } else if (status === 'PRACTICING') {
    barColor = 'bg-orange-400';
    text = `Practicing · Best score: ${bestScore ?? 0} · ${practiceCount} attempts`;
    progressWidth = `${Math.max(10, bestScore ?? 0)}%`;
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {status === 'MASTERED' && (
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {status === 'PRACTICING' && (
            <div className="w-3 h-3 bg-orange-400 rounded-full" />
          )}
          {status === 'NEW' && (
            <div className="w-3 h-3 bg-slate-300 dark:bg-slate-700 rounded-full" />
          )}
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{text}</span>
        </div>
      </div>
      <div 
        className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={bestScore ?? 0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progress: ${text}`}
      >
        <div 
          className={`h-full ${barColor} transition-all duration-1000 ease-out`}
          style={{ width: progressWidth }}
        />
      </div>
    </div>
  );
}
