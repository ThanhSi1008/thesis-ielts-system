import { PlayCircle, CheckCircle2 } from 'lucide-react';

import { DictationSentence } from '@/services/dictation.api';

export interface DictationSentenceRowProps {
  index: number;
  sentence: DictationSentence;
  isCompleted: boolean;
  isCurrent: boolean;
  onPlay: () => void;
}

export default function DictationSentenceRow({
  index,
  sentence,
  isCompleted,
  isCurrent,
  onPlay,
}: DictationSentenceRowProps) {
  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-300 ${
        isCurrent
          ? 'bg-primary/5 border-primary/30 shadow-sm ring-1 ring-primary'
          : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-sm'
      }`}
    >
      <div className="flex gap-4">
        <button
          onClick={onPlay}
          className={`shrink-0 mt-1 transition-colors ${
            isCurrent
              ? 'text-primary hover:opacity-80'
              : 'text-gray-400 dark:text-gray-600 hover:text-primary'
          }`}
        >
          <PlayCircle className="w-6 h-6" />
        </button>

        <div className="flex-1">
          <div className="flex gap-2">
            <p className={`text-lg font-medium leading-relaxed ${
              isCurrent ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
            }`}>
              {sentence.english}
            </p>
            {isCompleted && !isCurrent && (
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-1.5 opacity-60" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
