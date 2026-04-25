import json
import re
import os
from datasets import load_dataset

def parse_band(text):
    try:
        return float(text.strip())
    except ValueError:
        return None

def parse_evaluation(text):
    scores = {}
    
    match_ta = re.search(r'\*\*Task Achievement:\s*\[?([\d\.]+)\]?\*\*', text)
    if not match_ta:
        match_ta = re.search(r'\*\*Task Response:\s*\[?([\d\.]+)\]?\*\*', text)
        
    match_cc = re.search(r'\*\*Coherence and Cohesion:\s*\[?([\d\.]+)\]?\*\*', text)
    match_lr = re.search(r'\*\*Lexical Resource:\s*\[?([\d\.]+)\]?\*\*', text)
    match_gra = re.search(r'\*\*Grammatical Range and Accuracy:\s*\[?([\d\.]+)\]?\*\*', text)
    
    try:
        if match_ta: scores['task_achievement'] = float(match_ta.group(1))
        if match_cc: scores['coherence_cohesion'] = float(match_cc.group(1))
        if match_lr: scores['lexical_resource'] = float(match_lr.group(1))
        if match_gra: scores['grammatical_range'] = float(match_gra.group(1))
    except ValueError:
        return None

    # Only return if all 4 are present
    if len(scores) == 4:
        return scores
    return None

def main():
    print("Loading dataset...")
    ds = load_dataset('chillies/IELTS-writing-task-2-evaluation', split='train')
    
    low_band = []   # 4.0 - 5.0
    mid_band = []   # 5.5 - 6.5
    high_band = []  # 7.0 - 9.0
    
    for idx, row in enumerate(ds):
        band = parse_band(row['band'])
        if band is None:
            continue
            
        sub_scores = parse_evaluation(row['evaluation'])
        if not sub_scores:
            continue
            
        essay_data = {
            "id": f"essay_{idx+1:03d}",
            "task_type": "task2",
            "prompt": row['prompt'],
            "essay": row['essay'],
            "human_scores": {
                "overall": band,
                "task_achievement": sub_scores['task_achievement'],
                "coherence_cohesion": sub_scores['coherence_cohesion'],
                "lexical_resource": sub_scores['lexical_resource'],
                "grammatical_range": sub_scores['grammatical_range']
            },
            "source": "chillies/IELTS-writing-task-2-evaluation"
        }
        
        if 4.0 <= band <= 5.0 and len(low_band) < 10:
            low_band.append(essay_data)
        elif 5.5 <= band <= 6.5 and len(mid_band) < 10:
            mid_band.append(essay_data)
        elif 7.0 <= band <= 9.0 and len(high_band) < 10:
            high_band.append(essay_data)
            
        if len(low_band) == 10 and len(mid_band) == 10 and len(high_band) == 10:
            break
            
    final_essays = low_band + mid_band + high_band
    
    output_dir = os.path.join('_extras', 'research_paper', 'llm_validation')
    os.makedirs(output_dir, exist_ok=True)
    
    output_path = os.path.join(output_dir, 'essays.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(final_essays, f, indent=2, ensure_ascii=False)
        
    print(f"Saved {len(final_essays)} essays to {output_path}")
    print(f"- Low band (4.0-5.0): {len(low_band)}")
    print(f"- Mid band (5.5-6.5): {len(mid_band)}")
    print(f"- High band (7.0-9.0): {len(high_band)}")

if __name__ == '__main__':
    main()
