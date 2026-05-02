'use client';
import type { VocabLabStats } from '@/types';

interface Props {
  stats: VocabLabStats;
}

const HOUR_LABELS = ['12a', '', '', '3a', '', '', '6a', '', '', '9a', '', '', '12p', '', '', '3p', '', '', '6p', '', '', '9p', '', ''];

export function HourlyActivityChart({ stats }: Props) {
  const hourly = stats.hourlyActivity ?? [];
  const maxCount = Math.max(...hourly.map(h => h.count), 1);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 className="font-bold text-gray-800 text-lg mb-1">Study Hours</h3>
      <p className="text-xs text-gray-400 mb-6">When do you usually study? (all-time)</p>

      <div className="flex items-end gap-1 h-28">
        {hourly.map((h) => {
          const pct = maxCount > 0 ? (h.count / maxCount) * 100 : 0;
          return (
            <div key={h.hour} className="flex-1 flex flex-col items-center gap-1 group relative">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] rounded-md px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                {h.hour}:00 — {h.count}
              </div>
              <div
                className="w-full rounded-t-sm transition-all"
                style={{
                  height: `${Math.max(pct, h.count > 0 ? 4 : 0)}%`,
                  backgroundColor: h.count > 0 ? '#FFC600' : '#f3f4f6',
                  minHeight: h.count > 0 ? '3px' : '1px',
                }}
              />
              <span className="text-[8px] text-gray-400">{HOUR_LABELS[h.hour]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
