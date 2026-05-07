# Phase 2 — Exercise Data (Model Answers + Cloze/MCQ Conversion)

> **Goal:** Create `speaking_exercises.txt` with 18 exercises (14 cloze + 4 MCQ), extend the converter script, generate `speaking_cloze_auto.json`.
> **Dependencies:** Phase 1 (theme names must align). **Effort:** ~3-4 hours.

---

## Step 1: Create the Exercises TXT File

**File:** `backend-core/prisma/data/ielts-basic-compiled/speaking_exercises.txt` (create new)

### File Structure

Follow a similar format to `writing_task_2_exercises.txt` but adapted for speaking:

```
- speaking + exercise
    - Part 1 — Personal Questions
        - Hobbies
            - Exercise 1
                - Question
                    - Prompt

                        Do you have any hobbies?

                    - QuestionType

                        cloze

                - Answer
                    - Model Response

                        Well, to be honest, I'm quite into outdoor activities. I particularly enjoy hiking because it helps me unwind after a long week. On top of that, I find that being in nature really clears my mind and gives me a fresh perspective on things.

    - Best Response Practice
        - Part 1
            - Exercise 1
                - Question
                    - Prompt

                        Examiner asks: "Do you enjoy cooking?"

                    - QuestionType

                        mcq

                - Answer
                    - Options

                        A) Yes.
                        B) Yes, I love cooking. I cook every day. Cooking is my hobby.
                        C) Well, actually I'm quite passionate about cooking. I particularly enjoy experimenting with Thai cuisine because the combination of flavours is incredibly diverse.
                        D) I think cooking is very important for health.

                    - CorrectAnswer

                        C

                    - Feedback A

                        Too short — the examiner expects extended answers of 2-3 sentences.

                    - Feedback B

                        Repetitive — uses 'cooking' 3 times with no vocabulary variety.

                    - Feedback C

                        Excellent — extended, natural, uses range, gives a specific example.

                    - Feedback D

                        Doesn't directly answer whether YOU enjoy cooking.
```

### Exercise Topics to Write

#### Part 1 — Personal Questions (6 cloze exercises)

| # | Sub-Category | Prompt |
|---|---|---|
| 1 | Hobbies | "Do you have any hobbies?" |
| 2 | Hometown | "Can you describe your hometown?" |
| 3 | Work/Studies | "What do you do for a living?" / "What are you studying?" |
| 4 | Daily Routine | "Can you describe a typical day for you?" |
| 5 | Food | "What kind of food do you enjoy?" |
| 6 | Weather | "What is the weather like in your country?" |

Each answer should be a **natural spoken response of 3-4 sentences** using the AREA method.

#### Part 2 — Cue Card Responses (4 cloze exercises)

| # | Sub-Category | Prompt |
|---|---|---|
| 1 | A Person | "Describe a person who has influenced you. You should say: who this person is, how you know them, what they have done, and explain why they influenced you." |
| 2 | A Place | "Describe a place you have visited that you found very beautiful. You should say: where it was, when you went there, what you did there, and explain why you found it beautiful." |
| 3 | An Event | "Describe a memorable event in your life. You should say: what it was, when it happened, who was involved, and explain why it was memorable." |
| 4 | An Object | "Describe a gift you received that was important to you. You should say: what it was, who gave it to you, when you received it, and explain why it was important." |

Each answer should be a **structured spoken response of 4-6 sentences** with signposting.

#### Part 3 — Abstract Discussion (4 cloze exercises)

| # | Sub-Category | Prompt |
|---|---|---|
| 1 | Technology | "Do you think technology has made people's lives better or worse?" |
| 2 | Education | "How important is it for young people to go to university?" |
| 3 | Environment | "What can individuals do to help protect the environment?" |
| 4 | Society | "Do you think there is too much emphasis on material wealth in modern society?" |

Each answer should use **opinion language + balanced discussion** in 4-5 sentences.

#### Best Response MCQ (4 MCQ exercises)

| # | Sub-Category | Examiner Question |
|---|---|---|
| 1 | Part 1 | "Do you enjoy cooking?" |
| 2 | Part 1 | "Do you prefer reading books or watching movies?" |
| 3 | Part 3 | "Do you think children should learn a musical instrument?" |
| 4 | Part 3 | "Is it better to live in the city or the countryside?" |

Each MCQ has 4 options (A-D) with one correct answer and feedback for each option explaining why it's good/bad.

---

## Step 2: Extend the Converter Script

**File:** `backend-core/prisma/data/convert_cloze.js` (modify existing)

### 2.1 — Add Speaking Distractor Dictionary

Add a `speakingDict` after the existing `task2Dict`:

```javascript
const speakingDict = {
  // ── Natural openers ──
  "honest,": ["frank,", "serious,", "truthful,"],
  "Actually,": ["Basically,", "Obviously,", "Certainly,"],
  "Well,": ["So,", "Right,", "OK,"],
  
  // ── AREA method connectors ──
  "particularly": ["especially", "specifically", "mainly"],
  "especially": ["particularly", "specifically", "mainly"],
  "because": ["since", "as", "given that"],
  
  // ── Discourse markers ──
  "Furthermore,": ["However,", "Nevertheless,", "Although,"],
  "Moreover,": ["However,", "Nevertheless,", "Conversely,"],
  "Additionally,": ["However,", "Conversely,", "Nevertheless,"],
  "Consequently,": ["Similarly,", "Meanwhile,", "Furthermore,"],
  
  // ── Opinion expressions ──
  "perspective,": ["experience,", "knowledge,", "opinion,"],
  "convinced": ["uncertain", "skeptical", "doubtful"],
  "firmly": ["loosely", "somewhat", "vaguely"],
  "strongly": ["slightly", "somewhat", "partially"],
  
  // ── Descriptive adjectives ──
  "fascinating": ["boring", "ordinary", "simple"],
  "remarkable": ["ordinary", "typical", "common"],
  "incredible": ["mediocre", "ordinary", "average"],
  "breathtaking": ["unremarkable", "plain", "dull"],
  "overwhelming": ["underwhelming", "insignificant", "trivial"],
  
  // ── Speaking-specific vocabulary ──
  "unwind": ["stress", "worry", "tense"],
  "passionate": ["indifferent", "apathetic", "neutral"],
  "diverse": ["uniform", "identical", "monotonous"],
  "significant": ["minimal", "negligible", "slight"],
  "beneficial": ["harmful", "detrimental", "damaging"]
};
```

### 2.2 — Add Speaking Parser Section

Add at the end of `convert_cloze.js`, following the same pattern as the Task 2 section:

1. Read `speaking_exercises.txt`
2. Parse each exercise (detect `QuestionType: cloze` vs `mcq`)
3. For cloze exercises: run through `processSpeakingParagraph()` using `speakingDict`
4. For MCQ exercises: parse options, correct answer, and feedback into structured JSON
5. Output to `speaking_cloze_auto.json`

The key difference from Writing: speaking has a `Model Response` section instead of `Introduction/Body 1/Body 2/Conclusion`. The parser should look for `- Model Response` and create a single paragraph titled "Model Response".

For MCQ exercises, the parser should output:
```json
{
  "questionType": "mcq",
  "content": {
    "question": "Which response would score highest?",
    "options": [...],
    "correctAnswer": "C"
  }
}
```

### 2.3 — Run the Converter

```bash
cd backend-core/prisma/data
node convert_cloze.js
# Expected: "Generated 18 Speaking exercises in .../speaking_cloze_auto.json"
```

---

## Step 3: Verify Output

Check `speaking_cloze_auto.json`:
- 14 cloze exercises should have `questionType: "cloze"` with `modelAnswer.paragraphs`
- 4 MCQ exercises should have `questionType: "mcq"` with `content.options`
- All exercises should have `partType` (1, 2, or 3)
- Each cloze paragraph should have 2-3 blanks with 4 options each
