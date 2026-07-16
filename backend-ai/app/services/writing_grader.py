import os
import json
import re
import logging
import httpx
import typing

from dotenv import load_dotenv
load_dotenv()

from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

_GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if not _GEMINI_API_KEY:
    logger.warning("[WritingGrader] GEMINI_API_KEY is empty — grading will fail!")

_client = genai.Client(api_key=_GEMINI_API_KEY) if _GEMINI_API_KEY else None

MODEL = "gemini-1.5-flash"

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
    """Call Gemini to grade both IELTS writing tasks and return structured feedback."""
    logger.info("[WritingGrader] Calling Gemini API...")

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
        response = await _client.aio.models.generate_content(
            model=MODEL,
            contents=user_message,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.2,
                response_mime_type="application/json",
            ),
        )
    except Exception as e:
        logger.error(f"[WritingGrader] Gemini API call failed: {e}")
        raise

    # Output processing
    raw_text = response.text
    logger.info(f"[WritingGrader] Gemini responded ({len(raw_text)} chars)")

    # Parse — with response_mime_type="application/json", this is guaranteed valid
    try:
        result = typing.cast(typing.Dict[str, typing.Any], json.loads(raw_text))
    except json.JSONDecodeError as e:
        logger.error(f"[WritingGrader] JSON recovery failed: {e}\nRaw text was: {raw_text}")
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


SINGLE_TASK_SYSTEM_PROMPT = """You are an expert IELTS examiner. Grade the following IELTS Writing {task_type} strictly according to the official IELTS band descriptors.

{task_specific_instructions}

For EACH of the four criteria (Task Achievement/Response, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy), provide:
- A band score from 1.0 to 9.0 (in 0.5 increments)
- strengths: list of 1-3 specific positive observations
- weak_areas: list of 1-3 specific problems identified
- how_to_improve: list of 1-3 actionable improvement tips
- mistakes: list of 1-4 specific mistakes related to this criterion (leave empty if none). Each mistake needs "original", "correction", and "explanation".

Calculate the overall band as the mean of the 4 criteria (rounded to nearest 0.5).

Respond ONLY with valid JSON in this exact shape, no extra text:
{{
  "overall_band": 6.5,
  "criteria": {{
    "task_achievement": {{
      "band": 6.0,
      "strengths": ["..."],
      "weak_areas": ["..."],
      "how_to_improve": ["..."],
      "mistakes": []
    }},
    "coherence_and_cohesion": {{
      "band": 6.0,
      "strengths": ["..."],
      "weak_areas": ["..."],
      "how_to_improve": ["..."],
      "mistakes": []
    }},
    "lexical_resource": {{
      "band": 6.0,
      "strengths": ["..."],
      "weak_areas": ["..."],
      "how_to_improve": ["..."],
      "mistakes": []
    }},
    "grammatical_range_and_accuracy": {{
      "band": 6.0,
      "strengths": ["..."],
      "weak_areas": ["..."],
      "how_to_improve": ["..."],
      "mistakes": []
    }}
  }}
}}"""

TASK_1_INSTRUCTIONS = """For Task 1, you will be given the task prompt (and image description if available). Use it to verify whether the candidate has accurately described the data — correct values, trends, key features, and comparisons. Penalise under Task Achievement if the candidate misreads or ignores key data.

The essay should be at least 150 words. Penalise under Task Achievement if significantly under word count."""

TASK_2_INSTRUCTIONS = """For Task 2, evaluate the candidate's ability to present a clear position, develop supporting arguments with relevant examples, and address all parts of the question. Penalise under Task Achievement/Response if the position is unclear or parts of the question are not addressed.

The essay should be at least 250 words. Penalise under Task Achievement if significantly under word count."""

async def grade_single_writing_task(
    task_type: str,
    prompt: str,
    essay: str,
    image_url: str = "",
) -> dict:
    if not _client:
        raise RuntimeError("Gemini client not configured")

    task_label = "Task 1" if task_type == "TASK_1" else "Task 2"
    instructions = TASK_1_INSTRUCTIONS if task_type == "TASK_1" else TASK_2_INSTRUCTIONS

    system_prompt = SINGLE_TASK_SYSTEM_PROMPT.format(
        task_type=task_label,
        task_specific_instructions=instructions,
    )

    contents = []

    if task_type == "TASK_1" and image_url:
        try:
            async with httpx.AsyncClient() as http:
                img_resp = await http.get(image_url, timeout=15)
                if img_resp.status_code == 200:
                    ct = img_resp.headers.get("content-type", "image/jpeg")
                    contents.append(
                        types.Part.from_bytes(data=img_resp.content, mime_type=ct)
                    )
        except Exception as e:
            logger.warning(f"Failed to fetch image {image_url}: {e}")

    user_message = f"## Writing Prompt\n{prompt}\n\n## Candidate's Essay ({task_label})\n{essay}"
    contents.append(user_message)

    try:
        response = await _client.aio.models.generate_content(
            model=MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=0.3,
                max_output_tokens=8192, response_mime_type="application/json",
            ),
        )

        raw = response.text.strip()
        json_str = raw
        if "```json" in json_str:
            json_str = json_str.split("```json")[1].split("```")[0].strip()
        elif "```" in json_str:
            json_str = json_str.split("```")[1].split("```")[0].strip()

        result = json.loads(json_str)

        for criterion in result.get("criteria", {}).values():
            if isinstance(criterion, dict) and "band" in criterion:
                criterion["band"] = max(1.0, min(9.0, round(criterion["band"] * 2) / 2))

        result["overall_band"] = _calc_task_band(result.get("criteria", {}))
        return result
    except Exception as e:
        logger.error(f"Single task grading error: {e}")
        return {
            "overall_band": 0,
            "criteria": {
                "task_achievement": {"band":0, "strengths":[], "weak_areas":[], "how_to_improve":["Failed to parse AI response"], "mistakes":[]},
                "coherence_and_cohesion": {"band":0, "strengths":[], "weak_areas":[], "how_to_improve":[], "mistakes":[]},
                "lexical_resource": {"band":0, "strengths":[], "weak_areas":[], "how_to_improve":[], "mistakes":[]},
                "grammatical_range_and_accuracy": {"band":0, "strengths":[], "weak_areas":[], "how_to_improve":[], "mistakes":[]}
            }
        }
