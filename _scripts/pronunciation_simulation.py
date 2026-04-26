"""
Pronunciation Scoring Simulation
Replicates the Levenshtein-based scoring from pronunciation_service.py
Generates charts for the research paper (Experiment 3)
"""

import matplotlib.pyplot as plt
import matplotlib
import numpy as np
import os

matplotlib.use('Agg')

# ============================================================
# Levenshtein Distance (replicate from pronunciation_service.py)
# ============================================================

def levenshtein_distance(s1, s2):
    """Calculate Levenshtein distance between two strings."""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)
    
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    
    return previous_row[-1]


def calculate_similarity_score(transcribed, target):
    """
    Calculate pronunciation score based on Levenshtein distance.
    Exact replica of PronunciationService.calculate_similarity_score()
    
    Returns: Score from 0-100
    """
    transcribed_normalized = transcribed.lower().strip()
    target_normalized = target.lower().strip()
    
    # Exact match
    if transcribed_normalized == target_normalized:
        return 100
    
    distance = levenshtein_distance(transcribed_normalized, target_normalized)
    max_len = max(len(transcribed_normalized), len(target_normalized))
    
    if max_len == 0:
        return 0
    
    similarity = (1 - (distance / max_len)) * 100
    score = max(0, min(100, int(similarity)))
    
    return score


def generate_feedback_level(score):
    """Replicate _generate_feedback from pronunciation_service.py"""
    if score >= 90:
        return "Excellent", "#4CAF50"
    elif score >= 70:
        return "Good", "#2196F3"
    elif score >= 50:
        return "Fair", "#FF9800"
    else:
        return "Needs Improvement", "#F44336"


# ============================================================
# Test Data: Simulated pronunciation attempts
# ============================================================

test_cases = [
    # (target_word, transcribed_text, category)
    # === BASIC WORDS ===
    ("hello", "hello", "Basic"),
    ("world", "world", "Basic"),
    ("apple", "apple", "Basic"),
    ("book", "book", "Basic"),
    ("water", "water", "Basic"),
    ("happy", "happy", "Basic"),
    ("school", "school", "Basic"),
    ("family", "family", "Basic"),
    ("morning", "morning", "Basic"),
    ("thank", "thank", "Basic"),
    ("hello", "helo", "Basic"),
    ("world", "worl", "Basic"),
    ("apple", "aple", "Basic"),
    ("book", "buk", "Basic"),
    ("water", "watter", "Basic"),
    ("happy", "hapy", "Basic"),
    ("school", "shool", "Basic"),
    
    # === INTERMEDIATE WORDS ===
    ("environment", "environment", "Intermediate"),
    ("technology", "technology", "Intermediate"),
    ("education", "education", "Intermediate"),
    ("communication", "communication", "Intermediate"),
    ("development", "development", "Intermediate"),
    ("environment", "enviroment", "Intermediate"),
    ("technology", "tecnology", "Intermediate"),
    ("education", "educashion", "Intermediate"),
    ("communication", "comunicashion", "Intermediate"),
    ("development", "developent", "Intermediate"),
    ("environment", "envaironment", "Intermediate"),
    ("technology", "technolgy", "Intermediate"),
    ("education", "edukation", "Intermediate"),
    ("communication", "comminication", "Intermediate"),
    ("development", "devlopment", "Intermediate"),
    ("opportunity", "oportunity", "Intermediate"),
    ("responsibility", "responsability", "Intermediate"),
    
    # === ADVANCED WORDS ===
    ("entrepreneurship", "entrepreneurship", "Advanced"),
    ("sustainability", "sustainability", "Advanced"),
    ("infrastructure", "infrastructure", "Advanced"),
    ("communication", "communication", "Advanced"),
    ("entrepreneurship", "entrepranurship", "Advanced"),
    ("sustainability", "sustanability", "Advanced"),
    ("infrastructure", "infastructure", "Advanced"),
    ("entrepreneurship", "enterprenorship", "Advanced"),
    ("sustainability", "sustanibility", "Advanced"),
    ("infrastructure", "infrastrukture", "Advanced"),
    ("pharmaceutical", "farmaceutical", "Advanced"),
    ("entrepreneurship", "entripranurship", "Advanced"),
    ("sustainability", "substanability", "Advanced"),
    ("archaeological", "arkeological", "Advanced"),
    ("electromagnetic", "electramagnetic", "Advanced"),
    ("acknowledgement", "acknowledgment", "Advanced"),
    ("miscellaneous", "miscelaneous", "Advanced"),
]


def generate_charts(output_dir):
    """Generate all pronunciation scoring charts."""
    os.makedirs(output_dir, exist_ok=True)
    
    # Calculate scores
    results = []
    for target, transcribed, category in test_cases:
        score = calculate_similarity_score(transcribed, target)
        level, color = generate_feedback_level(score)
        distance = levenshtein_distance(transcribed.lower(), target.lower())
        results.append({
            'target': target,
            'transcribed': transcribed,
            'category': category,
            'score': score,
            'level': level,
            'color': color,
            'distance': distance,
            'is_correct': transcribed.lower().strip() == target.lower().strip(),
        })
    
    categories = ['Basic', 'Intermediate', 'Advanced']
    
    # ── Chart 1: Score Distribution by Category ────────────────────
    fig, ax = plt.subplots(figsize=(10, 6))
    
    cat_scores = {cat: [r['score'] for r in results if r['category'] == cat] for cat in categories}
    
    positions = [1, 2, 3]
    bp = ax.boxplot(
        [cat_scores[cat] for cat in categories],
        positions=positions,
        widths=0.6,
        patch_artist=True,
        showmeans=True,
        meanprops=dict(marker='D', markerfacecolor='white', markersize=8),
    )
    
    colors_bp = ['#4CAF50', '#FF9800', '#F44336']
    for patch, color in zip(bp['boxes'], colors_bp):
        patch.set_facecolor(color)
        patch.set_alpha(0.6)
    
    ax.set_xticklabels(categories, fontsize=13)
    ax.set_ylabel('Pronunciation Score (0-100)', fontsize=13)
    ax.set_title('Pronunciation Score Distribution by Word Difficulty', fontsize=15, fontweight='bold')
    ax.grid(True, axis='y', alpha=0.3)
    
    # Add mean annotations
    for i, cat in enumerate(categories):
        mean_val = np.mean(cat_scores[cat])
        ax.annotate(f'μ={mean_val:.1f}', xy=(positions[i], mean_val), 
                   xytext=(positions[i] + 0.35, mean_val),
                   fontsize=11, fontweight='bold', color=colors_bp[i])
    
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'pronunciation_score_distribution.png'), dpi=200)
    plt.close()
    print("✅ Saved pronunciation_score_distribution.png")
    
    # ── Chart 2: Average Score + Accuracy Bar Chart ────────────────
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
    
    # Average scores
    avg_scores = [np.mean(cat_scores[cat]) for cat in categories]
    bars1 = ax1.bar(categories, avg_scores, color=colors_bp, alpha=0.7, edgecolor='black', linewidth=0.5)
    ax1.set_ylabel('Average Score', fontsize=12)
    ax1.set_title('Average Pronunciation Score', fontsize=13, fontweight='bold')
    ax1.set_ylim(0, 105)
    for bar, val in zip(bars1, avg_scores):
        ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1, 
                f'{val:.1f}', ha='center', va='bottom', fontweight='bold', fontsize=12)
    ax1.grid(True, axis='y', alpha=0.3)
    
    # Perfect match rate
    perfect_rates = []
    for cat in categories:
        cat_results = [r for r in results if r['category'] == cat]
        perfect = sum(1 for r in cat_results if r['score'] == 100)
        perfect_rates.append(perfect / len(cat_results) * 100)
    
    bars2 = ax2.bar(categories, perfect_rates, color=colors_bp, alpha=0.7, edgecolor='black', linewidth=0.5)
    ax2.set_ylabel('Perfect Match Rate (%)', fontsize=12)
    ax2.set_title('Exact Pronunciation Match Rate', fontsize=13, fontweight='bold')
    ax2.set_ylim(0, 105)
    for bar, val in zip(bars2, perfect_rates):
        ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1, 
                f'{val:.1f}%', ha='center', va='bottom', fontweight='bold', fontsize=12)
    ax2.grid(True, axis='y', alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'pronunciation_accuracy_bars.png'), dpi=200)
    plt.close()
    print("✅ Saved pronunciation_accuracy_bars.png")
    
    # ── Chart 3: Levenshtein Distance Distribution ─────────────────
    fig, ax = plt.subplots(figsize=(10, 6))
    
    for cat, color in zip(categories, colors_bp):
        distances = [r['distance'] for r in results if r['category'] == cat]
        ax.hist(distances, bins=range(0, max(distances) + 2), alpha=0.5, 
                color=color, label=cat, edgecolor='black', linewidth=0.5)
    
    ax.set_xlabel('Levenshtein Edit Distance', fontsize=13)
    ax.set_ylabel('Frequency', fontsize=13)
    ax.set_title('Distribution of Edit Distances by Word Difficulty', fontsize=15, fontweight='bold')
    ax.legend(fontsize=12)
    ax.grid(True, axis='y', alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'pronunciation_edit_distance.png'), dpi=200)
    plt.close()
    print("✅ Saved pronunciation_edit_distance.png")
    
    # ── Print summary ──────────────────────────────────────────────
    print("\n" + "="*60)
    print("PRONUNCIATION SCORING SIMULATION RESULTS")
    print("="*60)
    for cat in categories:
        cat_results = [r for r in results if r['category'] == cat]
        scores = [r['score'] for r in cat_results]
        perfect = sum(1 for r in cat_results if r['score'] == 100)
        print(f"\n{cat} ({len(cat_results)} samples):")
        print(f"  Average score: {np.mean(scores):.1f}")
        print(f"  Min/Max: {min(scores)} / {max(scores)}")
        print(f"  Perfect matches: {perfect}/{len(cat_results)} ({perfect/len(cat_results)*100:.1f}%)")
        print(f"  Std deviation: {np.std(scores):.1f}")


if __name__ == '__main__':
    output_dir = os.path.join(os.path.dirname(__file__), '..', '_extras', 'paper_charts')
    generate_charts(output_dir)
    print(f"\n✅ All charts saved to: {output_dir}")
