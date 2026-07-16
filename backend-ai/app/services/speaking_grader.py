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
from google.genai import types
from app.services.transcription_service import get_transcription_service

logger = logging.getLogger(__name__)

_GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
_client = genai.Client(api_key=_GEMINI_API_KEY) if _GEMINI_API_KEY else None

MODEL = "gemini-1.5-flash"

SYSTEM_PROMPT = """You are an expert IELTS examiner. Grade the user's speaking test responses according to the official IELTS Speaking band descriptors.

You will be given:
1. The actual AUDIO RECORDINGS of the candidate's spoken responses (or placeholders if not available)
2. AI-generated text transcriptions as a reference (may contain minor errors)
3. Transcription confidence indicators

IMPORTANT: For Pronunciation and Fluency scoring, you MUST base your assessment on the AUDIO, not just the text. Listen for:
- Pronunciation: individual sound accuracy (based on IPA phonemes: plosives /p, b, t, d, k, ɡ/, fricatives /f, v, θ, ð, s, z, ʃ, ʒ, h/, nasals /m, n, ŋ/, affricates /tʃ, dʒ/, vowels and diphthongs), word stress, intonation patterns, connected speech, and L1 interference (mother-tongue accent influence).
- Fluency: speech rate, hesitations, false starts, self-corrections, pausing patterns.

The text transcription is provided as a convenience for assessing Lexical Resource and Grammatical Range, but always cross-reference with what you hear.

For EACH of the four criteria (Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, Pronunciation), provide:
- A band score from 1.0 to 9.0 (in 0.5 increments)
- strengths: list of 1-3 specific positive observations
- weak_areas: list of 1-3 specific problems identified
- how_to_improve: list of 1-3 actionable improvement tips
- mistakes: list of notable errors in grammar, vocabulary, or pronunciation.

For Pronunciation feedback, align your evaluation with a multi-dimensional approach:
- Classify the candidate's pronunciation level: "Excellent" (score 90-100% equivalent), "Good" (70-89% equivalent), "Fair" (50-69% equivalent), or "Needs Improvement" (under 50% equivalent).
- Highlight specific mispronounced sounds, consonant deletion, vowel shortening, or flat intonation.

Calculate the overall band as the mean of its 4 criteria (rounded to the nearest 0.5 using IELTS rounding rules: if the fraction is less than 0.25, round down to .0; if it is 0.25 or greater but less than 0.75, round to .5; if it is 0.75 or greater, round up to the next .0).

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

SINGLE_PART_SYSTEM_PROMPT = """You are an expert IELTS examiner. Grade the user's Speaking {part_label} responses according to the official IELTS Speaking band descriptors.

{part_instructions}

You will be given:
1. The actual AUDIO RECORDINGS of the candidate's spoken responses
2. AI-generated text transcriptions as a reference (may contain minor errors)
3. Transcription confidence indicators

IMPORTANT: For Pronunciation and Fluency scoring, you MUST base your assessment on the AUDIO, not just the text. Listen for:
- Pronunciation: individual sound accuracy (based on IPA phonemes: plosives /p, b, t, d, k, ɡ/, fricatives /f, v, θ, ð, s, z, ʃ, ʒ, h/, nasals /m, n, ŋ/, affricates /tʃ, dʒ/, vowels and diphthongs), word stress, connected speech, and L1 interference (mother-tongue accent influence).
- Fluency: speech rate, hesitations, false starts, self-corrections, pausing patterns.

For EACH of the four criteria (Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, Pronunciation), provide:
- A band score from 1.0 to 9.0 (in 0.5 increments)
- strengths: list of 1-3 specific positive observations
- weak_areas: list of 1-3 specific problems identified
- how_to_improve: list of 1-3 actionable improvement tips
- mistakes: list of notable errors in grammar, vocabulary, or pronunciation.

For Pronunciation feedback, align your evaluation with a multi-dimensional approach:
- Classify the candidate's pronunciation level: "Excellent" (score 90-100% equivalent), "Good" (70-89% equivalent), "Fair" (50-69% equivalent), or "Needs Improvement" (under 50% equivalent).
- Highlight specific mispronounced sounds, consonant deletion, vowel shortening, or flat intonation.

Calculate the overall band as the mean of the 4 criteria (rounded to the nearest 0.5 using IELTS rounding rules: if the fraction is less than 0.25, round down to .0; if it is 0.25 or greater but less than 0.75, round to .5; if it is 0.75 or greater, round up to the next .0).

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

PART_INSTRUCTIONS = {
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

def _round_to_half(value: float) -> float:
    # Standard IELTS rounding rules:
    # fraction < 0.25 -> round down to .0
    # 0.25 <= fraction < 0.75 -> round to .5
    # fraction >= 0.75 -> round up to next .0
    base = int(value)
    fraction = value - base
    if fraction < 0.25:
        return float(base)
    elif fraction < 0.75:
        return float(base) + 0.5
    else:
        return float(base) + 1.0

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
                    "transcript": result.get("text", ""),
                    "words": result.get("words", [])
                }
            except Exception as e:
                logger.error(f"[SpeakingGrader] Failed to process audio for {key}: {e}")
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
                
    # 3. Format prompt
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
        
    logger.info(f"[SpeakingGrader] Formatted prompt length: {len(text_part)}")
    
    # 4. Call Gemini
    # Build contents with Audio files + Text transcript
    contents = audio_parts + [types.Part.from_text(text=text_part)]
    
    try:
        response = await _client.aio.models.generate_content(
            model=MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.2,
                response_mime_type="application/json",
            ),
        )
    except Exception as e:
        logger.error(f"[SpeakingGrader] Gemini API call failed: {e}")
        raise

    # 5. Output processing
    try:
        result = typing.cast(typing.Dict[str, typing.Any], json.loads(response.text))
    except json.JSONDecodeError as e:
        logger.error(f"[SpeakingGrader] JSON recovery failed for raw response: {response.text}")
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


async def grade_single_speaking_part(
    part_number: int,
    part_type: str,
    questions: typing.List[str],
    audio_answers: typing.Dict[str, str],
) -> dict:
    """Grade a single IELTS speaking part (Part 1, 2, or 3)."""
    if not _client:
        logger.warning("[AdvSpeaking] GEMINI_API_KEY is missing! Grading will fail.")
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

                logger.info(f"[AdvSpeaking] Transcribing question {key}")
                result = transcription_svc.transcribe(path)
                transcripts[key] = {
                    "question": q_text,
                    "transcript": result.get("text", ""),
                    "words": result.get("words", []),
                }
            except Exception as e:
                logger.error(f"[AdvSpeaking] Failed to process audio for {key}: {e}")
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

    instructions = PART_INSTRUCTIONS.get(part_number, PART_INSTRUCTIONS[1])
    system_prompt = SINGLE_PART_SYSTEM_PROMPT.replace(
        "{part_label}", part_label
    ).replace(
        "{part_instructions}", instructions
    )

    contents = audio_parts + [types.Part.from_text(text=text_part)]

    try:
        response = await _client.aio.models.generate_content(
            model=MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=0.2,
                response_mime_type="application/json",
            ),
        )
    except Exception as e:
        logger.error(f"[AdvSpeaking] Gemini API call failed: {e}")
        raise

    try:
        result = typing.cast(typing.Dict[str, typing.Any], json.loads(response.text))
    except json.JSONDecodeError:
        logger.error(f"[AdvSpeaking] JSON parse failed for raw response: {response.text}")
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

    result["overall_band"] = _calc_overall_band(result.get("criteria", {}))
    result["transcripts"] = transcripts
    return result
