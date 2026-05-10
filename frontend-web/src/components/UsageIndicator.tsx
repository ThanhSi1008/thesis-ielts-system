"use client";

interface UsageIndicatorProps {
  label: string;
  used: number;
  limit: number; // -1 = unlimited
}

export default function UsageIndicator({ label, used, limit }: UsageIndicatorProps) {
  if (limit === -1) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span>{label}:</span>
        <span className="text-green-500 font-medium">Unlimited</span>
      </div>
    );
  }

  const percent = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const isNearLimit = percent >= 80;
  const isAtLimit = percent >= 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500 dark:text-gray-400">{label}</span>
        <span
          className={`font-medium ${isAtLimit ? "text-red-500" : isNearLimit ? "text-amber-500" : "text-gray-600 dark:text-gray-300"}`}
        >
          {used}/{limit}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isAtLimit ? "bg-red-500" : isNearLimit ? "bg-amber-400" : "bg-primary"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
