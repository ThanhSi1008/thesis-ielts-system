# Phase 4: AI Grading Integration

> **Goal**: Adapt the existing Gemini-based speaking grading pipeline to support **single-part** speaking evaluation for the IELTS Advanced Speaking module.

> **Depends on**: Phase 3 (backend API with RabbitMQ publish)

---

## 1. Current Grading Pipeline

```
Backend (NestJS)
  └─► AiClientService.publishGradingTask()
        └─► RabbitMQ: "exam-grading-queue"
              └─► GradingConsumer._grade_speaking()
                    └─► speaking_grader.grade_speaking()
                          └─► Whisper (transcription)
                          └─► Gemini API (grading)
                                └─► DB Update (session.feedback + session.bandScore)
```

### What Exists Today

The current `speaking_grader.py` (`backend-ai/app/services/speaking_grader.py`):
1. Receives `audio_answers` (base64-encoded audio per question key like `"0-0"`, `"0-1"`, etc.)
2. Decodes each audio → writes to temp `.webm` file
3. Transcribes each audio using Whisper (`transcription_service.py`)
4. Sends **both audio parts AND text transcripts** to Gemini for multimodal grading
5. Returns grading with 4 criteria: Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation

The key difference: the existing grader processes **all 3 parts** together (keys like `"0-0"` for Part 1 Question 1, `"1-0"` for Part 2, `"2-0"` for Part 3 Question 1). For Advanced Speaking, we only have **one part at a time** with simple keys like `"0"`, `"1"`, `"2"`, `"3"`.

### What We Need

A **single-part** grading mode that:
- Accepts audio from just 1–4 questions (not all 3 parts)
- Adjusts the grading prompt to focus on the specific part type
- Returns the same feedback JSON shape

---

## 2. Changes to `speaking_grader.py`

File: `backend-ai/app/services/speaking_grader.py`

### 2.1. New Function: `grade_single_speaking_part`

Add this function alongside the existing `grade_speaking`:

```python
SINGLE_PART_SYSTEM_PROMPT = """You are an expert IELTS examiner. Grade the user's Speaking {part_label} responses according to the official IELTS Speaking band descriptors.

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
{{
  "overall_band": 6.5,
  "criteria": {{
    "fluency_and_coherence": {{
      "band": 6.5,
      "strengths": ["..."],
      "weak_areas": ["..."],
      "how_to_improve": ["..."],
      "mistakes": [{{ "original": "...", "correction": "...", "explanation": "..." }}]
    }},
    "lexical_resource": {{ ... }},
    "grammatical_range_and_accuracy": {{ ... }},
    "pronunciation": {{ ... }}
  }}
}}"""

PART_INSTRUCTIONS = {
    1: """Part 1 (Interview): The examiner asks 3-4 familiar topic questions. 
Assess the candidate's ability to give appropriately extended responses about familiar topics.
Responses should be natural and conversational, typically 20-40 seconds each.
Penalise heavily under Fluency if responses are excessively short (under 10 seconds) or feel rehearsed.""",

    2: """Part 2 (Individual Long Turn / Cue Card): The candidate speaks for 1-2 minutes on a given topic.
Assess the candidate's ability to speak at length on a topic, using appropriate language and organising ideas coherently.
The response should cover all bullet points on the cue card.
Penalise under Task Achievement/Fluency if the candidate fails to speak for at least 1 minute or doesn't address the cue card points.""",

    3: """Part 3 (Discussion): The examiner asks abstract/analytical questions related to Part 2's topic.
Assess the candidate's ability to discuss abstract ideas, express and justify opinions, and analyse issues.
Responses should demonstrate more complex language and deeper thinking than Part 1.
This part tests the candidate's ability to go beyond personal experience into general/abstract discussion.""",
}


async def grade_single_speaking_part(
    part_number: int,
    part_type: str,
    questions: list[str],
    audio_answers: dict[str, str],
) -> dict:
    """Grade a single IELTS speaking part (Part 1, 2, or 3)."""

    if not _client:
        raise ValueError("GEMINI_API_KEY is missing.")

    transcription_svc = get_transcription_service()

    # 1. Decode audio & transcribe
    transcripts = {}
    temp_files = []
    audio_parts = []

    try:
        for key, audio_source in audio_answers.items():
            if not audio_source:
                continue

            try:
                fd, path = tempfile.mkstemp(suffix=".webm")
                temp_files.append(path)

                # Handle base64 audio
                if "," in audio_source:
                    audio_source = audio_source.split(",")[1]
                audio_bytes = base64.b64decode(audio_source)
                with os.fdopen(fd, 'wb') as f:
                    f.write(audio_bytes)

                # Add audio to multimodal parts
                q_idx = int(key)
                q_text = questions[q_idx] if q_idx < len(questions) else f"Question {key}"

                audio_parts.append(
                    types.Part.from_text(text=f"[Audio for: {q_text}]")
                )
                audio_parts.append(
                    types.Part.from_bytes(data=audio_bytes, mime_type="audio/webm")
                )

                # Transcribe
                logger.info(f"[AdvSpeaking] Transcribing question {key}")
                result = transcription_svc.transcribe(path)

                transcripts[key] = {
                    "question": q_text,
                    "transcript": result.get("text", ""),
                    "words": result.get("words", [])
                }
            except Exception as e:
                logger.error(f"[AdvSpeaking] Failed to process audio for {key}: {e}")
                q_idx = int(key) if key.isdigit() else 0
                transcripts[key] = {
                    "question": questions[q_idx] if q_idx < len(questions) else f"Question {key}",
                    "transcript": "(Audio transcription failed)",
                    "words": []
                }
    finally:
        for path in temp_files:
            try:
                os.remove(path)
            except OSError:
                pass

    # 2. Format text prompt
    part_label = f"Part {part_number}"
    text_part = f"=== SPEAKING {part_label.upper()} TRANSCRIPT ===\n\n"

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
                low_conf = [w.get("word", "") for w in words if w.get("probability", 0) < 0.7]
                text_part += f"[STT Confidence: {avg_conf:.2f}"
                if low_conf:
                    text_part += f" | Low confidence: {', '.join(low_conf)}"
                text_part += "]\n"
            text_part += "\n"

    # 3. Build system prompt
    instructions = PART_INSTRUCTIONS.get(part_number, PART_INSTRUCTIONS[1])
    system_prompt = SINGLE_PART_SYSTEM_PROMPT.format(
        part_label=part_label,
        part_instructions=instructions,
    )

    # 4. Call Gemini
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

    # 5. Parse result
    try:
        result = json.loads(response.text)
    except json.JSONDecodeError:
        logger.error(f"[AdvSpeaking] JSON parse failed: {response.text}")
        result = {
            "overall_band": 0,
            "criteria": {
                "fluency_and_coherence": {"band": 0, "strengths": [], "weak_areas": [], "how_to_improve": [], "mistakes": []},
                "lexical_resource": {"band": 0, "strengths": [], "weak_areas": [], "how_to_improve": [], "mistakes": []},
                "grammatical_range_and_accuracy": {"band": 0, "strengths": [], "weak_areas": [], "how_to_improve": [], "mistakes": []},
                "pronunciation": {"band": 0, "strengths": [], "weak_areas": [], "how_to_improve": [], "mistakes": []}
            }
        }

    # Recalculate overall band for consistency
    result["overall_band"] = _calc_overall_band(result.get("criteria", {}))

    # Attach transcripts for frontend display
    result["transcripts"] = transcripts

    return result
```

---

## 3. Changes to `grading_consumer.py`

File: `backend-ai/app/consumers/grading_consumer.py`

### 3.1. Add Import

```python
from app.services.speaking_grader import grade_speaking, grade_single_speaking_part
```

### 3.2. Add New Handler for `ADVANCED_SPEAKING`

In the main message router:

```python
async def _handle_message(self, body: dict):
    msg_type = body.get("type")

    if msg_type == "WRITING":
        await self._grade_writing(body)
    elif msg_type == "SPEAKING":
        await self._grade_speaking(body)
    elif msg_type == "ADVANCED_WRITING":
        await self._grade_advanced_writing(body)
    elif msg_type == "ADVANCED_SPEAKING":           # ← NEW
        await self._grade_advanced_speaking(body)
    else:
        logger.warning(f"Unknown grading type: {msg_type}")
```

### 3.3. Implement `_grade_advanced_speaking`

```python
async def _grade_advanced_speaking(self, body: dict):
    """Grade a single speaking part for IELTS Advanced Speaking module."""
    session_id = body["sessionId"]
    part_number = body["partNumber"]
    part_type = body["partType"]
    questions = body["questions"]
    audio_answers = body["audioAnswers"]

    logger.info(f"Grading advanced speaking session {session_id} (Part {part_number})")

    try:
        result = await grade_single_speaking_part(
            part_number=part_number,
            part_type=part_type,
            questions=questions,
            audio_answers=audio_answers,
        )

        await self._update_advanced_speaking_session(
            session_id,
            status="GRADED",
            feedback=result,
            band_score=result["overall_band"],
        )

        logger.info(f"Advanced speaking session {session_id} graded: band {result['overall_band']}")

    except Exception as e:
        logger.error(f"Failed to grade advanced speaking session {session_id}: {e}")
        await self._update_advanced_speaking_session(
            session_id,
            status="GRADING_FAILED",
            feedback={"error": str(e)},
            band_score=None,
        )
```

### 3.4. DB Update Helper

```python
async def _update_advanced_speaking_session(
    self,
    session_id: str,
    status: str,
    feedback: dict,
    band_score: float | None,
):
    """Update the IeltsAdvancedSpeakingSession record."""
    import json as json_module

    query = """
        UPDATE ielts_advanced_speaking_sessions
        SET status = $1,
            feedback = $2,
            "bandScore" = $3,
            "updatedAt" = NOW()
        WHERE id = $4
    """
    await self.db_pool.execute(
        query,
        status,
        json_module.dumps(feedback),
        band_score,
        session_id,
    )
```

> **Note**: Check the exact DB update method used in the existing `_grade_speaking`. Match the pattern (direct SQL via asyncpg or HTTP call to NestJS).

---

## 4. Feedback JSON Shape (for Frontend)

The `feedback` stored in `IeltsAdvancedSpeakingSession.feedback` will be:

```typescript
interface SpeakingFeedback {
  overall_band: number;
  criteria: {
    fluency_and_coherence: CriterionFeedback;
    lexical_resource: CriterionFeedback;
    grammatical_range_and_accuracy: CriterionFeedback;
    pronunciation: CriterionFeedback;
  };
  transcripts: Record<string, {
    question: string;
    transcript: string;
    words: Array<{ word: string; probability: number }>;
  }>;
}

interface CriterionFeedback {
  band: number;
  strengths: string[];
  weak_areas: string[];
  how_to_improve: string[];
  mistakes: Array<{
    original: string;
    correction: string;
    explanation: string;
  }>;
}
```

> This is the **same shape** as the existing `SpeakingResultView.tsx` expects. The frontend can reuse it directly.

---

## 5. Files Modified

| File | Change |
|------|--------|
| `backend-ai/app/services/speaking_grader.py` | Add `grade_single_speaking_part()` function + part-specific prompts |
| `backend-ai/app/consumers/grading_consumer.py` | Add `_grade_advanced_speaking()` handler + `ADVANCED_SPEAKING` case + DB update helper |

---

## 6. Testing Checklist

- [ ] Submit audio via API → check RabbitMQ receives the message with `type: "ADVANCED_SPEAKING"`
- [ ] Consumer processes `ADVANCED_SPEAKING` type correctly
- [ ] Whisper transcribes each audio clip (check logs)
- [ ] Gemini receives both audio parts and text transcripts
- [ ] Gemini returns valid JSON matching the expected feedback schema
- [ ] Session status updates from `GRADING` → `GRADED`
- [ ] `feedback` JSON is stored correctly (including `transcripts`)
- [ ] `bandScore` is populated correctly
- [ ] Error case: Gemini fails → session status = `GRADING_FAILED`
- [ ] Part 1: 4 separate audio clips processed correctly
- [ ] Part 2: 1 long audio clip processed correctly
- [ ] Part 3: 4-7 audio clips processed correctly
