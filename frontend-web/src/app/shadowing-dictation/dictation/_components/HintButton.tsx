import { Lightbulb } from 'lucide-react';
import { MAX_HINT_LEVEL } from '../_constants';

export interface HintButtonProps {
  hintLevel: number;
  onRequestHint: () => void;
  disabled: boolean;
}

export default function HintButton({ hintLevel, onRequestHint, disabled }: HintButtonProps) {
  const isMaxed = hintLevel >= MAX_HINT_LEVEL;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onRequestHint();
      }}
      disabled={disabled || isMaxed}
      className={`mt-1 p-1 rounded-md text-xs flex items-center gap-0.5 transition-all duration-200 ${
        isMaxed
          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
          : hintLevel > 0
            ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'
            : 'text-gray-400 dark:text-gray-500 hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-gray-800'
      } disabled:opacity-40 disabled:cursor-not-allowed`}
      title={isMaxed ? 'Word revealed' : `Hint (${hintLevel}/${MAX_HINT_LEVEL})`}
    >
      <Lightbulb className="w-3.5 h-3.5" />
      {hintLevel > 0 && !isMaxed && <span className="font-medium">{hintLevel}</span>}
    </button>
  );
}
