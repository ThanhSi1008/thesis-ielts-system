'use client';
import type { VocabLabStats } from '@/types';

interface Props {
  stats: VocabLabStats;
}

function DonutChart({ segments, total, centerLabel }: {
  segments: { value: number; color: string; label: string }[];
  total: number;
  centerLabel: string;
}) {
  const size = 160;
  const r = 60;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const arcs = segments.map(seg => {
    const frac = total > 0 ? seg.value / total : 0;
    const dash = frac * circumference;
    const arc = { ...seg, dash, offset };
    offset += dash;
    return arc;
  });

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={22} />
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth={22}
            strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
            strokeDashoffset={-arc.offset}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-bold text-gray-800">{total}</div>
        <div className="text-xs text-gray-400">{centerLabel}</div>
      </div>
    </div>
  );
}

export function CardCountsPie({ stats }: Props) {
  const counts = stats.cardCounts ?? {
    newCount: stats.newCount, learningCount: stats.learningCount,
    reviewCount: stats.reviewCount, relearningCount: 0, totalCount: stats.totalCount,
  };
  const segments = [
    { value: counts.newCount, color: '#3B82F6', label: 'New' },
    { value: counts.learningCount, color: '#EF4444', label: 'Learning' },
    { value: counts.reviewCount, color: '#10B981', label: 'Review' },
  ];
  const total = counts.totalCount;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col items-center">
      <h3 className="font-bold text-gray-800 text-lg mb-1 self-start">Card States</h3>
      <p className="text-xs text-gray-400 mb-6 self-start">Distribution by learning stage</p>
      {total === 0 ? (
        <div className="text-gray-400 text-sm py-8">No cards yet</div>
      ) : (
        <>
          <DonutChart segments={segments} total={total} centerLabel="cards" />
          <div className="w-full mt-6 space-y-3">
            {segments.map(seg => (
              <div key={seg.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
                  <span className="text-sm text-gray-600">{seg.label}</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-sm font-bold text-gray-800 w-6 text-right">{seg.value}</span>
                  <span className="text-xs text-gray-400 w-12 text-right">
                    {total > 0 ? ((seg.value / total) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function MaturityDonut({ stats }: Props) {
  const maturity = stats.maturityDistribution ?? { young: 0, mature: 0, suspended: 0 };
  const total = maturity.young + maturity.mature + maturity.suspended;
  const segments = [
    { value: maturity.young, color: '#F59E0B', label: 'Young (<21d)' },
    { value: maturity.mature, color: '#10B981', label: 'Mature (≥21d)' },
    { value: maturity.suspended, color: '#9CA3AF', label: 'Struggling (>8 lapses)' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col items-center">
      <h3 className="font-bold text-gray-800 text-lg mb-1 self-start">Card Maturity</h3>
      <p className="text-xs text-gray-400 mb-6 self-start">How well-learned are your review cards?</p>
      {total === 0 ? (
        <div className="text-gray-400 text-sm py-8">No review cards yet</div>
      ) : (
        <>
          <DonutChart segments={segments} total={total} centerLabel="review" />
          <div className="w-full mt-6 space-y-3">
            {segments.map(seg => (
              <div key={seg.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
                  <span className="text-sm text-gray-600">{seg.label}</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-sm font-bold text-gray-800 w-6 text-right">{seg.value}</span>
                  <span className="text-xs text-gray-400 w-12 text-right">
                    {total > 0 ? ((seg.value / total) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
