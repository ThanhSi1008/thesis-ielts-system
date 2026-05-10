'use client';
import type { VocabLabStats } from '@/types';

interface Props {
  stats: VocabLabStats;
}

const RATING_COLORS = {
  again: '#EF4444',
  hard: '#F59E0B',
  good: '#10B981',
  easy: '#3B82F6',
};

export function ReviewActivityChart({ stats }: Props) {
  const activity = stats.reviewActivity ?? [];
  const maxCount = Math.max(...activity.map(d => d.reviewCount), 1);

  const formatLabel = (dateStr: string, idx: number, total: number) => {
    // Show every ~7th label to avoid clutter
    const step = Math.max(1, Math.floor(total / 8));
    if (idx % step !== 0 && idx !== total - 1) return null;
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 className="font-bold text-gray-800 text-lg mb-1">Review Activity</h3>
      <p className="text-xs text-gray-400 mb-6">Daily reviews broken down by answer quality</p>

      {/* Legend */}
      <div className="flex gap-4 mb-4 flex-wrap">
        {[
          { label: 'Again', color: RATING_COLORS.again },
          { label: 'Hard', color: RATING_COLORS.hard },
          { label: 'Good', color: RATING_COLORS.good },
          { label: 'Easy', color: RATING_COLORS.easy },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Bars */}
      <div className="flex items-end gap-[2px] h-40 overflow-x-auto pb-6 relative">
        {activity.map((day, idx) => {
          const totalH = maxCount > 0 ? (day.reviewCount / maxCount) * 100 : 0;
          const label = formatLabel(day.date, idx, activity.length);
          return (
            <div key={day.date} className="flex flex-col items-center min-w-[10px] flex-1 relative group">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] rounded-lg px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                {day.date}: {day.reviewCount} reviews
              </div>

              {/* Stacked bar */}
              <div className="w-full flex flex-col-reverse rounded-t-sm overflow-hidden" style={{ height: `${Math.max(totalH, day.reviewCount > 0 ? 2 : 0)}%`, minHeight: day.reviewCount > 0 ? '2px' : '0' }}>
                {day.easyCount > 0 && (
                  <div style={{ height: `${(day.easyCount / day.reviewCount) * 100}%`, backgroundColor: RATING_COLORS.easy }} />
                )}
                {day.goodCount > 0 && (
                  <div style={{ height: `${(day.goodCount / day.reviewCount) * 100}%`, backgroundColor: RATING_COLORS.good }} />
                )}
                {day.hardCount > 0 && (
                  <div style={{ height: `${(day.hardCount / day.reviewCount) * 100}%`, backgroundColor: RATING_COLORS.hard }} />
                )}
                {day.againCount > 0 && (
                  <div style={{ height: `${(day.againCount / day.reviewCount) * 100}%`, backgroundColor: RATING_COLORS.again }} />
                )}
              </div>

              {/* X-axis label */}
              {label && (
                <span className="absolute -bottom-5 text-[9px] text-gray-400 whitespace-nowrap">{label}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
