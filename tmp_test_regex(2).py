import re

with open(r'c:\Users\Admin\Desktop\thesis\my videos\thesis-toeic-system\_extras\question_types\_compiled\writing_theory.txt', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.replace('\r', '').split('\n')
inContent = False

for line in lines:
    if line.startswith('    - Change Over Time'):
        inContent = True
    if line.startswith('    - Quiz'):
        inContent = False
        
    if inContent and line.startswith('            '):
        trimmed = re.sub(r'^ {12,16}', '', line)
        print("ORIG:", repr(line))
        print("TRIM:", repr(trimmed))

