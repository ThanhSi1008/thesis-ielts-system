import React, { useRef, useEffect } from 'react';
import { DictationSentence } from '@/services/dictation.api';

export interface DictationInputRowProps {
  sentence: DictationSentence;
  userInputs: string[];
  onInputChange: (index: number, value: string) => void;
  hiddenIndices: Set<number>;
  isChecked: boolean;
  normalizeWord: (w: string) => string;
}

export default function DictationInputRow({
  sentence,
  userInputs,
  onInputChange,
  hiddenIndices,
  isChecked,
  normalizeWord,
}: DictationInputRowProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus the first empty input when the sentence changes or resets
    const firstEmptyIndex = userInputs.findIndex(
      (val, idx) => hiddenIndices.has(idx) && val === ''
    );
    if (!isChecked && firstEmptyIndex >= 0) {
      inputsRef.current[firstEmptyIndex]?.focus();
    }
  }, [sentence.id, isChecked]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (isChecked) return;
    
    // Allow spaces if the correct word has punctuation, or jump to next
    if (e.key === ' ' || e.key === 'Enter') {
      const correctWord = sentence.words?.[index] || '';
      const currentInput = userInputs[index] || '';
      
      // If user typed space, and it matches the word's internal space (rare in dictation, but possible)
      if (e.key === ' ' && correctWord.includes(' ') && currentInput.length < correctWord.length) {
        return;
      }
      
      e.preventDefault();
      
      // Find the next hidden index
      const nextIndex = Array.from(hiddenIndices)
        .sort((a, b) => a - b)
        .find(i => i > index);
        
      if (nextIndex !== undefined) {
        inputsRef.current[nextIndex]?.focus();
      }
    } else if (e.key === 'Backspace' && userInputs[index] === '') {
      e.preventDefault();
      // Find previous hidden index
      const prevIndex = Array.from(hiddenIndices)
        .sort((a, b) => b - a)
        .find(i => i < index);
        
      if (prevIndex !== undefined) {
        inputsRef.current[prevIndex]?.focus();
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl flex flex-wrap gap-x-2 gap-y-4 items-center justify-center">
        {sentence.words?.map((word, idx) => {
          const isHidden = hiddenIndices.has(idx);
          const rawCorrect = word;
          const normCorrect = normalizeWord(word);
          const userInput = userInputs[idx] || '';
          const isMatch = normalizeWord(userInput) === normCorrect;

          if (!isHidden) {
            return (
              <span key={idx} className="text-2xl leading-relaxed text-gray-900 dark:text-gray-100 px-1 py-1">
                {rawCorrect}
              </span>
            );
          }

          let stateClass = 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-primary focus:border-primary';
          if (isChecked) {
            stateClass = isMatch
              ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400 font-medium'
              : 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-600 dark:text-red-400 line-through decoration-red-400/50';
          }

          return (
            <div key={idx} className="relative flex flex-col items-center">
              <input
                ref={(el) => { inputsRef.current[idx] = el; }}
                type="text"
                value={userInput}
                onChange={(e) => onInputChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                disabled={isChecked}
                className={`text-2xl text-center font-medium rounded-lg px-2 py-1 outline-none transition-all w-full
                  border-b-2 shadow-sm placeholder-gray-200
                  ${stateClass}
                `}
                style={{
                  width: `calc(${Math.max(rawCorrect.length, userInput.length, 2)}ch + 24px)`,
                  minWidth: '60px',
                }}
                placeholder="_"
                autoComplete="off"
                spellCheck="false"
              />
              {isChecked && !isMatch && (
                <div className="absolute top-full mt-1 px-2 py-0.5 bg-gray-900 text-white text-sm rounded shadow-sm whitespace-nowrap z-10 animate-fade-in">
                  {rawCorrect}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
