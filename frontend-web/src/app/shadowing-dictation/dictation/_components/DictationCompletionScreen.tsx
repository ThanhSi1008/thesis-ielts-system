import { CheckCircle2, RotateCcw } from 'lucide-react';

import { DictationVideo } from '@/services/dictation.api';

export interface DictationCompletionScreenProps {
  lesson: DictationVideo;
  onRestart?: () => void;
  onBack: () => void;
}

export default function DictationCompletionScreen({
  lesson,
  onRestart,
  onBack,
}: DictationCompletionScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-white dark:from-gray-900 to-gray-50 dark:to-slate-950">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-500" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
        Congratulations!
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
        You've completed all {lesson.sentences.length} sentences of{' '}
        <span className="font-medium text-gray-900 dark:text-gray-100">"{lesson.title}"</span> in{' '}
        Dictation mode.
      </p>
      
      {onRestart && (
        <button
          onClick={onRestart}
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-primary hover:text-primary font-semibold transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Practice Again
        </button>
      )}

      <button
        onClick={onBack}
        className="mt-4 flex items-center gap-2 px-6 py-3 text-primary font-semibold hover:underline transition-all"
      >
        Back to Library
      </button>
    </div>
  );
}
