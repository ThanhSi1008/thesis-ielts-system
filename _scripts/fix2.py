import sys
import re

def update_take_ui():
    file = 'frontend-web/src/app/ielts/intensive/[examId]/take/[sessionId]/page.tsx'
    with open(file, 'r', encoding='utf-8') as f:
        txt = f.read()

    # We want to conditionally render the Options Table.
    # We find: {/* Options Table */}
    # followed by <div className="border border-[#d2d2d2] ...
    
    # Let's match it with regex
    pattern = r'(\\{\/\\* Options Table \\*\\/\\}\\s*)<div className="border border-\\[#d2d2d2\\] max-w-2xl bg-white rounded-\\[2px\\] overflow-hidden mb-2">'
    replacement = r'\1{Object.values(item.options || {}).some(v => v.trim() !== "") && (\n          <div className="border border-[#d2d2d2] max-w-2xl bg-white rounded-[2px] overflow-hidden mb-2">'
    
    if re.search(pattern, txt):
        txt = re.sub(pattern, replacement, txt)
        # Now find the end of the Option Table div. It ends before Plan labeling.
        # Find: </tbody>\n            </table>\n          </div>\n\n        </div>\n      </div>\n    );\n  }\n\n  // Plan labeling placeholder
        end_pattern = r'(</tbody>\s*</table>\s*</div>)(\s*</div>\s*</div>\s*\);\s*}\s*// Plan labeling placeholder)'
        txt = re.sub(end_pattern, r'\1\n          )}\2', txt)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(txt)
        print("take UI updated with regex")
    else:
        print("take UI pattern not found")

def update_seed():
    file = 'backend-core/prisma/seed.ts'
    with open(file, 'r', encoding='utf-8') as f:
        txt = f.read()

    pattern = r'("question_type":\s*"Matching Information",\s*)("items":\s*\[)'
    replacement = r'\1"options_box": { "options": { "A": "", "B": "", "C": "", "D": "", "E": "", "F": "", "G": "" } },\n          \2'
    
    if re.search(pattern, txt):
        txt = re.sub(pattern, replacement, txt)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(txt)
        print("seed.ts updated with regex")
    else:
        print("seed pattern not found")

update_take_ui()
update_seed()
