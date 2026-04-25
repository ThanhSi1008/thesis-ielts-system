# Academic Review & Improved Outline

## Part 1: Section-by-Section Critique

### Overall Structure Assessment

```
Current Structure:
  I.   Introduction          (~1.5 cols)
  II.  Theoretical Background (~2 cols)  ← BLOATED
  III. Related Work           (~1 col)   ← THIN
  IV.  System Architecture    (~3.5 cols) ← DESCRIPTIVE ONLY
  V.   Implementation/Results (~3 cols)  ← FATALLY WEAK
  VI.  Conclusion             (~0.5 col) ← FORMULAIC
```

**Core Diagnosis:** The paper has an inverted effort distribution — 60% of the text describes *what was built* (Sections II + IV), and only 15% evaluates *whether it works* (Section V). A strong paper would reverse this ratio.

---

### §I. Abstract — Overclaiming

- **"Key technical contributions"** — Using Faster-Whisper, prompting an LLM, and implementing SM-2 are applications of existing tools, not contributions. The abstract should say "design and implementation," not "technical contributions."
- **"Llama 3.3 70B"** is mentioned in the abstract but the code actually uses **Gemini 2.5 Flash** now. This is a factual inconsistency that must be fixed.
- **"Experimental evaluation demonstrates..."** — The SM-2 "evaluation" is a simulation. The Levenshtein pronunciation "evaluation" is now superseded by the IPA phoneme system you just built. The abstract is describing a system that no longer matches the codebase.

> [!CAUTION]
> The abstract is now **out of date** with the actual implementation. It references Levenshtein (replaced by IPA phoneme scoring), Llama 3.3 70B (replaced by Gemini), and SM-2 (replaced by FSRS). It must be rewritten completely.

---

### §II. Theoretical Background — Textbook Padding

**Current subsections (8 total):**

| Subsection | Verdict | Reasoning |
|-----------|---------|-----------|
| §II-A Event-Driven Architecture | ✅ Keep | Relevant architectural concept |
| §II-B NestJS Framework | ❌ Cut | Framework documentation, not theory |
| §II-C FastAPI Framework | ❌ Cut | Same — one sentence in a footnote suffices |
| §II-D Faster-Whisper | ✅ Keep | Core technical component, but needs WER benchmarks |
| §II-E LLM-Based Grading | ⚠️ Rewrite | Cites GPT-3 paper but system uses Gemini. Needs AES literature |
| §II-F SM-2 Algorithm | ❌ Replace | System now uses FSRS, not SM-2 |
| §II-G Levenshtein Distance | ❌ Replace | System now uses IPA phoneme scoring |
| §II-H IELTS Answer Matching | ❌ Cut | Trivial string matching — not theoretical |

**Result:** 5 of 8 subsections need to be cut or replaced. This section is 50% padding.

**Missing theory that SHOULD be here:**
- FSRS (Free Spaced Repetition Scheduler) — the algorithm you actually use now
- IPA Phoneme Analysis — the weighted phoneme distance approach you just implemented
- Multimodal LLM Assessment — sending audio to Gemini for pronunciation/fluency grading
- Automated Essay Scoring (AES) — established field with decades of research (e-rater, ASAP competition). Zero citations currently.
- Computer-Assisted Language Learning (CALL) — the entire academic field your platform belongs to. Zero citations currently.

---

### §III. Related Work — Biased and Thin

- **Feature selection is cherry-picked.** The comparison table includes "SM-2 Spaced Repetition" (only your system has it) but omits "Phoneme-level analysis" (ELSA Speak would win).
- **Reference [15]** is cited as `[Authors]` — an incomplete citation in a published paper is unacceptable.
- **Missing competitors:** No mention of IELTS Liz, Road to IELTS (British Council), Magoosh IELTS, or IDP IELTS Prep.
- **No academic literature comparison.** Related work should compare *approaches*, not just feature checklists. What other papers have used LLMs for essay scoring? What open-source pronunciation assessment systems exist?
- The reference paper (SE2025_Paper_18) handles this section slightly better by at least structuring it as a feature comparison with clear categories.

---

### §IV. System Architecture — Well-Written but Descriptive Only

This is the strongest section. However:

- **§IV-C Authentication** (1 sentence about JWT + Guards) adds nothing. Cut it.
- **§IV-D AI-Powered Grading Pipeline** is described well but never validated. The paper says "the system's most significant technical contribution" — a claim with zero supporting evidence. This is the paper's central vulnerability.
- **§IV-E IELTS Exam Engine** is one vague sentence. Either expand or cut.
- **No discussion of failure modes.** What happens when the LLM hallucinates a band score? When Whisper misidentifies speech? When RabbitMQ drops a message? An architecture section should address these.

---

### §V. Implementation and Results — The Core Failure

This section must be completely restructured. Current problems:

**§V-A Deployment (3 paragraphs):** Mentions Docker Compose and K3s but provides zero performance data about the deployment itself. This is just a technology list.

**§V-B User Interface (2 figures):** Screenshots with no usability evaluation. These figures consume ~1.5 columns of space for zero empirical value.

**§V-C SM-2 Evaluation:** 
- This is now **doubly outdated** — you migrated to FSRS, so an SM-2 simulation is evaluating an algorithm you no longer use.
- The 74,922-day maximum interval (~205 years) is reported without comment. This is either a bug or an unrealistic artifact.
- No real users. No learning outcomes. No comparison with other algorithms.

**§V-D Pronunciation Scoring:**
- Now outdated — you replaced Levenshtein with IPA phoneme scoring.
- The 51-sample evaluation with mean scores of 90.4%, 91.7%, 90.0% (nearly identical across difficulty levels) is the exact problem the upgrade was meant to fix.
- No statistical tests (ANOVA, t-tests), no confidence intervals, no p-values.

**§V-E System Performance (Table II):**
- No sample sizes, no standard deviation, no percentiles.
- "8–15s" and "10–25s" are enormous ranges reported without explanation.
- No comparison baseline against cloud alternatives.

**What's completely missing:**
- LLM grading accuracy validation (the paper's most critical gap)
- Any user study, even a small pilot
- The multimodal speaking grading upgrade (Gemini hearing audio)
- The IPA phoneme pronunciation scoring system
- The FSRS spaced repetition system

---

### §VI. Conclusion — Formulaic

- Repeats the contributions list for the **third time** (abstract → intro → conclusion).
- Future work is an unstructured wish list.
- No honest discussion of limitations.

---

### References — Weak

- **15 references** for a systems paper of this scope (minimum 25–30 expected).
- **5 documentation-as-references** (NestJS, FastAPI, Redis, Prisma, RabbitMQ) — these are not academic sources.
- **Zero AES literature** despite the paper being about automated essay scoring.
- **Zero CALL/ICALL literature** despite the paper being a language learning platform.
- **Reference [15]** is incomplete (`[Authors]`).

---

### Comparison with Reference Paper (SE2025_Paper_18)

| Aspect | Your Paper | Reference Paper | Who's Better |
|--------|-----------|----------------|--------------|
| Structure | Standard IEEE 6-section | Standard IEEE 6-section | Tie |
| Theory section | Padded with framework docs | Also padded with framework docs | Tie (both weak) |
| Related work | Feature table only | Feature table + prose comparison | Reference |
| Architecture | Well-diagrammed, 3 figures | Well-diagrammed, 5 figures | Tie |
| Evaluation | 2 simulations, no users | 3 experiments, no users | Reference (more experiments) |
| Statistical rigor | No tests, no CI | No tests, no CI | Tie (both weak) |
| References | 15 (5 are docs) | 11 (5 are docs) | Your paper (slightly more) |
| Novelty claims | Overclaims "contributions" | More honest about scope | Reference |

**Key insight:** The reference paper is not a strong paper either, but it's more honest about its scope. It calls itself a "Student Scientific Research Communication" (not an IEEE conference paper), frames its experiments modestly, and doesn't overclaim "key technical contributions." Your paper's biggest structural problem is the gap between its ambitious claims and its thin evidence.

---

## Part 2: Improved Section-by-Section Outline

> [!IMPORTANT]
> This outline integrates the three upgrades you just implemented (IPA phoneme scoring, multimodal Gemini speaking grader, FSRS) and addresses every critique from the review.

### Title (Revised)

```
"IELTS Master English AI: Design and Evaluation of an AI-Powered 
 IELTS Preparation Platform with Multi-Dimensional Speech Assessment"
```

*Rationale: The new title centers the paper around the speech assessment methodology (your strongest differentiator) rather than generic architecture.*

---

### Abstract (Rewrite completely)

- Remove "key technical contributions" framing — replace with "design and implementation"
- Update to reflect actual tech stack: Gemini (not Llama), FSRS (not SM-2), IPA phoneme scoring (not Levenshtein)
- State evaluation scope honestly: "implementation verification" and "preliminary evaluation," not "experimental evaluation demonstrates"
- ~150 words max

---

### §I. Introduction (~1 page)

1. **Problem context** — IELTS global usage, demand for automated prep tools (keep, trim)
2. **Gap analysis** — 3 specific gaps (not 4, remove the cost argument):
   - Gap 1: No automated subjective-skill grading with structured rubric output
   - Gap 2: Pronunciation assessment tools lack phoneme-level analysis accessible without paid APIs
   - Gap 3: No adaptive spaced repetition integrated with IELTS vocabulary
3. **Solution summary** — One paragraph, no bullet list (remove duplication with abstract)
4. **Paper organization** — Keep

**Cut:** The 5-item bulleted contribution list (duplicates the abstract).

---

### §II. Background and Related Work (MERGE — ~1.5 pages)

> [!TIP]
> Merge current §II and §III into a single section. This eliminates the padding problem and creates a more natural flow: introduce a concept, then immediately compare your approach with existing work.

**§II-A. Automated Essay Scoring (AES)**
- Cite e-rater (Attali & Burstein, 2006), ASAP competition, neural AES approaches
- Position LLM-based grading as the newest paradigm, cite relevant papers
- Compare: traditional AES vs. your Gemini-based approach

**§II-B. Computer-Assisted Pronunciation Assessment**
- Cite existing CAPT systems (Goodness of Pronunciation, phone-level scoring)
- Describe the IPA phoneme comparison approach and Whisper confidence scoring
- Compare: cloud-based (Azure, ELSA) vs. your local approach
- Equations: weighted phoneme edit distance formula

**§II-C. Spaced Repetition for Vocabulary Acquisition**
- Cite SM-2 (Wozniak, 1990), Leitner system, FSRS (Ye, 2023)
- Explain why FSRS supersedes SM-2 (adaptive stability, difficulty parameters)
- Equations: FSRS next-interval formula

**§II-D. Event-Driven Architecture for AI Workloads**
- Keep EDA description
- Cite RabbitMQ patterns, async processing for ML inference
- Position: why EDA is necessary for educational AI platforms

**§II-E. Comparison with Existing Platforms**
- Revised Table I: add "Phoneme-level pronunciation," add IELTS Liz/Magoosh
- Include features where your system is weaker (e.g., no community features, no offline mode)
- Fix Reference [15] or remove it

---

### §III. System Architecture (~2 pages)

**§III-A. Architecture Overview** — Keep the 3-layer diagram (Client/Application/Data)

**§III-B. AI Processing Pipeline** — The core section
- Writing grading: Gemini 2.5 Flash + structured JSON rubric
- Speaking grading: **Multimodal** — audio sent directly to Gemini + Whisper confidence scores
- Pronunciation: Whisper transcription → IPA phoneme comparison → weighted distance scoring
- Include pipeline diagram (Fig. 3)

**§III-C. FSRS-Based Vocabulary System**
- Card model, study queue, interval scheduling
- FSRS state machine diagram (replace SM-2 flowchart)

**§III-D. Personalized Learning Pathway**
- Onboarding → roadmap generation → step-level progression
- Keep concise (1 paragraph)

**§III-E. Shadowing and Dictation**
- YouTube integration, Web Speech API for real-time matching
- Keep concise (1 paragraph)

**Cut entirely:** §Auth (JWT sentence), §Exam Engine (vague sentence), §Database Design (move the 35+ models claim to a footnote)

---

### §IV. Implementation (~1 page)

**§IV-A. Technology Stack and Deployment**
- One concise table: Frontend (Next.js 14), Backend (NestJS), AI (FastAPI + Gemini), DB (PostgreSQL + Redis), Message Broker (RabbitMQ), Storage (MinIO)
- Docker Compose / K3s deployment (1 paragraph, no full-page figure)

**§IV-B. Key UI Demonstrations**
- 2 figures max: (1) AI grading result screen, (2) Pronunciation feedback with phoneme breakdown
- Brief captions, no prose description

---

### §V. Evaluation (~2.5 pages) ← THE CRITICAL SECTION

> [!IMPORTANT]
> This section should be the longest and most rigorous. Every experiment needs: sample size, methodology, results with statistics, and interpretation.

**§V-A. Multi-Dimensional Pronunciation Assessment**
- **Methodology:** 51 pronunciation samples across 3 difficulty levels, scored with 3 metrics (IPA phoneme accuracy, Whisper confidence, text accuracy)
- **Results:** Report mean ± SD for each metric at each difficulty level
- **Statistical test:** One-way ANOVA across difficulty levels
- **Show:** That IPA phoneme scores differentiate difficulty levels better than old Levenshtein scores
- **Figure:** Score distribution box plots by difficulty (3 metrics × 3 levels)
- **Table:** Summary statistics with p-values

**§V-B. FSRS Spaced Repetition Verification**
- **Frame as:** "Implementation verification" (not "evaluation")
- **Methodology:** Simulation with 3 synthetic user profiles
- **Results:** Show FSRS produces more realistic intervals than SM-2 (no 74,922-day intervals)
- **Compare:** FSRS intervals vs. SM-2 intervals for the same profiles
- If possible, include 1-2 weeks of real user data

**§V-C. Multimodal Speaking Assessment**
- **Describe:** Gemini receives audio + transcript (multimodal) vs. transcript-only (text-based)
- **Qualitative comparison:** Show 2-3 examples where the multimodal grader gives different (more accurate) pronunciation/fluency scores than the text-only grader
- **Frame honestly:** As a methodology description with preliminary results, not a validated evaluation

**§V-D. System Performance**
- **Improved Table II:** Add sample sizes (n), standard deviation, 95th percentile
- **Comparison:** Add a column for "Cloud baseline" (e.g., Google Cloud STT latency)

**§V-E. Limitations**
- Small sample size (n=51 for pronunciation)
- No human-grader correlation study for LLM grading accuracy
- Browser-dependent Web Speech API for shadowing (Chrome only)
- No longitudinal user study

---

### §VI. Conclusion and Future Work (~0.5 page)

- **Do NOT repeat the contributions list** — summarize findings from §V instead
- **Honest conclusion:** "The system is functionally viable and demonstrates [specific finding from evaluation]. However, validation against human expert ratings and longitudinal user studies are needed before claims of pedagogical effectiveness can be made."
- **Prioritized future work** (top 3 only):
  1. Human-grader correlation study for LLM accuracy validation
  2. Longitudinal user study measuring learning outcomes
  3. Expansion to multi-test support (TOEFL, PTE)

---

### References (Target: 25–30)

**Add (minimum):**
- 3–5 AES papers (Attali & Burstein, Shermis & Burstein, ASAP, neural AES)
- 2–3 CALL/CAPT papers (pronunciation assessment in CALL)
- 1–2 FSRS papers (Ye, 2023)
- 2–3 spaced repetition papers (Leitner, Ebbinghaus, Kornell)
- 1–2 multimodal LLM papers (Gemini technical report)

**Remove:**
- NestJS docs, FastAPI docs, Redis docs, Prisma docs, RabbitMQ docs → move to footnotes
- Reference [15] if still incomplete

---

## Summary: Key Structural Changes

| Current | Proposed | Why |
|---------|----------|-----|
| 8 Theory subsections | 5 Background+Related Work subsections | Cut padding, merge related work |
| SM-2 equations + evaluation | FSRS equations + comparison | Reflects actual codebase |
| Levenshtein equation + evaluation | IPA phoneme distance + 3-metric evaluation | Reflects actual codebase |
| Text-only LLM grading | Multimodal LLM grading (audio + text) | Reflects actual codebase |
| No limitations section | Dedicated §V-E Limitations | Academic honesty |
| 15 references (5 docs) | 25–30 references (academic) | Meets IEEE standards |
| Contributions repeated 3× | Stated once in abstract only | Eliminates redundancy |
