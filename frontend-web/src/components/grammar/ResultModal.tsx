import React from 'react';

interface ResultModalProps {
  result: { correct: number; total: number; errors: any[] };
  onClose: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({ result, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-xl shadow-2xl max-w-4xl w-full animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        <h3 className="text-2xl font-bold mb-4 text-center">Exercise Results</h3>
        <div className="text-center mb-8">
          <div className={`text-6xl font-bold mb-2 ${result.correct === result.total ? 'text-success' : 'text-primary'}`}>
            {result.correct}/{result.total}
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {result.correct === result.total
              ? "Perfect! You've mastered this unit."
              : `You got ${result.correct} correct. Keep practicing to reach 100%!`}
          </p>
        </div>

        {result.errors.length > 0 && (
          <div className="mb-6 flex-1 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 flex flex-col min-h-0">
            <div className="bg-gray-100 dark:bg-gray-800 px-6 py-3 border-b border-gray-200 dark:border-gray-800 font-bold text-gray-800 dark:text-gray-200 shrink-0">Review Your Answers</div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800 overflow-y-auto custom-scrollbar flex-1">
              {result.errors.map((err, idx) => (
                <div key={idx} className={`p-6 transition-colors ${err.isCorrect ? 'bg-green-50/30 dark:bg-green-900/10' : 'bg-red-50/30 dark:bg-red-900/10'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {err.isCorrect ? (
                      <span className="text-green-600 font-bold">✅ Ex {err.questionId}</span>
                    ) : (
                      <span className="text-red-600 font-bold">❌ Ex {err.questionId}</span>
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">- {err.label}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-6 mt-3 pl-6">
                    <div className="flex-1 bg-white dark:bg-gray-900 p-3 rounded border border-gray-100 dark:border-gray-800 shadow-sm">
                      <span className="text-xs font-bold uppercase text-gray-400 block mb-1">Your Answer</span>
                      <span className={err.isCorrect ? "text-green-700 dark:text-green-500 font-medium" : "text-red-600 dark:text-red-500 line-through font-medium"}>{err.userAnswer}</span>
                    </div>
                    <div className="flex-1 bg-white dark:bg-gray-900 p-3 rounded border border-gray-100 dark:border-gray-800 shadow-sm">
                      <span className="text-xs font-bold uppercase text-gray-400 block mb-1">Correct Answer</span>
                      <span className="text-green-600 font-bold">{err.correctAnswer}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full bg-[#FFC600] text-black font-bold py-4 rounded-xl hover:opacity-90 transition-all text-lg shadow-md shrink-0 mt-2"
        >
          {result.correct === result.total ? "Awesome!" : "Try Again"}
        </button>
      </div>
    </div>
  );
};
