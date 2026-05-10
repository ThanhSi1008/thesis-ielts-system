import React from 'react';

interface TheoryViewProps {
  htmlContent: string;
  onFinish: () => void;
}

export const TheoryView: React.FC<TheoryViewProps> = ({ htmlContent, onFinish }) => {
  return (
    <div className="animate-in fade-in duration-300">
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />

      <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-center">
        <button
          onClick={onFinish}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-3 active:scale-95"
        >
          Finish Theory & Start Exercises
          <span className="text-xl">→</span>
        </button>
      </div>
    </div>
  );
};
