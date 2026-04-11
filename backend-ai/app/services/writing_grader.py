import os
import json
import re
import logging
import httpx
import typing

from dotenv import load_dotenv
load_dotenv()

from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

_GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
if not _GROQ_API_KEY:
    logger.warning("[WritingGrader] GROQ_API_KEY is empty — grading will fail!")

_client = AsyncOpenAI(
    api_key=_GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",
)

SYSTEM_PROMPT = """You are an expert IELTS examiner. Grade the two writing tasks strictly according to the official IELTS band descriptors.

For Task 1, you will be given the task prompt (and image description if available). Use it to verify whether the candidate has accurately described the data — correct values, trends, key features, and comparisons. Penalise under Task Achievement if the candidate misreads or ignores key data.

For EACH of the four criteria (Task Achievement/Response, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy), provide:
- A band score from 1.0 to 9.0 (in 0.5 increments)
- strengths: list of 1-3 specific positive observations
- weak_areas: list of 1-3 specific problems identified
- how_to_improve: list of 1-3 actionable improvement tips

Also identify specific mistakes:
- Up to 10 notable language mistakes across both essays
- Each mistake: the original phrase, a corrected version, a brief explanation, and the specific grading criterion it falls under (e.g. "lexical_resource" or "grammatical_range_and_accuracy")

Calculate the overall band for each task as the mean of its 4 criteria (rounded to nearest 0.5).
Calculate the overall test band as the mean of Task 1 band and Task 2 band (Task 2 is worth double: (task1_band + task2_band * 2) / 3), rounded to nearest 0.5.

Respond ONLY with valid JSON in this exact shape, no extra text:
{
  "overall_band": 6.5,
  "task1": {
    "band": 6.0,
    "criteria": {
      "task_achievement": {
        "band": 6.0,
        "strengths": ["..."],
        "weak_areas": ["..."],
        "how_to_improve": ["..."],
        "mistakes": [
          {
            "original": "...",
            "correction": "...",
            "explanation": "..."
          }
        ]
      },
      "coherence_and_cohesion": {
        "band": 6.0,
        "strengths": ["..."],
        "weak_areas": ["..."],
        "how_to_improve": ["..."],
        "mistakes": []
      },
      "lexical_resource": {
        "band": 6.0,
        "strengths": ["..."],
        "weak_areas": ["..."],
        "how_to_improve": ["..."],
        "mistakes": []
      },
      "grammatical_range_and_accuracy": {
        "band": 6.0,
        "strengths": ["..."],
        "weak_areas": ["..."],
        "how_to_improve": ["..."],
        "mistakes": []
      }
    }
  },
  "task2": {
    "band": 6.5,
    "criteria": {
      "task_achievement": {
        "band": 6.5,
        "strengths": ["..."],
        "weak_areas": ["..."],
        "how_to_improve": ["..."],
        "mistakes": []
      },
      "coherence_and_cohesion": {
        "band": 6.5,
        "strengths": ["..."],
        "weak_areas": ["..."],
        "how_to_improve": ["..."],
        "mistakes": []
      },
      "lexical_resource": {
        "band": 6.5,
        "strengths": ["..."],
        "weak_areas": ["..."],
        "how_to_improve": ["..."],
        "mistakes": []
      },
      "grammatical_range_and_accuracy": {
        "band": 6.5,
        "strengths": ["..."],
        "weak_areas": ["..."],
        "how_to_improve": ["..."],
        "mistakes": []
      }
    }
  }
}"""


def _round_to_half(value: float) -> float:
    return round(value * 2) / 2


def _calc_task_band(criteria: dict) -> float:
    scores = [c["band"] for c in criteria.values()]
    return _round_to_half(sum(scores) / len(scores))


def _calc_overall_band(task1_band: float, task2_band: float) -> float:
    # Task 2 is worth double
    return _round_to_half((task1_band + task2_band * 2) / 3)


async def grade_writing(
    task1_prompt: str,
    task2_prompt: str,
    task1_essay: str,
    task2_essay: str,
    task1_image_url: str = "",
) -> dict:
    """Call DeepSeek to grade both IELTS writing tasks and return structured feedback."""
    logger.info("[WritingGrader] Calling DeepSeek API...")

    # Build the user message text
    image_note = ""
    if task1_image_url:
        image_note = f"\n[Task 1 chart image URL: {task1_image_url} — please consider chart data as described in the prompt]"

    user_message = f"""=== WRITING TASK 1 ==={image_note}
Task Prompt: {task1_prompt}
Candidate's Response:
{task1_essay or "(No response submitted)"}

=== WRITING TASK 2 ===
Task Prompt: {task2_prompt}
Candidate's Response:
{task2_essay or "(No response submitted)"}"""

    try:
        response = await _client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            temperature=0.2,
        )
    except Exception as e:
        logger.error(f"[WritingGrader] DeepSeek API call failed: {e}")
        raise

    # Output processing
    raw_text = response.choices[0].message.content.strip()
    logger.info(f"[WritingGrader] DeepSeek responded ({len(raw_text)} chars)")

    # 1. Strip markdown code fences if present
    clean_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
    clean_text = re.sub(r"\s*```$", "", clean_text)

    # 2. Try parsing directly
    try:
        result = typing.cast(typing.Dict[str, typing.Any], json.loads(clean_text))
    except json.JSONDecodeError as e:
        logger.warning(f"[WritingGrader] Initial JSON parse failed ({e}). Attempting to repair.")
        start_idx = clean_text.find('{')
        end_idx = clean_text.rfind('}')
        if start_idx != -1 and end_idx != -1:
            clean_text = clean_text[start_idx:end_idx+1]
        clean_text = re.sub(r",\s*([\]}])", r"\1", clean_text)
        try:
            result = typing.cast(typing.Dict[str, typing.Any], json.loads(clean_text))
        except json.JSONDecodeError as e2:
            logger.error(f"[WritingGrader] JSON recovery failed: {e2}\nRaw text was: {raw_text}")
            result = typing.cast(typing.Dict[str, typing.Any], {
                "overall_band": 0,
                "task1": {"band": 0, "criteria": {
                    "task_achievement": {"band":0, "strengths":[], "weak_areas":[], "how_to_improve":["Failed to parse AI response"], "mistakes":[]},
                    "coherence_and_cohesion": {"band":0, "strengths":[], "weak_areas":[], "how_to_improve":[], "mistakes":[]},
                    "lexical_resource": {"band":0, "strengths":[], "weak_areas":[], "how_to_improve":[], "mistakes":[]},
                    "grammatical_range_and_accuracy": {"band":0, "strengths":[], "weak_areas":[], "how_to_improve":[], "mistakes":[]}
                }},
                "task2": {"band": 0, "criteria": {
                    "task_achievement": {"band":0, "strengths":[], "weak_areas":[], "how_to_improve":["Failed to parse AI response"], "mistakes":[]},
                    "coherence_and_cohesion": {"band":0, "strengths":[], "weak_areas":[], "how_to_improve":[], "mistakes":[]},
                    "lexical_resource": {"band":0, "strengths":[], "weak_areas":[], "how_to_improve":[], "mistakes":[]},
                    "grammatical_range_and_accuracy": {"band":0, "strengths":[], "weak_areas":[], "how_to_improve":[], "mistakes":[]}
                }}
            })

    # Recalculate bands server-side to ensure consistency
    t1_band = _calc_task_band(result["task1"]["criteria"])
    t2_band = _calc_task_band(result["task2"]["criteria"])
    overall = _calc_overall_band(t1_band, t2_band)

    result["task1"]["band"] = t1_band
    result["task2"]["band"] = t2_band
    result["overall_band"] = overall

    return result
