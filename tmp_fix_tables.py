import re

filepath = r'c:\Users\Admin\Desktop\thesis\my videos\thesis-toeic-system\_extras\question_types\_compiled\writing_theory.txt'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
in_table = False
row_acc = ""
base_indent = ""

def finish_row(row):
    # Fix instances of multiple <br> or trailing ones
    row = re.sub(r'(<br>)+', ' <br> ', row)
    row = re.sub(r' <br> \s*$', '', row)
    return row

for line in lines:
    stripped = line.strip()
    
    if not in_table:
        if stripped.startswith('|') and '---' in stripped:
            # We are in a table now! (Wait, the line before this is the header!)
            # So `in_table` should be True. But we already processed the header.
            new_lines.append(line)
            continue
        elif stripped.startswith('|'):
            # Potentially a header of a table
            in_table = True
            base_indent = line[:len(line) - len(line.lstrip())]
            row_acc = stripped
            if row_acc.endswith('|') and len(row_acc) > 1:
                new_lines.append(base_indent + finish_row(row_acc) + "\n")
                row_acc = ""
            continue
        else:
            new_lines.append(line)
    
    else:
        # We are inside a table structure
        if row_acc == "":
            if stripped.startswith('|'):
                row_acc = stripped
                base_indent = line[:len(line) - len(line.lstrip())]
                if row_acc.endswith('|') and len(row_acc) > 1:
                    new_lines.append(base_indent + finish_row(row_acc) + "\n")
                    row_acc = ""
            elif stripped == "":
                # End of table
                in_table = False
                new_lines.append(line)
            else:
                # Text that doesn't start with | and row is empty -> End of table
                in_table = False
                new_lines.append(line)
        else:
            # Accumulating
            if stripped == "":
                row_acc += "<br>"
            else:
                row_acc += "<br>" + stripped
                
            if row_acc.endswith('|'):
                new_lines.append(base_indent + finish_row(row_acc) + "\n")
                row_acc = ""

with open(r'c:\Users\Admin\Desktop\thesis\my videos\thesis-toeic-system\tmp_fix_tables(2).py', 'w', encoding='utf-8') as f:
    f.write("print('Done')")

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
