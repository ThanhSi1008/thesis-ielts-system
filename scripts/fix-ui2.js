const fs = require('fs');
const pt = 'frontend-web/src/app/ielts/intensive/[examId]/result/[sessionId]/page.tsx';
let d = fs.readFileSync(pt, 'utf8');

const s1 = '{/* Right: Transcript */}';
d = d.replace(s1, '{/* Right: Transcript or Passage */}');

const s2 = '<div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Audio Transcript</div>';
d = d.replace(s2, '{exam.type === "READING" ? (<><div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Reading Passage</div><div className="text-[15px] text-[#1a1a1a] leading-relaxed font-serif text-justify space-y-4 pb-20">{((parts[activePartIdx] as any)?.passage_text || "Passage text not available.").split("\\n").map((para: string, i: number) => (<p key={i}>{para}</p>))}</div></>) : (<><div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Audio Transcript</div>');

const s3 = '                  )}' + '\\n' + '                </>' + '\\n' + '              )}' + '\\n' + '            </div>';
d = d.replace(s3, '                  )}</>)}</div>');

fs.writeFileSync(pt, d, 'utf8');
console.log('Fixed UI in result page');
