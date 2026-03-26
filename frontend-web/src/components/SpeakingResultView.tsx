"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Mic, Headphones } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────

interface CriterionFeedback {
  band: number;
  strengths: string[];
  weak_areas: string[];
  how_to_improve: string[];
  mistakes?: Mistake[];
}

interface Mistake {
  original: string;
  correction: string;
  explanation: string;
}

export interface SpeakingFeedback {
  overall_band: number;
  criteria: {
    fluency_and_coherence: CriterionFeedback;
    lexical_resource: CriterionFeedback;
    grammatical_range_and_accuracy: CriterionFeedback;
    pronunciation: CriterionFeedback;
  };
}

interface SpeakingResultViewProps {
  feedback: SpeakingFeedback;
  answers?: Record<string, any>;
  exam?: any;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const CRITERIA_LABELS: Record<string, string> = {
  fluency_and_coherence: "Fluency & Coherence",
  lexical_resource: "Lexical Resource",
  grammatical_range_and_accuracy: "Grammatical Range & Accuracy",
  pronunciation: "Pronunciation",
};

function SmallScoreBadge({ band, isOverall = false }: { band: number; isOverall?: boolean }) {
  const bgClass =
    band > 7.5
      ? "bg-emerald-50 text-emerald-700"
      : band > 6.0
        ? "bg-blue-50 text-blue-700"
        : band > 4.5
          ? "bg-amber-50 text-amber-700"
          : "bg-rose-50 text-rose-700";

  const gradientClass =
    band > 7.5
      ? "from-emerald-500 to-teal-500 shadow-emerald-500/25"
      : band > 6.0
        ? "from-blue-500 to-indigo-500 shadow-blue-500/25"
        : band > 4.5
          ? "from-amber-500 to-orange-500 shadow-amber-500/25"
          : "from-rose-500 to-red-500 shadow-rose-500/25";

  if (isOverall) {
    return (
      <span className={`inline-flex items-center justify-center w-12 h-8 rounded-lg font-black text-white text-base bg-gradient-to-br shadow-md ${gradientClass}`}>
        {band.toFixed(1)}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center justify-center w-10 h-7 rounded-md font-bold text-sm ${bgClass}`}>
      {band.toFixed(1)}
    </span>
  );
}

function CriterionCard({
  criterionKey,
  data,
}: {
  criterionKey: string;
  data: CriterionFeedback;
}) {
  const label = CRITERIA_LABELS[criterionKey] || criterionKey;

  return (
    <div className="px-4 p-4 rounded-md border border-primary/50">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h4 className="text-[17px] font-extrabold text-dark">{label}</h4>
        <SmallScoreBadge band={data?.band || 0} />
      </div>

      {/* Strengths */}
      {data?.strengths?.length > 0 && (
        <div className="mb-3">
          <p className="text-[13px] font-bold uppercase tracking-wide mb-1.5 text-success">
            Strengths
          </p>
          <ul className="space-y-1">
            {data.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-gray-700">
                <span className="mt-0.5 flex-shrink-0">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weak Areas */}
      {data?.weak_areas?.length > 0 && (
        <div className="mb-3">
          <p className="text-[13px] font-bold uppercase tracking-wide mb-1.5 text-danger">
            Weak Areas
          </p>
          <ul className="space-y-1">
            {data.weak_areas.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-gray-700">
                <span className="mt-0.5 flex-shrink-0">⚠</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* How to Improve */}
      {data?.how_to_improve?.length > 0 && (
        <div>
          <p className="text-[13px] font-bold uppercase tracking-wide mb-1.5 text-info">
            How to Improve
          </p>
          <ul className="space-y-1">
            {data.how_to_improve.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-gray-700">
                <span className="mt-0.5 font-bold flex-shrink-0">
                  {i + 1}.
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mistakes Table */}
      {data?.mistakes && data.mistakes.length > 0 && (
        <div className="pt-4">
          <p className="text-[13px] font-bold uppercase tracking-wide mb-2 text-danger">
            Annotated Mistakes
          </p>
          <div className="rounded-lg border border-gray-150 overflow-hidden bg-white/60 shadow-sm">
            <table className="w-full text-[13px] text-left">
              <thead>
                <tr className="bg-gray-100/60 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="px-3 py-2 border-r border-gray-150 w-2/5">Original</th>
                  <th className="px-3 py-2">Correction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/50">
                {data.mistakes.map((m, i) => (
                  <tr key={i} className="bg-transparent hover:bg-white/80 transition-colors">
                    <td className="px-3 py-2 border-r border-gray-150 line-through font-medium align-top">{m.original}</td>
                    <td className="px-3 py-2 align-top">
                      <div className="font-bold mb-1">{m.correction}</div>
                      <div className="text-gray-500 leading-relaxed mt-1 opacity-90">{m.explanation}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SpeakingResultView({ feedback, answers, exam }: SpeakingResultViewProps) {
  const [detailedOpen, setDetailedOpen] = useState(true);
  const [reviewOpen, setReviewOpen] = useState(true);
  const [activeCriterion, setActiveCriterion] = useState<string | null>("fluency_and_coherence");

  const CRITERIA_KEYS = [
    "fluency_and_coherence",
    "lexical_resource",
    "grammatical_range_and_accuracy",
    "pronunciation",
  ] as const;

  const DetailedResult = (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <button onClick={() => setDetailedOpen(!detailedOpen)} className="w-full flex items-center gap-2 px-6 py-5 text-left transition-colors">
        {detailedOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        <span className="font-extrabold text-gray-900">Detailed Breakdown</span>
      </button>
      {detailedOpen && (
        <div className="px-8 pb-8 pt-2 flex justify-center bg-white">
          <div className="flex flex-col rounded-lg w-full max-w-2xl border border-gray-100 p-8 shadow-sm">
            <h3 className="font-extrabold text-gray-900 text-center tracking-tight mb-2">Speaking Performance</h3>
            <div className="flex justify-center mb-6">
              <img src="https://demo2.pavothemes.com/gopet/wp-content/uploads/2021/11/h3_divider.png" alt="" className="h-[3px]" />
            </div>
            <div className="flex flex-col gap-4">
              {CRITERIA_KEYS.map((key) => {
                const label = CRITERIA_LABELS[key];
                return (
                  <div key={key} className="flex justify-between items-center group py-2 border-b border-gray-50 last:border-0">
                    <span className="font-bold text-gray-700 text-sm group-hover:text-gray-900 transition-colors uppercase tracking-wide">{label}</span>
                    <SmallScoreBadge band={feedback?.criteria?.[key]?.band || 0} />
                  </div>
                );
              })}
              <div className="pt-6 mt-2 border-t-2 border-dashed border-gray-200 flex justify-between items-center">
                <span className="font-extrabold text-gray-900 text-sm tracking-widest uppercase">Overall Band</span>
                <SmallScoreBadge band={feedback?.overall_band || 0} isOverall />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const ReviewExplanation = (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <button onClick={() => setReviewOpen(!reviewOpen)} className="w-full flex items-center gap-2 px-6 py-5 text-left transition-color bg-white border-b border-gray-50">
        {reviewOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        <span className="font-extrabold text-gray-900">AI Feedback & Criteria</span>
      </button>
      
      {reviewOpen && (
        <div className="flex flex-col bg-white overflow-hidden">
          {/* NAV PILLS HEADER */}
          <div className="flex flex-col md:flex-row bg-white/95 backdrop-blur z-10 sticky top-0 border-b border-gray-100 shadow-sm">
            <div className="w-full py-4 px-8 flex justify-center items-center">
              <div className="inline-flex bg-gray-100/70 p-1.5 rounded-full items-center flex-wrap justify-center gap-1">
                {CRITERIA_KEYS.map((k) => {
                  const idMapping: any = { fluency_and_coherence: "FC", lexical_resource: "LR", grammatical_range_and_accuracy: "GRA", pronunciation: "PRON" };
                  const isActive = activeCriterion === k;
                  return (
                    <a
                      key={k}
                      href={`#speaking-crit-${k}`}
                      onClick={() => setActiveCriterion(k)}
                      className={`px-6 py-2 rounded-full text-[12px] font-bold tracking-widest transition-all ${isActive ? "bg-primary text-white shadow-md transform scale-105" : "text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-sm"}`}
                    >
                      {idMapping[k]} - {CRITERIA_LABELS[k]}
                    </a>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row h-[600px]">
            {/* LEFT PANE - Feedback Cards */}
            <div className="w-full h-full overflow-y-auto px-8 py-8 space-y-8 scroll-smooth bg-gray-50/50">
              {CRITERIA_KEYS.map((key) => (
                <div 
                  key={key} 
                  id={`speaking-crit-${key}`}
                  className={`transition-all duration-500 bg-white rounded-xl shadow-sm border-2 ${activeCriterion === key ? 'border-primary shadow-md' : 'border-transparent'}`}
                >
                  <CriterionCard
                    criterionKey={key}
                    data={feedback?.criteria?.[key] as any}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full space-y-6">
      {DetailedResult}
      {ReviewExplanation}
    </div>
  );
}
