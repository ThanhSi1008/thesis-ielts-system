const fs = require('fs');
const file = 'frontend-web/src/app/ielts/intensive/[examId]/take/[sessionId]/page.tsx';
let txt = fs.readFileSync(file, 'utf8');

const t1 = ') : !exam ? (';
const i1 = txt.indexOf(t1);
if (i1 === -1) process.exit(1);

const t2 = ') : (\\n          <div key={activePartIdx} id="main-scroll-container" className="w-full flex justify-center custom-scrollbar overflow-y-auto overflow-x-hidden relative" onClick={() => setFocusedQn(null)}>\\n            <div className="w-full bg-white pt-10 px-6 pb-32" onClick={(e) => e.stopPropagation()}>';
const i2 = txt.indexOf(t2, i1);

const t3 = '              </div>\\n\\n            </div>\\n          </div>\\n        )}';
const i3 = txt.indexOf(t3, i2);
if (i2 === -1 || i3 === -1) process.exit(2);

const replacement = \`) : exam.type === "READING" ? (
          <div key={activePartIdx} id="main-split-container" className="w-full h-full flex flex-row overflow-hidden relative" onClick={() => setFocusedQn(null)}>
            {/* Left Pane - Passage */}
            <div className="w-1/2 h-full overflow-y-auto custom-scrollbar border-r border-[#e2e1df] p-8 pb-32 bg-[#faf9f8]" onClick={(e) => e.stopPropagation()}>
              {(activePart as any).topic && (
                <h2 className="text-2xl font-bold mb-6 text-center">{(activePart as any).topic}</h2>
              )}
              <div className="text-[#1a1a1a] leading-relaxed text-[16px] space-y-4 text-justify font-serif">
                {((activePart as any).passage_text || "").split('\\n').map((para: string, i: number) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
            
            {/* Right Pane - Questions */}
            <div id="main-scroll-container" className="w-1/2 h-full flex flex-col items-center custom-scrollbar overflow-y-auto overflow-x-hidden relative" onClick={(e) => e.stopPropagation()}>
              <div className="w-full max-w-2xl bg-white pt-10 px-6 pb-32">
                <div className="bg-[#f2f1ef] border border-[#e2e1df] rounded py-5 px-6 mb-8 text-[#1a1a1a]">
                  <div className="font-bold text-[17px] mb-1">{getPartTitle(activePart)}</div>
                  <div className="text-[17px]">
                    Read the passage and answer questions {qNumbers.length > 0 ? \`\${qNumbers[0]} - \${qNumbers[qNumbers.length - 1]}\` : ""}.
                  </div>
                </div>

                {submitError && (
                  <div className="mb-8 bg-red-50 text-red-700 border border-red-100 rounded p-4 font-medium">
                    {submitError}
                  </div>
                )}

                <div className="space-y-6 text-[#1a1a1a] pb-10">
                  {items.length === 0 ? (
                    <div className="py-12 border border-gray-200 border-dashed rounded bg-gray-50 text-center text-gray-500">
                      No questions mapped.
                    </div>
                  ) : (
                    items.map((it, idx) => (
                      <AnswerField key={String(idx)} item={it} answers={answers} setAnswers={setAnswers} focusedQn={focusedQn} setFocusedQn={setFocusedQn} />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div key={activePartIdx} id="main-scroll-container" className="w-full flex justify-center custom-scrollbar overflow-y-auto overflow-x-hidden relative" onClick={() => setFocusedQn(null)}>
            <div className="w-full bg-white pt-10 px-6 pb-32" onClick={(e) => e.stopPropagation()}>
\`;

txt = txt.slice(0, i2) + replacement + txt.slice(i2 + t2.length);
fs.writeFileSync(file, txt, 'utf8');
console.log('take page updated strictly');
