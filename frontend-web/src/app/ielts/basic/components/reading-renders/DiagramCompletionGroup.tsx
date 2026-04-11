import React, { useState } from 'react';
import { MapPin, MessageSquare, StickyNote } from 'lucide-react';

export interface DiagramQuestion {
  question_number: number;
  answer: string;
  acceptable_answers?: string[];
  explanation?: any;
}

export interface DiagramCompletionGroup {
  type: 'diagram_completion';
  instruction?: string;
  diagram_title?: string;
  image_url: string;
  labels: string[];
  questions: DiagramQuestion[];
}

// Parse "the {{5}}" into text + blank segments
function parseLabel(
  label: string,
  qMap: Record<number, DiagramQuestion>,
  answers: Record<string | number, string>,
  submitted: boolean,
  showAnswers: boolean,
  onAnswer: (qNum: number, val: string) => void,
  checkAnswer: (q: DiagramQuestion, val: string) => boolean,
): React.ReactNode {
  const regex = /\{\{(\d+)\}\}/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(label)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<span key={`t-${lastIndex}`}>{label.slice(lastIndex, match.index)}</span>);
    }

    const qNum = Number(match[1]);
    const q = qMap[qNum];
    const userAnswer = String(answers[qNum] || '');
    const isCorrect = q ? checkAnswer(q, userAnswer) : false;

    nodes.push(
      <span
        key={`b-${qNum}`}
        id={`question-${qNum}`}
        className={`inline-flex items-center border rounded px-2 py-0.5 mx-0.5 min-w-[100px] transition-colors ${
          submitted
            ? isCorrect ? 'border-green-400 bg-green-50' : 'border-red-300 bg-red-50'
            : 'border-gray-400 bg-white focus-within:border-[#FFC107]'
        }`}
      >
        <span className={`text-[10px] font-bold mr-1.5 shrink-0 ${
          submitted ? (isCorrect ? 'text-green-600' : 'text-red-400') : 'text-gray-400'
        }`}>{qNum}</span>
        {submitted ? (
          <>
            <span className={`text-[12px] font-semibold ${isCorrect ? 'text-green-700' : 'text-red-500 line-through'}`}>
              {userAnswer || '—'}
            </span>
            {!isCorrect && q && showAnswers && (
              <span className="ml-1.5 text-[11px] text-green-600 font-bold">→ {q.answer}</span>
            )}
          </>
        ) : (
          <input
            type="text"
            value={userAnswer}
            onChange={e => onAnswer(qNum, e.target.value)}
            autoComplete="off"
            spellCheck={false}
            className="outline-none bg-transparent text-[12px] text-gray-800 min-w-[60px] w-full font-medium caret-yellow-500"
          />
        )}
      </span>
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < label.length) {
    nodes.push(<span key="t-end">{label.slice(lastIndex)}</span>);
  }

  return <span className="flex flex-wrap items-baseline gap-0.5">{nodes}</span>;
}

function getExplanationText(exp: any): string {
  if (!exp) return '';
  if (typeof exp === 'string') return exp;
  return exp.rationale || JSON.stringify(exp);
}

export function DiagramCompletionGroup({
  group,
  answers,
  onAnswer,
  submitted,
  showAnswers,
  onLocate,
}: {
  group: DiagramCompletionGroup;
  answers: Record<string | number, string>;
  onAnswer: (qNum: number, val: string) => void;
  submitted: boolean;
  showAnswers: boolean;
  onLocate: (qNum: number) => void;
}) {
  const [showExplanation, setShowExplanation] = useState<number | null>(null);

  const qMap = Object.fromEntries(group.questions.map(q => [q.question_number, q]));

  const checkAnswer = (q: DiagramQuestion, userAns: string) => {
    const acceptable = q.acceptable_answers
      ? q.acceptable_answers.map(a => a.toLowerCase().trim())
      : [q.answer.toLowerCase().trim()];
    return acceptable.includes(userAns.toLowerCase().trim());
  };

  const qNums = group.questions.map(q => q.question_number);

  return (
    <div className="mb-8 font-sans">
      {/* Header */}
      {qNums.length > 0 && (
        <p className="text-[13px] font-bold text-gray-900 mb-0.5">
          Questions {Math.min(...qNums)}–{Math.max(...qNums)}
        </p>
      )}
      <p className="text-[13px] text-gray-600 mb-4 leading-relaxed">
        {group.instruction || 'Label the diagram below.'}
      </p>

      <div className="flex flex-col gap-5 mb-4">
        {/* Diagram Image — full width on top */}
        <div className="bg-white border border-gray-200 p-2 overflow-hidden flex items-center justify-center rounded-lg">
          <img
            src={group.image_url}
            alt={group.diagram_title || 'Diagram'}
            className="max-w-full max-h-[420px] object-contain"
          />
        </div>

        {/* Labels Panel — below the image */}
        <div className="w-full flex flex-col gap-3">
          {group.diagram_title && (
            <h4 className="text-[13px] font-bold text-gray-800 border-b border-gray-200 pb-2">
              {group.diagram_title}
            </h4>
          )}

          <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4">
            <h5 className="text-[12px] font-bold text-gray-600 uppercase tracking-wide mb-3">Labels</h5>
            <ul className="space-y-3">
              {group.labels.map((label, li) => (
                <li key={li} className="flex items-baseline gap-2 text-[13.5px] text-gray-800 leading-relaxed">
                  <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  {parseLabel(label, qMap, answers, submitted, showAnswers, onAnswer, checkAnswer)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Post-submit action buttons */}
      {showAnswers && (
        <div className="mt-3 space-y-2">
          {group.questions.map(q => (
            <div key={q.question_number} className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400 w-6 shrink-0">Q{q.question_number}</span>
              <button onClick={() => onLocate(q.question_number)} className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md transition-colors">
                <MapPin className="w-3 h-3" /> Locate
              </button>
              <button onClick={() => setShowExplanation(showExplanation === q.question_number ? null : q.question_number)} className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md transition-colors">
                <MessageSquare className="w-3 h-3" /> Explain
              </button>
              <button className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md transition-colors">
                <StickyNote className="w-3 h-3" /> Note
              </button>
              {showExplanation === q.question_number && (
                <div className="w-full mt-1 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-[13px] text-blue-900 leading-relaxed">
                  {getExplanationText(q.explanation)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
