# Phase 4: AI Grading Integration

> **Goal**: Adapt the existing Gemini-based grading pipeline to support **single-task** writing evaluation for the IELTS Advanced Writing module.

> **Depends on**: Phase 3 (backend API with RabbitMQ publish)

---

## 1. Current Grading Pipeline

```
Backend (NestJS)
  └─► AiClientService.publishGradingTask()
        └─► RabbitMQ: "exam-grading-queue"
              └─► GradingConsumer._grade_writing()
                    └─► writing_grader.grade_writing()
                          └─► Gemini API
                                └─► DB Update (session.feedback + session.bandScore)
```

### What Exists Today

The current `writing_grader.py` grades **two tasks together** (Task 1 + Task 2 as a pair). It returns:

```json
{
  "overall_band": 6.5,
  "task1": { "band": 6.0, "criteria": { ... }, "mistakes": [...] },
  "task2": { "band": 7.0, "criteria": { ... }, "mistakes": [...] }
}
```

### What We Need

A **single-task** grading mode that returns:

```json
{
  "overall_band": 6.5,
  "criteria": {
    "task_achievement": { "band": 6.5, "strengths": [...], "weak_areas": [...], "how_to_improve": [...] },
    "coherence_and_cohesion": { ... },
    "lexical_resource": { ... },
    "grammatical_range_and_accuracy": { ... }
  },
  "mistakes": [
    { "original": "...", "corrected": "...", "explanation": "...", "criterion": "..." }
  ]
}
```

---

## 2. Changes to `writing_grader.py`

File: `backend-ai/app/services/writing_grader.py`

### 2.1. New System Prompt for Single-Task Grading

Add a new constant:

```python
SINGLE_TASK_SYSTEM_PROMPT = """You are an expert IELTS examiner. Grade the following IELTS Writing {task_type} strictly according to the official IELTS band descriptors.

{task_specific_instructions}

For EACH of the four criteria (Task Achievement/Response, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy), provide:
- A band score from 1.0 to 9.0 (in 0.5 increments)
- strengths: list of 1-3 specific positive observations
- weak_areas: list of 1-3 specific problems identified
- how_to_improve: list of 1-3 actionable improvement tips

Also identify specific mistakes:
- Up to 8 notable language mistakes
- Each mistake: the original phrase, a corrected version, a brief explanation, and the criterion it falls under

Calculate the overall band as the mean of the 4 criteria (rounded to nearest 0.5).

Respond ONLY with valid JSON in this exact shape, no extra text:
{{
  "overall_band": 6.5,
  "criteria": {{
    "task_achievement": {{
      "band": 6.0,
      "strengths": ["..."],
      "weak_areas": ["..."],
      "how_to_improve": ["..."]
    }},
    "coherence_and_cohesion": {{ ... }},
    "lexical_resource": {{ ... }},
    "grammatical_range_and_accuracy": {{ ... }}
  }},
  "mistakes": [
    {{
      "original": "...",
      "corrected": "...",
      "explanation": "...",
      "criterion": "lexical_resource"
    }}
  ]
}}"""

TASK_1_INSTRUCTIONS = """For Task 1, you will be given the task prompt (and image description if available). Use it to verify whether the candidate has accurately described the data — correct values, trends, key features, and comparisons. Penalise under Task Achievement if the candidate misreads or ignores key data.

The essay should be at least 150 words. Penalise under Task Achievement if significantly under word count."""

TASK_2_INSTRUCTIONS = """For Task 2, evaluate the candidate's ability to present a clear position, develop supporting arguments with relevant examples, and address all parts of the question. Penalise under Task Achievement/Response if the position is unclear or parts of the question are not addressed.

The essay should be at least 250 words. Penalise under Task Achievement if significantly under word count."""
```

### 2.2. New Function: `grade_single_writing_task`

```python
async def grade_single_writing_task(
    task_type: str,       # "TASK_1" or "TASK_2"
    prompt: str,
    essay: str,
    image_url: str = "",
) -> dict:
    """Grade a single IELTS writing task (Task 1 or Task 2)."""

    if not _client:
        raise RuntimeError("Gemini client not configured")

    # Build task-specific instructions
    task_label = "Task 1" if task_type == "TASK_1" else "Task 2"
    instructions = TASK_1_INSTRUCTIONS if task_type == "TASK_1" else TASK_2_INSTRUCTIONS

    system_prompt = SINGLE_TASK_SYSTEM_PROMPT.format(
        task_type=task_label,
        task_specific_instructions=instructions,
    )

    # Build content parts
    contents = []

    # Add image for Task 1 if available
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

    # Add text prompt and essay
    user_message = f"""## Writing Prompt
{prompt}

## Candidate's Essay ({task_label})
{essay}"""

    contents.append(user_message)

    # Call Gemini
    response = await _client.aio.models.generate_content(
        model=MODEL,
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=0.3,
            max_output_tokens=4096,
        ),
    )

    raw = response.text.strip()

    # Parse JSON from response (handle markdown code blocks)
    json_str = raw
    if "```json" in json_str:
        json_str = json_str.split("```json")[1].split("```")[0].strip()
    elif "```" in json_str:
        json_str = json_str.split("```")[1].split("```")[0].strip()

    result = json.loads(json_str)

    # Validate and clamp band scores
    for criterion in result.get("criteria", {}).values():
        if isinstance(criterion, dict) and "band" in criterion:
            criterion["band"] = max(1.0, min(9.0, round(criterion["band"] * 2) / 2))

    result["overall_band"] = max(1.0, min(9.0, round(result["overall_band"] * 2) / 2))

    return result
```

---

## 3. Changes to `grading_consumer.py`

File: `backend-ai/app/consumers/grading_consumer.py`

### 3.1. Add New Handler for `ADVANCED_WRITING`

In the main message router (usually a match/if-elif chain on `type`):

```python
async def _handle_message(self, body: dict):
    msg_type = body.get("type")

    if msg_type == "WRITING":
        await self._grade_writing(body)
    elif msg_type == "SPEAKING":
        await self._grade_speaking(body)
    elif msg_type == "ADVANCED_WRITING":           # ← NEW
        await self._grade_advanced_writing(body)
    else:
        logger.warning(f"Unknown grading type: {msg_type}")
```

### 3.2. Implement `_grade_advanced_writing`

```python
async def _grade_advanced_writing(self, body: dict):
    """Grade a single writing task for IELTS Advanced Writing module."""
    session_id = body["sessionId"]
    task_type = body["taskType"]    # "TASK_1" or "TASK_2"
    prompt = body["prompt"]
    essay = body["essay"]
    image_url = body.get("imageUrl", "")

    logger.info(f"Grading advanced writing session {session_id} ({task_type})")

    try:
        result = await grade_single_writing_task(
            task_type=task_type,
            prompt=prompt,
            essay=essay,
            image_url=image_url,
        )

        # Update session in database
        await self._update_advanced_writing_session(
            session_id,
            status="GRADED",
            feedback=result,
            band_score=result["overall_band"],
        )

        logger.info(f"Advanced writing session {session_id} graded: band {result['overall_band']}")

    except Exception as e:
        logger.error(f"Failed to grade advanced writing session {session_id}: {e}")
        await self._update_advanced_writing_session(
            session_id,
            status="GRADING_FAILED",
            feedback={"error": str(e)},
            band_score=None,
        )
```

### 3.3. DB Update Helper

```python
async def _update_advanced_writing_session(
    self,
    session_id: str,
    status: str,
    feedback: dict,
    band_score: float | None,
):
    """Update the IeltsAdvancedWritingSession record."""
    import json as json_module

    query = """
        UPDATE ielts_advanced_writing_sessions
        SET status = $1,
            feedback = $2,
            "bandScore" = $3,
            "updatedAt" = NOW()
        WHERE id = $4
    """
    # Use the existing database connection pool
    await self.db_pool.execute(
        query,
        status,
        json_module.dumps(feedback),
        band_score,
        session_id,
    )
```

> **Note**: Check the exact DB update method used in the existing `_grade_writing`. Some implementations use Prisma via a separate HTTP call, others use direct SQL via asyncpg. **Match the existing pattern**.

---

## 4. Feedback JSON Shape (for Frontend)

The `feedback` stored in `IeltsAdvancedWritingSession.feedback` must be compatible with the existing `WritingResultView.tsx` component. The shape:

```typescript
// TypeScript interface (for reference)
interface WritingFeedback {
  overall_band: number;
  criteria: {
    task_achievement: CriterionFeedback;
    coherence_and_cohesion: CriterionFeedback;
    lexical_resource: CriterionFeedback;
    grammatical_range_and_accuracy: CriterionFeedback;
  };
  mistakes: Mistake[];
}

interface CriterionFeedback {
  band: number;
  strengths: string[];
  weak_areas: string[];
  how_to_improve: string[];
}

interface Mistake {
  original: string;
  corrected: string;
  explanation: string;
  criterion: string;
}
```

> **IMPORTANT**: The existing `WritingResultView.tsx` expects `task1.criteria` and `task2.criteria`. For single-task mode, the frontend will need to adapt to read `criteria` directly at the top level. This is handled in Phase 5 (Frontend).

---

## 5. Files Modified

| File | Change |
|------|--------|
| `backend-ai/app/services/writing_grader.py` | Add `grade_single_writing_task()` function + new prompts |
| `backend-ai/app/consumers/grading_consumer.py` | Add `_grade_advanced_writing()` handler + `ADVANCED_WRITING` case |

---

## 6. Testing Checklist

- [ ] Submit an essay via API → check RabbitMQ receives the message
- [ ] Consumer processes `ADVANCED_WRITING` type correctly
- [ ] Gemini returns valid JSON matching the expected schema
- [ ] Session status updates from `GRADING` → `GRADED`
- [ ] `feedback` JSON is stored correctly in the session record
- [ ] `bandScore` is populated correctly
- [ ] Error case: Gemini fails → session status = `GRADING_FAILED`
- [ ] Task 1 with image: image is sent to Gemini for visual analysis
- [ ] Task 2 without image: text-only grading works correctly
