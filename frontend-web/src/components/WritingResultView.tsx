"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, BarChart } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────

interface CriterionFeedback {
  band: number;
  strengths: string[];
  weak_areas: string[];
  how_to_improve: string[];
  mistakes?: Mistake[];
}

interface TaskFeedback {
  band: number;
  criteria: {
    task_achievement: CriterionFeedback;
    coherence_and_cohesion: CriterionFeedback;
    lexical_resource: CriterionFeedback;
    grammatical_range_and_accuracy: CriterionFeedback;
  };
}

interface Mistake {
  original: string;
  correction: string;
  explanation: string;
}

export interface WritingFeedback {
  overall_band: number;
  task1: TaskFeedback;
  task2: TaskFeedback;
}

interface WritingResultViewProps {
  feedback: WritingFeedback;
  answers?: { task1?: string; task2?: string };
  exam?: any;
  practicePart?: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const CRITERIA_LABELS: Record<string, string> = {
  task_achievement: "Task Achievement / Response",
  coherence_and_cohesion: "Coherence & Cohesion",
  lexical_resource: "Lexical Resource",
  grammatical_range_and_accuracy: "Grammatical Range & Accuracy",
};



function BandBadge({ band, size = "md" }: { band: number; size?: "sm" | "md" | "lg" }) {
  const color =
    band > 7.5
      ? "from-emerald-500 to-teal-500 shadow-emerald-500/25"
      : band > 6.0
        ? "from-blue-500 to-indigo-500 shadow-blue-500/25"
        : band > 4.5
          ? "from-amber-500 to-orange-500 shadow-amber-500/25"
          : "from-rose-500 to-red-500 shadow-rose-500/25";

  const sizeClass =
    size === "lg"
      ? "w-24 h-24 text-4xl"
      : size === "md"
        ? "w-16 h-16 text-2xl"
        : "w-11 h-11 text-base";

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br ${color} flex flex-col items-center justify-center text-white font-extrabold shadow-lg`}
    >
      <span>{band.toFixed(1)}</span>
    </div>
  );
}

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
  taskLabel,
}: {
  criterionKey: string;
  data: CriterionFeedback;
  taskLabel: string;
}) {
  const label = CRITERIA_LABELS[criterionKey];

  return (
    <div className="px-4 p-4 rounded-md border border-primary/50">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h4 className="text-[17px] font-extrabold text-dark">{label}</h4>
        <SmallScoreBadge band={data.band} />
      </div>

      {/* Strengths */}
      {data.strengths?.length > 0 && (
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
      {data.weak_areas?.length > 0 && (
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
      {data.how_to_improve?.length > 0 && (
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
      {data.mistakes && data.mistakes.length > 0 && (
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

export default function WritingResultView({ feedback, answers, exam, practicePart }: WritingResultViewProps) {
  const [detailedOpen, setDetailedOpen] = useState(true);
  const [reviewOpen, setReviewOpen] = useState(true);
  const [activeTask, setActiveTask] = useState<1 | 2>(practicePart === 2 ? 2 : 1);
  const [activeView, setActiveView] = useState<"Question" | "Answer">("Question");
  const [activeCriterion, setActiveCriterion] = useState<string | null>("task_achievement");

  const CRITERIA_KEYS = [
    "task_achievement",
    "coherence_and_cohesion",
    "lexical_resource",
    "grammatical_range_and_accuracy",
  ] as const;

  const TaskDetailColumn = ({ taskName, data, isTask2 }: { taskName: string; data: TaskFeedback; isTask2: boolean }) => (
    <div className="flex flex-col rounded-lg px-6 lg:px-8 lg:p-8 h-full">
      <h3 className="font-extrabold text-gray-900 text-center tracking-tight mb-2">{taskName}</h3>
      <div className="flex justify-center mb-6">
        <img src="https://demo2.pavothemes.com/gopet/wp-content/uploads/2021/11/h3_divider.png" alt="" className="h-[3px]" />
      </div>
      <div className="flex flex-col gap-4">
        {CRITERIA_KEYS.map((key) => {
          let label = CRITERIA_LABELS[key];
          if (isTask2 && key === "task_achievement") label = "Task Response";
          if (!isTask2 && key === "task_achievement") label = "Task Achievement";
          return (
            <div key={key} className="flex justify-between items-center group py-1">
              <span className="font-medium text-gray-600 text-sm group-hover:text-gray-900 transition-colors">{label}</span>
              <SmallScoreBadge band={data.criteria[key].band} />
            </div>
          );
        })}
        <div className="pt-5 flex justify-between items-center">
          <span className="font-extrabold text-gray-900 text-sm tracking-wide uppercase">Overall</span>
          <SmallScoreBadge band={data.band} isOverall />
        </div>
      </div>
    </div>
  );

  const DetailedResult = (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <button onClick={() => setDetailedOpen(!detailedOpen)} className="w-full flex items-center gap-2 px-6 py-5 text-left transition-colors">
        {detailedOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        <span className="font-extrabold text-gray-900">Detailed Breakdown</span>
      </button>
      {detailedOpen && (
        <div className="px-8 mb-8 gap-4 grid grid-cols-1 md:grid-cols-2 bg-white">
          {(!practicePart || practicePart === 1) && <TaskDetailColumn taskName="Task 1" data={feedback.task1} isTask2={false} />}
          {(!practicePart || practicePart === 2) && <TaskDetailColumn taskName="Task 2" data={feedback.task2} isTask2={true} />}
        </div>
      )}
    </div>
  );

  // Split Pane Implementation Data
  const currentFeedback = activeTask === 1 ? feedback.task1 : feedback.task2;
  const currentAnswer = activeTask === 1 ? answers?.task1 : answers?.task2;
  const tasks = exam?.questions?.tasks || [];
  const currentPromptObj = tasks.find((t: any) => t.task_number === activeTask) || {};

  const ReviewExplanation = (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <button onClick={() => setReviewOpen(!reviewOpen)} className="w-full flex items-center gap-2 px-6 py-5 text-left transition-color bg-white">
        {reviewOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
        <span className="font-extrabold text-gray-900">Review & Explanation</span>
      </button>
      {reviewOpen && (
        <div className="flex flex-col bg-white overflow-hidden">
          {/* TOP FULL-WIDTH HEADER: TASK TABS */}
          <div className="flex bg-white px-4 md:px-8">
            {(!practicePart || practicePart === 1) && (
              <button
                onClick={() => setActiveTask(1)}
                className={`py-4 px-6 border-b-[2px] flex items-center justify-center lg:justify-start gap-3 transition-colors ${activeTask === 1 ? "border-[#ffc107] text-[#ffc107]" : "border-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-900"}`}
              >
                <BarChart className="w-6 h-6 flex-shrink-0" />
                <div className="flex flex-col items-start leading-[1.1] text-left">
                  <span className="font-extrabold text-[15px] tracking-tight">Task 1</span>
                  <span className="text-[11px] font-bold tracking-tight">Diagram Report</span>
                </div>
              </button>
            )}
            {(!practicePart || practicePart === 2) && (
              <button
                onClick={() => setActiveTask(2)}
                className={`py-4 px-6 border-b-[2px] flex items-center justify-center lg:justify-start gap-3 transition-colors ${activeTask === 2 ? "border-[#ffc107] text-[#ffc107]" : "border-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-900"}`}
              >
                <FileText className={`w-6 h-6 flex-shrink-0 ${activeTask === 2 ? "text-[#ffc107]" : "text-gray-600"}`} />
                <div className="flex flex-col items-start leading-[1.1] text-left">
                  <span className={`font-extrabold text-[15px] tracking-tight ${activeTask === 2 ? "" : "text-gray-800"}`}>Task 2</span>
                  <span className={`text-[11px] font-bold tracking-tight ${activeTask === 2 ? "" : "text-gray-600"}`}>Essay Writing</span>
                </div>
              </button>
            )}
          </div>

          {/* SECOND FULL-WIDTH HEADER: TIMELINE NAV PILLS */}
          <div className="flex flex-col md:flex-row bg-white/95 backdrop-blur z-10 sticky top-0">
            {/* Left Nav (Question/Answer) */}
            <div className="w-full md:w-1/2 px-8 flex items-center">
              <div className="inline-flex bg-gray-100/70 p-1.5 rounded-full items-center">
                <a
                  href="#task-question"
                  onClick={() => setActiveView("Question")}
                  className={`px-6 py-2 rounded-full text-[12px] font-bold tracking-wide transition-all ${activeView === "Question" ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-white/50"}`}
                >
                  Question
                </a>
                <a
                  href="#task-answer"
                  onClick={() => setActiveView("Answer")}
                  className={`px-6 py-2 rounded-full text-[12px] font-bold tracking-wide transition-all ${activeView === "Answer" ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-white/50"}`}
                >
                  Answer
                </a>
              </div>
            </div>

            {/* Right Nav (Criteria) */}
            <div className="w-full md:w-1/2 px-8 py-5 flex items-center border-t border-gray-100 md:border-t-0">
              <div className="inline-flex bg-gray-100/70 p-1.5 rounded-full items-center">
                {["task_achievement", "coherence_and_cohesion", "lexical_resource", "grammatical_range_and_accuracy"].map((k) => {
                  const idMapping: any = { task_achievement: "TA", coherence_and_cohesion: "CAC", lexical_resource: "LR", grammatical_range_and_accuracy: "GRA" };
                  const isActive = activeCriterion === k;
                  return (
                    <a
                      key={k}
                      href={`#curr-task-${k}`}
                      onClick={() => setActiveCriterion(k)}
                      className={`px-5 py-2 rounded-full text-[11px] font-bold tracking-widest transition-all ${isActive ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-sm focus:bg-primary focus:text-white focus:shadow-sm active:bg-gray-200"}`}
                    >
                      {idMapping[k]}
                    </a>
                  )
                })}
              </div>
            </div>
          </div>

          {/* BOTTOM SPLIT PANES: CONTENT */}
          <div className="flex flex-col md:flex-row h-[600px]">
            {/* LEFT PANE CONTENT */}
            <div className="mb-6 w-full md:w-1/2 overflow-y-auto scroll-smooth bg-gray-50/30">
              <div id="task-question" className="px-8 mb-4 pt-4 border-b border-gray-100">
                <div className="space-y-6">
                  {currentPromptObj.prompt && (
                    <div className="text-[14px] text-gray-800 font-medium leading-[1.8] bg-[#fbfbfa] p-6 rounded-xl border border-[#ebebeb] shadow-sm">
                      {currentPromptObj.prompt}
                    </div>
                  )}
                  {currentPromptObj.image_url && (
                    <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden bg-white p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={currentPromptObj.image_url} alt="Task diagram" className="w-full h-auto rounded-lg" />
                    </div>
                  )}
                </div>
              </div>
              <div id="task-answer" className="px-8">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm min-h-full">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Your Response</span>
                    <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {currentAnswer ? currentAnswer.trim().split(/\s+/).length : 0} words
                    </span>
                  </div>
                  <div className="text-[14px] text-gray-800 leading-[1.8] whitespace-pre-wrap">
                    {currentAnswer || <span className="text-gray-400 italic">No answer provided.</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PANE CONTENT */}
            <div className="mb-6 w-full md:w-1/2 overflow-y-auto px-8 py-4 space-y-6 scroll-smooth bg-white relative border-t border-gray-100 md:border-t-0">
              {CRITERIA_KEYS.map((key) => (
                <div key={key} id={`curr-task-${key}`}>
                  <CriterionCard
                    criterionKey={key}
                    data={currentFeedback.criteria[key]}
                    taskLabel={`Task ${activeTask}`}
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
    <div className="w-full">
      {DetailedResult}
      {ReviewExplanation}
    </div>
  );
}
