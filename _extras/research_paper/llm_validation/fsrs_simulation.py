"""
FSRS Simulation for Research Paper §IV-B
Replicates the ts-fsrs algorithm used in the production codebase.

Parameters match vocab-lab.service.ts:
  request_retention = 0.9
  maximum_interval  = 365
"""

import random
import math
import os
import json

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

# ── FSRS-5 core parameters (default weights from ts-fsrs) ──
W = [
    0.4072, 1.1829, 3.1262, 15.4722,   # w0-w3: initial stability
    7.2102, 0.5316, 1.0651, 0.0589,     # w4-w7
    1.5330, 0.1418, 1.0100, 1.9395,     # w8-w11
    0.1100, 0.2900, 2.2700, 0.2500,     # w12-w15
    2.9898, 0.5100, 0.6000,             # w16-w18
]

REQUEST_RETENTION = 0.9
MAXIMUM_INTERVAL = 365

# ── FSRS formulas ──

def init_stability(rating: int) -> float:
    """Initial stability for a new card based on first rating (1-4)."""
    return max(0.1, W[rating - 1])

def init_difficulty(rating: int) -> float:
    """Initial difficulty for a new card (1-4 scale -> 1-10)."""
    d = W[4] - math.exp(W[5] * (rating - 1)) + 1
    return min(10, max(1, d))

def next_difficulty(d: float, rating: int) -> float:
    """Update difficulty after a review."""
    delta = -(W[6] * (rating - 3))
    d_new = d + delta * (W[7] * (10 - d))  # mean reversion
    # Clamp
    return min(10, max(1, d_new))

def next_stability_success(s: float, d: float, r: float, rating: int) -> float:
    """Calculate next stability after a successful review (rating >= 2)."""
    hard_penalty = W[15] if rating == 2 else 1.0
    easy_bonus = W[16] if rating == 4 else 1.0
    new_s = s * (
        1 + math.exp(W[8])
        * (11 - d)
        * s ** (-W[9])
        * (math.exp((1 - r) * W[10]) - 1)
        * hard_penalty
        * easy_bonus
    )
    return min(MAXIMUM_INTERVAL, max(0.1, new_s))

def next_stability_fail(s: float, d: float, r: float) -> float:
    """Calculate next stability after a failed review (rating == 1)."""
    new_s = (
        W[11]
        * d ** (-W[12])
        * ((s + 1) ** W[13] - 1)
        * math.exp((1 - r) * W[14])
    )
    return min(MAXIMUM_INTERVAL, max(0.1, new_s))

def retrievability(elapsed_days: float, stability: float) -> float:
    """Calculate probability of recall."""
    if stability <= 0:
        return 0.0
    return (1 + elapsed_days / (9 * stability)) ** -1

def next_interval(stability: float) -> int:
    """Calculate next interval in days from stability and desired retention."""
    interval = stability * 9 * (1 / REQUEST_RETENTION - 1)
    return max(1, min(MAXIMUM_INTERVAL, round(interval)))


# ── Simulation ──

def simulate_user(accuracy: float, n_reviews: int = 50, seed: int = 42) -> dict:
    """Simulate a user with given accuracy over n_reviews."""
    rng = random.Random(seed)
    
    # Card starts as NEW
    stability = 0.0
    difficulty = 0.0
    interval = 0
    elapsed = 0
    state = "NEW"
    
    history = []
    
    for i in range(n_reviews):
        # Determine rating based on accuracy profile
        if state == "NEW":
            # First review: simulate rating 1-4
            if rng.random() < accuracy:
                rating = rng.choices([3, 4], weights=[0.7, 0.3])[0]  # Good or Easy
            else:
                rating = rng.choices([1, 2], weights=[0.6, 0.4])[0]  # Again or Hard
            
            stability = init_stability(rating)
            difficulty = init_difficulty(rating)
            interval = next_interval(stability)
            state = "LEARNING" if rating <= 2 else "REVIEW"
        else:
            # Subsequent reviews
            r = retrievability(elapsed, stability) if stability > 0 else 0.5
            
            if rng.random() < accuracy:
                rating = rng.choices([3, 4], weights=[0.7, 0.3])[0]
                stability = next_stability_success(stability, difficulty, r, rating)
                difficulty = next_difficulty(difficulty, rating)
                interval = next_interval(stability)
                state = "REVIEW"
            else:
                rating = rng.choices([1, 2], weights=[0.6, 0.4])[0]
                stability = next_stability_fail(stability, difficulty, r)
                difficulty = next_difficulty(difficulty, rating)
                interval = next_interval(stability)
                state = "RELEARNING" if state == "REVIEW" else "LEARNING"
        
        elapsed = interval  # Assume user reviews on schedule
        
        history.append({
            "review": i + 1,
            "rating": rating,
            "stability": round(stability, 2),
            "difficulty": round(difficulty, 2),
            "interval": interval,
            "state": state,
        })
    
    return {
        "accuracy": accuracy,
        "history": history,
        "final_stability": round(stability, 2),
        "final_difficulty": round(difficulty, 2),
        "final_interval": interval,
        "max_interval": max(h["interval"] for h in history),
        "times_in_review": sum(1 for h in history if h["state"] == "REVIEW"),
        "times_in_relearning": sum(1 for h in history if h["state"] == "RELEARNING"),
        "correct": sum(1 for h in history if h["rating"] >= 3),
        "total": n_reviews,
    }


def main():
    profiles = [
        {"name": "User A (90%)", "accuracy": 0.9, "seed": 42},
        {"name": "User B (60%)", "accuracy": 0.6, "seed": 42},
        {"name": "User C (30%)", "accuracy": 0.3, "seed": 42},
    ]
    
    results = []
    for p in profiles:
        result = simulate_user(p["accuracy"], n_reviews=50, seed=p["seed"])
        result["name"] = p["name"]
        results.append(result)
    
    # ── Print Summary Table ──
    print("=" * 80)
    print("FSRS Simulation Summary (N=50 reviews, request_retention=0.9, max_interval=365)")
    print("=" * 80)
    print(f"{'Metric':<30} {'User A (90%)':<15} {'User B (60%)':<15} {'User C (30%)':<15}")
    print("-" * 80)
    for key, label in [
        ("correct", "Correct Responses"),
        ("final_stability", "Final Stability"),
        ("final_difficulty", "Final Difficulty"),
        ("final_interval", "Final Interval (days)"),
        ("max_interval", "Max Interval (days)"),
        ("times_in_review", "Times in REVIEW"),
        ("times_in_relearning", "Times in RELEARNING"),
    ]:
        vals = [str(r[key]) for r in results]
        print(f"  {label:<28} {vals[0]:<15} {vals[1]:<15} {vals[2]:<15}")
    print("=" * 80)
    
    # ── Generate Chart ──
    script_dir = os.path.dirname(os.path.abspath(__file__))
    figures_dir = os.path.join(script_dir, "..", "figures")
    os.makedirs(figures_dir, exist_ok=True)
    
    fig, ax = plt.subplots(figsize=(7, 4.5))
    
    colors = ["#2ecc71", "#f39c12", "#e74c3c"]
    
    for i, r in enumerate(results):
        intervals = [h["interval"] for h in r["history"]]
        reviews = list(range(1, len(intervals) + 1))
        ax.plot(reviews, intervals, color=colors[i], linewidth=2,
                label=r["name"], marker="o", markersize=3, alpha=0.85)
    
    ax.set_xlabel("Review Number", fontsize=11)
    ax.set_ylabel("Interval (days)", fontsize=11)
    ax.set_title("FSRS Interval Progression (request_retention=0.9, max_interval=365)", fontsize=12)
    ax.legend(fontsize=10)
    ax.set_xlim(1, 50)
    ax.grid(True, alpha=0.3)
    plt.tight_layout()
    
    chart_path = os.path.join(figures_dir, "fsrs_interval_progression.png")
    plt.savefig(chart_path, dpi=300)
    print(f"\nSaved: {chart_path}")


if __name__ == "__main__":
    main()
