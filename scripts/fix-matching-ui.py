import sys
import re

def update_take_ui():
    file = 'frontend-web/src/app/ielts/intensive/[examId]/take/[sessionId]/page.tsx'
    with open(file, 'r', encoding='utf-8') as f:
        txt = f.read()

    target_start = '          {/* Options Table */}\\n          <div className="border border-[#d2d2d2] max-w-2xl bg-white rounded-[2px] overflow-hidden mb-2">'
    replacement = '          {/* Options Table */}\\n          {Object.values(item.options || {}).some(v => v.trim() !== "") && (\\n          <div className="border border-[#d2d2d2] max-w-2xl bg-white rounded-[2px] overflow-hidden mb-2">'

    if target_start in txt and 'Object.values(item.options || {}).some' not in txt:
        txt = txt.replace(target_start, replacement)
        
        target_end = '              </tbody>\\n            </table>\\n          </div>\\n\\n        </div>\\n      </div>\\n    );\\n  }\\n\\n  // Plan labeling placeholder'
        repl_end = '              </tbody>\\n            </table>\\n          </div>\\n          )}\\n\\n        </div>\\n      </div>\\n    );\\n  }\\n\\n  // Plan labeling placeholder'
        txt = txt.replace(target_end, repl_end)

        with open(file, 'w', encoding='utf-8') as f:
            f.write(txt)
        print("take UI updated to hide empty options table")
    else:
        print("take UI target not found or already updated")

def update_seed():
    file = 'backend-core/prisma/seed.ts'
    with open(file, 'r', encoding='utf-8') as f:
        txt = f.read()

    # Find the Matching Information block in Cambridge 17 Test 1 array
    match_str = '"question_type": "Matching Information",\\n          "items": ['
    # We want to insert `"options_box"` above `"items": [`
    opts_box = '"options_box": { "options": { "A": "", "B": "", "C": "", "D": "", "E": "", "F": "", "G": "" } },\\n          "items": ['
    
    if match_str in txt:
        txt = txt.replace(match_str, opts_box)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(txt)
        print("seed.ts updated with options_box for Matching Information")
    else:
        print("seed.ts target not found")

update_take_ui()
update_seed()
