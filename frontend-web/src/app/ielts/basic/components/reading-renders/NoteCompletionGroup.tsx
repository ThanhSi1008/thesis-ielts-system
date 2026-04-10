import React, { useState } from 'react';
import { MapPin, MessageSquare, StickyNote } from 'lucide-react';

export interface NoteQuestion {
  question_number: number;
  answer: string;
  acceptable_answers?: string[];
  explanation?: any;
}

// notes can be flat strings OR grouped objects with subheadings
export type NoteEntry = string | { subheading: string; points: string[] };

export interface NoteCompletionGroup {
  type: 'note_completion';
  instruction?: string;
  note_title?: string;
  notes: NoteEntry[];
  questions: NoteQuestion[];
}

// Parse a note string like "Timber {{1}} was used" into segments
function parseNote(note: string): Array<{ type: 'text'; value: string } | { type: 'blank'; qNum: number }> {
  const segments: Array<{ type: 'text'; value: string } | { type: 'blank'; qNum: number }> = [];
  const regex = /\{\{(\d+)\}\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(note)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: note.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'blank', qNum: Number(match[1]) });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < note.length) {
    segments.push({ type: 'text', value: note.slice(lastIndex) });
  }
  return segments;
}

function getExplanationText(exp: any): string {
  if (!exp) return '';
  if (typeof exp === 'string') return exp;
  return exp.rationale || JSON.stringify(exp);
}

function NoteLine({
  note,
  qMap,
  answers,
  submitted,
  onAnswer,
  checkAnswer,
}: {
  note: string;
  qMap: Record<number, NoteQuestion>;
  answers: Record<string | number, string>;
  submitted: boolean;
  onAnswer: (qNum: number, val: string) => void;
  checkAnswer: (q: NoteQuestion, userAns: string) => boolean;
}) {
  const segments = parseNote(note);
  return (
    <li className="flex items-baseline gap-2 text-[14px] text-gray-800 leading-relaxed">
      <span className="mt-[6px] w-1.5 h-1.5 rounded-full bg-gray-500 shrink-0" />
      <span className="flex-1 flex flex-wrap items-baseline gap-1">
        {segments.map((seg, si) => {
          if (seg.type === 'text') {
            return <span key={si}>{seg.value}</span>;
          }

          const qNum = seg.qNum;
          const q = qMap[qNum];
          const userAnswer = String(answers[qNum] || '');
          const isCorrect = q ? checkAnswer(q, userAnswer) : false;

          return (
            <span
              key={si}
              id={`question-${qNum}`}
              className={`inline-flex items-center border rounded px-2 py-0.5 min-w-[120px] transition-colors ${
                submitted
                  ? isCorrect
                    ? 'border-green-400 bg-green-50'
                    : 'border-red-300 bg-red-50'
                  : 'border-gray-400 bg-white focus-within:border-[#FFC107]'
              }`}
            >
              <span className={`text-[11px] font-bold mr-1.5 shrink-0 ${
                submitted ? (isCorrect ? 'text-green-600' : 'text-red-400') : 'text-gray-400'
              }`}>
                {qNum}
              </span>
              {submitted ? (
                <>
                  <span className={`text-[13px] font-semibold ${isCorrect ? 'text-green-700' : 'text-red-500 line-through'}`}>
                    {userAnswer || '—'}
                  </span>
                  {!isCorrect && q && (
                    <span className="ml-1.5 text-[12px] text-green-600 font-bold">({q.answer})</span>
                  )}
                </>
              ) : (
                <input
                  type="text"
                  value={userAnswer}
                  onChange={e => onAnswer(qNum, e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  className="outline-none bg-transparent text-[13px] text-gray-800 min-w-[80px] w-full font-medium caret-yellow-500"
                />
              )}
            </span>
          );
        })}
      </span>
    </li>
  );
}

export function NoteCompletionGroup({
  group,
  answers,
  onAnswer,
  submitted,
  onLocate,
}: {
  group: NoteCompletionGroup;
  answers: Record<string | number, string>;
  onAnswer: (qNum: number, val: string) => void;
  submitted: boolean;
  onLocate: (qNum: number) => void;
}) {
  const [showExplanation, setShowExplanation] = useState<number | null>(null);
  const qMap = Object.fromEntries(group.questions.map(q => [q.question_number, q]));

  const checkAnswer = (q: NoteQuestion, userAns: string) => {
    const acceptable = q.acceptable_answers
      ? q.acceptable_answers.map(a => a.toLowerCase().trim())
      : [q.answer.toLowerCase().trim()];
    return acceptable.includes(userAns.toLowerCase().trim());
  };

  const qNums = group.questions.map(q => q.question_number);

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="mb-4">
        {qNums.length > 0 && (
          <p className="text-[13px] font-bold text-gray-900 mb-0.5">
            Questions {Math.min(...qNums)}–{Math.max(...qNums)}
          </p>
        )}
        <p className="text-[13px] text-gray-600 mb-4 leading-relaxed">
          {group.instruction || 'Complete the notes below.'}
        </p>

        {/* Note Title Box */}
        {group.note_title && (
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 text-center">
              <span className="text-[13px] font-bold text-gray-800">{group.note_title}</span>
            </div>

            <div className="px-5 py-3 space-y-4">
              {group.notes.map((entry, ni) => {
                // --- Grouped format: { subheading, points[] } ---
                if (typeof entry === 'object' && 'points' in entry) {
                  return (
                    <div key={ni}>
                      <p className="text-[13px] font-semibold text-gray-700 mb-2 italic">{entry.subheading}</p>
                      <ul className="space-y-2 ml-2">
                        {entry.points.map((point, pi) => (
                          <NoteLine
                            key={pi}
                            note={point}
                            qMap={qMap}
                            answers={answers}
                            submitted={submitted}
                            onAnswer={onAnswer}
                            checkAnswer={checkAnswer}
                          />
                        ))}
                      </ul>
                    </div>
                  );
                }

                // --- Flat format: plain string ---
                return (
                  <ul key={ni} className="space-y-2">
                    <NoteLine
                      note={entry as string}
                      qMap={qMap}
                      answers={answers}
                      submitted={submitted}
                      onAnswer={onAnswer}
                      checkAnswer={checkAnswer}
                    />
                  </ul>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Post-submit action buttons per question */}
      {submitted && (
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
