'use client';
import type { VocabLabStats } from '@/types';
import { Layers, CheckCircle2, Flame, Brain } from 'lucide-react';

interface Props {
  stats: VocabLabStats;
}

export function SummaryCards({ stats }: Props) {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayActivity = stats.reviewActivity?.find(a => a.date === todayStr);
  const reviewsToday = todayActivity?.reviewCount ?? 0;

  const cards = [
    {
      label: 'Total Cards',
      value: stats.cardCounts?.totalCount ?? stats.totalCount,
      icon: <Layers className="w-7 h-7 text-blue-500" />,
      color: 'bg-blue-50 border-blue-100',
      valueColor: 'text-blue-700',
    },
    {
      label: 'Reviews Today',
      value: reviewsToday,
      icon: <CheckCircle2 className="w-7 h-7 text-amber-500" />,
      color: 'bg-amber-50 border-amber-100',
      valueColor: 'text-amber-700',
    },
    {
      label: 'Current Streak',
      value: `${stats.streakData?.currentStreak ?? 0}d`,
      icon: <Flame className="w-7 h-7 text-orange-500" />,
      color: 'bg-orange-50 border-orange-100',
      valueColor: 'text-orange-700',
    },
    {
      label: 'Retention Rate',
      value: `${stats.averages?.retentionRatePercent ?? 0}%`,
      icon: <Brain className="w-7 h-7 text-green-500" />,
      color: 'bg-green-50 border-green-100',
      valueColor: 'text-green-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className={`rounded-2xl border p-5 ${card.color}`}>
          <div className="text-2xl mb-2">{card.icon}</div>
          <div className={`text-2xl font-bold ${card.valueColor}`}>{card.value}</div>
          <div className="text-sm text-gray-500 mt-1 font-medium">{card.label}</div>
        </div>
      ))}
    </div>
  );
}
