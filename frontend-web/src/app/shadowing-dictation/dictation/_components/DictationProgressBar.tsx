export interface DictationProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export default function DictationProgressBar({ current, total, label = "Dictation" }: DictationProgressBarProps) {
  const progressPercent = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 z-10 shrink-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label} Progress
        </span>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {current} / {total}
        </span>
      </div>
      <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
