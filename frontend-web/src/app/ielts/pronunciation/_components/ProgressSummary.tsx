"use client";
import React from 'react';
import type { PronunciationStats } from '@/types';

interface ProgressSummaryProps {
  stats: PronunciationStats;
}

export default function ProgressSummary({ stats }: ProgressSummaryProps) {
  const { totalSounds, masteredCount, practicingCount, newCount, overallMastery } = stats;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Header / Mastery Ring */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              {/* Background Circle */}
              <path
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              {/* Progress Circle */}
              <path
                className={`${overallMastery >= 75 ? 'text-green-500' : overallMastery >= 25 ? 'text-orange-400' : 'text-blue-500'}`}
                strokeDasharray={`${overallMastery}, 100`}
                strokeLinecap="round"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-bold text-slate-900 dark:text-white">{overallMastery}%</span>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>🔊</span> IPA Mastery
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Track your pronunciation progress</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:flex gap-4 md:gap-8 pb-2 md:pb-0 w-full md:w-auto">
          <div className="flex flex-col bg-slate-50 dark:bg-slate-800/50 md:bg-transparent md:dark:bg-transparent p-3 md:p-0 rounded-lg md:rounded-none">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalSounds}</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Sounds</span>
          </div>
          <div className="flex flex-col bg-slate-50 dark:bg-slate-800/50 md:bg-transparent md:dark:bg-transparent p-3 md:p-0 rounded-lg md:rounded-none">
            <span className="text-2xl font-extrabold text-green-500">{masteredCount}</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Mastered</span>
          </div>
          <div className="flex flex-col bg-slate-50 dark:bg-slate-800/50 md:bg-transparent md:dark:bg-transparent p-3 md:p-0 rounded-lg md:rounded-none">
            <span className="text-2xl font-extrabold text-orange-400">{practicingCount}</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Practicing</span>
          </div>
          <div className="flex flex-col bg-slate-50 dark:bg-slate-800/50 md:bg-transparent md:dark:bg-transparent p-3 md:p-0 rounded-lg md:rounded-none">
            <span className="text-2xl font-extrabold text-slate-400 dark:text-slate-500">{newCount}</span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">New</span>
          </div>
        </div>

      </div>

      {/* Progress Bar Segmented */}
      <div className="mt-6 flex h-2 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <div 
          className="bg-green-500 transition-all duration-1000 ease-out" 
          style={{ width: `${(masteredCount / totalSounds) * 100}%` }}
        />
        <div 
          className="bg-orange-400 transition-all duration-1000 ease-out" 
          style={{ width: `${(practicingCount / totalSounds) * 100}%` }}
        />
      </div>
    </div>
  );
}
