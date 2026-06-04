import { Eye, EyeOff, Languages } from 'lucide-react';
import { ShadowingSentence } from '@/services/shadowing.api';

export interface ActiveSentenceDisplayProps {
  sentence: ShadowingSentence;
  spokenWords: string[];
  showTranslation: boolean;
  showPhonetic: boolean;
  onToggleTranslation: () => void;
  onTogglePhonetic: () => void;
  normalizeWord: (w: string) => string;
  fuzzyMatchWord: (spoken: string, correct: string) => boolean;
}

export default function ActiveSentenceDisplay({
  sentence,
  spokenWords,
  showTranslation,
  showPhonetic,
  onToggleTranslation,
  onTogglePhonetic,
  normalizeWord,
  fuzzyMatchWord,
}: ActiveSentenceDisplayProps) {
  return (
    <div className="p-4 bg-white dark:bg-gray-900 shrink-0 flex flex-col relative justify-center">
      <div className="flex gap-2 absolute top-4 right-4">
        {sentence.phonetic && (
          <button
            onClick={onTogglePhonetic}
            className={`p-1.5 rounded-md transition-colors ${
              showPhonetic ? 'bg-primary text-gray-900' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title="Toggle Phonetic (IPA)"
          >
            <Languages className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onToggleTranslation}
          className={`p-1.5 rounded-md transition-colors ${
            showTranslation ? 'bg-primary text-gray-900' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          title="Toggle Translation"
        >
          {showTranslation ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      </div>

      <div className="text-center w-full max-w-2xl mx-auto space-y-4">
        {showPhonetic && sentence.phonetic && (
          <div className="text-lg text-gray-500 dark:text-gray-400 font-mono tracking-wide">
            /{sentence.phonetic}/
          </div>
        )}
        
        <div className="flex flex-wrap items-center justify-center gap-2">
          {sentence.words && sentence.words.map((word, idx) => {
            let colorClass = 'text-gray-900 dark:text-gray-100';
            if (spokenWords.length > 0) {
              const typed = normalizeWord(spokenWords[idx] || '');
              const correct = normalizeWord(word);
              const spokenRaw = spokenWords[idx] || '';
              
              if (typed === correct && typed !== '') {
                colorClass = 'text-green-600 font-medium';
              } else if (spokenRaw !== '' && fuzzyMatchWord(spokenRaw, word)) {
                colorClass = 'text-amber-500 font-medium';
              } else if (idx < spokenWords.length) {
                colorClass = 'text-red-500 underline decoration-red-300';
              }
            }
            return (
              <span key={idx} className={`text-2xl leading-relaxed ${colorClass}`}>
                {word}
              </span>
            );
          })}
        </div>
        
        {showTranslation && sentence.vietnamese && (
          <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl mx-auto border-t dark:border-gray-700 pt-4 mt-4">
            {sentence.vietnamese}
          </p>
        )}
      </div>
    </div>
  );
}
