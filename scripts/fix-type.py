import sys

file = 'frontend-web/src/app/ielts/intensive/[examId]/result/[sessionId]/page.tsx'
with open(file, 'r', encoding='utf-8') as f:
    txt = f.read()

txt = txt.replace('exam.type === "READING"', 'exam?.type === "READING"')

with open(file, 'w', encoding='utf-8') as f:
    f.write(txt)
print("Optionally chained exam.type in Result view")
