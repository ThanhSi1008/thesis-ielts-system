import sys

files = [
    'frontend-web/src/app/ielts/intensive/[examId]/take/[sessionId]/page.tsx',
    'frontend-web/src/app/ielts/intensive/[examId]/result/[sessionId]/page.tsx'
]

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        txt = f.read()

    txt = txt.replace('const parts = item.text.split(', 'const parts = (item.text || "").split(')

    with open(file, 'w', encoding='utf-8') as f:
        f.write(txt)
    print(f"Fixed {file}")
