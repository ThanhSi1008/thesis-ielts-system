import { useCallback, useEffect, useMemo, useState } from 'react';
import { MAX_HINT_LEVEL } from '../_constants';

interface UseDictationHintsOptions {
  words: string[] | undefined;
  hiddenIndices: Set<number>;
  sentenceId: string | undefined;
  onAutoFill: (index: number, value: string) => void;
  isChecked: boolean;
}

interface UseDictationHintsReturn {
  hintLevels: Map<number, number>;
  requestHint: (wordIndex: number) => void;
  requestHintForFocused: () => void;
  totalHintsUsed: number;
  getHintLevel: (wordIndex: number) => number;
}

export function useDictationHints({
  words,
  hiddenIndices,
  sentenceId,
  onAutoFill,
  isChecked,
}: UseDictationHintsOptions): UseDictationHintsReturn {
  const [hintLevels, setHintLevels] = useState<Map<number, number>>(new Map());

  useEffect(() => {
    setHintLevels(new Map());
  }, [sentenceId]);

  const requestHint = useCallback((wordIndex: number) => {
    if (isChecked || !hiddenIndices.has(wordIndex) || !words?.[wordIndex]) return;

    setHintLevels((prev) => {
      const currentLevel = prev.get(wordIndex) ?? 0;
      if (currentLevel >= MAX_HINT_LEVEL) return prev;

      const nextLevel = currentLevel + 1;
      const next = new Map(prev);
      next.set(wordIndex, nextLevel);

      if (nextLevel >= MAX_HINT_LEVEL) {
        onAutoFill(wordIndex, words[wordIndex]);
      }

      return next;
    });
  }, [isChecked, hiddenIndices, words, onAutoFill]);

  const requestHintForFocused = useCallback(() => {
    const activeEl = document.activeElement as HTMLInputElement | null;
    if (!activeEl || activeEl.tagName !== 'INPUT') return;

    const indexStr = activeEl.getAttribute('data-word-index');
    if (indexStr === null) return;

    const wordIndex = parseInt(indexStr, 10);
    if (!Number.isNaN(wordIndex)) requestHint(wordIndex);
  }, [requestHint]);

  const totalHintsUsed = useMemo(
    () => Array.from(hintLevels.values()).reduce((sum, level) => sum + level, 0),
    [hintLevels]
  );

  const getHintLevel = useCallback((wordIndex: number): number => hintLevels.get(wordIndex) ?? 0, [hintLevels]);

  return { hintLevels, requestHint, requestHintForFocused, totalHintsUsed, getHintLevel };
}
