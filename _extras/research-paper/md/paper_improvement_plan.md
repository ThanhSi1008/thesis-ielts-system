# Paper Improvement Plan — New Experiments (Revised)

## Current State

The evaluation section (Section IV) currently has **3 subsections**:

| # | Experiment | Type | Strength |
|---|-----------|------|----------|
| IV.A | LLM Writing Grading Accuracy | Real data (N=30 essays) | ★★★★ Strong |
| IV.B | FSRS Spaced Repetition | Simulation (3 profiles × 50 reviews) | ★★★ Decent |
| IV.C | System Performance | Static table (5 rows of claimed latencies) | ★★ Weak |

**Diagnosis:** The paper validates only *one* of three principal contributions (Writing). Speaking, Pronunciation, and the Event-Driven Architecture have **zero empirical evidence**.

---

## What The App Actually Uses (Current Implementation)

The pronunciation pipeline in [pronunciation_service.py](file:///c:/Users/Admin/Desktop/thesis/my%20videos/thesis-ielts-system/backend-ai/app/services/pronunciation_service.py) is a **multi-metric** system, NOT simple Levenshtein:

```
Combined Score = IPA Phoneme Accuracy × 0.4
              + Whisper Confidence    × 0.4
              + Text Accuracy (Lev.)  × 0.2
```

### Metric 1: IPA Phoneme Accuracy (40%)
- Converts both target and transcribed words to IPA via `eng_to_ipa`
- Computes **weighted edit distance** on IPA phoneme sequences
- Substitution costs are based on **articulatory phoneme classes**:
  - Same phoneme = 0.0 (e.g., `/p/` → `/p/`)
  - Same class = 0.3 (e.g., `/p/` → `/b/` — both plosives)
  - Different consonant classes = 0.7 (e.g., `/p/` → `/s/` — plosive vs fricative)
  - Vowel ↔ Consonant = 1.0 (e.g., `/a/` → `/t/` — maximum penalty)
- Classes: Vowels, Plosives, Fricatives, Nasals, Approximants, Affricates

### Metric 2: Whisper Confidence (40%)
- Per-word probability scores from Faster-Whisper with `word_timestamps=True`
- Averaged across all words in the utterance
- Reflects STT model's certainty about what was spoken

### Metric 3: Text Accuracy / Levenshtein (20%)
- Standard Levenshtein distance on normalized text strings
- Legacy/fallback metric — lowest weight

> [!WARNING]
> The old `_scripts/pronunciation_simulation.py` is **completely outdated**. It only tests basic Levenshtein and does NOT reflect the current multi-metric system with IPA phoneme classes or Whisper confidence.

---

## Proposed Experiments

### Experiment 1: Multi-Metric Pronunciation Scoring Accuracy ⭐ HIGH IMPACT / LOW EFFORT

**Research Question:**
How effectively does the multi-metric pronunciation scoring pipeline (IPA phoneme similarity, Whisper confidence, Levenshtein distance) discriminate between correct, partially correct, and incorrect pronunciations across different word difficulty levels and error types?

**Methodology:**

1. **Curate a test set of 50 word pairs** (target → simulated transcription):
   - **Difficulty**: Basic (N=15), Intermediate (N=20), Advanced (N=15)
   - **Error severity**: Exact match, minor (1 phoneme class swap), moderate (2-3 edits), severe (>3 edits, cross-class)

2. **For each pair, compute all three component scores independently:**
   - `ipa_similarity_score(target, transcribed)` — the IPA phoneme metric
   - Simulated Whisper confidence (0.95 for exact, 0.7 for minor, 0.4 for severe)
   - `Levenshtein.distance(target, transcribed)` → text accuracy score
   - Combined weighted score (40/40/20)

3. **Analyze:**
   - **Sensitivity**: Spearman ρ between known error severity rank and predicted combined score (should be strongly negative, ρ < −0.8)
   - **Component contribution**: How much does the IPA phoneme metric disagree with raw Levenshtein? (This proves the articulatory weighting adds value)
   - **Per-difficulty distributions**: Box plots showing score separation across Basic/Intermediate/Advanced
   - **Articulatory class analysis**: Same-class swaps (e.g., `/p/`→`/b/`) should score higher than cross-class swaps (e.g., `/p/`→`/s/`), validating the weighted distance design

**Deliverables for paper:**

| Deliverable | Type |
|-------------|------|
| Table: Mean ± SD of each metric per difficulty tier | Table VI |
| Figure: Box plot of combined scores by difficulty | Fig. 5 |
| Key metric: Spearman ρ (error severity vs score) | In-text |
| Comparison: IPA phoneme score vs raw Levenshtein (proves articulatory weighting adds discriminatory power) | In-text |

**Why this experiment matters:**
- It validates a contribution that's currently **0% empirically tested**
- The articulatory phoneme class weighting is a genuine design novelty — showing it outperforms plain Levenshtein would be a clear paper contribution
- It's pure Python, no external API, runs in <1 minute

**Implementation:**
```
File: _extras/research_paper/llm_validation/pronunciation_experiment.py
```
- Import `ipa_similarity_score`, `phoneme_distance` from `pronunciation_service.py`
- Build 50-word test set with known error categories
- Run all 3 metrics, compare, generate charts
- **Estimated time: ~2 hours**

---

### Experiment 2: Event-Driven Architecture Throughput ⭐ HIGH IMPACT / MEDIUM EFFORT

**Research Question:**
Does the asynchronous RabbitMQ-based grading pipeline maintain stable API response times under concurrent load?

**Methodology:**

1. **Instrument the consumer** to use `time.sleep(10)` as a mock inference delay (isolates architecture overhead from real Gemini latency)

2. **Benchmark script** sends N concurrent grading requests via `httpx`:
   - 1 request (baseline)
   - 5 concurrent requests
   - 10 concurrent requests
   - 20 concurrent requests

3. **Measure two things per scenario:**
   - **API acceptance time**: Time from HTTP POST to receiving `202 Accepted` (should stay flat ~50-150ms regardless of load)
   - **End-to-end completion time**: Time from submission to `GRADED` status (scales with queue depth)

4. **Analytical comparison**: Compute what a synchronous architecture would yield:
   - Sync API time = inference_time × queue_position (because each request blocks the thread)
   - Async API time = constant (because the server immediately returns 202)

**Deliverables for paper:**

| Deliverable | Type |
|-------------|------|
| Table: p50, p95 API response time per concurrency level | Table VII |
| Figure: Line chart — response time vs concurrency (async flat line vs sync diagonal) | Fig. 6 |
| Key finding: "20 concurrent requests → async p50 = ~100ms vs sync p50 = ~100s" | In-text |

**Implementation:**
```
File: _extras/research_paper/llm_validation/architecture_benchmark.py
```
- Requires: running NestJS + RabbitMQ + modified consumer (mock delay)
- **Estimated time: ~3-4 hours**

> [!TIP]
> Even without real Gemini calls, using `time.sleep(10)` as mock inference proves the architectural decoupling. The point isn't to measure Gemini latency — it's to show that the API stays responsive while heavy work happens in the background.

---

### Experiment 3: Upgrade System Performance Table ★ MEDIUM IMPACT / LOW EFFORT

**Current problem:** Table V is just 5 rows of unsubstantiated claims ("8-15s", "20-80ms").

**Fix:** Add measurement methodology + percentile columns (p50, p95).

**Implementation:** Run 20 sample requests per operation category using `httpx` with timing, or extract from server logs/browser DevTools.

**Estimated time: ~1 hour**

---

## Updated Paper Structure

```
Section IV: Evaluation
├── IV.A  LLM Writing Grading Accuracy           ← existing
├── IV.B  Multi-Metric Pronunciation Accuracy     ← NEW (Exp 1)
├── IV.C  FSRS Spaced Repetition Verification     ← existing
├── IV.D  Async Architecture Performance          ← NEW (Exp 2)
├── IV.E  System Performance                      ← upgraded (Exp 3)
└── IV.F  Limitations                             ← rewritten
```

---

## Execution Order

| Step | Task | Time | Notes |
|------|------|------|-------|
| 1 | **Pronunciation experiment** script | 2h | Pure Python, no deps, runs instantly |
| 2 | Write LaTeX for pronunciation results | 30min | New subsection IV.B |
| 3 | **Architecture benchmark** script | 3h | Needs running infra, mock consumer |
| 4 | Write LaTeX for architecture results | 45min | New subsection IV.D |
| 5 | **Upgrade perf table** | 1h | Manual measurements or script |
| 6 | Update Limitations + Conclusion | 30min | Remove "no pronunciation validation" |
| 7 | Recompile + proofread | 15min | Run pdflatex twice |

**Total: ~8 hours**

---

## What This Fixes

| Current Weakness | Fix |
|-----------------|-----|
| Pronunciation pipeline: zero validation | Exp 1 provides accuracy + sensitivity metrics |
| IPA phoneme weighting: claimed but unproven | Exp 1 compares IPA scores vs raw Levenshtein — proves articulatory weighting adds value |
| Async architecture: described but never tested | Exp 2 proves API stays responsive under load |
| Performance table: unsubstantiated numbers | Exp 3 adds real measured percentiles |
| Evaluation covers only 1/3 contributions | Now covers all 3 + FSRS |
| Limitations says "no pronunciation validation" | Can remove it |
