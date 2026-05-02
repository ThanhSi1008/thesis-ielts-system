"use client";
import React from 'react';
import Link from 'next/link';
import type { PronunciationData, SoundProgress } from '@/types';

interface IpaChartProps {
  sounds: PronunciationData;
  progress?: SoundProgress[];
  basePath: string;
}

interface SoundTileProps {
  symbol: string;
  word: string;
  type: 'monophthong' | 'diphthong' | 'consonant';
  voiced?: boolean;
  mastery: 'NEW' | 'PRACTICING' | 'MASTERED';
  href: string;
  practiceCount: number;
}

const SoundTile: React.FC<SoundTileProps> = ({ symbol, word, type, voiced, mastery, href, practiceCount }) => {
  let baseColor = '';
  if (type === 'monophthong') baseColor = 'bg-[#FACC15] hover:bg-[#EAB308] text-black';
  else if (type === 'diphthong') baseColor = 'bg-[#EF4444] hover:bg-[#DC2626] text-white';
  else if (type === 'consonant') {
    if (voiced) {
      baseColor = 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 text-gray-800 dark:text-gray-200';
    } else {
      baseColor = 'bg-gray-100 dark:bg-gray-900 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  }

  let masteryBorder = '';
  if (mastery === 'MASTERED') {
    masteryBorder = 'ring-2 ring-green-400 ring-offset-2';
  }

  return (
    <Link 
      href={href} 
      className="flex h-full w-full"
      role="link"
      aria-label={`Sound ${symbol}, example word ${word}, mastery status: ${mastery.toLowerCase()}`}
    >
      <div className={`relative w-full aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all shadow-sm hover:shadow-md hover:-translate-y-1 ${baseColor} ${masteryBorder}`}>
        <span className="font-bold text-xl md:text-2xl mb-0.5 md:mb-1">{symbol}</span>
        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wide opacity-80 dark:opacity-70">{word}</span>
        
        {mastery === 'MASTERED' && (
          <div className="absolute top-1 right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
            <svg className="w-2 h-2 md:w-2.5 md:h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {mastery === 'PRACTICING' && (
          <div className="absolute top-1 right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-orange-400 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-[7px] md:text-[8px] font-bold text-white">{practiceCount}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default function IpaChart({ sounds, progress, basePath }: IpaChartProps) {
  const soundHref = (symbol: string) => `${basePath}/sounds/${encodeURIComponent(symbol)}`;

  const getMastery = (symbol: string) => {
    if (!progress) return { status: 'NEW' as const, practiceCount: 0 };
    const p = progress.find(p => p.symbol === symbol);
    return {
      status: p?.status ?? 'NEW',
      practiceCount: p?.practiceCount ?? 0,
    };
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-12 gap-2 md:gap-4">
        {/* VOWELS LABEL */}
        <div className="col-start-1 flex justify-center items-center pt-8">
          <h2 className="text-xs md:text-xl font-bold uppercase -rotate-90 origin-center translate-y-2 text-gray-400 dark:text-gray-500 tracking-widest whitespace-nowrap h-max">Vowels</h2>
        </div>

        {/* VOWELS CONTENT */}
        <div className="col-start-2 col-span-11 md:col-span-10 grid grid-cols-8 gap-2 md:gap-4">
          <div className="col-span-4 text-center font-bold text-xs md:text-lg text-gray-600 dark:text-gray-400 mb-1 md:mb-2">Monophthongs</div>
          <div className="col-span-4 text-center font-bold text-xs md:text-lg text-gray-600 dark:text-gray-400 mb-1 md:mb-2">Diphthongs</div>

          {/* Monophthongs */}
          <div className="col-span-4 grid grid-cols-4 gap-1.5 md:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
            {sounds.monophthongs.map((item) => {
              const { status, practiceCount } = getMastery(item.symbol);
              return (
                <SoundTile
                  key={item.symbol}
                  symbol={item.symbol}
                  word={item.word}
                  type="monophthong"
                  mastery={status}
                  practiceCount={practiceCount}
                  href={soundHref(item.symbol)}
                />
              );
            })}
          </div>

          {/* Diphthongs */}
          <div className="col-span-4 grid grid-cols-4 gap-1.5 md:gap-4 content-start self-start animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
            {sounds.diphthongs.map((item) => {
              const { status, practiceCount } = getMastery(item.symbol);
              return (
                <SoundTile
                  key={item.symbol}
                  symbol={item.symbol}
                  word={item.word}
                  type="diphthong"
                  mastery={status}
                  practiceCount={practiceCount}
                  href={soundHref(item.symbol)}
                />
              );
            })}
          </div>
        </div>

        {/* CONSONANTS LABEL */}
        <div className="col-start-1 flex justify-center items-center">
          <h2 className="text-xs md:text-xl font-bold uppercase -rotate-90 origin-center translate-y-6 text-gray-400 dark:text-gray-500 tracking-widest whitespace-nowrap h-max">Consonants</h2>
        </div>

        {/* CONSONANTS CONTENT */}
        <div className="col-start-2 col-span-11 md:col-span-10 grid grid-cols-6 md:grid-cols-8 gap-1.5 md:gap-4 mt-2 md:mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
          {sounds.consonants.map((item) => {
            const { status, practiceCount } = getMastery(item.symbol);
            return (
              <SoundTile
                key={item.symbol}
                symbol={item.symbol}
                word={item.word}
                type="consonant"
                voiced={item.voiced}
                mastery={status}
                practiceCount={practiceCount}
                href={soundHref(item.symbol)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
