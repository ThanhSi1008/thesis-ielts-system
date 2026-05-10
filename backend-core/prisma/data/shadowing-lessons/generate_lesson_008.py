import re
import json

input_file = r"c:\Users\Admin\Desktop\data\speech_to_timestamp\output\1.txt"
output_file = r"c:\Users\Admin\Desktop\thesis\merge\thesis-toeic-system\backend-core\prisma\data\shadowing-lessons\lesson-008-walts-deal-with-the-schwartzs-breaking-bad.ts"

with open(input_file, "r", encoding="utf-8") as f:
    lines = f.readlines()

sentences = []
sentence_id = 1

for line in lines:
    line = line.strip()
    if not line:
        continue
    
    # Example format: [00.00s -> 11.00s]  My children are...
    match = re.match(r"\[([\d\.]+)s -> ([\d\.]+)s\]\s+(.*)", line)
    if match:
        start = float(match.group(1))
        end = float(match.group(2))
        english = match.group(3).strip()
        
        # split words and strip basic punctuation (.,!?)
        raw_words = english.split()
        words = []
        for w in raw_words:
            cleaned = re.sub(r'[.,!?"]+$', '', w)
            cleaned = re.sub(r'^["]+', '', cleaned)
            if cleaned:
                words.append(cleaned)
                
        sentences.append({
            "id": sentence_id,
            "english": english,
            "phonetic": "",
            "vietnamese": "",
            "words": words,
            "audioStart": start,
            "audioEnd": end
        })
        sentence_id += 1

lesson = {
    "id": "8",
    "title": "Walt's Deal With The Schwartzs | Breaking Bad",
    "audioUrl": "",
    "youtubeVideoId": "CN6RkaJPAbI",
    "image": "https://img.youtube.com/vi/CN6RkaJPAbI/maxresdefault.jpg",
    "tags": [
        "YOUTUBE",
        "breaking-bad"
    ],
    "duration": "03:28", # Assuming around 208s -> 3 mins 28 sec
    "sentences": sentences
}

ts_content = "import { ShadowingLesson } from './types';\n\n"
ts_content += f"export const lesson008: ShadowingLesson = {json.dumps(lesson, indent=4)};\n"

with open(output_file, "w", encoding="utf-8") as f:
    f.write(ts_content)

print(f"Generated {output_file}")
