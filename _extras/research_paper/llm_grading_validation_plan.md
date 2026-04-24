# Plan: Validate LLM Grading Accuracy

## Goal
Compare your system's LLM grading (Llama 3.3 70B via Groq) against human examiner scores on real IELTS essays. Report Pearson/Spearman correlation and Cohen's kappa. This is the single highest-impact improvement for the paper.

---

## Phase 1: Collect Human-Graded IELTS Essays (Days 1–2)

### Data Sources (Pick One)

| Source | Size | What You Get | Effort |
|--------|------|-------------|--------|
| **Kaggle – IELTS Writing Scored Essays** | 1,200+ essays | Prompt, essay, examiner comments, per-criterion scores (TA, CC, LR, GRA) | ⭐ Best option |
| **HuggingFace – chillies/IELTS-writing-task-2-evaluation** | 9,000+ samples | Essays + real band scores (2022–2023 tests) | Good, but Task 2 only |
| **Figshare – IELTS and World Englishes Essays** | Smaller | Multi-rater scores, academic focus | Good for inter-rater analysis |

> [!TIP]
> **Recommended:** Use the **Kaggle dataset** — it has both Task 1 and Task 2 with per-criterion scores, which maps directly to your system's output schema.

### Sample Selection

- Select **25–30 essays** (minimum 20, ideally 30 for statistical power)
- Stratified sampling across band ranges: ~8–10 essays per tier
  - **Low** (Band 4.0–5.0)
  - **Mid** (Band 5.5–6.5)
  - **High** (Band 7.0–9.0)
- Include both Task 1 and Task 2 if possible
- Record for each essay:
  - Essay text
  - Task prompt
  - Human band score (overall)
  - Human per-criterion scores (TA, CC, LR, GRA) — if available

### Output: `dataset/essays.json`

```json
[
  {
    "id": "essay_001",
    "task_type": "task2",
    "prompt": "Some people think...",
    "essay": "In today's world...",
    "human_scores": {
      "overall": 6.5,
      "task_achievement": 6.0,
      "coherence_cohesion": 7.0,
      "lexical_resource": 6.5,
      "grammatical_range": 6.5
    },
    "source": "Kaggle IELTS Writing Dataset"
  }
]
```

---

## Phase 2: Run LLM Grading on All Essays (Days 2–3)

### Approach

Write a Python script that feeds each essay through your existing `grade_writing()` function in [writing_grader.py](file:///c:/Users/Admin/Desktop/thesis/my%20videos/thesis-toeic-system/backend-ai/app/services/writing_grader.py) and collects the LLM's per-criterion scores.

### Script: `_extras/research_paper/scripts/run_grading_experiment.py`

```python
import asyncio
import json
import csv
import time
import sys
import os

# Add the backend-ai directory to path so we can import the grader
sys.path.insert(0, os.path.abspath("../../../backend-ai"))

from app.services.writing_grader import grade_writing

async def grade_single_essay(essay: dict) -> dict:
    """Grade one essay and return combined human + LLM scores."""
    
    # Your grader expects both tasks; for single-task essays,
    # pass empty string for the other task
    if essay["task_type"] == "task2":
        result = await grade_writing(
            task1_prompt="",
            task2_prompt=essay["prompt"],
            task1_essay="",
            task2_essay=essay["essay"],
        )
        llm_scores = {
            "overall": result["task2"]["band"],
            "task_achievement": result["task2"]["criteria"]["task_achievement"]["band"],
            "coherence_cohesion": result["task2"]["criteria"]["coherence_and_cohesion"]["band"],
            "lexical_resource": result["task2"]["criteria"]["lexical_resource"]["band"],
            "grammatical_range": result["task2"]["criteria"]["grammatical_range_and_accuracy"]["band"],
        }
    else:
        result = await grade_writing(
            task1_prompt=essay["prompt"],
            task2_prompt="",
            task1_essay=essay["essay"],
            task2_essay="",
        )
        llm_scores = {
            "overall": result["task1"]["band"],
            "task_achievement": result["task1"]["criteria"]["task_achievement"]["band"],
            "coherence_cohesion": result["task1"]["criteria"]["coherence_and_cohesion"]["band"],
            "lexical_resource": result["task1"]["criteria"]["lexical_resource"]["band"],
            "grammatical_range": result["task1"]["criteria"]["grammatical_range_and_accuracy"]["band"],
        }
    
    return {
        "id": essay["id"],
        "human": essay["human_scores"],
        "llm": llm_scores,
    }


async def main():
    with open("../dataset/essays.json", "r") as f:
        essays = json.load(f)
    
    results = []
    for i, essay in enumerate(essays):
        print(f"Grading essay {i+1}/{len(essays)}: {essay['id']}...")
        try:
            result = await grade_single_essay(essay)
            results.append(result)
        except Exception as e:
            print(f"  ERROR: {e}")
            continue
        # Rate limiting — Groq free tier is 30 req/min
        time.sleep(3)
    
    with open("../results/grading_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\nDone! {len(results)}/{len(essays)} essays graded successfully.")


if __name__ == "__main__":
    asyncio.run(main())
```

> [!WARNING]
> **Groq rate limits:** Free tier = 30 requests/minute, 14,400/day. With 25 essays and a 3-second delay, one run takes ~75 seconds. Budget for 2–3 runs (to check reproducibility).

### Reproducibility: Run Each Essay 3× (Optional but Recommended)

Since `temperature=0.2`, the LLM output is *mostly* deterministic but not perfectly. Running each essay 3× lets you:
- Report the **mean** LLM score as the "LLM rating"
- Report **intra-rater reliability** (how consistent the LLM is with itself)

---

## Phase 3: Statistical Analysis (Days 3–4)

### Script: `_extras/research_paper/scripts/analyze_results.py`

```python
import json
import numpy as np
from scipy import stats
from sklearn.metrics import cohen_kappa_score

# Load results
with open("../results/grading_results.json") as f:
    results = json.load(f)

human_overall = [r["human"]["overall"] for r in results]
llm_overall   = [r["llm"]["overall"] for r in results]

# --- 1. Pearson correlation ---
pearson_r, pearson_p = stats.pearsonr(human_overall, llm_overall)
print(f"Pearson r = {pearson_r:.3f}  (p = {pearson_p:.4f})")

# --- 2. Spearman rank correlation ---
spearman_rho, spearman_p = stats.spearmanr(human_overall, llm_overall)
print(f"Spearman ρ = {spearman_rho:.3f}  (p = {spearman_p:.4f})")

# --- 3. Cohen's Kappa (requires discrete categories) ---
# IELTS bands are 0.5 increments, so they are already categorical
kappa = cohen_kappa_score(human_overall, llm_overall, weights="quadratic")
print(f"Cohen's κ (quadratic) = {kappa:.3f}")

# --- 4. Per-criterion analysis ---
criteria = ["task_achievement", "coherence_cohesion", 
            "lexical_resource", "grammatical_range"]

print("\n--- Per-Criterion Correlation ---")
for c in criteria:
    h = [r["human"][c] for r in results]
    l = [r["llm"][c] for r in results]
    pr, _ = stats.pearsonr(h, l)
    sr, _ = stats.spearmanr(h, l)
    k = cohen_kappa_score(h, l, weights="quadratic")
    print(f"  {c:35s}  Pearson={pr:.3f}  Spearman={sr:.3f}  κ={k:.3f}")

# --- 5. Mean Absolute Error ---
mae = np.mean(np.abs(np.array(human_overall) - np.array(llm_overall)))
print(f"\nMean Absolute Error = {mae:.2f} bands")

# --- 6. Exact match & within-0.5 agreement ---
exact = sum(1 for h, l in zip(human_overall, llm_overall) if h == l)
within_half = sum(1 for h, l in zip(human_overall, llm_overall) if abs(h - l) <= 0.5)
n = len(results)
print(f"Exact match: {exact}/{n} ({exact/n*100:.1f}%)")
print(f"Within ±0.5: {within_half}/{n} ({within_half/n*100:.1f}%)")
```

### What the Numbers Mean

| Metric | What It Measures | Good Result | Acceptable |
|--------|-----------------|-------------|------------|
| **Pearson r** | Linear correlation between human and LLM scores | r ≥ 0.80 | r ≥ 0.60 |
| **Spearman ρ** | Rank-order agreement (robust to non-linearity) | ρ ≥ 0.80 | ρ ≥ 0.60 |
| **Cohen's κ (quadratic)** | Inter-rater agreement beyond chance | κ ≥ 0.60 (substantial) | κ ≥ 0.40 (moderate) |
| **MAE** | Average band score difference | MAE ≤ 0.5 | MAE ≤ 1.0 |
| **Within ±0.5** | % of essays where LLM is within half a band | ≥ 70% | ≥ 50% |

> [!IMPORTANT]
> Even "moderate" results (κ ≈ 0.40, r ≈ 0.60) are publishable if you discuss them honestly. The goal is **evidence**, not perfection.

---

## Phase 4: Generate Figures for the Paper (Day 4)

### Figure 1: Scatter Plot with Regression Line

```python
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(6, 5))
ax.scatter(human_overall, llm_overall, alpha=0.7, edgecolors='k', s=60)

# Perfect agreement line
ax.plot([3, 9], [3, 9], 'r--', label='Perfect Agreement')

# Regression line
m, b = np.polyfit(human_overall, llm_overall, 1)
ax.plot([3, 9], [m*3+b, m*9+b], 'b-', label=f'LLM Fit (r={pearson_r:.2f})')

ax.set_xlabel("Human Examiner Band Score")
ax.set_ylabel("LLM Band Score")
ax.set_title("Human vs. LLM Writing Scores")
ax.legend()
ax.set_xlim(3, 9.5)
ax.set_ylim(3, 9.5)
ax.set_aspect('equal')
plt.tight_layout()
plt.savefig("../../paper_charts/human_vs_llm_scatter.png", dpi=300)
```

### Figure 2: Bland-Altman Plot (Difference Plot)

```python
mean_scores = [(h + l) / 2 for h, l in zip(human_overall, llm_overall)]
diff_scores = [l - h for h, l in zip(human_overall, llm_overall)]
mean_diff = np.mean(diff_scores)
std_diff = np.std(diff_scores)

fig, ax = plt.subplots(figsize=(6, 5))
ax.scatter(mean_scores, diff_scores, alpha=0.7, edgecolors='k', s=60)
ax.axhline(y=mean_diff, color='r', linestyle='-', label=f'Mean Diff ({mean_diff:.2f})')
ax.axhline(y=mean_diff + 1.96*std_diff, color='gray', linestyle='--', label='±1.96 SD')
ax.axhline(y=mean_diff - 1.96*std_diff, color='gray', linestyle='--')
ax.set_xlabel("Mean of Human and LLM Scores")
ax.set_ylabel("Difference (LLM − Human)")
ax.set_title("Bland-Altman Plot: LLM vs Human Agreement")
ax.legend()
plt.tight_layout()
plt.savefig("../../paper_charts/bland_altman_plot.png", dpi=300)
```

### Figure 3: Per-Criterion Heatmap (Optional)

A heatmap showing correlation coefficients for each of the four criteria.

---

## Phase 5: Write the Paper Section (Day 5)

### New Section: §V-F "LLM Writing Grading Accuracy"

Suggested LaTeX structure:

```latex
\subsection{LLM Writing Grading Accuracy}

To assess the reliability of the LLM-based writing grading system,
we compared scores produced by Llama 3.3 70B against human examiner 
band scores on a stratified sample of N=25 IELTS Task 2 essays 
drawn from [source]. Essays were selected to cover band ranges 
4.0--5.0 (n=8), 5.5--6.5 (n=9), and 7.0--9.0 (n=8).

\subsubsection{Methodology}
Each essay was submitted to the grading pipeline with its original 
task prompt. The LLM was configured with temperature 0.2 to reduce 
output variance. Per-criterion band scores (Task Response, Coherence 
and Cohesion, Lexical Resource, Grammatical Range and Accuracy) and 
overall band scores were recorded. Each essay was graded three times 
to assess intra-rater consistency.

\subsubsection{Results}
Table~\ref{tab:grading_accuracy} presents the correlation and 
agreement metrics. Fig.~\ref{fig:scatter} shows the scatter plot 
of human vs. LLM scores.

% Insert table and figures here

\subsubsection{Discussion}
[Interpret the results honestly — discuss where the LLM agrees
and where it diverges from human examiners]
```

---

## Timeline Summary

```mermaid
gantt
    title LLM Grading Validation — 5-Day Plan
    dateFormat  YYYY-MM-DD
    section Data Collection
        Download Kaggle dataset           :d1, 2026-04-25, 1d
        Curate 25-30 essays (stratified)  :d2, after d1, 1d
    section Grading Experiment
        Write grading script              :d3, after d2, 1d
        Run LLM grading (3× per essay)   :d4, after d3, 1d
    section Analysis
        Statistical analysis              :d5, after d4, 1d
        Generate figures                  :d6, after d4, 1d
    section Writing
        Write paper section §V-F          :d7, after d5, 1d
        Update abstract & conclusion      :d8, after d7, 1d
```

---

## File Structure

```
_extras/research_paper/
├── dataset/
│   └── essays.json              ← 25-30 curated essays with human scores
├── scripts/
│   ├── run_grading_experiment.py ← Feeds essays through your LLM grader
│   └── analyze_results.py       ← Statistical analysis + figure generation
├── results/
│   └── grading_results.json     ← Raw LLM output for each essay
└── paper_charts/
    ├── human_vs_llm_scatter.png ← Scatter plot for the paper
    └── bland_altman_plot.png    ← Agreement plot for the paper
```

---

## Checklist

- [ ] Download and inspect Kaggle IELTS Writing dataset
- [ ] Select 25–30 essays with stratified band range sampling
- [ ] Format into `essays.json` with standardized schema
- [ ] Verify `.env` has valid `GROQ_API_KEY`
- [ ] Run `run_grading_experiment.py` — confirm all essays grade successfully
- [ ] (Optional) Run 3× for reproducibility
- [ ] Run `analyze_results.py` — record all metrics
- [ ] Generate scatter plot + Bland-Altman plot
- [ ] Write §V-F in `research_paper.tex`
- [ ] Update abstract to reference the validation results
- [ ] Update conclusion to mention grading accuracy findings

---

## What This Adds to the Paper

> [!IMPORTANT]
> This single addition transforms the paper from a **"system description"** (C+ grade per the critical review) to a paper with **genuine empirical evidence**. Even moderate results (κ ≈ 0.40–0.60) are valuable if reported honestly with proper discussion of limitations.

### Before (current paper)
> *"LLM-based automated Writing and Speaking grading with structured rubric output following official IELTS band descriptors"*
> — No evidence this grading is accurate.

### After (with validation)
> *"We evaluate the LLM grading against N=25 human-scored IELTS essays, achieving Pearson r=X.XX, Spearman ρ=X.XX, and quadratic Cohen's κ=X.XX, with XX% of scores falling within ±0.5 bands of human ratings."*
> — Concrete, verifiable, publishable.
