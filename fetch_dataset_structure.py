from datasets import load_dataset
import json

ds = load_dataset('chillies/IELTS-writing-task-2-evaluation', split='train')
with open('dataset_structure.txt', 'w', encoding='utf-8') as f:
    f.write(json.dumps(ds[0], indent=2))
