import { CheckCircle2, ChevronRight } from 'lucide-react';

export interface ShadowingActionBarProps {
  onMarkDone: () => void;
  onNext: () => void;
  hasNext: boolean;
  isFinished: boolean;
}

export default function ShadowingActionBar({
  onMarkDone,
  onNext,
  hasNext,
  isFinished,
}: ShadowingActionBarProps) {
  return (
    <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0 flex items-center justify-between">
      {!isFinished ? (
        <button
          onClick={onMarkDone}
          className="flex-1 max-w-sm mx-auto flex items-center justify-center gap-2 px-6 py-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl font-medium border-2 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 hover:border-green-300 transition-all"
        >
          <CheckCircle2 className="w-5 h-5" />
          Mark as Done
        </button>
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
