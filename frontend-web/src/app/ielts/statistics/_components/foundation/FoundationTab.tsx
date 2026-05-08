"use client";

import React, { useEffect, useState } from "react";
import { ieltsStatisticsApi } from "@/services/ielts-statistics.api";
import type { IeltsFoundationStats } from "@/types";
import FlipCard from "./FlipCard";
import { BookOpen, PenLine, Mic2, LayoutGrid } from "lucide-react";

function VocabBack({ stats }: { stats: IeltsFoundationStats }) {
  return (
    <div className="space-y-3">
      <StatRow label="Words Learned" value={`${stats.vocabulary.wordsLearned} / ${stats.vocabulary.totalWords}`} color="#10b981" />
      <StatRow label="Avg Quiz Score" value={`${stats.averageAccuracy}%`} color="#10b981" />
      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-2">
        <div className="h-full rounded-full bg-emerald-400"
          style={{ width: `${stats.vocabulary.totalWords > 0 ? (stats.vocabulary.wordsLearned / stats.vocabulary.totalWords) * 100 : 0}%` }} />
      </div>
    </div>
  );
}

function GrammarBack({ stats }: { stats: IeltsFoundationStats }) {
  return (
    <div className="space-y-3">
      <StatRow label="Units Completed" value={`${stats.grammar.completedUnits} / ${stats.grammar.totalUnits}`} color="#6366f1" />
      <StatRow label="Avg Exercise Score" value={`${stats.averageAccuracy}%`} color="#6366f1" />
      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-2">
        <div className="h-full rounded-full bg-indigo-400"
          style={{ width: `${stats.grammar.totalUnits > 0 ? (stats.grammar.completedUnits / stats.grammar.totalUnits) * 100 : 0}%` }} />
      </div>
    </div>
  );
}

function PronunciationBack({ stats }: { stats: IeltsFoundationStats }) {
  const { mastered, practicing, new: newCount } = stats.pronunciation;
  const total = mastered + practicing + newCount;
  return (
    <div className="space-y-2">
      <StatRow label="Mastered" value={`${mastered}`} color="#22c55e" />
      <StatRow label="Practicing" value={`${practicing}`} color="#f59e0b" />
      <StatRow label="New" value={`${newCount}`} color="#94a3b8" />
      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-2 flex">
        {total > 0 && <>
          <div style={{ width: `${(mastered / total) * 100}%` }} className="h-full bg-green-400" />
          <div style={{ width: `${(practicing / total) * 100}%` }} className="h-full bg-amber-400" />
        </>}
      </div>
      <div className="flex gap-3 mt-1 text-[10px] text-slate-400">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />Mastered</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Practicing</span>
      </div>
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-xs font-bold" style={{ color }}>{value}</span>
    </div>
  );
}

function FoundationSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 w-48 rounded-xl bg-slate-100 dark:bg-slate-800" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => <div key={i} className="h-72 rounded-3xl bg-slate-100 dark:bg-slate-800" />)}
      </div>
      <div className="h-20 rounded-3xl bg-slate-100 dark:bg-slate-800" />
    </div>
  );
}

export default function FoundationTab() {
  const [data, setData] = useState<IeltsFoundationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ieltsStatisticsApi.getFoundation().then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  if (loading) return <FoundationSkeleton />;
  if (!data) return <div className="text-center py-16 text-slate-400 text-sm">Could not load Foundation stats.</div>;

  const vocabPct = data.vocabulary.totalWords > 0 ? Math.round((data.vocabulary.wordsLearned / data.vocabulary.totalWords) * 100) : 0;
  const grammarPct = data.grammar.totalUnits > 0 ? Math.round((data.grammar.completedUnits / data.grammar.totalUnits) * 100) : 0;
  const { mastered, practicing, new: newCount } = data.pronunciation;
  const totalSounds = mastered + practicing + newCount;
  const pronunciationPct = totalSounds > 0 ? Math.round((mastered / totalSounds) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
            <LayoutGrid className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="font-bold text-slate-800 dark:text-white text-sm">Foundation Mastery</div>
            <div className="text-xs text-slate-400">Vocabulary · Grammar · Pronunciation</div>
          </div>
        </div>
        <span className="text-[11px] text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
          Hover a card to flip
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FlipCard color="#10b981" icon={<BookOpen size={17} />} title="Vocabulary" subtitle="IELTS Foundation Words"
          percentage={vocabPct} statLabel="Words Learned"
          statValue={`${data.vocabulary.wordsLearned} / ${data.vocabulary.totalWords}`}
          backContent={<VocabBack stats={data} />} />
        <FlipCard color="#6366f1" icon={<PenLine size={17} />} title="Grammar" subtitle="Foundation Grammar Units"
          percentage={grammarPct} statLabel="Units Completed"
          statValue={`${data.grammar.completedUnits} / ${data.grammar.totalUnits}`}
          backContent={<GrammarBack stats={data} />} />
        <FlipCard color="#f59e0b" icon={<Mic2 size={17} />} title="Pronunciation" subtitle="IPA Sound Mastery"
          percentage={pronunciationPct} statLabel="Sounds Mastered"
          statValue={`${mastered} / ${totalSounds}`}
          backContent={<PronunciationBack stats={data} />} />
      </div>

      {/* Time Balance */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
          Study Time Distribution
        </div>
        <div className="h-3 rounded-full overflow-hidden flex gap-0.5">
          <div style={{ width: `${data.timeBalance.vocab}%`, background: "linear-gradient(90deg,#10b981,#34d399)" }} className="h-full rounded-l-full" />
          <div style={{ width: `${data.timeBalance.grammar}%`, background: "linear-gradient(90deg,#6366f1,#818cf8)" }} className="h-full" />
          <div style={{ width: `${data.timeBalance.pronunciation}%`, background: "linear-gradient(90deg,#f59e0b,#fcd34d)" }} className="h-full rounded-r-full" />
        </div>
        <div className="flex gap-5 mt-4">
          {[
            { label: "Vocabulary",     pct: data.timeBalance.vocab,         color: "#10b981" },
            { label: "Grammar",        pct: data.timeBalance.grammar,        color: "#6366f1" },
            { label: "Pronunciation",  pct: data.timeBalance.pronunciation,  color: "#f59e0b" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-xs text-slate-500">{s.label}</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
