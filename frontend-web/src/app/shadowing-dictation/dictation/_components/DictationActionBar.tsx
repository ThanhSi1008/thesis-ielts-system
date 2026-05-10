import { CheckCircle2, ChevronRight } from 'lucide-react';

export interface DictationActionBarProps {
  onCheck: () => void;
  onNext: () => void;
  canCheck: boolean;
  isChecked: boolean;
  isAllCorrect: boolean;
  hasNext: boolean;
  isFinished: boolean;
  onRetry: () => void;
}

export default function DictationActionBar({
  onCheck,
  onNext,
  canCheck,
  isChecked,
  isAllCorrect,
  hasNext,
  isFinished,
  onRetry,
}: DictationActionBarProps) {
  return (
    <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0 flex items-center justify-between">
      {!isChecked && !isFinished ? (
        <button
          onClick={onCheck}
          disabled={!canCheck}
          className="flex-1 max-w-sm mx-auto flex items-center justify-center gap-2 px-6 py-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl font-medium border-2 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 hover:border-green-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle2 className="w-5 h-5" />
          Check Answer
        </button>
      ) : isChecked && !isAllCorrect ? (
        <button
          onClick={onRetry}
          className="flex-1 max-w-sm mx-auto flex items-center justify-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-medium border-2 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 hover:border-red-300 transition-all shadow-sm"
        >
          Try Again
        </button>
      ) : (
        <button
          onClick={onNext}
          className="flex-1 max-w-sm mx-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-gray-900 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-sm"
        >
          {hasNext ? 'Next Sentence' : 'Finish'}
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
