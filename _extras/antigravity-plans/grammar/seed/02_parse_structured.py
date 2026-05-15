import json
import re
import os

INPUT_FILE = r'c:\Users\Admin\Desktop\thesis\merge\thesis-toeic-system\_extras\antigravity_plans\grammar\seed\output\raw_units.json'
OUTPUT_FILE = r'c:\Users\Admin\Desktop\thesis\merge\thesis-toeic-system\_extras\antigravity_plans\grammar\seed\output\structured_units.json'

def parse_theory(raw_text):
    # Remove "Unit\nN\n" pattern
    text = re.sub(r'Unit\n\d+\n', '', raw_text)
    
    # Simple semantic wrapper preserving whitespace
    # We use a white-space pre-wrap div so the layout is somewhat retained
    html = f'<div class="grammar-theory" style="white-space: pre-wrap; font-family: sans-serif; line-height: 1.6;">\n{text.strip()}\n</div>'
    
    # Make section letters bold 
    html = re.sub(r'\n([A-E])\n', r'\n<h3 class="text-xl font-bold mt-6 mb-2 text-primary">\1</h3>\n', html)
    
    return html

def parse_exercises(unit_num, raw_text, answers_raw):
    exercises = []
    
    # Split by section marker (e.g. \n1.1\n or \n1.1 )
    section_pattern = r'\n(' + str(unit_num) + r'\.\d+)[\s\n]+'
    parts = re.split(section_pattern, "\n" + raw_text)
    
    for i in range(1, len(parts), 2):
        sec_num = parts[i]
        sec_text = parts[i+1].strip()
        
        lines = [line.strip() for line in sec_text.split('\n') if line.strip()]
        if not lines: continue
        
        question = lines[0]
        
        # Determine items
        # Find numbered items: \n1 , \n2 , etc.
        item_pattern = r'\n(\d+)\s+'
        item_parts = re.split(item_pattern, "\n" + sec_text)
        
        items = []
        options = None
        
        # item_parts[0] contains the question and potentially the verb options
        header_text = item_parts[0].strip()
        header_lines = [line.strip() for line in header_text.split('\n') if line.strip()]
        
        # If there are lines after the question before item 1, they might be options
        if len(header_lines) > 1:
            verbs = []
            for hl in header_lines[1:]:
                # simple split by multiple spaces
                verbs.extend([v.strip() for v in re.split(r'\s{2,}', hl) if v.strip()])
            if verbs:
                options = {"verbs": verbs}
        
        # Parse items
        # answers_raw mapping: answers_raw[sec_num] is a string like "2 He's tying\n3 They're crossing"
        ans_text = answers_raw.get(sec_num, "")
        
        # Extract answers into a dictionary: { "2": "He's tying", "3": "They're crossing" }
        # Need to handle multi-line answers if any. Let's do a simple parse:
        ans_dict = {}
        if ans_text:
            ans_lines = ans_text.split('\n')
            for aline in ans_lines:
                match = re.match(r'^(\d+)\s+(.*)', aline.strip())
                if match:
                    ans_dict[match.group(1)] = match.group(2).strip()
                else:
                    # letter matching like "2 e", "3 g"
                    match_letter = re.match(r'^(\d+)\s+([a-zA-Z])(?:\.|$)', aline.strip())
                    if match_letter:
                         ans_dict[match_letter.group(1)] = match_letter.group(2).strip()
        
        # Process items
        exercise_type = 'fill_blank'
        
        for j in range(1, len(item_parts), 2):
            item_num = item_parts[j]
            item_text = item_parts[j+1].strip()
            
            # Remove any trailing "Exercises" or page number garbage
            item_text = re.sub(r'\nExercises\n\d+$', '', item_text).strip()
            item_text = re.sub(r'\n\d+$', '', item_text).strip()
            
            # The item text usually contains the example answer if it's item 1
            is_example = (item_num == '1')
            
            # Default to fill_blank but detect if it's matching
            # Matching usually has left column items and right column items, often not parsed cleanly
            # If the item text is just a sentence, we replace parts of it with ________ to make it fill_blank?
            # Actually, our schema stores `label` and `answer`.
            
            # In TOEIC app schema, fill_blank items have `label` with "________".
            # For simplicity, we just use the item_text as label and answer from the key.
            # If item_text doesn't have a blank, let's prepend or append the blank.
            label = item_text
            if "________" not in label and "____" not in label and "_" not in label:
                 # Just a heuristic to put a blank where an answer might go
                 pass 
                 
            # If it's a match exercise
            if 'goes with which' in question.lower() or 'match' in question.lower():
                 exercise_type = 'match'
                 
            ans = ans_dict.get(item_num, "")
            # If it's item 1 and it's the example, we might not have an answer in the key
            # or the answer is in the text itself.
            if is_example and not ans:
                 ans = "" # It's an example, user doesn't need to answer it
                 
            # Take primary answer if multiple (e.g. "He's tying / He is tying")
            if ' / ' in ans:
                 ans = ans.split(' / ')[0].strip()
                 
            items.append({
                "label": label,
                "answer": ans,
                "isExample": is_example
            })
            
        exercises.append({
            "id": sec_num,
            "question": question,
            "type": exercise_type,
            "options": options,
            "items": items
        })
        
    return exercises

def process():
    print("Loading raw_units.json...")
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)
        
    structured = {}
    
    print("Parsing theory and exercises...")
    for u_num, unit in raw_data.items():
        # print(f"Processing Unit {u_num}...")
        
        theory_html = parse_theory(unit["theory_raw"])
        exercises = parse_exercises(u_num, unit["exercises_raw"], unit["answers_raw"])
        
        # Better title extraction
        title = unit["title"]
        lines = unit["theory_raw"].split('\n')
        # Find Unit\nN\n
        unit_idx = -1
        for i, l in enumerate(lines):
            if l.strip() == 'Unit' and i+1 < len(lines) and lines[i+1].strip() == u_num:
                unit_idx = i
                break
        if unit_idx != -1:
            if unit_idx > 0 and '➜' not in lines[unit_idx-1]:
                title = lines[unit_idx-1].strip()
            elif unit_idx + 2 < len(lines) and len(lines[unit_idx+2].strip()) > 3 and not lines[unit_idx+2].startswith('Study'):
                title = lines[unit_idx+2].strip()
        
        structured[u_num] = {
            "unit": unit["unit"],
            "title": title,
            "theory": theory_html,
            "exercises": exercises
        }
        
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(structured, f, indent=2, ensure_ascii=False)
        
    print(f"Parsing complete! Saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    process()
