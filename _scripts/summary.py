import sys
import re

def update_parser_types():
    file = 'frontend-web/src/lib/exam-parser.ts'
    with open(file, 'r', encoding='utf-8') as f:
        txt = f.read()
    
    # 1. Add summary_completion to NormalizedItem
    summary_type = r'''  | {
      kind: "summary_completion";
      qns: number[];
      text: string;
      heading?: string;
      options?: Record<string, string>;
    }'''
    
    if '"summary_completion"' not in txt:
        # insert before export function
        txt = txt.replace('export function extractAllItemsFromPart', summary_type + '\\n)\\n\\nexport function extractAllItemsFromPart')
        # also need to remove the closing ) from the original type union?
        # The original ends with: } \n ); \n\n export function...
        # Let's cleanly replace
        txt = txt.replace('    }\n);\n\nexport function', '    }\n' + summary_type + '\n);\n\nexport function')
        print("Inserted type")
        with open(file, 'w', encoding='utf-8') as f:
            f.write(txt)

def update_parser_parseContentList():
    file = 'frontend-web/src/lib/exam-parser.ts'
    with open(file, 'r', encoding='utf-8') as f:
        txt = f.read()
    
    # We need to change the logic in parseContentList.
    # Currently:
    #      } else if (Array.isArray(block?.points)) {
    #        ...
    #      }
    # We inject logic: if block.text exists and block.points has questions without text, it's a summary!
    
    logic_to_add = '''      } else if (Array.isArray(block?.points)) {
        const hasBlockText = typeof block.text === "string" && block.text.trim().length > 0;
        const allPointsLackText = block.points.every((p: any) => typeof p?.question_number === "number" && !p.text);
        
        if (hasBlockText && allPointsLackText) {
            const qns = block.points.map((p: any) => p.question_number).filter((n: any) => typeof n === "number");
            if (qns.length > 0) {
                items.push({
                    kind: "summary_completion",
                    qns,
                    text: block.text,
                    heading: heading || block.heading,
                    // options will be attached later if this group has an options_box
                });
                continue;
            }
        }
        
        let precedingText: string[] = [];'''
        
    old_logic = '''      } else if (Array.isArray(block?.points)) {
        let precedingText: string[] = [];'''
    
    if 'kind: "summary_completion"' not in txt[txt.find('parseContentList'):]:
        txt = txt.replace(old_logic, logic_to_add)
        
        # We also need to map options to summary_completion items if the group has options!
        # In extractAllItemsFromPart, at the end of `for (const g of part.question_groups) {`:
        attach_options_code = '''
      // Attach options to summary_completion items if the group has options_box
      const optionsBox = g?.options_box?.options;
      if (optionsBox && Object.keys(optionsBox).length > 0) {
          for (let i = groupStartIdx; i < items.length; i++) {
              if (items[i].kind === "summary_completion") {
                  (items[i] as any).options = optionsBox;
              }
          }
      }
      if (g?.topic && items.length > groupStartIdx) items[groupStartIdx].topic = g.topic;'''
        
        old_topic_attach = 'if (g?.topic && items.length > groupStartIdx) items[groupStartIdx].topic = g.topic;'
        txt = txt.replace(old_topic_attach, attach_options_code)
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(txt)
        print("Updated parseContentList")

def update_take_ansfield():
    file = 'frontend-web/src/app/ielts/intensive/[examId]/take/[sessionId]/page.tsx'
    with open(file, 'r', encoding='utf-8') as f:
        txt = f.read()
    
    # We insert the summary_completion renderer above matching_group
    
    summary_ui = '''  // Summary Completion
  if (item.kind === "summary_completion") {
    // We split the item.text by numeric blanks e.g. "18 [blank]" or just "18" followed by blank
    const textPieces: React.ReactNode[] = [];
    const regex = /(\\d+)\\s*\\[blank\\]/g;
    let lastIndex = 0;
    
    // We will parse the string manually
    const str = item.text || "";
    let match;
    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        textPieces.push(<span key={\`text-\${lastIndex}\`}>{str.substring(lastIndex, match.index)}</span>);
      }
      const qNum = parseInt(match[1]);
      const key = String(qNum);
      const value = typeof answers[key] === "string" ? answers[key] : "";
      
      textPieces.push(
        <span key={\`input-\${qNum}\`} className="inline-flex items-center gap-1 mx-1 align-middle">
          <span className="text-[12px] font-bold text-gray-500 bg-gray-100 rounded-full px-1.5 py-0.5">{qNum}</span>
          <input
            value={value}
            onFocus={() => setFocusedQn(qNum)}
            onChange={(e) => setAnswers({ ...answers, [key]: e.target.value })}
            className={\`w-32 h-[26px] py-0 px-2 text-[15px] font-bold text-[#1a1a1a] border border-[#b5b5b5] rounded-[3px] shadow-inner focus:outline-none transition-colors \${focusedQn === qNum ? "border-[#2181d8] ring-[1px] ring-[#2181d8] bg-[#f0f9ff]" : "hover:border-[#8e8e8e] bg-white"}\`}
          />
        </span>
      );
      
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < str.length) {
      textPieces.push(<span key={\`text-\${lastIndex}\`}>{str.substring(lastIndex)}</span>);
    }

    const firstQn = item.qns[0];
    const isFocused = item.qns.includes(focusedQn || -1);

    return (
      <div id={\`question-\${firstQn}\`} className="py-6 border-b border-[#e2e1df] last:border-0 relative">
        {item.topic && <div className="font-extrabold text-[18px] text-center mb-6 text-[#111111]">{item.topic}</div>}
        <div className="flex flex-col text-[#1a1a1a]">
          <div className="flex items-start mb-4">
             <QnBadge n={firstQn} txt={item.qns.length > 1 ? \`\${firstQn} - \${item.qns[item.qns.length - 1]}\` : String(firstQn)} isFocused={isFocused} />
          </div>
          
          <div className="border border-[#e2e1df] bg-[#fdfdfd] p-6 rounded-[2px] mb-4">
            {item.heading && <div className="font-bold text-[16px] uppercase mb-4 text-center">{item.heading}</div>}
            <div className="text-[16px] leading-[2.1] font-medium text-[#2d2d2d] text-justify">
              {textPieces}
            </div>
          </div>
          
          {item.options && Object.keys(item.options).length > 0 && (
            <div className="border border-[#d2d2d2] max-w-2xl bg-white rounded-[2px] overflow-hidden mb-2 mt-2">
              <div className="bg-[#fcfcfc] border-b border-[#d2d2d2] p-3.5 font-bold text-[14px] uppercase tracking-wide">
                Options
              </div>
              <table className="w-full border-collapse">
                <tbody>
                  {Object.entries(item.options).map(([k, v]) => (
                    <tr key={k} className="border-b border-[#e5e5e5] last:border-0 hover:bg-[#f9f9f9] transition-colors">
                      <td className="p-3.5 w-[56px] font-bold text-[16px] border-r border-[#d2d2d2] text-center">{k}</td>
                      <td className="p-3.5 text-[15px]">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Matching Group (Grid)'''

    if 'item.kind === "summary_completion"' not in txt:
        txt = txt.replace('  // Matching Group (Grid)', summary_ui)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(txt)
        print("Updated AnswerField for summary_completion")

update_parser_types()
update_parser_parseContentList()
update_take_ansfield()
