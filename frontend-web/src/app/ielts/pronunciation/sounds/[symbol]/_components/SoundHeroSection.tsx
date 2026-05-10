import React, { useState } from 'react';

interface SoundHeroSectionProps {
  symbol: string;
  name: string;
  type: string;
  audioUrl?: string;
  voiced?: boolean;
}

export default function SoundHeroSection({ symbol, name, type, audioUrl, voiced }: SoundHeroSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = () => {
    if (!audioUrl) return;
    setIsPlaying(true);
    const audio = new Audio(audioUrl);
    audio.onended = () => setIsPlaying(false);
    audio.play().catch(e => {
      console.error("Audio playback failed", e);
      setIsPlaying(false);
    });
  };

  let typeColor = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
  if (type === 'monophthong') typeColor = 'bg-[#FACC15] text-black bg-opacity-30';
  else if (type === 'diphthong') typeColor = 'bg-[#EF4444] text-white';

  const typeLabel = type === 'consonant' 
    ? `${voiced ? 'Voiced' : 'Voiceless'} Consonant`
    : type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-4">
        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${typeColor}`}>
          {typeLabel}
        </span>
      </div>
      
      <h1 className="text-6xl md:text-8xl font-extrabold text-slate-900 dark:text-white mb-2">{symbol}</h1>
      <h2 className="text-lg md:text-xl font-medium text-slate-500 dark:text-slate-400 mb-8">{name}</h2>

      <button
        onClick={playAudio}
        disabled={!audioUrl}
        aria-label={`Play sound ${symbol}`}
        className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all shadow-md
          ${audioUrl ? 'bg-primary hover:bg-primary/90 hover:scale-105' : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'}
          ${isPlaying ? 'ring-4 ring-primary/30 animate-pulse' : ''}
        `}
      >
        <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>
    </div>
  );
}
