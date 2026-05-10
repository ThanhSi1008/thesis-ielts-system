import { useState, useMemo, useEffect } from 'react';
import { DictationSentence } from '@/services/dictation.api';
import { normalizeWord } from '../_constants';

export function useDictation(currentSentence: DictationSentence | undefined, difficulty: string) {
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [isChecked, setIsChecked] = useState(false);
  const [isAllCorrect, setIsAllCorrect] = useState(false);

  // Reset when sentence changes
  useEffect(() => {
    if (currentSentence?.words) {
      setUserInputs(new Array(currentSentence.words.length).fill(''));
    } else {
      setUserInputs([]);
    }
    setIsChecked(false);
    setIsAllCorrect(false);
  }, [currentSentence?.id]); // Only reset on new sentence ID

  const handleInputChange = (index: number, value: string) => {
    if (isChecked) return;
    const newInputs = [...userInputs];
    newInputs[index] = value;
    setUserInputs(newInputs);
  };

  const hiddenIndices = useMemo(() => {
    if (!currentSentence?.words) return new Set<number>();
    
    const words = currentSentence.words;
    let ratio = 0.5;
    if (difficulty === 'Beginner') ratio = 0.3;
    if (difficulty === 'Advanced') ratio = 0.7;
    if (difficulty === 'Expert') ratio = 1.0;

    const numToHide = Math.max(1, Math.floor(words.length * ratio));
    const indices = Array.from({ length: words.length }, (_, i) => i);
    // basic shuffle to hide random words
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return new Set(indices.slice(0, numToHide));
  }, [currentSentence?.id, difficulty]); // Depend on ID, not object ref

  const checkAnswers = () => {
    if (!currentSentence?.words) return false;
    let allCorrect = true;
    currentSentence.words.forEach((word, idx) => {
      if (hiddenIndices.has(idx)) {
        if (normalizeWord(userInputs[idx]) !== normalizeWord(word)) {
          allCorrect = false;
        }
      }
    });
    setIsChecked(true);
    setIsAllCorrect(allCorrect);
    return allCorrect;
  };

  const retry = () => {
    setIsChecked(false);
    setIsAllCorrect(false);
    // Option 1: clear wrong inputs. Option 2: keep them. We'll keep them so they can fix them.
  };

  return {
    userInputs,
    handleInputChange,
    hiddenIndices,
    isChecked,
    isAllCorrect,
    checkAnswers,
    retry,
  };
}
