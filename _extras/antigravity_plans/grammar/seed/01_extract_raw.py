import fitz
import sys
import io
import json
import re
import os

# Set encoding for Windows console if needed
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

PDF_PATH = r'c:\Users\Admin\Desktop\thesis\merge\thesis-toeic-system\_extras\antigravity_plans\grammar\MUCLecture_2022_5217521.pdf'
OUTPUT_DIR = r'c:\Users\Admin\Desktop\thesis\merge\thesis-toeic-system\_extras\antigravity_plans\grammar\seed\output'

os.makedirs(OUTPUT_DIR, exist_ok=True)

def extract_raw_data():
    print("Opening PDF...")
    doc = fitz.open(PDF_PATH)
    
    units = {}
    
    print("Extracting Theory and Exercises (Pages 13-302)...")
    for unit_num in range(1, 146):
        theory_page_idx = 13 + (unit_num - 1) * 2
        exercise_page_idx = theory_page_idx + 1
        
        theory_text = doc[theory_page_idx].get_text()
        exercise_text = doc[exercise_page_idx].get_text()
        
        # Extract title from the first line of the theory page
        lines = [line.strip() for line in theory_text.split('\n') if line.strip()]
        title = lines[0] if lines else f"Unit {unit_num}"
        
        # Sometimes 'Unit' comes first
        if title.lower() == 'unit' and len(lines) > 2:
            title = lines[2]
            
        units[str(unit_num)] = {
            "unit": unit_num,
            "title": title,
            "theory_raw": theory_text,
            "exercises_raw": exercise_text,
            "answers_raw": {}
        }
    
    print("Extracting Answer Key (Pages 347-383)...")
    # Concatenate all answer key pages
    answer_text_full = ""
    for p in range(347, 384):
        answer_text_full += doc[p].get_text() + "\n"
        
    # Remove page headers/footers to clean up
    answer_text_full = re.sub(r'facebook\.com/LinguaLIB\s*vk\.com/lingualib', '', answer_text_full)
    answer_text_full = re.sub(r'Key to Exercises\n', '', answer_text_full)
    
    # Split by UNIT N
    # Pattern looks for 'UNIT 1\n', 'UNIT 2\n', etc.
    unit_chunks = re.split(r'\nUNIT (\d+)\n', "\n" + answer_text_full)
    
    # unit_chunks[0] is garbage before UNIT 1
    # unit_chunks[1] is '1'
    # unit_chunks[2] is the text for UNIT 1, etc.
    
    for i in range(1, len(unit_chunks), 2):
        u_num_str = unit_chunks[i]
        u_text = unit_chunks[i+1]
        
        if u_num_str in units:
            # Now split by section markers like 1.1, 1.2, 1.3
            # Pattern: \n1.1\n
            section_pattern = r'\n(' + u_num_str + r'\.\d+)\n'
            sections = re.split(section_pattern, "\n" + u_text)
            
            # sections[0] is garbage before first section
            answers_dict = {}
            for j in range(1, len(sections), 2):
                sec_num = sections[j]
                sec_text = sections[j+1].strip()
                answers_dict[sec_num] = sec_text
                
            units[u_num_str]["answers_raw"] = answers_dict
            
    # Save to JSON
    out_file = os.path.join(OUTPUT_DIR, 'raw_units.json')
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(units, f, indent=2, ensure_ascii=False)
        
    print(f"Extraction complete! Saved to {out_file}")

if __name__ == "__main__":
    extract_raw_data()
