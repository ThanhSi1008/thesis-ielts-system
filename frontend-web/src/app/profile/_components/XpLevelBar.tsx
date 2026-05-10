import { Star } from "lucide-react";

interface XpLevelBarProps {
  level: number;
  currentLevelXp: number;
  xpNeeded: number;
  totalXp: number;
}

export default function XpLevelBar({ level, currentLevelXp, xpNeeded, totalXp }: XpLevelBarProps) {
  const percentage = Math.min((currentLevelXp / xpNeeded) * 100, 100);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm mb-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <span className="bg-primary/10 text-primary font-bold rounded-full px-4 py-1.5 text-lg flex items-center gap-2">
            <Star className="w-5 h-5 fill-primary" /> Level {level}
          </span>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {currentLevelXp} / {xpNeeded} XP
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Total: {totalXp} XP
          </div>
        </div>
      </div>
      <div className="w-full h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
        <div 
          className="h-full bg-gradient-to-r from-primary to-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
