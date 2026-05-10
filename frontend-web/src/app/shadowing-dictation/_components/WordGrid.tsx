export interface WordGridProps {
  words: string[];
  wordStatuses: ('revealed' | 'correct' | 'incorrect' | 'pending')[];
  onRevealWord: (index: number) => void;
  showAllWords: boolean;
}

export default function WordGrid({
  words,
  wordStatuses,
  onRevealWord,
  showAllWords,
}: WordGridProps) {
  return (
    <div className="flex flex-wrap gap-2 p-4 bg-white border-b shrink min-h-[100px] max-h-[35vh] overflow-y-auto items-center justify-center">
      {words.map((word, i) => {
        const status = wordStatuses[i];
        const isRevealed = status === 'revealed' || showAllWords;
        const isCorrect = status === 'correct';
        const isIncorrect = status === 'incorrect';

        let className =
          'px-2 py-1 text-base rounded-md font-mono transition-all duration-200 min-w-[2rem] text-center border-b-2 cursor-pointer ';

        if (isCorrect) {
          className += 'text-green-600 border-green-500 bg-green-50 font-medium scale-110 shadow-sm';
        } else if (isIncorrect) {
          className += 'text-red-500 border-red-400 bg-red-50';
        } else if (isRevealed) {
          className += 'text-gray-600 border-gray-300 bg-gray-50';
        } else {
          className += 'text-transparent border-gray-300 bg-gray-100 hover:bg-gray-200';
        }

        return (
          <span
            key={i}
            className={className}
            onClick={() => {
              if (!isCorrect && !isRevealed) {
                onRevealWord(i);
              }
            }}
            title={(!isCorrect && !isRevealed) ? "Click to reveal word" : ""}
          >
            {isRevealed || isCorrect
              ? word
              : word.replace(/./g, '*')}
          </span>
        );
      })}
    </div>
  );
}
