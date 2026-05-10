import { useEffect } from 'react';

interface DictationShortcutConfig {
  onCheck?: () => void;
  onNext?: () => void;
  onRepeat?: () => void;
  onToggleSpeed?: () => void;
  onCycleDifficulty?: () => void;
  onRetry?: () => void;
  canCheck: boolean;
  canGoNext: boolean;
  canRetry?: boolean;
}

export function useDictationShortcuts({
  onCheck,
  onNext,
  onRepeat,
  onToggleSpeed,
  onCycleDifficulty,
  onRetry,
  canCheck,
  canGoNext,
  canRetry,
}: DictationShortcutConfig) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        // Allow enter when typing in inputs
        if (e.key === 'Enter') {
          if (canGoNext && onNext) {
            e.preventDefault();
            onNext();
          } else if (canRetry && onRetry) {
            e.preventDefault();
            onRetry();
          } else if (canCheck && onCheck) {
            e.preventDefault();
            onCheck();
          }
        }

      // Alt shortcuts
      if (e.altKey) {
        if (e.key.toLowerCase() === 'r') {
          e.preventDefault();
          onRepeat?.();
        } else if (e.key.toLowerCase() === 's') {
          e.preventDefault();
          onToggleSpeed?.();
        } else if (e.key.toLowerCase() === 'm') {
          e.preventDefault();
          onCycleDifficulty?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCheck, onNext, onRepeat, onToggleSpeed, onCycleDifficulty, onRetry, canCheck, canGoNext, canRetry]);
}
