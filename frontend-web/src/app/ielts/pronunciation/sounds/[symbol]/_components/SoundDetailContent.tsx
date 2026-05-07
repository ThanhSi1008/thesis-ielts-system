import React from 'react';
import type { FoundationPronunciationSound, WordProgress } from '@/types';
import WordProgressCounter from './WordProgressCounter';
import SoundHeroSection from './SoundHeroSection';
import SoundInstructionSection from './SoundInstructionSection';
import ExampleWordCard from './ExampleWordCard';
import { useAuth } from '@/contexts/AuthContext';

interface SoundDetailContentProps {
  sound: FoundationPronunciationSound;
  wordProgress: WordProgress[];
  onPracticeComplete: (score: number) => void;
}

export default function SoundDetailContent({ sound, wordProgress, onPracticeComplete }: SoundDetailContentProps) {
  const { user } = useAuth();

  const wordProgressMap = Object.fromEntries(
    wordProgress.map(wp => [wp.word.toLowerCase(), wp])
  );

  const totalWords = sound.exampleWords?.length ?? 0;

  return (
    <div className="w-full">
      {user && totalWords > 0 && (
        <WordProgressCounter
          wordProgress={wordProgress}
          total={totalWords}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <SoundHeroSection
          symbol={sound.symbol}
          name={sound.name || 'Phoneme'}
          type={sound.type}
          audioUrl={sound.audioUrl}
          voiced={sound.voiced}
        />
        <SoundInstructionSection
          description={sound.description || 'No description available.'}
          tip={sound.tip || ''}
          imageUrl={sound.imageUrl}
        />
      </div>

      <div className="mt-12">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          Example Words
        </h3>

        {sound.exampleWords && sound.exampleWords.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {sound.exampleWords.map((ew, idx) => (
              <ExampleWordCard
                key={ew.id}
                word={ew.word}
                ipa={ew.ipa}
                audioUrl={ew.audioUrl}
                userId={user?.id}
                soundId={sound.id}
                onScoreReceived={onPracticeComplete}
                index={idx}
                tip={sound.tip}
                progress={wordProgressMap[ew.word.toLowerCase()]}
              />
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 text-slate-500 rounded-xl p-8 text-center border border-slate-200">
            No example words available for this sound yet.
          </div>
        )}
      </div>
    </div>
  );
}
