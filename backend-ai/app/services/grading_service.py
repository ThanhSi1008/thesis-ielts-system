import os
import json
import re
import logging
import tempfile
import base64
import typing
import urllib.request
import httpx
from typing import Dict, Any, List

from dotenv import load_dotenv
load_dotenv()

from google import genai
from google.genai import types
from app.services.transcription_service import get_transcription_service

logger = logging.getLogger(__name__)

_client = None

def _get_client():
    global _client
    if _client is None:
        from app.core.config import get_settings
        api_key = get_settings().gemini_api_key or os.getenv("GEMINI_API_KEY", "")
        if api_key:
            _client = genai.Client(api_key=api_key)
    return _client

MODEL = "gemini-2.5-flash"

# ==============================================================================
# WRITING PROMPTS
# ==============================================================================

WRITING_SYSTEM_PROMPT = """You are an expert IELTS examiner. Grade the two writing tasks strictly according to the official IELTS band descriptors.

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

SINGLE_WRITING_SYSTEM_PROMPT = """You are an expert IELTS examiner. Grade the following IELTS Writing {task_type} strictly according to the official IELTS band descriptors.

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

WRITING_TASK_1_INSTRUCTIONS = """For Task 1, you will be given the task prompt (and image description if available). Use it to verify whether the candidate has accurately described the data — correct values, trends, key features, and comparisons. Penalise under Task Achievement if the candidate misreads or ignores key data.

The essay should be at least 150 words. Penalise under Task Achievement if significantly under word count."""

WRITING_TASK_2_INSTRUCTIONS = """For Task 2, evaluate the candidate's ability to present a clear position, develop supporting arguments with relevant examples, and address all parts of the question. Penalise under Task Achievement/Response if the position is unclear or parts of the question are not addressed.

The essay should be at least 250 words. Penalise under Task Achievement if significantly under word count."""

# ==============================================================================
# SPEAKING PROMPTS
# ==============================================================================

SPEAKING_SYSTEM_PROMPT = """You are an expert IELTS examiner. Grade the user's speaking test responses according to the official IELTS Speaking band descriptors.

You will be given:
1. The actual AUDIO RECORDINGS of the candidate's spoken responses (or placeholders if not available)
2. AI-generated text transcriptions as a reference (may contain minor errors)
3. Transcription confidence indicators

IMPORTANT: For Pronunciation and Fluency scoring, you MUST base your assessment on the AUDIO, not just the text. Listen for:
- Pronunciation: individual sound accuracy, word stress, intonation patterns, connected speech, L1 interference
- Fluency: speech rate, hesitations, false starts, self-corrections, pausing patterns

The text transcription is provided as a convenience for assessing Lexical Resource and Grammatical Range, but always cross-reference with what you hear.

For EACH of the four criteria (Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, Pronunciation), provide:
- A band score from 1.0 to 9.0 (in 0.5 increments)
- strengths: list of 1-3 specific positive observations
- weak_areas: list of 1-3 specific problems identified
- how_to_improve: list of 1-3 actionable improvement tips

Also identify specific mistakes:
- Up to 10 notable language mistakes across the whole test.
- Each mistake: the original phrase, a corrected version, a brief explanation, and the specific grading criterion it falls under.

Calculate the overall band as the mean of its 4 criteria (rounded down to the nearest 0.5 if it ends in .25 or .75, as per IELTS rules, but simply rounding to nearest 0.5 is acceptable for this system).

Respond ONLY with valid JSON in this exact shape, no extra text:
{
  "overall_band": 6.5,
  "criteria": {
    "fluency_and_coherence": {
      "band": 6.5,
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
    "lexical_resource": {
      "band": 6.5,
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
    },
    "pronunciation": {
      "band": 6.5,
      "strengths": ["..."],
      "weak_areas": ["..."],
      "how_to_improve": ["..."],
      "mistakes": []
    }
  }
}"""

SINGLE_SPEAKING_SYSTEM_PROMPT = """You are an expert IELTS examiner. Grade the user's Speaking {part_label} responses according to the official IELTS Speaking band descriptors.

{part_instructions}

You will be given:
1. The actual AUDIO RECORDINGS of the candidate's spoken responses
2. AI-generated text transcriptions as a reference (may contain minor errors)
3. Transcription confidence indicators

IMPORTANT: For Pronunciation and Fluency scoring, you MUST base your assessment on the AUDIO, not just the text. Listen for:
- Pronunciation: individual sound accuracy, word stress, intonation patterns, connected speech, L1 interference
- Fluency: speech rate, hesitations, false starts, self-corrections, pausing patterns

For EACH of the four criteria (Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, Pronunciation), provide:
- A band score from 1.0 to 9.0 (in 0.5 increments)
- strengths: list of 1-3 specific positive observations
- weak_areas: list of 1-3 specific problems identified
- how_to_improve: list of 1-3 actionable improvement tips

Also identify specific mistakes:
- Up to 8 notable language mistakes
- Each mistake: the original phrase, a corrected version, a brief explanation, and the criterion

Calculate the overall band as the mean of the 4 criteria (rounded to nearest 0.5).

Respond ONLY with valid JSON in this exact shape, no extra text:
{
  "overall_band": 6.5,
  "criteria": {
    "fluency_and_coherence": {
      "band": 6.5,
      "strengths": ["..."],
      "weak_areas": ["..."],
      "how_to_improve": ["..."],
      "mistakes": [{ "original": "...", "correction": "...", "explanation": "..." }]
    },
    "lexical_resource": { "band": 6.5, "strengths": ["..."], "weak_areas": ["..."], "how_to_improve": ["..."], "mistakes": [] },
    "grammatical_range_and_accuracy": { "band": 6.5, "strengths": ["..."], "weak_areas": ["..."], "how_to_improve": ["..."], "mistakes": [] },
    "pronunciation": { "band": 6.5, "strengths": ["..."], "weak_areas": ["..."], "how_to_improve": ["..."], "mistakes": [] }
  }
}"""

SPEAKING_PART_INSTRUCTIONS = {
    1: """Part 1 (Interview): The examiner asks 3-4 familiar topic questions.
Assess the candidate's ability to give appropriately extended responses about familiar topics.
Responses should be natural and conversational, typically 20-40 seconds each.
Penalize heavily under Fluency if responses are excessively short (under 10 seconds) or feel rehearsed.""",
    2: """Part 2 (Individual Long Turn / Cue Card): The candidate speaks for 1-2 minutes on a given topic.
Assess the candidate's ability to speak at length on a topic, using appropriate language and organizing ideas coherently.
The response should cover all cue card bullet points when relevant.
Penalize under Fluency if the candidate fails to speak for at least 1 minute.""",
    3: """Part 3 (Discussion): The examiner asks abstract/analytical questions related to Part 2's topic.
Assess the candidate's ability to discuss abstract ideas, express and justify opinions, and analyze issues.
Responses should demonstrate more complex language and deeper reasoning than Part 1.""",
}

# ==============================================================================
# HELPERS
# ==============================================================================

def _round_to_half(value: float) -> float:
    return round(value * 2) / 2

def _calc_writing_task_band(criteria: dict) -> float:
    scores = [c["band"] for c in criteria.values()]
    return _round_to_half(sum(scores) / len(scores))

def _calc_writing_overall_band(task1_band: float, task2_band: float) -> float:
    # Task 2 is worth double
    return _round_to_half((task1_band + task2_band * 2) / 3)

def _calc_speaking_overall_band(criteria: dict) -> float:
    scores = [c.get("band", 0) for c in criteria.values() if isinstance(c, dict)]
    if not scores:
        return 0.0
    return _round_to_half(sum(scores) / len(scores))

# ==============================================================================
# PUBLIC WRITING METHODS
# ==============================================================================

async def grade_writing(
    task1_prompt: str,
    task2_prompt: str,
    task1_essay: str,
    task2_essay: str,
    task1_image_url: str = "",
) -> dict:
    """Call Gemini to grade both IELTS writing tasks and return structured feedback."""
    logger.info("[IeltsGrader] Calling Gemini API for writing...")

    client = _get_client()
    if not client:
        raise RuntimeError("Gemini client not configured")

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
        response = await client.aio.models.generate_content(
            model=MODEL,
            contents=user_message,
            config=types.GenerateContentConfig(
                system_instruction=WRITING_SYSTEM_PROMPT,
                temperature=0.2,
                response_mime_type="application/json",
            ),
        )
    except Exception as e:
        logger.error(f"[IeltsGrader] Gemini API call failed for writing: {e}")
        raise

    raw_text = response.text
    logger.info(f"[IeltsGrader] Gemini writing response ({len(raw_text)} chars)")

    try:
        result = typing.cast(typing.Dict[str, typing.Any], json.loads(raw_text))
    except json.JSONDecodeError as e:
        logger.error(f"[IeltsGrader] JSON recovery failed for writing: {e}\nRaw text was: {raw_text}")
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
    t1_band = _calc_writing_task_band(result["task1"]["criteria"])
    t2_band = _calc_writing_task_band(result["task2"]["criteria"])
    overall = _calc_writing_overall_band(t1_band, t2_band)

    result["task1"]["band"] = t1_band
    result["task2"]["band"] = t2_band
    result["overall_band"] = overall

    return result

async def grade_single_writing_task(
    task_type: str,
    prompt: str,
    essay: str,
    image_url: str = "",
) -> dict:
    """Grade a single IELTS Writing task (Task 1 or Task 2)."""
    logger.info("[IeltsGrader] Calling Gemini API for single writing task...")

    client = _get_client()
    if not client:
        raise RuntimeError("Gemini client not configured")

    task_label = "Task 1" if task_type == "TASK_1" else "Task 2"
    instructions = WRITING_TASK_1_INSTRUCTIONS if task_type == "TASK_1" else WRITING_TASK_2_INSTRUCTIONS

    system_prompt = SINGLE_WRITING_SYSTEM_PROMPT.format(
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
        response = await client.aio.models.generate_content(
            model=MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=0.3,
                max_output_tokens=8192,
                response_mime_type="application/json",
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

        result["overall_band"] = _calc_writing_task_band(result.get("criteria", {}))
        return result
    except Exception as e:
        logger.error(f"Single writing task grading error: {e}")
        return {
            "overall_band": 0,
            "criteria": {
                "task_achievement": {"band":0, "strengths":[], "weak_areas":[], "how_to_improve":["Failed to parse AI response"], "mistakes":[]},
                "coherence_and_cohesion": {"band":0, "strengths":[], "weak_areas":[], "how_to_improve":[], "mistakes":[]},
                "lexical_resource": {"band":0, "strengths":[], "weak_areas":[], "how_to_improve":[], "mistakes":[]},
                "grammatical_range_and_accuracy": {"band":0, "strengths":[], "weak_areas":[], "how_to_improve":[], "mistakes":[]}
            }
        }

# ==============================================================================
# PUBLIC SPEAKING METHODS
# ==============================================================================

async def grade_speaking(
    session_id: str,
    exam_questions: Dict[str, Any],
    audio_answers: Dict[str, str]
) -> dict:
    """Grade IELTS Speaking responses by transcribing audio and calling Gemini."""
    logger.info("[IeltsGrader] Calling Gemini API for speaking...")

    client = _get_client()
    if not client:
        logger.warning("[IeltsGrader] GEMINI_API_KEY is missing! Speaking grading will fail.")
        raise ValueError("GEMINI_API_KEY is missing.")

    transcription_svc = get_transcription_service()
    
    transcripts = {}
    temp_files = []
    audio_parts = []
    
    try:
        parts = exam_questions.get("parts", [])
        
        for key, audio_source in audio_answers.items():
            if not audio_source:
                continue
                
            try:
                fd, path = tempfile.mkstemp(suffix=".webm")
                temp_files.append(path)
                
                if audio_source.startswith("http://") or audio_source.startswith("https://"):
                    req = urllib.request.Request(audio_source, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req) as response:
                        audio_bytes = response.read()
                        with os.fdopen(fd, 'wb') as f:
                            f.write(audio_bytes)
                else:
                    if "," in audio_source:
                        audio_source = audio_source.split(",")[1]
                    audio_bytes = base64.b64decode(audio_source)
                    with os.fdopen(fd, 'wb') as f:
                        f.write(audio_bytes)
                
                # Add audio to multimodal parts
                audio_parts.append(
                    types.Part.from_text(text=f"[Audio recording for Question {key}]")
                )
                audio_parts.append(
                    types.Part.from_bytes(
                        data=audio_bytes,
                        mime_type="audio/webm"
                    )
                )
                
                # Transcribe
                logger.info(f"[IeltsGrader] Transcribing speaking response for question {key}")
                result = transcription_svc.transcribe(path)
                
                # Map key to question block
                q_text = f"Question {key}"
                try:
                    part_idx, qn_idx = map(int, key.split("-"))
                    if part_idx < len(parts):
                        part = parts[part_idx]
                        if part.get("questions") and qn_idx < len(part["questions"]):
                            q_text = part["questions"][qn_idx].get("text", q_text)
                        elif part.get("cue_card"):
                            q_text = part.get("cue_card", q_text)
                except Exception as map_err:
                    logger.warning(f"Could not map key {key} to question text: {map_err}")
                    
                transcripts[key] = {
                    "question": q_text,
                    "transcript": result.get("text", ""),
                    "words": result.get("words", [])
                }
            except Exception as e:
                logger.error(f"[IeltsGrader] Failed to process speaking audio for {key}: {e}")
                transcripts[key] = {
                    "question": f"Question {key}",
                    "transcript": "(Audio transcription failed)",
                    "words": []
                }
    finally:
        for path in temp_files:
            try:
                os.remove(path)
            except OSError:
                pass
                
    # Format prompt
    text_part = "=== SPEAKING TEST TRANSCRIPT ===\n\n"
    if not transcripts:
        text_part += "(No responses transcribed)\n\n"
    else:
        def sort_key(k):
            try:
                return [int(x) for x in k.split("-")]
            except:
                return [k]
                
        for key in sorted(transcripts.keys(), key=sort_key):
            data = transcripts[key]
            text_part += f"Q: {data['question']}\n"
            text_part += f"A: {data['transcript'] if data['transcript'] else '(No audible response)'}\n"
            
            # Add Whisper confidence as supplementary information
            words = data.get("words", [])
            if words:
                avg_conf = sum(w.get("probability", 0) for w in words) / len(words)
                low_conf_words = [w.get("word", "") for w in words if w.get("probability", 0) < 0.7]
                text_part += f"[STT Confidence: {avg_conf:.2f}"
                if low_conf_words:
                    text_part += f" | Low confidence words: {', '.join(low_conf_words)}"
                text_part += "]\n"
            text_part += "\n"
        
    logger.info(f"[IeltsGrader] Formatted speaking prompt length: {len(text_part)}")
    
    # Build contents with Audio files + Text transcript
    contents = audio_parts + [types.Part.from_text(text=text_part)]
    
    try:
        response = await client.aio.models.generate_content(
            model=MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SPEAKING_SYSTEM_PROMPT,
                temperature=0.2,
                response_mime_type="application/json",
            ),
        )
    except Exception as e:
        logger.error(f"[IeltsGrader] Gemini API call failed for speaking: {e}")
        raise

    try:
        result = typing.cast(typing.Dict[str, typing.Any], json.loads(response.text))
    except json.JSONDecodeError as e:
        logger.error(f"[IeltsGrader] JSON recovery failed for speaking: {response.text}")
        result = {
            "overall_band": 0,
            "criteria": {
                "fluency_and_coherence": {"band": 0, "strengths": [], "weak_areas": [], "how_to_improve": [], "mistakes": []},
                "lexical_resource": {"band": 0, "strengths": [], "weak_areas": [], "how_to_improve": [], "mistakes": []},
                "grammatical_range_and_accuracy": {"band": 0, "strengths": [], "weak_areas": [], "how_to_improve": [], "mistakes": []},
                "pronunciation": {"band": 0, "strengths": [], "weak_areas": [], "how_to_improve": [], "mistakes": []}
            }
        }

    overall = _calc_speaking_overall_band(result.get("criteria", {}))
    result["overall_band"] = overall
    return result

async def grade_single_speaking_part(
    part_number: int,
    part_type: str,
    questions: typing.List[str],
    audio_answers: typing.Dict[str, str],
) -> dict:
    """Grade a single IELTS speaking part (Part 1, 2, or 3)."""
    logger.info("[IeltsGrader] Calling Gemini API for single speaking part...")

    client = _get_client()
    if not client:
        logger.warning("[IeltsGrader] GEMINI_API_KEY is missing! Speaking grading will fail.")
        raise ValueError("GEMINI_API_KEY is missing.")

    transcription_svc = get_transcription_service()

    transcripts = {}
    temp_files = []
    audio_parts = []

    try:
        def _sort_key(key: str):
            return int(key) if key.isdigit() else key

        for key in sorted(audio_answers.keys(), key=_sort_key):
            audio_source = audio_answers.get(key)
            if not audio_source:
                continue

            try:
                fd, path = tempfile.mkstemp(suffix=".webm")
                temp_files.append(path)

                if "," in audio_source:
                    audio_source = audio_source.split(",", 1)[1]
                audio_bytes = base64.b64decode(audio_source)
                with os.fdopen(fd, "wb") as f:
                    f.write(audio_bytes)

                q_idx = int(key) if key.isdigit() else 0
                q_text = questions[q_idx] if q_idx < len(questions) else f"Question {key}"

                audio_parts.append(types.Part.from_text(text=f"[Audio for: {q_text}]"))
                audio_parts.append(
                    types.Part.from_bytes(data=audio_bytes, mime_type="audio/webm")
                )

                logger.info(f"[IeltsGrader] Transcribing speaking response for question {key}")
                result = transcription_svc.transcribe(path)
                transcripts[key] = {
                    "question": q_text,
                    "transcript": result.get("text", ""),
                    "words": result.get("words", []),
                }
            except Exception as e:
                logger.error(f"[IeltsGrader] Failed to process speaking audio for {key}: {e}")
                q_idx = int(key) if key.isdigit() else 0
                transcripts[key] = {
                    "question": questions[q_idx] if q_idx < len(questions) else f"Question {key}",
                    "transcript": "(Audio transcription failed)",
                    "words": [],
                }
    finally:
        for path in temp_files:
            try:
                os.remove(path)
            except OSError:
                pass

    part_label = f"Part {part_number}"
    text_part = f"=== SPEAKING {part_label.upper()} TRANSCRIPT ({part_type}) ===\n\n"

    if not transcripts:
        text_part += "(No responses transcribed)\n\n"
    else:
        for key in sorted(transcripts.keys(), key=lambda k: int(k) if k.isdigit() else 0):
            data = transcripts[key]
            text_part += f"Q: {data['question']}\n"
            text_part += f"A: {data['transcript'] or '(No audible response)'}\n"

            words = data.get("words", [])
            if words:
                avg_conf = sum(w.get("probability", 0) for w in words) / len(words)
                low_conf_words = [
                    w.get("word", "") for w in words if w.get("probability", 0) < 0.7
                ]
                text_part += f"[STT Confidence: {avg_conf:.2f}"
                if low_conf_words:
                    text_part += f" | Low confidence words: {', '.join(low_conf_words)}"
                text_part += "]\n"
            text_part += "\n"

    instructions = SPEAKING_PART_INSTRUCTIONS.get(part_number, SPEAKING_PART_INSTRUCTIONS[1])
    system_prompt = SINGLE_SPEAKING_SYSTEM_PROMPT.replace(
        "{part_label}", part_label
    ).replace(
        "{part_instructions}", instructions
    )

    contents = audio_parts + [types.Part.from_text(text=text_part)]

    try:
        response = await client.aio.models.generate_content(
            model=MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=0.2,
                response_mime_type="application/json",
            ),
        )
    except Exception as e:
        logger.error(f"[IeltsGrader] Gemini API call failed for single speaking part: {e}")
        raise

    try:
        result = typing.cast(typing.Dict[str, typing.Any], json.loads(response.text))
    except json.JSONDecodeError:
        logger.error(f"[IeltsGrader] JSON parse failed for single speaking part: {response.text}")
        result = {
            "overall_band": 0,
            "criteria": {
                "fluency_and_coherence": {
                    "band": 0,
                    "strengths": [],
                    "weak_areas": [],
                    "how_to_improve": [],
                    "mistakes": [],
                },
                "lexical_resource": {
                    "band": 0,
                    "strengths": [],
                    "weak_areas": [],
                    "how_to_improve": [],
                    "mistakes": [],
                },
                "grammatical_range_and_accuracy": {
                    "band": 0,
                    "strengths": [],
                    "weak_areas": [],
                    "how_to_improve": [],
                    "mistakes": [],
                },
                "pronunciation": {
                    "band": 0,
                    "strengths": [],
                    "weak_areas": [],
                    "how_to_improve": [],
                    "mistakes": [],
                },
            },
        }

    result["overall_band"] = _calc_speaking_overall_band(result.get("criteria", {}))
    result["transcripts"] = transcripts
    return result
