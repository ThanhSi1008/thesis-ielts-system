"""
=============================================================================
  Writing Grading Experiment — REAL Gemini API (Lightweight)
  IELTS Master English AI -- Thesis Defense
=============================================================================

Calls Gemini 2.5 Flash directly with a simplified prompt that returns
ONLY band scores (no mistakes/corrections) to avoid JSON parse errors.

Features:
  - Resumes from existing grading_results.json
  - Retries failed essays up to 3 times
  - 5s wait between requests (fresh API key quota)

RUN:
    python run_experiment.py
    python run_demo.py          # analyze + charts
=============================================================================
"""

import asyncio
import json
import os
import sys
import re
import time

from dotenv import load_dotenv

# Load .env from backend-ai
backend_ai_path = os.path.abspath(os.path.join(
    os.path.dirname(__file__), "..", "..", "..", "backend-ai"
))
load_dotenv(os.path.join(backend_ai_path, ".env"))

from google import genai
from google.genai import types

API_KEY = os.getenv("GEMINI_API_KEY", "")
MODEL = "gemini-2.5-flash"

client = genai.Client(api_key=API_KEY)

# Simplified prompt — only returns band scores, no mistake details
SYSTEM_PROMPT = """You are an expert IELTS examiner. Grade the following IELTS Writing Task 2 essay strictly according to the official IELTS band descriptors.

For EACH of the four criteria, provide a band score from 1.0 to 9.0 (in 0.5 increments).

Calculate the overall band as the mean of the 4 criteria (rounded to nearest 0.5).

Respond ONLY with valid JSON in this EXACT shape, no extra text:
{
  "overall_band": 6.5,
  "task_achievement": 6.5,
  "coherence_and_cohesion": 6.0,
  "lexical_resource": 6.5,
  "grammatical_range_and_accuracy": 6.5
}"""


def round_to_half(value: float) -> float:
    return round(value * 2) / 2


async def grade_essay(prompt: str, essay: str) -> dict:
    """Call Gemini API and return band scores."""
    user_message = f"## Task Prompt\n{prompt}\n\n## Candidate's Essay\n{essay}"

    response = await client.aio.models.generate_content(
        model=MODEL,
        contents=user_message,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            temperature=0.2,
            response_mime_type="application/json",
        ),
    )

    raw = response.text.strip()
    result = json.loads(raw)

    # Recalculate overall for consistency
    bands = [
        result["task_achievement"],
        result["coherence_and_cohesion"],
        result["lexical_resource"],
        result["grammatical_range_and_accuracy"],
    ]
    result["overall_band"] = round_to_half(sum(bands) / len(bands))

    return result


async def grade_single_essay(essay: dict, max_retries: int = 3) -> dict:
    """Grade one essay with retry logic."""
    for attempt in range(1, max_retries + 1):
        try:
            scores = await grade_essay(essay["prompt"], essay["essay"])

            llm_scores = {
                "overall": scores["overall_band"],
                "task_achievement": scores["task_achievement"],
                "coherence_cohesion": scores["coherence_and_cohesion"],
                "lexical_resource": scores["lexical_resource"],
                "grammatical_range": scores["grammatical_range_and_accuracy"],
            }

            return {
                "id": essay["id"],
                "human": essay["human_scores"],
                "llm": llm_scores,
            }

        except Exception as e:
            err = str(e)
            if "429" in err or "RESOURCE_EXHAUSTED" in err:
                wait = 90
                print(f"[rate limit, wait {wait}s]", end=" ", flush=True)
                await asyncio.sleep(wait)
                continue

            if attempt < max_retries:
                print(f"[err retry {attempt}/{max_retries}]", end=" ", flush=True)
                await asyncio.sleep(5)
                continue

            print(f"[FAILED: {err[:80]}]", end=" ", flush=True)

    return {
        "id": essay["id"],
        "human": essay["human_scores"],
        "llm": {"overall": 0.0, "task_achievement": 0.0, "coherence_cohesion": 0.0,
                "lexical_resource": 0.0, "grammatical_range": 0.0},
    }


async def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))

    essays_path = os.path.normpath(os.path.join(
        script_dir, "..", "..", "research-paper", "llm_validation", "essays.json"
    ))

    if not os.path.exists(essays_path):
        print(f"  ERROR: Cannot find essays.json at: {essays_path}")
        return

    with open(essays_path, "r", encoding="utf-8") as f:
        essays = json.load(f)

    # Load existing valid results for resume
    results_path = os.path.join(script_dir, "grading_results.json")
    existing = {}
    if os.path.exists(results_path):
        with open(results_path, "r", encoding="utf-8") as f:
            for r in json.load(f):
                if r["llm"]["overall"] > 0:
                    existing[r["id"]] = r

    remaining = len(essays) - len(existing)

    print("=" * 80)
    print("  WRITING GRADING EXPERIMENT -- LIVE GEMINI API")
    print(f"  Model: {MODEL} | Total: {len(essays)} | Cached: {len(existing)} | Todo: {remaining}")
    print("=" * 80)

    results = []

    for i, essay in enumerate(essays):
        eid = essay["id"]

        if eid in existing:
            results.append(existing[eid])
            h = existing[eid]["human"]["overall"]
            l = existing[eid]["llm"]["overall"]
            print(f"  [{i+1}/{len(essays)}] {eid} CACHED  H={h:.1f} L={l:.1f}")
            continue

        print(f"  [{i+1}/{len(essays)}] {eid}...", end=" ", flush=True)
        t0 = time.time()

        result = await grade_single_essay(essay)
        results.append(result)
        elapsed = time.time() - t0

        h = result["human"]["overall"]
        l = result["llm"]["overall"]
        ok = "OK" if l > 0 else "FAIL"
        print(f"H={h:.1f} L={l:.1f} D={l-h:+.1f} ({elapsed:.0f}s) [{ok}]")

        # Save after each
        with open(results_path, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)

        await asyncio.sleep(5)

    # Final save
    with open(results_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    valid = sum(1 for r in results if r["llm"]["overall"] > 0)
    print(f"\n{'=' * 80}")
    print(f"  DONE! Valid: {valid}/{len(essays)}")
    if valid < len(essays):
        print(f"  Run again to retry {len(essays)-valid} failed essays")
    print(f"  Results: {results_path}")
    print(f"  Next: python run_demo.py")
    print(f"{'=' * 80}")


if __name__ == "__main__":
    asyncio.run(main())
