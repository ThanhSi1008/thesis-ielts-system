import re

path = r'c:\Users\Admin\Desktop\thesis\my videos\thesis-toeic-system\_extras\question_types\_compiled\writing_theory.txt'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    # If the line contains a cloudinary url and doesn't already have markdown image syntax
    if 'https://res.cloudinary.com' in line and '![](' not in line:
        lines[i] = re.sub(r'(https://res\.cloudinary\.com[^\s]+)', r'![](\1)', line)

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Replaced successfully")
