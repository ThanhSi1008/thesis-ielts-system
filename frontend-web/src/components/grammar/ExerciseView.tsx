import React from 'react';



export const ExerciseImageView: React.FC<{ unitOrder: number }> = ({ unitOrder }) => (
  <img
    src={`/images/grammar/intermediate/unit_${unitOrder}_exercises.png`}
    alt={`Unit ${unitOrder} Exercises`}
    className="w-full h-auto object-contain"
  />
);

export const AnswerSheetView: React.FC<{
  exercises: any[];
  answers: Record<string, string>;
  onInputChange: (id: string, value: string) => void;
  onSubmit: () => void;
  onFillDevAnswers?: () => void;
  unitOrder: number;
}> = ({ exercises, answers, onInputChange, onSubmit, onFillDevAnswers, unitOrder }) => {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm w-full min-h-full">
      <h3 className="font-bold text-xl text-blue-900 dark:text-blue-400 mb-6 flex items-center gap-2">
        Your Answers
      </h3>

      <div className="space-y-8">
        {exercises.map((ex: any, idx: number) => (
          <div key={ex.id} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
            <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 text-lg">
              <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-sm mr-2">{unitOrder}.{idx + 1}</span>
              Exercise
            </h4>

            <div className="space-y-3">
              {ex.type === 'fill_blank' && ex.items && ex.items.map((item: any, idx: number) => {
                const inputId = `${ex.id}-${idx}`;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400 w-6 text-right">{idx + 1}.</span>
                    {!item.isExample ? (
                      <input
                        type="text"
                        value={answers[inputId] || ''}
                        onChange={(e) => onInputChange(inputId, e.target.value)}
                        className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 rounded focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors"
                        placeholder="Type answer..."
                      />
                    ) : (
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-3 py-2 rounded text-sm font-medium italic">
                        {item.answer || item.value?.split(' ').slice(1).join(' ')} (Example)
                      </div>
                    )}
                  </div>
                );
              })}

              {ex.type === 'match' && ex.items && ex.items.filter((m: any) => m.label && m.label.length > 2).map((m: any, idx: number) => {
                const inputId = `${ex.id}-match-${idx}`;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400 w-6 text-right">{idx + 1}.</span>
                    {!m.isExample ? (
                      <input
                        type="text"
                        maxLength={1}
                        value={answers[inputId] || ''}
                        onChange={(e) => onInputChange(inputId, e.target.value)}
                        className="w-12 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 rounded focus:border-blue-500 dark:focus:border-blue-400 outline-none text-center uppercase font-bold transition-colors"
                        placeholder="?"
                      />
                    ) : (
                      <div className="w-12 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-3 py-2 rounded text-center text-sm font-bold italic">
                        {m.answer ? m.answer.split('.')[0] : '?'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-3">
        {onFillDevAnswers && (
          <button
            onClick={onFillDevAnswers}
            className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold py-3 rounded-lg border border-gray-200 dark:border-gray-700 transition-all text-sm"
          >
            Fill Dev Answers
          </button>
        )}
        <button
          onClick={onSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          Submit Answers
        </button>
      </div>
    </div>
  );
};
