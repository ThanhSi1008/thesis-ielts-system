import fitz, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

doc = fitz.open(r'c:\Users\Admin\Desktop\thesis\merge\thesis-toeic-system\_extras\antigravity_plans\grammar\MUCLecture_2022_5217521.pdf')

# The "facebook.com/LinguaLIB" pages (347-383) are likely the answer key
print('=== PAGE 347 ===')
print(doc[347].get_text()[:2000])

print('\n=== PAGE 348 ===')
print(doc[348].get_text()[:2000])

print('\n=== PAGE 349 ===')
print(doc[349].get_text()[:2000])
