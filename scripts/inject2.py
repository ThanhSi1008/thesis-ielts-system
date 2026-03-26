import sys

def perform_take():
    file = 'frontend-web/src/app/ielts/intensive/[examId]/take/[sessionId]/page.tsx'
    with open(file, 'r', encoding='utf-8') as f:
        txt = f.read()
    
    with open('scripts/take-layout.txt', 'r', encoding='utf-8') as f:
        rep = f.read()

    t1 = ') : !exam ? ('
    i1 = txt.find(t1)
    
    t2 = ') : (\n          <div key={activePartIdx} id="main-scroll-container" className="w-full flex justify-center custom-scrollbar overflow-y-auto overflow-x-hidden relative" onClick={() => setFocusedQn(null)}>\n            <div className="w-full bg-white pt-10 px-6 pb-32" onClick={(e) => e.stopPropagation()}>'
    i2 = txt.find(t2, i1)
    
    if i2 != -1:
        txt = txt[:i2] + rep + txt[i2 + len(t2):]
        with open(file, 'w', encoding='utf-8') as f:
            f.write(txt)
        print("Take updated")
    else:
        print("Take anchor not found!")

def perform_result():
    file = 'frontend-web/src/app/ielts/intensive/[examId]/result/[sessionId]/page.tsx'
    with open(file, 'r', encoding='utf-8') as f:
        txt = f.read()
    
    with open('scripts/result-band.txt', 'r', encoding='utf-8') as f:
        rep_band = f.read()
    
    with open('scripts/result-layout.txt', 'r', encoding='utf-8') as f:
        rep_layout = f.read()
        
    t0 = 'function getIeltsBand(score: number): number {'
    i0 = txt.find(t0)
    if i0 != -1:
        ie = txt.find('}', i0) + 1
        txt = txt[:i0] + rep_band + txt[ie:]
        
    txt = txt.replace('const band = getIeltsBand(rawScore);', 'const band = exam.type === "READING" ? getIeltsReadingBand(rawScore) : getIeltsBand(rawScore);')
    
    t_right = '{/* Right: Transcript */}\n            <div key={`right-${activePartIdx}`} className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">\n              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Audio Transcript</div>\n              {transcript.length === 0 ? (\n                <p className="text-sm text-gray-400 italic">Transcript not available for this part.</p>\n              ) : (\n                <div className="space-y-3">'
    txt = txt.replace(t_right, rep_layout)
    
    t_close = '                  })}\n                </div>\n              )}\n            </div>'
    r_close = '                  })}\n                </div>\n              )}\n                </>\n              )}\n            </div>'
    txt = txt.replace(t_close, r_close)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(txt)
    print("Result updated")

perform_take()
perform_result()
