import React, { useState } from 'react';
import { MapPin, MessageSquare, StickyNote } from 'lucide-react';

export interface FlowchartQuestion {
  question_number: number;
  answer: string;
  acceptable_answers?: string[];
  explanation?: any;
}

export interface FlowchartStage {
  stage_name?: string;
  text: string;
}

export interface FlowchartCompletionGroup {
  type: 'flowchart_completion';
  instruction?: string;
  flowchart_title?: string;
  stages: FlowchartStage[];
  questions: FlowchartQuestion[];
}

// Parse a stage text like "Parrotfish enter the ocean as {{3}}."
function parseStageText(
  text: string,
  qMap: Record<number, FlowchartQuestion>,
  answers: Record<string | number, string>,
  submitted: boolean,
  showAnswers: boolean,
  onAnswer: (qNum: number, val: string) => void,
  checkAnswer: (q: FlowchartQuestion, val: string) => boolean,
): React.ReactNode[] {
  const regex = /\{\{(\d+)\}\}/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<span key={`t-${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>);
    }

    const qNum = Number(match[1]);
    const q = qMap[qNum];
    const userAnswer = String(answers[qNum] || '');
    const isCorrect = q ? checkAnswer(q, userAnswer) : false;

    nodes.push(
      <span
        key={`b-${qNum}`}
        id={`question-${qNum}`}
        className={`inline-flex items-center border rounded px-2 py-0.5 mx-0.5 w-24 transition-colors ${
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

  if (lastIndex < text.length) {
    nodes.push(<span key={`t-end`}>{text.slice(lastIndex)}</span>);
  }

  return nodes;
}

function getExplanationText(exp: any): string {
  if (!exp) return '';
  if (typeof exp === 'string') return exp;
  return exp.rationale || JSON.stringify(exp);
}

export function FlowchartCompletionGroup({
  group,
  answers,
  onAnswer,
  submitted,
  showAnswers,
  onLocate,
}: {
  group: FlowchartCompletionGroup;
  answers: Record<string | number, string>;
  onAnswer: (qNum: number, val: string) => void;
  submitted: boolean;
  showAnswers: boolean;
  onLocate: (qNum: number) => void;
}) {
  const [showExplanation, setShowExplanation] = useState<number | null>(null);

  const qMap = Object.fromEntries(group.questions.map(q => [q.question_number, q]));

  const checkAnswer = (q: FlowchartQuestion, userAns: string) => {
    const acceptable = q.acceptable_answers
      ? q.acceptable_answers.map(a => a.toLowerCase().trim())
      : [q.answer.toLowerCase().trim()];
    return acceptable.includes(userAns.toLowerCase().trim());
  };

  const qNums = group.questions.map(q => q.question_number);

  return (
    <div className="mb-8">
      {/* Header */}
      {qNums.length > 0 && (
        <p className="text-[13px] font-bold text-gray-900 mb-0.5">
          Questions {Math.min(...qNums)}–{Math.max(...qNums)}
        </p>
      )}
      <p className="text-[13px] text-gray-600 mb-4 leading-relaxed">
        {group.instruction || 'Complete the flow-chart below.'}
      </p>

      {/* Flowchart box */}
      <div className="border border-gray-300 rounded-lg overflow-hidden mb-4">
        {group.flowchart_title && (
          <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 text-center">
            <span className="text-[13px] font-bold text-gray-800">{group.flowchart_title}</span>
          </div>
        )}

        {/* Stages */}
        <div className="px-6 py-4 flex flex-col items-center gap-0">
          {group.stages.map((stage, si) => {
            const hasBlank = /\{\{\d+\}\}/.test(stage.text);
            return (
              <div key={si} className="flex flex-col items-center w-full">
                {/* Stage box */}
                <div className={`w-full border-2 rounded-lg px-4 py-3 text-[13px] text-gray-800 leading-loose text-center transition-colors ${
                  hasBlank ? 'border-gray-400' : 'border-gray-300 bg-gray-50/60'
                }`}>
                  {stage.stage_name && (
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      {stage.stage_name}
                    </p>
                  )}
                  <span className="block text-center whitespace-normal">
                    {parseStageText(stage.text, qMap, answers, submitted, showAnswers, onAnswer, checkAnswer)}
                  </span>
                </div>

                {/* Arrow down (not after last) */}
                {si < group.stages.length - 1 && (
                  <div className="flex flex-col items-center my-1.5">
                    <div className="w-0.5 h-4 bg-gray-400" />
                    <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-gray-400" />
                  </div>
                )}
              </div>
            );
          })}
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
