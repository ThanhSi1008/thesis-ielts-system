import json
import numpy as np
from scipy import stats
from sklearn.metrics import cohen_kappa_score
import os

# Load results — everything lives in llm_validation/
script_dir = os.path.dirname(os.path.abspath(__file__))
results_path = os.path.join(script_dir, "results", "grading_results.json")

with open(results_path) as f:
    results = json.load(f)

human_overall = [r["human"]["overall"] for r in results]
llm_overall   = [r["llm"]["overall"] for r in results]

# --- 1. Pearson correlation ---
pearson_r, pearson_p = stats.pearsonr(human_overall, llm_overall)
print(f"Pearson r = {pearson_r:.3f}  (p = {pearson_p:.4f})")

# --- 2. Spearman rank correlation ---
spearman_rho, spearman_p = stats.spearmanr(human_overall, llm_overall)
print(f"Spearman rho = {spearman_rho:.3f}  (p = {spearman_p:.4f})")

# --- 3. Cohen's Kappa (requires discrete categories) ---
# IELTS bands are 0.5 increments, so they are already categorical
# We multiply by 10 and convert to int so scikit-learn treats them as discrete classes
kappa = cohen_kappa_score([int(x*10) for x in human_overall], [int(x*10) for x in llm_overall], weights="quadratic")
print(f"Cohen's kappa (quadratic) = {kappa:.3f}")

# --- 4. Per-criterion analysis ---
criteria = ["task_achievement", "coherence_cohesion", 
            "lexical_resource", "grammatical_range"]

print("\n--- Per-Criterion Correlation ---")
for c in criteria:
    h = [r["human"][c] for r in results]
    l = [r["llm"][c] for r in results]
    pr, _ = stats.pearsonr(h, l)
    sr, _ = stats.spearmanr(h, l)
    k = cohen_kappa_score([int(x*10) for x in h], [int(x*10) for x in l], weights="quadratic")
    print(f"  {c:35s}  Pearson={pr:.3f}  Spearman={sr:.3f}  kappa={k:.3f}")

# --- 5. Mean Absolute Error ---
mae = np.mean(np.abs(np.array(human_overall) - np.array(llm_overall)))
print(f"\nMean Absolute Error = {mae:.2f} bands")

# --- 6. Exact match & within-0.5 agreement ---
exact = sum(1 for h, l in zip(human_overall, llm_overall) if h == l)
within_half = sum(1 for h, l in zip(human_overall, llm_overall) if abs(h - l) <= 0.5)
n = len(results)
print(f"Exact match: {exact}/{n} ({exact/n*100:.1f}%)")
print(f"Within ±0.5: {within_half}/{n} ({within_half/n*100:.1f}%)")

# --- 7. Bias direction ---
mean_human = np.mean(human_overall)
mean_llm = np.mean(llm_overall)
bias = mean_llm - mean_human
print(f"\nMean human: {mean_human:.2f}  Mean LLM: {mean_llm:.2f}")
print(f"Bias (LLM - Human): {bias:+.2f} {'(LLM grades higher)' if bias > 0 else '(LLM grades lower)'}")


# =========================================================================
# Generate Figures
# =========================================================================

import matplotlib.pyplot as plt
import matplotlib
matplotlib.use("Agg")
import seaborn as sns
import pandas as pd

# Figure 1: Scatter Plot with Regression Line
fig, ax = plt.subplots(figsize=(6, 5))
ax.scatter(human_overall, llm_overall, alpha=0.7, edgecolors='k', s=60)

# Perfect agreement line
ax.plot([3, 9], [3, 9], 'r--', label='Perfect Agreement')

# Regression line
m, b = np.polyfit(human_overall, llm_overall, 1)
ax.plot([3, 9], [m*3+b, m*9+b], 'b-', label=f'LLM Fit (r={pearson_r:.2f})')

ax.set_xlabel("Human Examiner Band Score")
ax.set_ylabel("Gemini 2.5 Flash Band Score")
ax.set_title("Human vs. LLM Writing Scores")
ax.legend()
ax.set_xlim(3, 9.5)
ax.set_ylim(3, 9.5)
ax.set_aspect('equal')
plt.tight_layout()

charts_dir = os.path.join(script_dir, "charts")
os.makedirs(charts_dir, exist_ok=True)
plt.savefig(os.path.join(charts_dir, "human_vs_llm_scatter.png"), dpi=300)
print("Saved: llm_validation/charts/human_vs_llm_scatter.png")


# Figure 2: Bland-Altman Plot (Difference Plot)
mean_scores = [(h + l) / 2 for h, l in zip(human_overall, llm_overall)]
diff_scores = [l - h for h, l in zip(human_overall, llm_overall)]
mean_diff = np.mean(diff_scores)
std_diff = np.std(diff_scores)

fig, ax = plt.subplots(figsize=(6, 5))
ax.scatter(mean_scores, diff_scores, alpha=0.7, edgecolors='k', s=60)
ax.axhline(y=mean_diff, color='r', linestyle='-', label=f'Mean Diff ({mean_diff:+.2f})')
ax.axhline(y=mean_diff + 1.96*std_diff, color='gray', linestyle='--', label='±1.96 SD')
ax.axhline(y=mean_diff - 1.96*std_diff, color='gray', linestyle='--')
ax.set_xlabel("Mean of Human and LLM Scores")
ax.set_ylabel("Difference (LLM − Human)")
ax.set_title("Bland-Altman Plot: Gemini vs Human Agreement")
ax.legend()
plt.tight_layout()
plt.savefig(os.path.join(charts_dir, "bland_altman_plot.png"), dpi=300)
print("Saved: llm_validation/charts/bland_altman_plot.png")


# Figure 3: Per-Criterion Heatmap
criteria_names = ["Task Achievement", "Coherence & Cohesion", 
                  "Lexical Resource", "Grammatical Range"]
criteria_keys  = ["task_achievement", "coherence_cohesion",
                  "lexical_resource", "grammatical_range"]
metrics_names  = ["Pearson r", "Spearman ρ", "Cohen's κ"]

data = []
for c in criteria_keys:
    h = [r["human"][c] for r in results]
    l = [r["llm"][c] for r in results]
    pr, _ = stats.pearsonr(h, l)
    sr, _ = stats.spearmanr(h, l)
    k = cohen_kappa_score([int(x*10) for x in h], [int(x*10) for x in l], weights="quadratic")
    data.append([pr, sr, k])

df = pd.DataFrame(data, index=criteria_names, columns=metrics_names)

fig, ax = plt.subplots(figsize=(6, 4))
sns.heatmap(df, annot=True, fmt=".2f", cmap="RdYlGn", vmin=0, vmax=1,
            linewidths=0.5, ax=ax)
ax.set_title("Per-Criterion Agreement: Gemini vs Human")
plt.tight_layout()
plt.savefig(os.path.join(charts_dir, "per_criterion_heatmap.png"), dpi=300)
print("Saved: llm_validation/charts/per_criterion_heatmap.png")
