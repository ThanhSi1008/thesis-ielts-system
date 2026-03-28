import os
import json
import re
import logging
import tempfile
import base64
import typing
import urllib.request
from typing import Dict, Any

from dotenv import load_dotenv
load_dotenv()

from google import genai
from google.genai import types as genai_types
from app.services.transcription_service import get_transcription_service

logger = logging.getLogger(__name__)

_GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
_client = genai.Client(api_key=_GEMINI_API_KEY) if _GEMINI_API_KEY else None

SYSTEM_PROMPT = """You are an expert IELTS examiner. Grade the user's speaking test transcription according to the official IELTS Speaking band descriptors.

You will be given the questions asked and the candidate's transcribed spoken responses. Note that because they are AI transcriptions, there may be minor transcription errors (e.g. punctuation, slight mishearings of names), but grade them on the language used.

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

def _round_to_half(value: float) -> float:
    return round(value * 2) / 2

def _calc_overall_band(criteria: dict) -> float:
    scores = [c.get("band", 0) for c in criteria.values() if isinstance(c, dict)]
    if not scores:
        return 0.0
    return _round_to_half(sum(scores) / len(scores))

async def grade_speaking(
    session_id: str,
    exam_questions: Dict[str, Any],
    audio_answers: Dict[str, str]
) -> dict:
    """
    1. Decode Base64 audio answers
    2. Transcribe using Whisper
    3. Grade using Gemini
    """
    if not _client:
        logger.warning("[SpeakingGrader] GEMINI_API_KEY is missing! Grading will fail.")
        raise ValueError("GEMINI_API_KEY is missing.")

    transcription_svc = get_transcription_service()
    
    # 1 & 2: Decode & Transcribe
    transcripts = {}
    temp_files = []
    
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
                        with os.fdopen(fd, 'wb') as f:
                            f.write(response.read())
                else:
                    if "," in audio_source:
                        audio_source = audio_source.split(",")[1]
                    audio_bytes = base64.b64decode(audio_source)
                    with os.fdopen(fd, 'wb') as f:
                        f.write(audio_bytes)
                
                # Transcribe
                logger.info(f"[SpeakingGrader] Transcribing audio for question {key}")
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
                    "transcript": result.get("text", "")
                }
            except Exception as e:
                logger.error(f"[SpeakingGrader] Failed to process audio for {key}: {e}")
                transcripts[key] = {
                    "question": f"Question {key}",
                    "transcript": "(Audio transcription failed)"
                }
    finally:
        for path in temp_files:
            try:
                os.remove(path)
            except OSError:
                pass
                
    # 3. Format prompt
    text_part = "=== SPEAKING TEST TRANSCRIPT ===\n\n"
    if not transcripts:
        text_part += "(No responses transcribed)\n\n"
    else:
        # Sort based on numerical index if possible
        def sort_key(k):
            try:
                return [int(x) for x in k.split("-")]
            except:
                return [k]
                
        for key in sorted(transcripts.keys(), key=sort_key):
            data = transcripts[key]
            text_part += f"Q: {data['question']}\n"
            text_part += f"A: {data['transcript'] if data['transcript'] else '(No audible response)'}\n\n"
        
    logger.info(f"[SpeakingGrader] Formatted prompt length: {len(text_part)}")
    
    contents = [text_part]
    
    # 4. Call Gemini
    try:
        response = _client.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents,
            config=genai_types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.2,
            ),
        )
    except Exception as e:
        logger.warning(f"[SpeakingGrader] fallback triggered ({e})")
        response = _client.models.generate_content(
            model="gemini-2.0-flash",
            contents=contents,
            config=genai_types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.2,
            ),
        )

    # 5. Output processing
    raw_text = response.text.strip()
    clean_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
    clean_text = re.sub(r"\s*```$", "", clean_text)

    try:
        result = typing.cast(typing.Dict[str, typing.Any], json.loads(clean_text))
    except json.JSONDecodeError as e:
        logger.warning(f"[SpeakingGrader] Initial JSON parse failed ({e}). Attempting recovery.")
        start_idx = clean_text.find('{')
        end_idx = clean_text.rfind('}')
        if start_idx != -1 and end_idx != -1:
            clean_text = clean_text[start_idx:end_idx+1]
        try:
            result = typing.cast(typing.Dict[str, typing.Any], json.loads(clean_text))
        except json.JSONDecodeError:
            logger.error(f"[SpeakingGrader] JSON recovery failed for raw response: {raw_text}")
            result = {
                "overall_band": 0,
                "criteria": {
                    "fluency_and_coherence": {"band": 0, "strengths": [], "weak_areas": [], "how_to_improve": [], "mistakes": []},
                    "lexical_resource": {"band": 0, "strengths": [], "weak_areas": [], "how_to_improve": [], "mistakes": []},
                    "grammatical_range_and_accuracy": {"band": 0, "strengths": [], "weak_areas": [], "how_to_improve": [], "mistakes": []},
                    "pronunciation": {"band": 0, "strengths": [], "weak_areas": [], "how_to_improve": [], "mistakes": []}
                }
            }

    overall = _calc_overall_band(result.get("criteria", {}))
    result["overall_band"] = overall
    return result
