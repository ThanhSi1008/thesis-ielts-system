import asyncio
import json
import time
import sys
import os

# Add the backend-ai directory to path so we can import the grader
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "backend-ai")))  # llm_validation -> research_paper -> _extras -> root -> backend-ai

from app.services.writing_grader import grade_writing

import random

def round_to_half(value: float) -> float:
    return round(value * 2) / 2

async def grade_single_essay(essay: dict) -> dict:
    """Live grading using Gemini API with rate limiting."""
    human = essay["human_scores"]
    
    # We only have Task 2 in the dataset, pass empty strings for Task 1
    raw_result = await grade_writing(
        task1_prompt="",
        task2_prompt=essay["prompt"],
        task1_essay="",
        task2_essay=essay["essay"]
    )
    
    # The grade_writing returns a complex structure. We need to extract the Task 2 criterion bands.
    # The criteria are 'task_achievement', 'coherence_cohesion', 'lexical_resource', 'grammatical_range_and_accuracy'
    task2_criteria = raw_result["task2"]["criteria"]
    
    llm_scores = {
        "overall": raw_result.get("overall_band", raw_result["task2"].get("band", 0.0)),
        "task_achievement": task2_criteria["task_achievement"]["band"],
        "coherence_cohesion": task2_criteria["coherence_cohesion"]["band"],
        "lexical_resource": task2_criteria["lexical_resource"]["band"],
        "grammatical_range": task2_criteria["grammatical_range_and_accuracy"]["band"],
    }
    
    # Add a delay to respect API rate limits
    await asyncio.sleep(4.0)
    
    return {
        "id": essay["id"],
        "human": human,
        "llm": llm_scores,
    }


async def main():
    # Paths — everything lives in llm_validation/
    script_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(script_dir, "essays.json")
    os.makedirs(os.path.join(script_dir, "results"), exist_ok=True)
    results_path = os.path.join(script_dir, "results", "grading_results.json")

    with open(dataset_path, "r", encoding="utf-8") as f:
        essays = json.load(f)
    
    results = []
    for i, essay in enumerate(essays):
        print(f"Grading essay {i+1}/{len(essays)}: {essay['id']}...")
        result = await grade_single_essay(essay)
        results.append(result)
        print(f"  Human: {result['human']['overall']}  LLM: {result['llm']['overall']}")
    
    with open(results_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    
    print(f"\nDone! {len(results)}/{len(essays)} essays graded successfully.")
    print(f"Results saved to: {results_path}")


if __name__ == "__main__":
    asyncio.run(main())
