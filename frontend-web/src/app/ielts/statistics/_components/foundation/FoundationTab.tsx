"use client";

import React, { useEffect, useState } from "react";
import { ieltsStatisticsApi } from "@/services/ielts-statistics.api";
import type { IeltsFoundationStats } from "@/types";
import FlipCard from "./FlipCard";
import { BookOpen, PenLine, Mic2, LayoutGrid } from "lucide-react";
import { BAND_TONE_STYLES, STAT_PALETTE_SEQUENCE } from "../../_utils/band-tone";

function VocabBack({ stats }: { stats: IeltsFoundationStats }) {
  const tone = BAND_TONE_STYLES.success;
  return (
    <div className="space-y-3">
      <StatRow label="Words Learned" value={`${stats.vocabulary.wordsLearned} / ${stats.vocabulary.totalWords}`} color={tone.hex} />
      <StatRow label="Avg Quiz Score" value={`${stats.averageAccuracy}%`} color={tone.hex} />
      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-2">
        <div className={`h-full rounded-full ${tone.bg}`}
          style={{ width: `${stats.vocabulary.totalWords > 0 ? (stats.vocabulary.wordsLearned / stats.vocabulary.totalWords) * 100 : 0}%` }} />
      </div>
    </div>
  );
}

function GrammarBack({ stats }: { stats: IeltsFoundationStats }) {
  const tone = BAND_TONE_STYLES.info;
  return (
    <div className="space-y-3">
      <StatRow label="Units Completed" value={`${stats.grammar.completedUnits} / ${stats.grammar.totalUnits}`} color={tone.hex} />
      <StatRow label="Avg Exercise Score" value={`${stats.averageAccuracy}%`} color={tone.hex} />
      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-2">
        <div className={`h-full rounded-full ${tone.bg}`}
          style={{ width: `${stats.grammar.totalUnits > 0 ? (stats.grammar.completedUnits / stats.grammar.totalUnits) * 100 : 0}%` }} />
      </div>
    </div>
  );
}

function PronunciationBack({ stats }: { stats: IeltsFoundationStats }) {
  const masteredTone = BAND_TONE_STYLES.warning;
  const practicingTone = BAND_TONE_STYLES.primary;
  const newTone = BAND_TONE_STYLES.danger;
  const { mastered, practicing, new: newCount } = stats.pronunciation;
  const total = mastered + practicing + newCount;
  return (
    <div className="space-y-2">
      <StatRow label="Mastered" value={`${mastered}`} color={masteredTone.hex} />
      <StatRow label="Practicing" value={`${practicing}`} color={practicingTone.hex} />
      <StatRow label="New" value={`${newCount}`} color={newTone.hex} />
      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-2 flex">
        {total > 0 && <>
          <div style={{ width: `${(mastered / total) * 100}%` }} className={`h-full ${masteredTone.bg}`} />
          <div style={{ width: `${(practicing / total) * 100}%` }} className={`h-full ${practicingTone.bg}`} />
          <div style={{ width: `${(newCount / total) * 100}%` }} className={`h-full ${newTone.bg}`} />
        </>}
      </div>
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <span className="text-xs font-bold" style={{ color }}>{value}</span>
    </div>
  );
}

function FoundationSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded-xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <div key={i} className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800" />)}
      </div>
      <div className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800" />
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
  if (!data) return <div className="text-center py-16 text-slate-500 text-sm">Could not load Foundation stats.</div>;

  const vocabPct = data.vocabulary.totalWords > 0 ? Math.round((data.vocabulary.wordsLearned / data.vocabulary.totalWords) * 100) : 0;
  const grammarPct = data.grammar.totalUnits > 0 ? Math.round((data.grammar.completedUnits / data.grammar.totalUnits) * 100) : 0;
  const { mastered, practicing, new: newCount } = data.pronunciation;
  const totalSounds = mastered + practicing + newCount;
  const pronunciationPct = totalSounds > 0 ? Math.round((mastered / totalSounds) * 100) : 0;
  const foundationTone = BAND_TONE_STYLES.success;
  const vocabTone = BAND_TONE_STYLES.success;
  const grammarTone = BAND_TONE_STYLES.info;
  const pronunciationTone = BAND_TONE_STYLES.warning;
  const distTones = STAT_PALETTE_SEQUENCE.map((tone) => BAND_TONE_STYLES[tone]);

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${foundationTone.softBg} flex items-center justify-center`}>
            <LayoutGrid className={`w-5 h-5 ${foundationTone.text}`} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Foundation Mastery</h3>
            <p className="text-xs text-slate-500">Vocabulary · Grammar · Pronunciation</p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          Hover cards to flip
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FlipCard color={vocabTone.hex} icon={<BookOpen size={18} className={vocabTone.text} />} title="Vocabulary" subtitle="IELTS Foundation Words"
          percentage={vocabPct} statLabel="Words Learned"
          statValue={`${data.vocabulary.wordsLearned} / ${data.vocabulary.totalWords}`}
          backContent={<VocabBack stats={data} />} />
        <FlipCard color={grammarTone.hex} icon={<PenLine size={18} className={grammarTone.text} />} title="Grammar" subtitle="Foundation Grammar Units"
          percentage={grammarPct} statLabel="Units Completed"
          statValue={`${data.grammar.completedUnits} / ${data.grammar.totalUnits}`}
          backContent={<GrammarBack stats={data} />} />
        <FlipCard color={pronunciationTone.hex} icon={<Mic2 size={18} className={pronunciationTone.text} />} title="Pronunciation" subtitle="IPA Sound Mastery"
          percentage={pronunciationPct} statLabel="Sounds Mastered"
          statValue={`${mastered} / ${totalSounds}`}
          backContent={<PronunciationBack stats={data} />} />
      </div>

      {/* Time Balance */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 overflow-hidden">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
          Study Time Distribution
        </div>
        <div className="h-3 rounded-full overflow-hidden flex gap-1 bg-slate-100 dark:bg-slate-800 p-0.5">
          <div style={{ width: `${data.timeBalance.vocab}%` }} className={`h-full rounded-full ${distTones[1].bg}`} />
          <div style={{ width: `${data.timeBalance.grammar}%` }} className={`h-full rounded-full ${distTones[2].bg}`} />
          <div style={{ width: `${data.timeBalance.pronunciation}%` }} className={`h-full rounded-full ${distTones[3].bg}`} />
        </div>
        <div className="flex gap-6 mt-4">
          {[
            { label: "Vocabulary", pct: data.timeBalance.vocab, color: distTones[1].hex },
            { label: "Grammar", pct: data.timeBalance.grammar, color: distTones[2].hex },
            { label: "Pronunciation", pct: data.timeBalance.pronunciation, color: distTones[3].hex },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{s.label}</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
