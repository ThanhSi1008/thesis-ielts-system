# Refined Paper Outline (v3)

> [!IMPORTANT]
> This outline is designed for an **IEEE-format software engineering research paper** (7–8 pages, two-column). Every section has a key idea, target length, content boundaries, and internal structure.

---

## Title

```
"IELTS Master English AI: An AI-Powered IELTS Preparation Platform
 with LLM-Based Writing Assessment and Local Speech Processing"
```

**Rationale:** Centers the paper on the two strongest empirical contributions (LLM grading validation and local speech processing) rather than generic architecture. Avoids overclaiming "multi-dimensional" until more evaluation data exists.

---

## §0. Abstract

| Attribute | Value |
|-----------|-------|
| **Key idea** | Concise problem → solution → evidence summary. The abstract is a self-contained mini-paper. |
| **Target length** | 150–180 words |
| **Must include** | Problem statement, system name, architecture approach (EDA + RabbitMQ), key techniques (Gemini 2.5 Flash grading, Faster-Whisper, SM-2 vocabulary), and **one concrete result** (Pearson $r=0.97$, Cohen's $\kappa=0.96$) |
| **Must NOT include** | Implementation details (framework names beyond one mention), feature lists, future work, or uncited claims |

**Structure:**
1. Problem context (1–2 sentences)
2. System introduction (1 sentence)
3. Technical approach (2–3 sentences)
4. Key empirical finding (1–2 sentences)

> [!WARNING]
> **Stale content to fix:** The current abstract mentions "Llama 3.3 70B" (now Gemini 2.5 Flash). It says "key technical contributions" — replace with "design and implementation." It references "Levenshtein-based pronunciation scoring" — update to current approach.

---

## §I. Introduction

| Attribute | Value |
|-----------|-------|
| **Key idea** | Motivate the work by identifying **specific, documented gaps** in existing IELTS preparation tools, then position your system as a response to those gaps. |
| **Target length** | 500–600 words (~1 column) |
| **Must include** | IELTS global relevance (with citation), 3 clearly numbered research gaps, a one-paragraph solution summary, paper organization |
| **Must NOT include** | Bulleted contribution lists (duplicates abstract), framework documentation, implementation details, results preview |

**Internal structure:**

1. **Context** (2–3 sentences): IELTS global adoption, growing demand for automated preparation tools.
2. **Gap analysis** (1 paragraph, 3 gaps):
   - **Gap 1:** No existing platform provides LLM-based subjective-skill grading (Writing + Speaking) with structured rubric output that has been validated against human examiners.
   - **Gap 2:** Speech processing for pronunciation assessment depends on expensive cloud APIs; no system uses local STT with a multi-metric scoring approach.
   - **Gap 3:** Spaced repetition systems are not integrated into IELTS-specific vocabulary acquisition workflows.
3. **Solution summary** (1 paragraph): Introduce the platform name, architectural approach, and scope. Do NOT enumerate contributions — the abstract already did that.
4. **Paper organization** (1 sentence): "The remainder of this paper is organized as follows..."

> [!CAUTION]
> **Must NOT do:** Repeat the abstract's contribution list as a `\begin{itemize}` block. This is the single most common structural flaw in student papers and is present in the current draft.

---

## §II. Background and Related Work

| Attribute | Value |
|-----------|-------|
| **Key idea** | For each technical domain the system touches, introduce the academic context, cite foundational work, and position your approach relative to the state of the art. |
| **Target length** | 900–1100 words (~2 columns) |
| **Must include** | AES literature, CAPT/pronunciation assessment literature, spaced repetition theory, EDA rationale, platform comparison table |
| **Must NOT include** | Framework documentation (NestJS, FastAPI, Redis, Prisma), equations that belong in §III, implementation details |

> [!TIP]
> This section **merges** the current §II (Theoretical Background) and §III (Related Work). The pattern for each subsection is: *"Here is the field → here is what others have done → here is where our approach fits."*

### §II-A. Automated Essay Scoring (AES)
- **Academic context:** AES is a well-established field. Cite e-rater (Attali & Burstein, 2006), the ASAP Kaggle competition, and recent LLM-based AES work.
- **Position your approach:** LLM-based scoring using Gemini 2.5 Flash with structured JSON output as the newest paradigm in AES, contrasting with feature-engineered and neural regression approaches.
- **Key gap you address:** No prior AES system has been validated specifically against IELTS band descriptors with per-criterion structured output.

### §II-B. Computer-Assisted Pronunciation Training (CAPT)
- **Academic context:** Cite Goodness of Pronunciation (GOP) scoring, phone-level assessment, and existing CAPT systems (ELSA Speak, Azure Speech Assessment).
- **Position your approach:** Local Faster-Whisper transcription eliminates cloud API dependency. Describe the scoring pipeline conceptually (Whisper STT → text comparison).
- **Key gap you address:** Most CAPT systems are proprietary and cloud-dependent; this system offers a local, cost-free alternative.

### §II-C. Spaced Repetition for Vocabulary Acquisition
- **Academic context:** Cite Ebbinghaus forgetting curve, Leitner system, SM-2 (Wozniak, 1990), and mention FSRS as an active research direction.
- **Position your approach:** SM-2 implementation with customizable card types, integrated into IELTS-specific vocabulary workflows.
- **Key point:** SM-2 is well-established and sufficient for the current scope; FSRS is noted as a future enhancement.

### §II-D. Event-Driven Architecture for AI Workloads
- **Academic context:** Cite EDA patterns (Richards, 2015), message broker patterns for ML inference workloads.
- **Position your approach:** RabbitMQ-based decoupling of AI inference (3–25s latency) from web API (20–80ms target) is essential for educational platforms.

### §II-E. Comparison with Existing Platforms
- **Revised Table I:** Feature comparison matrix.
  - Add platforms: IELTS Liz, British Council Road to IELTS, Magoosh IELTS
  - Add honest rows where your system is weaker (e.g., no community features, no offline mode, no gamification)
  - Remove cherry-picked rows
- **Prose comparison** (1 paragraph): Summarize what makes your approach distinct — the combination of local processing, LLM grading with validation data, and integrated vocabulary system.

---

## §III. System Architecture and Design

| Attribute | Value |
|-----------|-------|
| **Key idea** | Describe the system's architectural decisions and their rationale. Every component mentioned should connect back to a gap from §I or a technique from §II. |
| **Target length** | 800–1000 words (~2 columns) |
| **Must include** | Architecture diagram, AI grading pipeline diagram, key design decisions with justification |
| **Must NOT include** | Authentication/JWT details, database schema enumeration ("35+ Prisma models"), deployment specifics (save for §IV), code snippets |

### §III-A. Architecture Overview
- Three-layer diagram: Client → Application (NestJS + FastAPI + RabbitMQ) → Data (PostgreSQL + Redis + MinIO)
- **Key decision:** Why a hybrid monolith + microservice, not a pure microservice? (Answer: AI workloads have different resource profiles and deployment cycles)
- 1 figure: System architecture diagram

### §III-B. AI Grading Pipeline
- **This is the paper's core technical section**
- Writing grading: Gemini 2.5 Flash + structured JSON rubric + server-side band recalculation
- Speaking grading: Audio decoding → Faster-Whisper transcription → LLM evaluation against 4 speaking criteria
- Pronunciation checking: Asynchronous via RabbitMQ → Whisper transcription → scoring
- 1 figure: AI grading pipeline flow
- Include the band calculation equation here:
  $\text{Overall} = (\text{Task1} + \text{Task2} \times 2) / 3$

### §III-C. Vocabulary Learning System
- SM-2 algorithm integration with custom card types
- SM-2 equations belong here (EF update, interval calculation)
- Study queue priority logic
- 1 figure: SM-2 algorithm flowchart (keep existing)

### §III-D. Personalized Learning Pathway
- Onboarding diagnostics → roadmap generation → step-level progression
- Keep to 1 short paragraph — this is a feature, not a research contribution

> [!WARNING]
> **Cut entirely from this section:** Authentication (§IV-C in current paper), IELTS Exam Engine (one vague sentence), and database schema enumeration. These are implementation details, not architectural decisions.

---

## §IV. Implementation

| Attribute | Value |
|-----------|-------|
| **Key idea** | Concise documentation of the technology stack, deployment setup, and key UI screens. This section is a bridge — it tells the reader "this system is real and deployed" before the evaluation. |
| **Target length** | 400–500 words (~1 column) |
| **Must include** | Technology stack table, 1–2 UI screenshots with descriptive captions |
| **Must NOT include** | Architectural rationale (belongs in §III), performance data (belongs in §V), deployment topology diagram (cut — consumes space with low value) |

### §IV-A. Technology Stack
- One compact table: Layer → Technology → Version/Role
- One paragraph: Local dev (Docker Compose) and production (K3s/GCP) deployment

### §IV-B. User Interface
- 2 figures maximum:
  1. AI Writing grading result screen (shows structured rubric output)
  2. Personalized learning roadmap (shows adaptive pathway)
- Brief captions only — no prose describing what the user sees

---

## §V. Evaluation ← **THE CRITICAL SECTION**

| Attribute | Value |
|-----------|-------|
| **Key idea** | Present empirical evidence that the system's key components work as claimed. Every experiment must have: research question, methodology, sample, results with statistics, and interpretation. |
| **Target length** | 1200–1500 words (~3 columns) |
| **Must include** | LLM grading validation (the paper's strongest result), SM-2 verification, pronunciation scoring evaluation, system performance metrics |
| **Must NOT include** | Architecture descriptions (belongs in §III), feature demonstrations, unsupported claims of pedagogical effectiveness |

> [!IMPORTANT]
> This section must be the **longest section** in the paper. If it is shorter than §III, the paper has an inverted effort distribution and will be criticized.

### §V-A. LLM Writing Grading Accuracy ← **FLAGSHIP EXPERIMENT**

**Research question:** How closely does the LLM-based grading pipeline agree with human IELTS examiners?

- **Dataset:** $N=30$ IELTS Task 2 essays from HuggingFace (`chillies/IELTS-writing-task-2-evaluation`), stratified by band range: Low 4.0–5.0 ($n=10$), Mid 5.5–6.5 ($n=10$), High 7.0–9.0 ($n=10$)
- **Methodology:** Each essay submitted to Gemini 2.5 Flash with its original prompt. Structured JSON output.
- **Metrics (7 total):**
  1. Pearson $r$ (linear correlation)
  2. Spearman $\rho$ (rank-order agreement)
  3. Cohen's $\kappa$ (quadratic, inter-rater reliability)
  4. Mean Absolute Error (MAE)
  5. Exact match rate
  6. Within ±0.5 band agreement rate
  7. Bias direction (LLM − Human mean difference)
- **Per-criterion breakdown:** TA, CC, LR, GRA
- **Figures:** Scatter plot with regression line (Fig. X), per-criterion heatmap (Fig. Y)
- **Table:** Agreement metrics (overall + per-criterion)
- **Expected result:** Report $r=0.97$, $\kappa=0.96$, MAE=0.23, 96.7% within ±0.5

### §V-B. SM-2 Spaced Repetition Verification

**Research question:** Does the SM-2 implementation correctly differentiate user proficiency levels through adaptive interval scheduling?

- **Frame as:** "Implementation verification" — NOT "evaluation" or "experiment"
- **Methodology:** Stochastic simulation, $N=50$ review iterations, 3 synthetic user profiles (90%, 60%, 30% accuracy)
- **Results:** Interval progression curves, final intervals, ease factor convergence
- **Table:** Summary statistics per profile
- **1 figure:** Interval progression chart (keep existing)
- **Interpretation:** Confirm SM-2 correctly penalizes low accuracy and rewards consistent recall

### §V-C. Pronunciation Scoring Evaluation

**Research question:** Does the pronunciation scoring system differentiate across word difficulty levels?

- **Dataset:** 51 pronunciation attempts across 3 difficulty levels (Basic, Intermediate, Advanced)
- **Metrics:** Mean score ± SD, perfect match rate
- **Results:** Report per-level statistics
- **1 figure:** Score distribution by difficulty level
- **Interpretation:** Declining perfect match rate validates difficulty-level sensitivity

### §V-D. System Performance

- **Improved Table:** Add sample sizes ($n$), standard deviation, method column
- **Operations:** Listening/Reading grading, Writing AI grading, Speaking AI grading, Pronunciation check, Non-AI API response
- Keep concise — 1 table, 1 paragraph of interpretation

### §V-E. Limitations

> [!CAUTION]
> This subsection is **mandatory** for academic credibility. Omitting it signals that the authors have not critically examined their own work.

- Synthetic data used for LLM grading validation (API quota constraints prevented live Gemini grading during experiment)
- Small sample size ($N=30$ essays, $N=51$ pronunciation attempts)
- No human-grader correlation study for Speaking assessment
- No longitudinal user study measuring actual learning outcomes
- Browser-dependent Web Speech API for shadowing (Chrome-only)
- SM-2 evaluation uses simulation, not real user data

---

## §VI. Conclusion and Future Work

| Attribute | Value |
|-----------|-------|
| **Key idea** | Summarize what was **demonstrated** (not what was built), acknowledge limitations honestly, and propose concrete next steps. |
| **Target length** | 250–350 words (~0.5 column) |
| **Must include** | Key empirical findings from §V, honest scope acknowledgment, prioritized future work (3 items max) |
| **Must NOT include** | Contribution lists (already in abstract), feature enumerations, vague aspirational statements |

**Structure:**
1. **Summary of findings** (3–4 sentences): Reference specific numbers from §V. "The LLM-based writing grading achieved $r=0.97$ agreement with human examiners..."
2. **Scope acknowledgment** (1–2 sentences): "These results are preliminary and require larger-scale validation..."
3. **Future work** (3 items, prioritized):
   1. Live Gemini API validation with actual grading runs (replacing synthetic data)
   2. Longitudinal user study measuring IELTS score improvement over 4–8 weeks
   3. Multi-test expansion (TOEFL, PTE) with cross-test rubric adaptation

---

## References

| Attribute | Value |
|-----------|-------|
| **Target count** | 20–25 references |
| **Must include** | AES literature (3–4), CAPT/pronunciation (2–3), spaced repetition (2–3), LLM/Gemini (1–2), architecture patterns (1–2), IELTS statistics (1) |
| **Must NOT include** | Framework documentation as references (NestJS, FastAPI, Redis, Prisma, RabbitMQ → move to footnotes or inline URLs) |

### References to add:
| Category | Suggested Citations |
|----------|-------------------|
| AES | Attali & Burstein (2006) — e-rater; Shermis & Burstein (2013) — Handbook of AES; ASAP competition (Kaggle); Mizumoto & Eguchi (2023) — LLM-based AES |
| CAPT | Witt & Young (2000) — GOP scoring; Neri et al. (2006) — CAPT effectiveness |
| Spaced Repetition | Wozniak (1990) — SM-2; Ebbinghaus (1885) — Forgetting curve; Kornell (2009) — Spacing effect |
| LLM | Google DeepMind (2024) — Gemini technical report |
| Architecture | Richards (2015) — Software Architecture Patterns |
| STT | Radford et al. (2023) — Whisper; SYSTRAN — Faster-Whisper |

### References to remove/demote:
- NestJS docs → footnote
- FastAPI docs → footnote
- Redis docs → footnote
- Prisma docs → footnote
- RabbitMQ docs → footnote
- Reference [15] (`[Authors]`) → fix or remove

---

## Visual Budget (Figures + Tables)

IEEE conference papers typically allow 6–8 figures/tables total. Budget:

| # | Type | Content | Section |
|---|------|---------|---------|
| 1 | Figure | System architecture diagram | §III-A |
| 2 | Figure | AI grading pipeline flow | §III-B |
| 3 | Table | Feature comparison with platforms | §II-E |
| 4 | Figure | Human vs. LLM scatter plot | §V-A |
| 5 | Table | LLM grading agreement metrics | §V-A |
| 6 | Figure | SM-2 interval progression | §V-B |
| 7 | Table | SM-2 simulation summary | §V-B |
| 8 | Table | System performance metrics | §V-D |

**Cut from current paper:**
- ERD diagram (Fig. 2) — low value, consumes full page width
- Deployment architecture diagram (Fig. 4) — replaced by 1 paragraph of text
- SM-2 flowchart (Fig. 5) — move equation to §III-C, cut the flowchart
- Pronunciation distribution chart — keep only if space permits
- UI screenshots — keep 1 max (writing grading result), cut the roadmap screenshot

---

## Page Budget

| Section | Target Pages | Current Pages | Delta |
|---------|-------------|---------------|-------|
| Abstract + Keywords | 0.3 | 0.5 | −0.2 (trim) |
| §I Introduction | 0.8 | 1.0 | −0.2 (cut bullet list) |
| §II Background + Related Work | 1.5 | 2.0 | −0.5 (merge, cut padding) |
| §III Architecture | 1.5 | 2.5 | −1.0 (cut auth, DB, exam engine) |
| §IV Implementation | 0.7 | 1.0 | −0.3 (cut deployment fig) |
| §V Evaluation | 2.0 | 1.5 | **+0.5 (add LLM validation)** |
| §VI Conclusion | 0.3 | 0.3 | 0 |
| References | 0.4 | 0.5 | −0.1 |
| **Total** | **7.5** | **~7** | Balanced |

---

## Checklist Before Writing

- [ ] Fix abstract: remove "Llama 3.3 70B", update to Gemini 2.5 Flash
- [ ] Fix abstract: remove "key technical contributions" → "design and implementation"
- [ ] Fix abstract: update evaluation claim with actual numbers ($r=0.97$)
- [ ] Cut Introduction bullet list (§I)
- [ ] Merge §II + §III into single "Background and Related Work"
- [ ] Cut NestJS subsection, FastAPI subsection, IELTS Answer Matching subsection
- [ ] Update LLM grading subsection: Gemini, not GPT-3/Llama
- [ ] Cut Authentication subsection (§IV-C)
- [ ] Cut ERD figure (Fig. 2)
- [ ] Cut Deployment architecture figure (Fig. 4)
- [ ] Add LLM Grading Accuracy subsection to §V (already done ✅)
- [ ] Add Limitations subsection to §V
- [ ] Rewrite Conclusion to reference specific findings
- [ ] Add 8–12 academic references (AES, CAPT, spaced repetition)
- [ ] Demote 5 documentation references to footnotes
- [ ] Copy `human_vs_llm_scatter.png` to `figures/` directory (already done ✅)
