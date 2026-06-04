import { CheckCircle2, ChevronRight } from 'lucide-react';

export interface ShadowingActionBarProps {
  onMarkDone: () => void;
  onNext: () => void;
  hasNext: boolean;
  isFinished: boolean;
  disabled?: boolean;
  allowSkip?: boolean;
}

export default function ShadowingActionBar({
  onMarkDone,
  onNext,
  hasNext,
  isFinished,
  disabled,
  allowSkip,
}: ShadowingActionBarProps) {
  return (
    <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0 flex items-center justify-between">
      {!isFinished ? (
        allowSkip ? (
          <button
            onClick={onMarkDone}
            className="flex-1 max-w-sm mx-auto flex items-center justify-center gap-2 px-6 py-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl font-medium border-2 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all shadow-sm"
          >
            Skip (Speech unrecognised)
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
        <button
          onClick={onMarkDone}
          disabled={disabled}
          className={`flex-1 max-w-sm mx-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium border-2 transition-all ${
            disabled 
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-60'
              : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 hover:border-green-300'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          Mark as Done
        </button>
        )
      ) : (
        <button
          onClick={onNext}
          className="flex-1 max-w-sm mx-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-gray-900 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-sm"
        >
          Next Sentence
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
