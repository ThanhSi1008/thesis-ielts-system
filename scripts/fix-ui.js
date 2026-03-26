const fs = require('fs');
const path = 'frontend-web/src/app/ielts/intensive/[examId]/result/[sessionId]/page.tsx';
let txt = fs.readFileSync(path, 'utf8');

const anchorStart = '{/* Right: Transcript */}';
if (txt.includes(anchorStart)) {
  const startIdx = txt.indexOf(anchorStart);
  const endAnchor = '          </div>\\n        </div>\\n      )}\\n    </div>\\n  );\\n}';
  const endIdx = txt.indexOf('          </div>\\n        </div>\\n      )}\\n    </div>\\n  );\\n}', startIdx);

  if (endIdx !== -1) {
    const originalBlock = txt.slice(startIdx, endIdx);
    
    // We already accidentally inserted `)} </> )}` at the bottom of the block from chunk 1!
    // So we just replace the whole block clean!
    
    const newBlock = \`{/* Right: Transcript or Passage */}
            <div key={\\\`right-\\\${activePartIdx}\\\`} className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
              {exam.type === "READING" ? (
                <>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Reading Passage</div>
                  <div className="text-[15px] text-[#1a1a1a] leading-relaxed font-serif text-justify space-y-4 pb-20">
                    {((parts[activePartIdx] as any)?.passage_text || "Passage text not available.").split('\\\\n').map((para: string, i: number) => (
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
                    <div className="space-y-3">
                      {transcript.map((line: any, idx: number) => {
                        const hasQ = line.question_number != null;
                        return (
                          <div
                            key={idx}
                            ref={(el) => { if (hasQ) transcriptRefs.current[line.question_number] = el; }}
                            className={\\\`text-sm leading-relaxed \\\${hasQ ? "scroll-mt-4" : ""}\\\`}
                          >
                            <span className="font-bold text-gray-500 mr-2 text-xs uppercase tracking-wide">{line.speaker}:</span>
                            {hasQ ? (
                              <span>
                                {(() => {
                                  const markers = line.question_markers || [{ question_number: line.question_number, highlight_text: line.highlight_text }];
                                  let resultElements: React.ReactNode[] = [line.text];
    
                                  markers.forEach((marker: any) => {
                                    if (!marker.highlight_text) return;
    
                                    const nextElements: React.ReactNode[] = [];
                                    const escaped = String(marker.highlight_text).replace(/[.*+?^\\\${}()|[\\\\]\\\\\\\\]/g, "\\\\\\\\$&");
                                    const re = new RegExp(\\\`(\\\${escaped})\\\`, "i");
    
                                    resultElements.forEach((el, index) => {
                                      if (typeof el === "string") {
                                        const strings = el.split(re);
                                        strings.forEach((part, pi) => {
                                          if (re.test(part)) {
                                            nextElements.push(
                                              <mark key={\\\`\\\${marker.question_number}-\\\${index}-\\\${pi}\\\`} className="bg-yellow-200 text-yellow-900 px-0.5 rounded font-semibold">
                                                {part}
                                                <sup className="ml-0.5 text-[10px] font-bold text-amber-600">Q{marker.question_number}</sup>
                                              </mark>
                                            );
                                          } else {
                                            if (part) nextElements.push(part);
                                          }
                                        });
                                      } else {
                                        nextElements.push(el);
                                      }
                                    });
                                    resultElements = nextElements;
                                  });
    
                                  return resultElements;
                                })()}
                              </span>
                            ) : (
                              <span className="text-gray-700">{line.text}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
\`;
    txt = txt.slice(0, startIdx) + newBlock + txt.slice(endIdx);
    fs.writeFileSync(path, txt, 'utf8');
    console.log('Result Page Updated!');
  } else {
    console.log('End anchor not found!');
  }
} else {
  console.log('Start anchor not found!');
}
