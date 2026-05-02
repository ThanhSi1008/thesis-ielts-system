import React, { useState } from 'react';
import { PronunciationRecorder } from '@/components/pronunciation/PronunciationRecorder';
import type { WordProgress, PronunciationResult } from '@/types';

interface ExampleWordCardProps {
  word: string;
  ipa?: string;
  audioUrl?: string;
  userId?: string;
  soundId: string;
  onScoreReceived: (score: number) => void;
  index: number;
  tip?: string;
  progress?: WordProgress;
}

const STATUS_BADGE: Record<WordProgress['status'], { className: string; icon: React.ReactNode; label: string }> = {
  MASTERED: {
    className: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    icon: (
      <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
    label: 'Mastered',
  },
  PRACTICING: {
    className: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    icon: <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />,
    label: 'Practicing',
  },
  NEW: {
    className: 'text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800',
    icon: null,
    label: 'Not practiced',
  },
};

export default function ExampleWordCard({
  word, ipa, audioUrl, userId, soundId, onScoreReceived, index, tip, progress,
}: ExampleWordCardProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = () => {
    if (!audioUrl) return;
    setIsPlaying(true);
    const audio = new Audio(audioUrl);
    audio.onended = () => setIsPlaying(false);
    audio.play().catch(() => setIsPlaying(false));
  };

  const handleResult = (result: PronunciationResult) => {
    onScoreReceived(result.score);
    // Auto-close recorder on mastery
    if (result.score >= 80) {
      setTimeout(() => setIsRecording(false), 4000);
    }
  };

  const badge = progress ? STATUS_BADGE[progress.status] : null;
  const cardBorderClass = progress?.status === 'MASTERED'
    ? 'border-green-200 dark:border-green-800'
    : progress?.status === 'PRACTICING'
      ? 'border-amber-200 dark:border-amber-800'
      : 'border-slate-200 dark:border-slate-800';

  return (
    <div
      className={`bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both transition-all ${cardBorderClass}`}
      style={{ animationDelay: `${200 + index * 50}ms` }}
    >
      {/* Header row: word + ipa + progress badge + controls */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col min-w-0">
          <span className="text-xl font-extrabold text-slate-900 dark:text-white truncate">{word}</span>
          <span className="text-sm font-mono text-slate-500 dark:text-slate-400 tracking-wider">{ipa}</span>
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          {/* Progress badge */}
          {badge && progress && (
            <div className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.className}`}>
              {badge.icon}
              {progress.bestScore != null
                ? <span>{progress.bestScore}</span>
                : <span>{badge.label}</span>}
            </div>
          )}

          {/* Audio + record buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={playAudio}
              disabled={!audioUrl}
              aria-label={`Play audio for ${word}`}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors
                ${audioUrl ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'}
                ${isPlaying ? 'animate-pulse' : ''}
              `}
            >
              <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>

            {userId ? (
              <button
                onClick={() => setIsRecording(r => !r)}
                aria-label={`Record pronunciation for ${word}`}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors
                  ${isRecording ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40'}
                `}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            ) : (
              <div className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md hidden md:block">Log in to practice</div>
            )}
          </div>
        </div>
      </div>

      {/* Recorder panel */}
      {isRecording && userId && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-300">
          <PronunciationRecorder
            targetWord={word}
            userId={userId}
            onSuccess={handleResult}
          />
        </div>
      )}
    </div>
  );
}
