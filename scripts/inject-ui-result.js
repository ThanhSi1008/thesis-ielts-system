const fs = require('fs');
const file = 'frontend-web/src/app/ielts/intensive/[examId]/result/[sessionId]/page.tsx';
let txt = fs.readFileSync(file, 'utf8');

const t0 = 'function getIeltsBand(score: number): number {';
const iband = \\`function getIeltsBand(score: number): number {
  if (score >= 39) return 9.0;
  if (score >= 37) return 8.5;
  if (score >= 35) return 8.0;
  if (score >= 32) return 7.5;
  if (score >= 30) return 7.0;
  if (score >= 26) return 6.5;
  if (score >= 23) return 6.0;
  if (score >= 18) return 5.5;
  if (score >= 16) return 5.0;
  if (score >= 13) return 4.5;
  if (score >= 10) return 4.0;
  if (score >= 8) return 3.5;
  if (score >= 6) return 3.0;
  if (score >= 4) return 2.5;
  if (score >= 2) return 2.0;
  return 1.0;
}

function getIeltsReadingBand(score: number): number {
  if (score >= 39) return 9.0;
  if (score >= 37) return 8.5;
  if (score >= 35) return 8.0;
  if (score >= 33) return 7.5;
  if (score >= 30) return 7.0;
  if (score >= 27) return 6.5;
  if (score >= 23) return 6.0;
  if (score >= 19) return 5.5;
  if (score >= 15) return 5.0;
  if (score >= 13) return 4.5;
  if (score >= 10) return 4.0;
  if (score >= 8) return 3.5;
  if (score >= 6) return 3.0;
  if (score >= 4) return 2.5;
  if (score >= 2) return 2.0;
  return 1.0;
}\\`;

// band score declaration
const fnDecl = txt.substring(txt.indexOf(t0), txt.indexOf('}', txt.indexOf(t0)) + 1);
txt = txt.replace(fnDecl, iband);

// band score invocation
txt = txt.replace('const band = getIeltsBand(rawScore);', 'const band = exam.type === "READING" ? getIeltsReadingBand(rawScore) : getIeltsBand(rawScore);');

// right pane
const rightStart = '{/* Right: Transcript */}';
const targetRight = \`{/* Right: Transcript */}
            <div key={\` + "\\\`" + 'right-${activePartIdx}' + "\\\`" + \`} className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Audio Transcript</div>
              {transcript.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Transcript not available for this part.</p>
              ) : (
                <div className="space-y-3">\`;
                
const repRight = \`{/* Right: Transcript or Passage */}
            <div key={\` + "\\\`" + 'right-${activePartIdx}' + "\\\`" + \`} className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
              {exam.type === "READING" ? (
                <>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Reading Passage</div>
                  <div className="text-[15px] text-[#1a1a1a] leading-relaxed font-serif text-justify space-y-4 pb-20">
                    {((parts[activePartIdx] as any)?.passage_text || "Passage text not available.").split('\\n').map((para: string, i: number) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Audio Transcript</div>
                  {transcript.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Transcript not available for this part.</p>
                  ) : (
                    <div className="space-y-3">\`;

txt = txt.replace(targetRight, repRight);

// close tags
const closeTarget = \`                  })}
                </div>
              )}
            </div>\`;
const closeRep = \`                  })}
                </div>
              )}
                </>
              )}
            </div>\`;
txt = txt.replace(closeTarget, closeRep);

fs.writeFileSync(file, txt, 'utf8');
console.log('result page updated strictly');
