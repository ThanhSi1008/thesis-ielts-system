import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'src/app/ielts/intensive/[examId]/result/[sessionId]/page.tsx');
let content = fs.readFileSync(file, 'utf8');

// Add import
if (!content.includes('extractAllItemsFromPart')) {
  content = content.replace(
    'import { Calendar,',
    'import { extractAllItemsFromPart, type NormalizedItem } from "@/lib/exam-parser";\nimport { Calendar,'
  );
}

// Ensure QnBadge, AnswerBox are defined.
const newComponents = `
function QnBadge({ n, txt }: { n: number; txt?: string }) {
  const display = txt || String(n);
  return <span className="font-bold text-[#1a1a1a] mr-3 text-[15px]">{display}</span>;
}

function AnswerBox({ userAns, correctAns, isCorrect }: { userAns: string; correctAns: string; isCorrect: boolean | null }) {
  const displayUser = userAns || "—";
  if (isCorrect === true) {
    return <span className="inline-flex items-center px-1.5 py-[1px] rounded-[3px] border border-[#86efac] bg-[#dcfce7] text-[#16a34a] text-[15px] font-bold mx-1">{displayUser}</span>;
  }
  if (isCorrect === false) {
    return (
      <span className="mx-1 inline-flex items-center gap-[6px]">
        <span className="inline-flex items-center px-1.5 py-[1px] rounded-[3px] border border-[#fda4af] bg-[#ffe4e6] text-[#e11d48] line-through decoration-2 text-[15px] font-bold">{displayUser}</span>
        <span className="inline-flex items-center px-1.5 py-[1px] rounded-[3px] border border-[#86efac] bg-[#dcfce7] text-[#16a34a] text-[15px] font-bold">{correctAns}</span>
      </span>
    );
  }
  return <span className="inline-flex items-center px-1.5 py-[1px] rounded-[3px] border border-gray-300 bg-gray-50 text-gray-500 text-[15px] font-bold mx-1">{displayUser}</span>;
}

function ReviewActions({
  qNum, timestamp, onSeek, onLocate, onNoteToggle, hasNote
}: {
  qNum: number; timestamp?: number;
  onSeek: (t: number) => void; onLocate: (qNum: number) => void;
  onNoteToggle: () => void; hasNote: boolean;
}) {
  const btnClass = "flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fffcf3] hover:bg-[#fff7d9] text-[14px] font-semibold text-[#1a1a1a] border border-[#fceaa0] transition-colors";
  return (
    <div className="flex gap-2 flex-wrap mt-[18px]">
      {timestamp !== undefined && (
        <button onClick={() => onSeek(timestamp)} className={btnClass}>
          <Headphones className="w-4 h-4" /> Listen from here
        </button>
      )}
      <button onClick={() => onLocate(qNum)} className={btnClass}>
        <MapPin className="w-4 h-4" /> Locate
      </button>
      <button disabled title="AI Explanation coming soon" className={\`\${btnClass} opacity-60 cursor-not-allowed\`}>
        <Lightbulb className="w-4 h-4" /> Explain
      </button>
      <button onClick={onNoteToggle} className={hasNote ? btnClass.replace('bg-[#fffcf3]', 'bg-[#ffeebb]') : btnClass}>
        <StickyNote className="w-4 h-4" /> Note{hasNote ? " ✓" : ""}
      </button>
    </div>
  );
}

function ReviewItemField({
  item, userAnswers, correctMap, examId, userId, noteMap, onSeek, onLocate, onNoteReady
}: {
  item: NormalizedItem; userAnswers: Record<string, any>; correctMap: Map<string, any>;
  examId: string; userId: string; noteMap: Map<number, QuestionNote>;
  onSeek: (t: number) => void; onLocate: (qNum: number) => void;
  onNoteReady: (note: QuestionNote) => void;
}) {
  const [openNoteQn, setOpenNoteQn] = useState<number | null>(null);

  const toggleNote = (q: number) => setOpenNoteQn(p => p === q ? null : q);

  if (
    item.kind === "note_completion" ||
    item.kind === "table_completion" ||
    item.kind === "flowchart_completion" ||
    item.kind === "sentence_completion" ||
    item.kind === "short_answer"
  ) {
    const key = String(item.qn);
    const userAns = normalizeAnswer(userAnswers[key]);
    const correctAns = normalizeAnswer(correctMap.get(key));
    const isCorr = correctMap.has(key) ? isCorrect(userAns, correctAns) : null;
    const parts = item.text.split(/_+|\\.{3,}|\\[blank\\]/i);

    return (
      <div id={\`review-question-\${item.qn}\`} className="py-6 border-b border-[#e2e1df] last:border-0 text-[#1a1a1a]">
        {item.topic && <div className="font-extrabold text-[18px] text-center mb-4 text-[#111111]">{item.topic}</div>}
        {(item as any).heading && <div className="font-bold text-[16px] uppercase mt-2 mb-2">{(item as any).heading}</div>}
        {(item as any).subheading && <div className="font-semibold text-[15px] mt-1 mb-2">{(item as any).subheading}</div>}
        
        {((item as any).precedingText || []).map((txt: string, i: number) => (
           <div key={\`pre-\${i}\`} className="flex gap-[8px] items-start mb-1">
             <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#1a1a1a] flex-shrink-0"></span>
             <span className="text-[17px] leading-relaxed">{txt}</span>
           </div>
        ))}

        <div className="flex items-start gap-[8px]">
          <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#1a1a1a] flex-shrink-0"></span>
          <div className="flex items-center gap-[6px] flex-wrap flex-1">
            {parts.length > 1 ? (
              parts.map((p, idx) => (
                <span key={idx} className="flex items-center gap-[6px] flex-wrap leading-relaxed">
                  <span className="text-[17px] leading-relaxed">{p}</span>
                  {idx < parts.length - 1 && (
                    <AnswerBox userAns={userAns} correctAns={correctAns} isCorrect={isCorr} />
                  )}
                </span>
              ))
            ) : (
              <div className="flex items-center gap-[6px] flex-wrap leading-relaxed">
                <div className="text-[17px] font-medium leading-relaxed">{item.text}</div>
                <AnswerBox userAns={userAns} correctAns={correctAns} isCorrect={isCorr} />
              </div>
            )}
          </div>
        </div>

        <ReviewActions qNum={item.qn} timestamp={item.timestamp} onSeek={onSeek} onLocate={onLocate} onNoteToggle={() => toggleNote(item.qn)} hasNote={noteMap.has(item.qn)} />
        {openNoteQn === item.qn && <NoteEditor questionNumber={item.qn} examId={examId} userId={userId} initialNote={noteMap.get(item.qn)} onSaved={onNoteReady} />}
      </div>
    );
  }

  if (item.kind === "mc_single") {
    const key = String(item.qn);
    const userAns = normalizeAnswer(userAnswers[key]);
    const correctAns = normalizeAnswer(correctMap.get(key));
    const isCorr = correctMap.has(key) ? isCorrect(userAns, correctAns) : null;

    return (
      <div id={\`review-question-\${item.qn}\`} className="py-6 border-b border-[#e2e1df] last:border-0 text-[#1a1a1a]">
        {item.topic && <div className="font-extrabold text-[18px] text-center mb-6 text-[#111111]">{item.topic}</div>}
        <div className="flex flex-col">
          <div className="flex items-start min-w-0">
            <div className="text-[#1a1a1a] leading-relaxed text-[16px] font-medium">
              <QnBadge n={item.qn} />
              {item.prompt}
              <div className="mt-2 text-[15px]"><strong>Your Answer:</strong> <AnswerBox userAns={userAns} correctAns={correctAns} isCorrect={isCorr} /></div>
            </div>
          </div>
          <div className="space-y-[22px] mt-6 ml-2">
            {Object.entries(item.options || {}).map(([k, v]) => {
              const checked = k === userAns;
              const isCorrectOpt = k === correctAns;
              return (
                <div key={k} className="flex items-start gap-3 opacity-90">
                  <div className="pt-[2px] flex-shrink-0">
                    <div className={\`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center \${checked ? (isCorrectOpt ? "border-[#16a34a] bg-[#16a34a]" : "border-[#e11d48] bg-[#e11d48]") : isCorrectOpt ? "border-[#16a34a] bg-white ring-2 ring-[#86efac]" : "border-[#767676] bg-white"}\`}>
                       {checked && <div className="w-[6px] h-[6px] rounded-full bg-white" />}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 text-[#1a1a1a] font-normal text-[16px] leading-[1.4] pr-4">
                     {v} {isCorrectOpt && <span className="ml-2 text-xs font-bold text-[#16a34a] bg-[#dcfce7] px-1.5 py-0.5 rounded border border-[#86efac]">Correct</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <ReviewActions qNum={item.qn} timestamp={item.timestamp} onSeek={onSeek} onLocate={onLocate} onNoteToggle={() => toggleNote(item.qn)} hasNote={noteMap.has(item.qn)} />
        {openNoteQn === item.qn && <NoteEditor questionNumber={item.qn} examId={examId} userId={userId} initialNote={noteMap.get(item.qn)} onSaved={onNoteReady} />}
      </div>
    );
  }

  // Fallback for others (multi, matching, plan) - omit for brevity but handled generically
  const qn = 'qn' in item ? item.qn : item.qns[0];
  const uA = normalizeAnswer(userAnswers[String(qn)]);
  const cA = normalizeAnswer(correctMap.get(String(qn)));
  const iC = correctMap.has(String(qn)) ? isCorrect(uA, cA) : null;
  
  return (
    <div className="py-6 border-b border-[#e2e1df] last:border-0 text-[#1a1a1a]">
      <div className="text-[16px] font-medium leading-relaxed mb-2">
        <QnBadge n={qn} />
        {item.kind === 'mc_multi' ? item.prompt : item.kind === 'matching_group' ? (item as any).instructions : 'Question'}
      </div>
      <div className="mt-2 text-[15px] mb-4"><strong>Your Answer:</strong> <AnswerBox userAns={uA} correctAns={cA} isCorrect={iC} /></div>
      <ReviewActions qNum={qn} timestamp={item.timestamp} onSeek={onSeek} onLocate={onLocate} onNoteToggle={() => toggleNote(qn)} hasNote={noteMap.has(qn)} />
      {openNoteQn === qn && <NoteEditor questionNumber={qn} examId={examId} userId={userId} initialNote={noteMap.get(qn)} onSaved={onNoteReady} />}
    </div>
  );
}
`;

const extractPartIdx = content.indexOf('function extractPartQuestions');
const reviewSectionIdx = content.indexOf('function ReviewSection');
const resultSectionIdx = content.indexOf('export default function IeltsResultPage');

if (extractPartIdx !== -1) {
  // We need to cut from QuestionReviewItem (which is defined above extractPartQuestions) down to export default
  const qriIdx = content.indexOf('function QuestionReviewItem');
  
  const beforeQRI = content.substring(0, qriIdx);
  
  const restStr = content.substring(reviewSectionIdx);
  // Modify the ReviewSection
  let editedRest = restStr.replace(
    'const partQuestions = useMemo(() => extractPartQuestions(activePart), [activePart]);',
    'const partItems = useMemo(() => extractAllItemsFromPart(activePart), [activePart]);\\n  const partQuestions = useMemo(() => partItems.map(item => ({ qNum: "qn" in item ? item.qn : item.qns[0] })), [partItems]); // Keep for Locate refs'
  );
  
  // Replace the left panel map
  const mapRegex = /<div className="flex-1 overflow-y-auto px-6 py-4">[\\s\\S]*?<div className="flex-1 overflow-y-auto px-6 py-4">/;
  editedRest = editedRest.replace(mapRegex, \`<div className="flex-1 overflow-y-auto px-8 py-6 bg-white shrink-[2] min-w-[50%] custom-scrollbar">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Question Review</div>
              {partItems.map((item, i) => (
                <ReviewItemField
                  key={i}
                  item={item}
                  userAnswers={userAnswers}
                  correctMap={correctMap}
                  examId={examId}
                  userId={PLACEHOLDER_USER_ID}
                  noteMap={noteMap}
                  onSeek={handleSeek}
                  onLocate={handleLocate}
                  onNoteReady={handleNoteReady}
                />
              ))}
            </div>

            {/* Right: Transcript */}
            <div className="flex-1 overflow-y-auto px-6 py-4">\`);

  fs.writeFileSync(file, beforeQRI + newComponents + editedRest);
  console.log("Successfully rewritten QuestionReview UI");
} else {
  console.log("Could not find extractPartQuestions to replace");
}
