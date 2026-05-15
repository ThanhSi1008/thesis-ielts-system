import json
import os

INPUT_FILE = r'c:\Users\Admin\Desktop\thesis\merge\thesis-toeic-system\_extras\antigravity_plans\grammar\seed\output\structured_units.json'
OUTPUT_FILE = r'c:\Users\Admin\Desktop\thesis\merge\thesis-toeic-system\backend-core\prisma\data\grammar-intermediate.json'

def generate():
    print(f"Loading {INPUT_FILE}...")
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    out_data = {
        "content": {},
        "units": []
    }
    
    for u_num in sorted([int(k) for k in data.keys()]):
        u_str = str(u_num)
        unit = data[u_str]
        
        out_data["content"][u_str] = {
            "theory": unit["theory"],
            "exercises": unit["exercises"]
        }
        
        out_data["units"].append({
            "title": unit["title"],
            "order": u_num
        })
        
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(out_data, f, indent=2, ensure_ascii=False)
        
    print(f"Seed JSON generated! Saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    generate()
