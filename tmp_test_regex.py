import re

with open(r'c:\Users\Admin\Desktop\thesis\my videos\thesis-toeic-system\_extras\question_types\_compiled\writing_theory.txt', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.replace('\r', '').split('\n')
for line in lines:
    if line.startswith('            - '):
        trimmed = line.replace('            ', '', 1)
        # Check if it's a subheading
        match = re.match(r'^- (.+)$', trimmed)
        if match:
            print("MATCHED SUBHEAD:", match.group(1))

