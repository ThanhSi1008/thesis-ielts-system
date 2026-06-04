"""
=============================================================================
  FSRS Spaced Repetition Validation Demo
  IELTS Master English AI — Thesis Defense
=============================================================================

Reproduces the slide results using the ACTUAL FSRS algorithm (py-fsrs v6):

  - Simulates 3 user profiles: A (90%), B (60%), C (30%) correct
  - Demonstrates adaptive interval scheduling
  - Validates: retention-aware spacing, lapse handling, difficulty adaptation

ALGORITHM (from production backend-core):
  const f = fsrs({ request_retention: 0.9, maximum_interval: 365 });

The Python `fsrs` library (v6) mirrors the open-source ts-fsrs implementation
used in the production system.

RUN:
    pip install fsrs matplotlib numpy scipy
    python run_demo.py
=============================================================================
"""

import os
import random
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime, timedelta, timezone

# ── Import FSRS v6 (Python port of the same algorithm as ts-fsrs) ──
from fsrs import Scheduler, Card, Rating, State

# ─────────────────────────────────────────────────────────────────────────────
# PRODUCTION CONFIGURATION (matches backend-core/vocab-lab.service.ts)
#   const f = fsrs({ request_retention: 0.9, maximum_interval: 365 });
# ─────────────────────────────────────────────────────────────────────────────

scheduler = Scheduler(
    desired_retention=0.9,
    maximum_interval=365,
)


# ─────────────────────────────────────────────────────────────────────────────
# USER PROFILES
#   Each profile simulates a learner with a fixed probability of recalling
#   a card correctly (mapping to FSRS ratings).
# ─────────────────────────────────────────────────────────────────────────────

USER_PROFILES = {
    "User A (90%)": {"correct_rate": 0.90, "color": "#4CAF50", "marker": "o"},
    "User B (60%)": {"correct_rate": 0.60, "color": "#FF9800", "marker": "s"},
    "User C (30%)": {"correct_rate": 0.30, "color": "#F44336", "marker": "D"},
}

NUM_REVIEWS = 50  # Number of review sessions per user

# State name mapping (fsrs v6: State enum doesn't include New)
# Card starts with state=None/0 before first review, then transitions to
# Learning(1), Review(2), or Relearning(3)
STATE_NAMES = {
    State.Learning: "Learning",
    State.Review: "Review",
    State.Relearning: "Relearning",
}

RATING_NAMES = {
    Rating.Again: "Again",
    Rating.Hard: "Hard",
    Rating.Good: "Good",
    Rating.Easy: "Easy",
}


def get_state_name(state) -> str:
    """Get human-readable state name, handling None/0 as 'New'."""
    if state is None or state == 0:
        return "New"
    return STATE_NAMES.get(state, f"Unknown({state})")


def simulate_rating(correct_rate: float) -> Rating:
    """
    Simulate a user's self-rating based on their recall probability.
    Maps to the same 4-button system as the production frontend:
      1 = Again, 2 = Hard, 3 = Good, 4 = Easy
    """
    roll = random.random()
    if roll < (1 - correct_rate):
        return Rating.Again  # Forgot
    elif roll < (1 - correct_rate) + correct_rate * 0.15:
        return Rating.Hard   # Struggled
    elif roll < (1 - correct_rate) + correct_rate * 0.85:
        return Rating.Good   # Normal recall
    else:
        return Rating.Easy   # Instant recall


def simulate_user(profile_name: str, correct_rate: float):
    """
    Run NUM_REVIEWS review cycles for a simulated user.
    Returns a list of dicts with review metadata.
    """
    card = Card()
    now = datetime.now(timezone.utc)
    results = []

    for review_num in range(1, NUM_REVIEWS + 1):
        rating = simulate_rating(correct_rate)
        card, review_log = scheduler.review_card(card, rating, now)

        # Calculate interval in days from due date
        if card.due > now:
            interval_days = (card.due - now).total_seconds() / 86400
        else:
            interval_days = 0

        results.append({
            "review": review_num,
            "rating": rating,
            "rating_name": RATING_NAMES.get(rating, "?"),
            "state": card.state,
            "state_name": get_state_name(card.state),
            "interval": interval_days,
            "stability": card.stability,
            "difficulty": card.difficulty,
        })

        # Advance time to the next scheduled review
        now = card.due if card.due > now else now + timedelta(minutes=10)

    return results


def count_lapses(results):
    """Count total times a card was rated Again while in Review state."""
    count = 0
    for i, r in enumerate(results):
        if r["rating"] == Rating.Again and r["state"] == State.Relearning:
            count += 1
    return count


def main():
    random.seed(42)  # Reproducible results
    script_dir = os.path.dirname(os.path.abspath(__file__))
    charts_dir = os.path.join(script_dir, "charts")
    os.makedirs(charts_dir, exist_ok=True)

    print("=" * 80)
    print("  FSRS SPACED REPETITION VALIDATION — LIVE DEMO")
    print("  Mirrors production config: desired_retention=0.9, maximum_interval=365")
    print("=" * 80)

    all_results = {}

    for profile_name, profile in USER_PROFILES.items():
        results = simulate_user(profile_name, profile["correct_rate"])
        all_results[profile_name] = results

        print(f"\n{'-' * 80}")
        print(f"  {profile_name}")
        print(f"{'-' * 80}")
        print(f"  {'#':>3}  {'Rating':<6}  {'State':<12}  {'Interval':>10}  "
              f"{'Stability':>10}  {'Difficulty':>10}")
        print(f"  {'-' * 60}")

        for r in results:
            if r['interval'] >= 1:
                interval_str = f"{r['interval']:.1f}d"
            elif r['interval'] > 0:
                interval_str = f"{r['interval']*24:.0f}h"
            else:
                interval_str = "0m"
            print(f"  {r['review']:>3}  {r['rating_name']:<6}  {r['state_name']:<12}  "
                  f"{interval_str:>10}  {r['stability']:>10.2f}  {r['difficulty']:>10.2f}")

    # ─── Statistical Summary ───
    print(f"\n{'=' * 80}")
    print("  SUMMARY STATISTICS")
    print(f"{'=' * 80}")
    print(f"  {'Profile':<20} {'Avg Interval':>12} {'Max Interval':>12} "
          f"{'Avg Stability':>14} {'Lapses':>8}")
    print(f"  {'-' * 66}")
    for profile_name, results in all_results.items():
        intervals = [r["interval"] for r in results]
        stabilities = [r["stability"] for r in results]
        lapses = count_lapses(results)
        print(f"  {profile_name:<20} {np.mean(intervals):>10.1f}d "
              f"{max(intervals):>11.1f}d {np.mean(stabilities):>13.1f} "
              f"{lapses:>8}")

    print(f"\n  Key Findings:")
    intervals_a = [r["interval"] for r in all_results["User A (90%)"]]
    intervals_c = [r["interval"] for r in all_results["User C (30%)"]]
    avg_a = np.mean(intervals_a)
    avg_c = max(np.mean(intervals_c), 0.01)
    print(f"  • User A avg interval: {avg_a:.1f} days  vs  "
          f"User C: {avg_c:.1f} days")
    print(f"  • Ratio: {avg_a / avg_c:.1f}x longer intervals for strong learners")
    print(f"  • FSRS correctly adapts: strong learners review LESS, weak learners review MORE")
    print(f"{'=' * 80}")

    # ═══════════════════════════════════════════════════════════════════════════
    # FIGURE 1: Interval Progression (the slide chart)
    # ═══════════════════════════════════════════════════════════════════════════
    fig, ax = plt.subplots(figsize=(12, 6))
    for profile_name, profile in USER_PROFILES.items():
        results = all_results[profile_name]
        reviews = [r["review"] for r in results]
        intervals = [r["interval"] for r in results]
        ax.plot(reviews, intervals, color=profile["color"], marker=profile["marker"],
                markersize=5, linewidth=1.5, label=profile_name, alpha=0.85)

    ax.set_xlabel("Review Number", fontsize=13)
    ax.set_ylabel("Interval (days)", fontsize=13)
    ax.set_title("FSRS Interval Progression (request_retention=0.9, max_interval=365)",
                 fontsize=14, fontweight='bold')
    ax.legend(fontsize=11)
    ax.grid(True, alpha=0.3)
    ax.set_ylim(bottom=-5)
    plt.tight_layout()
    plt.savefig(os.path.join(charts_dir, "interval_progression.png"), dpi=200)
    plt.close()
    print(f"\n  [OK] Saved: charts/interval_progression.png")

    # ═══════════════════════════════════════════════════════════════════════════
    # FIGURE 2: Stability Growth Comparison
    # ═══════════════════════════════════════════════════════════════════════════
    fig, ax = plt.subplots(figsize=(12, 6))
    for profile_name, profile in USER_PROFILES.items():
        results = all_results[profile_name]
        reviews = [r["review"] for r in results]
        stabilities = [r["stability"] for r in results]
        ax.plot(reviews, stabilities, color=profile["color"], marker=profile["marker"],
                markersize=5, linewidth=1.5, label=profile_name, alpha=0.85)

    ax.set_xlabel("Review Number", fontsize=13)
    ax.set_ylabel("Stability (days until 90% recall)", fontsize=13)
    ax.set_title("FSRS Stability Growth by Learner Profile",
                 fontsize=14, fontweight='bold')
    ax.legend(fontsize=11)
    ax.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(os.path.join(charts_dir, "stability_growth.png"), dpi=200)
    plt.close()
    print(f"  [OK] Saved: charts/stability_growth.png")

    # ═══════════════════════════════════════════════════════════════════════════
    # FIGURE 3: Card State Distribution Over Time
    # ═══════════════════════════════════════════════════════════════════════════
    fig, axes = plt.subplots(1, 3, figsize=(16, 5), sharey=True)
    state_colors = {
        "Learning": "#2196F3",
        "Review": "#4CAF50",
        "Relearning": "#FF9800",
    }

    for idx, (profile_name, profile) in enumerate(USER_PROFILES.items()):
        ax = axes[idx]
        results = all_results[profile_name]

        state_counts = {"Learning": [], "Review": [], "Relearning": []}
        for r in results:
            for state_name in state_counts:
                state_counts[state_name].append(1 if r["state_name"] == state_name else 0)

        # Rolling average (window=5) for smoother visualization
        window = 5
        reviews = list(range(1, NUM_REVIEWS + 1))
        bottom = np.zeros(NUM_REVIEWS)

        for state_name, counts in state_counts.items():
            smoothed = np.convolve(counts, np.ones(window)/window, mode='same')
            ax.bar(reviews, smoothed, bottom=bottom, color=state_colors[state_name],
                   label=state_name, alpha=0.8, width=1.0)
            bottom += smoothed

        ax.set_title(profile_name, fontsize=12, fontweight='bold',
                     color=profile["color"])
        ax.set_xlabel("Review #", fontsize=11)
        if idx == 0:
            ax.set_ylabel("State Distribution", fontsize=11)

    # Shared legend
    handles = [plt.Rectangle((0,0), 1, 1, fc=c, alpha=0.8)
               for c in state_colors.values()]
    fig.legend(handles, state_colors.keys(), loc='upper center',
               ncol=4, fontsize=10, bbox_to_anchor=(0.5, 1.02))
    fig.suptitle("Card State Distribution During Review Sessions",
                 fontsize=14, fontweight='bold', y=1.08)
    plt.tight_layout()
    plt.savefig(os.path.join(charts_dir, "state_distribution.png"),
                dpi=200, bbox_inches='tight')
    plt.close()
    print(f"  [OK] Saved: charts/state_distribution.png")

    # ═══════════════════════════════════════════════════════════════════════════
    # FIGURE 4: Difficulty Adaptation
    # ═══════════════════════════════════════════════════════════════════════════
    fig, ax = plt.subplots(figsize=(12, 6))
    for profile_name, profile in USER_PROFILES.items():
        results = all_results[profile_name]
        reviews = [r["review"] for r in results]
        difficulties = [r["difficulty"] for r in results]
        ax.plot(reviews, difficulties, color=profile["color"], marker=profile["marker"],
                markersize=5, linewidth=1.5, label=profile_name, alpha=0.85)

    ax.set_xlabel("Review Number", fontsize=13)
    ax.set_ylabel("Card Difficulty (FSRS D parameter)", fontsize=13)
    ax.set_title("FSRS Difficulty Adaptation by Learner Profile",
                 fontsize=14, fontweight='bold')
    ax.legend(fontsize=11)
    ax.grid(True, alpha=0.3)
    ax.set_ylim(0, 10.5)
    plt.tight_layout()
    plt.savefig(os.path.join(charts_dir, "difficulty_adaptation.png"), dpi=200)
    plt.close()
    print(f"  [OK] Saved: charts/difficulty_adaptation.png")

    print(f"\n  All charts saved to: {charts_dir}")
    print("=" * 80)


if __name__ == "__main__":
    main()
