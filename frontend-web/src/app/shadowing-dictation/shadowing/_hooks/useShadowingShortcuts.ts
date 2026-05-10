import { useEffect } from 'react';

interface ShadowingShortcutConfig {
  onNext?: () => void;
  onRepeat?: () => void;
  onToggleSpeed?: () => void;
  canGoNext: boolean;
}

export function useShadowingShortcuts({
  onNext,
  onRepeat,
  onToggleSpeed,
  canGoNext,
}: ShadowingShortcutConfig) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (canGoNext && onNext) {
          onNext();
        }
      }

      if (e.altKey) {
        if (e.key.toLowerCase() === 'r') {
          e.preventDefault();
          onRepeat?.();
        } else if (e.key.toLowerCase() === 's') {
          e.preventDefault();
          onToggleSpeed?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onRepeat, onToggleSpeed, canGoNext]);
}
