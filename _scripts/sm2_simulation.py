"""
SM-2 Spaced Repetition Algorithm Simulation
Generates charts for the research paper (Experiment 4)
"""

import matplotlib.pyplot as plt
import matplotlib
import numpy as np
import random
import os

matplotlib.use('Agg')  # Non-interactive backend

# ============================================================
# SM-2 Algorithm (exact replica from vocab-lab.service.ts)
# ============================================================

def sm2_review(ease_factor, interval, repetition, card_state, rating):
    """
    Replicate the SM-2 algorithm from the codebase.
    
    Parameters:
        ease_factor: Current ease factor (>= 1.3)
        interval: Current interval in days
        repetition: Number of successful repetitions
        card_state: 'NEW', 'LEARNING', or 'REVIEW'
        rating: Quality rating 0-5
    
    Returns:
        (new_ease_factor, new_interval, new_repetition, new_state)
    """
    q = rating
    new_ef = ease_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    if new_ef < 1.3:
        new_ef = 1.3

    if q < 3:
        # Failed review
        new_repetition = 0
        new_interval = 1
        new_state = 'LEARNING'
    else:
        # Successful review
        if repetition == 0:
            new_interval = 1
        elif repetition == 1:
            new_interval = 6
        else:
            new_interval = round(interval * new_ef)
        
        new_repetition = repetition + 1
        new_state = 'REVIEW' if new_repetition > 1 else 'LEARNING'

    return new_ef, new_interval, new_repetition, new_state


# ============================================================
# Simulation
# ============================================================

def simulate_user(accuracy_prob, num_reviews=50, seed=42):
    """
    Simulate a user doing `num_reviews` reviews with a given accuracy probability.
    
    Returns:
        dict with lists of intervals, ease_factors, states over time
    """
    rng = random.Random(seed)
    
    ease_factor = 2.5
    interval = 0
    repetition = 0
    state = 'NEW'
    
    intervals = [0]
    ease_factors = [2.5]
    states = ['NEW']
    ratings_history = []
    cumulative_correct = [0]
    
    correct_count = 0
    
    for i in range(num_reviews):
        # Simulate rating based on accuracy probability
        is_correct = rng.random() < accuracy_prob
        
        if is_correct:
            # Good-to-perfect response (rating 3-5)
            rating = rng.choice([3, 4, 5])
            correct_count += 1
        else:
            # Poor response (rating 0-2)
            rating = rng.choice([0, 1, 2])
        
        ease_factor, interval, repetition, state = sm2_review(
            ease_factor, interval, repetition, state, rating
        )
        
        intervals.append(interval)
        ease_factors.append(ease_factor)
        states.append(state)
        ratings_history.append(rating)
        cumulative_correct.append(correct_count)
    
    return {
        'intervals': intervals,
        'ease_factors': ease_factors,
        'states': states,
        'ratings': ratings_history,
        'cumulative_correct': cumulative_correct,
        'final_interval': interval,
        'final_ef': ease_factor,
    }


def generate_charts(output_dir):
    """Generate all charts for the paper."""
    os.makedirs(output_dir, exist_ok=True)
    
    N = 50  # Number of reviews
    
    # Three user profiles
    profiles = {
        'User A (High - 90%)': {'prob': 0.9, 'color': '#2196F3', 'seed': 42},
        'User B (Medium - 60%)': {'prob': 0.6, 'color': '#FF9800', 'seed': 42},
        'User C (Low - 30%)': {'prob': 0.3, 'color': '#F44336', 'seed': 42},
    }
    
    results = {}
    for name, config in profiles.items():
        results[name] = simulate_user(config['prob'], N, config['seed'])
    
    # ── Chart 1: Interval Progression (Log Scale) ──────────────────
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
    
    # Left: Log scale (full range)
    for name, config in profiles.items():
        data = results[name]
        # Replace 0 intervals with 0.5 for log scale
        intervals_log = [max(0.5, i) for i in data['intervals']]
        ax1.plot(range(N + 1), intervals_log, 
                label=name, color=config['color'], linewidth=2, alpha=0.85)
    
    ax1.set_yscale('log')
    ax1.set_xlabel('Review Number', fontsize=13)
    ax1.set_ylabel('Interval (days, log scale)', fontsize=13)
    ax1.set_title('Interval Progression (Log Scale)', fontsize=13, fontweight='bold')
    ax1.legend(fontsize=10, loc='upper left')
    ax1.grid(True, alpha=0.3, which='both')
    ax1.set_xlim(0, N)
    
    # Right: Linear scale capped at 100 days for detail view
    for name, config in profiles.items():
        data = results[name]
        capped = [min(i, 100) for i in data['intervals']]
        ax2.plot(range(N + 1), capped, 
                label=name, color=config['color'], linewidth=2, alpha=0.85)
    
    ax2.set_xlabel('Review Number', fontsize=13)
    ax2.set_ylabel('Interval (days, capped at 100)', fontsize=13)
    ax2.set_title('Interval Progression (Detail View)', fontsize=13, fontweight='bold')
    ax2.legend(fontsize=10, loc='upper left')
    ax2.grid(True, alpha=0.3)
    ax2.set_xlim(0, N)
    ax2.set_ylim(0, 105)
    
    fig.suptitle('SM-2 Interval Progression by User Proficiency', fontsize=15, fontweight='bold', y=1.02)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'sm2_interval_progression.png'), dpi=200, bbox_inches='tight')
    plt.close()
    print(f"✅ Saved sm2_interval_progression.png")
    
    # ── Chart 2: Ease Factor Evolution ─────────────────────────────
    fig, ax = plt.subplots(figsize=(10, 6))
    
    for name, config in profiles.items():
        data = results[name]
        ax.plot(range(N + 1), data['ease_factors'],
                label=name, color=config['color'], linewidth=2, alpha=0.85)
    
    ax.axhline(y=1.3, color='gray', linestyle='--', alpha=0.5, label='Minimum EF (1.3)')
    ax.axhline(y=2.5, color='gray', linestyle=':', alpha=0.5, label='Initial EF (2.5)')
    
    ax.set_xlabel('Review Number', fontsize=13)
    ax.set_ylabel('Ease Factor', fontsize=13)
    ax.set_title('SM-2 Ease Factor Evolution by User Proficiency', fontsize=15, fontweight='bold')
    ax.legend(fontsize=10, loc='upper right')
    ax.grid(True, alpha=0.3)
    ax.set_xlim(0, N)
    
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'sm2_ease_factor.png'), dpi=200)
    plt.close()
    print(f"✅ Saved sm2_ease_factor.png")
    
    # ── Chart 3: Card State Distribution (Stacked Bar) ─────────────
    fig, axes = plt.subplots(1, 3, figsize=(14, 5))
    
    for idx, (name, config) in enumerate(profiles.items()):
        data = results[name]
        states = data['states']
        
        # Count states at each review
        new_counts = []
        learning_counts = []
        review_counts = []
        
        for i in range(N + 1):
            s = states[i]
            new_counts.append(1 if s == 'NEW' else 0)
            learning_counts.append(1 if s == 'LEARNING' else 0)
            review_counts.append(1 if s == 'REVIEW' else 0)
        
        x = range(N + 1)
        axes[idx].fill_between(x, 0, review_counts, alpha=0.6, color='#4CAF50', label='Review')
        axes[idx].fill_between(x, review_counts, 
                              [r + l for r, l in zip(review_counts, learning_counts)],
                              alpha=0.6, color='#FF9800', label='Learning')
        axes[idx].set_title(name.split('(')[0].strip(), fontsize=12, fontweight='bold')
        axes[idx].set_xlabel('Review #', fontsize=10)
        axes[idx].legend(fontsize=9)
        axes[idx].set_xlim(0, N)
    
    fig.suptitle('Card State Transitions During Review Sessions', fontsize=14, fontweight='bold')
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'sm2_state_transitions.png'), dpi=200)
    plt.close()
    print(f"✅ Saved sm2_state_transitions.png")
    
    # ── Chart 4: Summary Statistics Table ──────────────────────────
    fig, ax = plt.subplots(figsize=(10, 4))
    ax.axis('off')
    
    table_data = []
    for name, config in profiles.items():
        data = results[name]
        final_interval = data['final_interval']
        final_ef = data['final_ef']
        total_correct = data['cumulative_correct'][-1]
        review_state_count = sum(1 for s in data['states'] if s == 'REVIEW')
        learning_state_count = sum(1 for s in data['states'] if s == 'LEARNING')
        max_interval = max(data['intervals'])
        
        table_data.append([
            name.split('(')[0].strip(),
            f"{config['prob']*100:.0f}%",
            str(total_correct),
            f"{final_ef:.2f}",
            f"{final_interval} days",
            f"{max_interval} days",
            str(review_state_count),
        ])
    
    col_labels = ['User', 'Accuracy', 'Correct', 'Final EF', 'Final Interval', 'Max Interval', 'Times in REVIEW']
    
    table = ax.table(cellText=table_data, colLabels=col_labels, loc='center', cellLoc='center')
    table.auto_set_font_size(False)
    table.set_fontsize(11)
    table.scale(1.2, 1.8)
    
    # Style header
    for (row, col), cell in table.get_celld().items():
        if row == 0:
            cell.set_facecolor('#37474F')
            cell.set_text_props(color='white', fontweight='bold')
        else:
            cell.set_facecolor('#FAFAFA' if row % 2 == 0 else 'white')
    
    plt.title('SM-2 Simulation Summary (N=50 Reviews)', fontsize=14, fontweight='bold', pad=20)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'sm2_summary_table.png'), dpi=200, bbox_inches='tight')
    plt.close()
    print(f"✅ Saved sm2_summary_table.png")
    
    # ── Print summary to console ───────────────────────────────────
    print("\n" + "="*60)
    print("SM-2 SIMULATION RESULTS")
    print("="*60)
    for name, config in profiles.items():
        data = results[name]
        print(f"\n{name}:")
        print(f"  Accuracy probability: {config['prob']*100:.0f}%")
        print(f"  Total correct: {data['cumulative_correct'][-1]}/{N}")
        print(f"  Final ease factor: {data['final_ef']:.2f}")
        print(f"  Final interval: {data['final_interval']} days")
        print(f"  Max interval reached: {max(data['intervals'])} days")
        print(f"  Times in REVIEW state: {sum(1 for s in data['states'] if s == 'REVIEW')}")


if __name__ == '__main__':
    output_dir = os.path.join(os.path.dirname(__file__), '..', '_extras', 'paper_charts')
    generate_charts(output_dir)
    print(f"\n✅ All charts saved to: {output_dir}")
