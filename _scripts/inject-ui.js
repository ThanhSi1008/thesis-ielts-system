const fs = require('fs');

const takeFile = 'frontend-web/src/app/ielts/intensive/[examId]/take/[sessionId]/page.tsx';
let txtTake = fs.readFileSync(takeFile, 'utf8');

const t1 = ') : !exam ? (';
const i1 = txtTake.indexOf(t1);
const t2 = ') : (\\n          <div key={activePartIdx} id="main-scroll-container" className="w-full flex justify-center custom-scrollbar overflow-y-auto overflow-x-hidden relative" onClick={() => setFocusedQn(null)}>\\n            <div className="w-full bg-white pt-10 px-6 pb-32" onClick={(e) => e.stopPropagation()}>';
const i2 = txtTake.indexOf(t2, i1);

const replacementTake = fs.readFileSync('scripts/take-layout.txt', 'utf8');
txtTake = txtTake.slice(0, i2) + replacementTake + txtTake.slice(i2 + t2.length);
fs.writeFileSync(takeFile, txtTake, 'utf8');
console.log('Take page injected');

const resFile = 'frontend-web/src/app/ielts/intensive/[examId]/result/[sessionId]/page.tsx';
let txtRes = fs.readFileSync(resFile, 'utf8');

const t0 = 'function getIeltsBand(score: number): number {';
const iband = fs.readFileSync('scripts/result-band.txt', 'utf8');
const fnDecl = txtRes.substring(txtRes.indexOf(t0), txtRes.indexOf('}', txtRes.indexOf(t0)) + 1);
txtRes = txtRes.replace(fnDecl, iband);

txtRes = txtRes.replace('const band = getIeltsBand(rawScore);', 'const band = exam.type === "READING" ? getIeltsReadingBand(rawScore) : getIeltsBand(rawScore);');

const targetRight = \`{/* Right: Transcript */}
            <div key={\` + "\\\`" + 'right-${activePartIdx}' + "\\\`" + \`} className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Audio Transcript</div>
              {transcript.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Transcript not available for this part.</p>
              ) : (
                <div className="space-y-3">\`;

const repRight = fs.readFileSync('scripts/result-layout.txt', 'utf8');
txtRes = txtRes.replace(targetRight, repRight);

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
txtRes = txtRes.replace(closeTarget, closeRep);

fs.writeFileSync(resFile, txtRes, 'utf8');
console.log('Result page injected');
