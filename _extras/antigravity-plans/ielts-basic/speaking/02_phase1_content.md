# Phase 1 — Theory Content Authoring

> **Goal:** Create `speaking_theory.txt` with 6 lessons covering all 3 parts of the IELTS Speaking test.
> **Dependencies:** None. **Effort:** ~3 hours.

---

## Step 1: Create the Theory TXT File

**File:** `backend-core/prisma/data/ielts-basic-compiled/speaking_theory.txt` (create new)

### Important Format Rules

1. Root line must be `- speaking + theory`
2. Each lesson title at 4-space indent: `    - Lesson Title`
3. Content block at 8-space indent: `        - Content`
4. **Sub-block names MUST be exactly:**
   - `- Fluency & Coherence` (maps to modal type `"traps"`, green Target icon)
   - `- Grammar & Pronunciation` (maps to modal type `"strategy"`, pink Link icon)
   - `- Lexical Resource` (maps to modal type `"tips"`, yellow BookOpen icon)
5. Quiz block at 8-space indent: `        - Quiz`
6. All markdown content is at 12-space indent

### Seeder Mapping Note

The seeder function `getTheoryLessons()` in `ielts-basic.seeder.ts` parses sub-blocks at the 12-space indent level. It maps block names to types using this logic (around line 245-280):

```
"task achievement" → type: "traps"
"grammar" (partial match) → type: "strategy"  
"lexical" (partial match) → type: "tips"
```

**You must update the seeder** to also recognize the speaking-specific names:
```
"fluency" (partial match) → type: "traps"
"grammar" (already matched) → type: "strategy"
"lexical" (already matched) → type: "tips"
```

This means adding a check for `"fluency"` alongside the existing `"task achievement"` check in `getTheoryLessons()`.

---

## Step 2: Lesson Content Outlines

### Lesson 1: Introduction to Speaking

**Content section:**
- Test logistics: 11-14 minutes, face-to-face, recorded
- 3 parts overview with timing
- 4 scoring criteria explained
- Common mistakes (one-word answers, memorized scripts, going off-topic)
- General preparation strategies

**Fluency & Coherence sub-block:**
- What fluency means (not speed — it's about smoothness)
- Self-correction is OK; long pauses are not
- Use signposting: "First of all...", "What I mean is...", "The thing is..."

**Grammar & Pronunciation sub-block:**
- Mix simple and complex sentences
- Conditional structures: "If I had more time, I would..."
- Word stress basics: PHOtograph vs phoTOGraphy

**Lexical Resource sub-block:**
- Paraphrasing: Don't repeat the examiner's words
- Topic vocabulary banks for common Part 1 topics (home, work, studies, hobbies)

**Quiz:** 6 MCQ questions testing comprehension of test format and scoring criteria.

---

### Lesson 2: Part 1 — Personal Questions

**Content section:**
- What Part 1 is: 4-5 minutes, familiar topics
- The AREA method: **A**nswer → **R**eason → **E**xample → **A**dd-on
- How to extend answers naturally (aim for 2-3 sentences per question)
- Common Part 1 topics: hometown, work/studies, daily routine, hobbies, food, weather

**Fluency & Coherence sub-block:**
- Natural openers: "Well, ...", "Actually, ...", "To be honest, ..."
- Avoid starting every answer with "I think..."
- Linking: "...and on top of that...", "...not to mention..."

**Grammar & Pronunciation sub-block:**
- Present Simple vs Present Continuous for habits vs current activities
- Frequency adverbs placement
- Intonation: rising for lists, falling for statements

**Lexical Resource sub-block:**
- Table of common Part 1 topics with 5-8 key vocabulary items each
- Collocations: "keen on", "passionate about", "can't stand", "fond of"

**Quiz:** 6 MCQ questions.

---

### Lesson 3: Part 2 — The Cue Card

**Content section:**
- What Part 2 is: receive topic card, 1 min prep, speak 1-2 min
- How to read the cue card (identify the 4 bullet points)
- The 1-minute planning technique: write keywords, not sentences
- How to structure your talk: brief intro → address each bullet → wrap up
- What to do if you run out of things to say

**Fluency & Coherence sub-block:**
- Signposting for long turns: "I'd like to talk about...", "Moving on to...", "To wrap up..."
- Time management: ~30 seconds per bullet point
- How to naturally fill time without repetition

**Grammar & Pronunciation sub-block:**
- Past tenses for "Describe a time when..." questions
- Relative clauses: "...which was something I really enjoyed"
- Sentence stress for emphasis

**Lexical Resource sub-block:**
- Descriptive adjectives: fascinating, breathtaking, thought-provoking, overwhelming
- Narrative phrases: "What struck me most was...", "The highlight of the experience was..."

**Quiz:** 6 MCQ questions.

---

### Lesson 4: Part 3 — Abstract Discussion

**Content section:**
- What Part 3 is: 4-5 minutes, deeper questions linked to Part 2
- How it differs from Part 1 (abstract vs personal, opinion vs fact)
- How to give balanced opinions
- Speculating about the future: "I suppose...", "It's likely that..."

**Fluency & Coherence sub-block:**
- Discourse markers for discussion: "On one hand...", "Having said that..."
- How to buy thinking time: "That's an interesting question...", "Let me think about that..."
- Building extended arguments (point → explain → example → conclude)

**Grammar & Pronunciation sub-block:**
- Modal verbs for speculation: might, could, may, would
- Passive voice for formal discussion: "It could be argued that..."
- Complex conditionals: "If governments were to invest more..."

**Lexical Resource sub-block:**
- Opinion phrases: "From my perspective", "I'm firmly convinced", "It's debatable whether"
- Agreement/disagreement language
- Topic vocabulary for common Part 3 themes (technology, education, environment, society)

**Quiz:** 6 MCQ questions.

---

### Lesson 5: Fluency & Coherence Mastery

**Content section:**
- Good fillers vs bad fillers ("Well..." ✓ vs "Umm..." ✗)
- Self-correction techniques: "Sorry, what I meant was..."
- How to handle questions you don't understand: "Could you rephrase that?"
- Discourse markers masterclass with examples

**Fluency & Coherence sub-block:**
- Complete reference table of discourse markers by function (adding, contrasting, exemplifying, concluding)

**Grammar & Pronunciation sub-block:**
- Complex sentence patterns that sound natural when spoken
- Ellipsis and short forms in natural speech

**Lexical Resource sub-block:**
- Idiomatic expressions appropriate for IELTS (not too informal)
- Phrasal verbs for common topics

**Quiz:** 6 MCQ questions.

---

### Lesson 6: Pronunciation & Lexical Resource

**Content section:**
- Word stress patterns: 2-syllable nouns vs verbs (REcord vs reCORD)
- Sentence stress: content words stressed, function words unstressed
- Intonation patterns: falling for statements, rising for yes/no questions
- Connected speech: linking, elision, assimilation

**Fluency & Coherence sub-block:**
- How good pronunciation supports fluency
- Chunking: speaking in meaningful phrases, not word by word

**Grammar & Pronunciation sub-block:**
- Stress shift in word families: ECONomy → ecoNOMic → econOMically
- Common pronunciation pitfalls for Vietnamese/Asian speakers

**Lexical Resource sub-block:**
- Collocations bank organized by topic
- Paraphrasing practice: 10 common words → 3 synonyms each
- How to naturally introduce less common vocabulary

**Quiz:** 6 MCQ questions.

---

## Step 3: Write the Full File

Using the outlines above, write the complete `speaking_theory.txt` file following this exact template for each lesson:

```
- speaking + theory
    - Introduction to Speaking
        - Content
            ## 1. Test Format
            
            (markdown content here...)
            
            - Fluency & Coherence
                (content with tables, examples)
            - Grammar & Pronunciation
                (content with tables, examples)
            - Lexical Resource
                (content with tables, examples)
        - Quiz
            1. Question text
            A) Option A
            B) Option B
            C) Option C
            D) Option D
            **Hint:** hint text
            **Answer:** B
            **Why:** explanation
    - Part 1 — Personal Questions
        - Content
            ...
```

Each quiz should have **6 MCQ questions** with Hint, Answer, and Why fields.

---

## Step 4: Verify

After creating the file, verify:
1. The root line is `- speaking + theory`
2. There are exactly 6 lessons
3. Each lesson has Content (with 3 sub-blocks) + Quiz (6 questions)
4. Sub-block names are exactly: `Fluency & Coherence`, `Grammar & Pronunciation`, `Lexical Resource`
5. All indentation is correct (4-space increments)
