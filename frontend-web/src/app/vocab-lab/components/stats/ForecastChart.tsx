'use client';
import type { VocabLabStats } from '@/types';

interface Props {
  stats: VocabLabStats;
}

export function ForecastChart({ stats }: Props) {
  const forecast = stats.forecast ?? [];
  if (forecast.length === 0) return null;

  const maxDue = Math.max(...forecast.map(f => f.dueCount), 1);
  const maxCum = Math.max(...forecast.map(f => f.cumulativeCount), 1);
  const W = 600;
  const H = 140;
  const PAD = { t: 10, r: 10, b: 24, l: 36 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const n = forecast.length;

  // Bar positions
  const barW = chartW / n - 1;

  // Area path for cumulative
  const pts = forecast.map((f, i) => {
    const x = PAD.l + (i / (n - 1)) * chartW;
    const y = PAD.t + chartH - (f.cumulativeCount / maxCum) * chartH;
    return `${x},${y}`;
  });
  const areaPath = `M${PAD.l},${PAD.t + chartH} L${pts.join(' L')} L${PAD.l + chartW},${PAD.t + chartH} Z`;
  const linePath = `M${pts.join(' L')}`;

  // X-axis labels every 7 days
  const xLabels = forecast.filter((_, i) => i % 7 === 0 || i === forecast.length - 1);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 className="font-bold text-gray-800 text-lg mb-1">Due Forecast</h3>
      <p className="text-xs text-gray-400 mb-4">Cards due each day over the next 30 days</p>

      <div className="flex gap-4 mb-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-blue-200" />
          <span className="text-xs text-gray-500">Due per day</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 rounded-sm bg-[#FFC600]" />
          <span className="text-xs text-gray-500">Cumulative</span>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 300 }}>
          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(frac => {
            const y = PAD.t + chartH * (1 - frac);
            const val = Math.round(maxDue * frac);
            return (
              <g key={frac}>
                <line x1={PAD.l} y1={y} x2={PAD.l + chartW} y2={y} stroke="#f3f4f6" strokeWidth={1} />
                <text x={PAD.l - 4} y={y + 3} textAnchor="end" fontSize={9} fill="#9ca3af">{val}</text>
              </g>
            );
          })}

          {/* Bars (due per day) */}
          {forecast.map((f, i) => {
            const barH = (f.dueCount / maxDue) * chartH;
            const x = PAD.l + i * (barW + 1);
            return (
              <rect
                key={f.date}
                x={x} y={PAD.t + chartH - barH}
                width={barW} height={barH}
                fill="#BFDBFE"
                rx={1}
              />
            );
          })}

          {/* Area fill (cumulative) */}
          <path d={areaPath} fill="rgba(255,198,0,0.15)" />
          <path d={linePath} fill="none" stroke="#FFC600" strokeWidth={2} strokeLinejoin="round" />

          {/* X-axis labels */}
          {xLabels.map(f => {
            const i = forecast.indexOf(f);
            const x = PAD.l + (i / (n - 1)) * chartW;
            const d = new Date(f.date);
            return (
              <text key={f.date} x={x} y={H - 4} textAnchor="middle" fontSize={9} fill="#9ca3af">
                {`${d.getMonth() + 1}/${d.getDate()}`}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
