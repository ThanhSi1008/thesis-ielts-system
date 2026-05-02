"""
Pronunciation Service — Multi-dimensional scoring
Uses IPA phoneme comparison + Whisper confidence + Levenshtein distance
"""

import logging
import math
from typing import Dict, Any, List
import Levenshtein
import eng_to_ipa as ipa

logger = logging.getLogger(__name__)


# ── IPA Phoneme Classes (for weighted distance) ──
# Group phonemes by articulatory features so similar sounds have small distances
VOWELS = set("iɪeɛæɑɔoʊuʌəɜɝ")
CONSONANTS_PLOSIVE = set("pbtdkɡ")
CONSONANTS_FRICATIVE = set("fvθðszʃʒhx")
CONSONANTS_NASAL = set("mnŋ")
CONSONANTS_APPROX = set("lrwj")
CONSONANTS_AFFRICATE = set("ʧʤ")  # tʃ, dʒ


def phoneme_distance(p1: str, p2: str) -> float:
    """
    Calculate weighted distance between two IPA phonemes.
    Same phoneme = 0.0, same class = 0.3, different class = 1.0
    """
    if p1 == p2:
        return 0.0

    def get_class(p):
        if p in VOWELS: return "vowel"
        if p in CONSONANTS_PLOSIVE: return "plosive"
        if p in CONSONANTS_FRICATIVE: return "fricative"
        if p in CONSONANTS_NASAL: return "nasal"
        if p in CONSONANTS_APPROX: return "approx"
        if p in CONSONANTS_AFFRICATE: return "affricate"
        return "other"

    c1, c2 = get_class(p1), get_class(p2)

    if c1 == c2:
        return 0.3  # Same class (e.g., /p/ vs /b/) — minor error
    elif (c1 == "vowel") != (c2 == "vowel"):
        return 1.0  # Vowel vs consonant — major error
    else:
        return 0.7  # Different consonant classes — moderate error


def ipa_similarity_score(target_word: str, transcribed_word: str) -> float:
    """
    Calculate phoneme-level similarity between two words.
    Returns score 0-100.
    """
    target_ipa = ipa.convert(target_word.lower().strip())
    transcribed_ipa = ipa.convert(transcribed_word.lower().strip())

    # Remove stress marks and non-phonemic characters for comparison
    clean = lambda s: ''.join(c for c in s if c not in "ˈˌ.'*ˑː ")
    t_phonemes = list(clean(target_ipa))
    s_phonemes = list(clean(transcribed_ipa))

    if not t_phonemes:
        return 0.0

    # If IPA conversion failed (returns the word with asterisk), fall back
    if '*' in target_ipa or '*' in transcribed_ipa:
        # Fallback to simple Levenshtein for unknown words
        distance = Levenshtein.distance(target_word.lower(), transcribed_word.lower())
        max_len = max(len(target_word), len(transcribed_word))
        return (1 - distance / max_len) * 100 if max_len > 0 else 0

    # Weighted edit distance using phoneme classes
    n, m = len(t_phonemes), len(s_phonemes)
    dp = [[0.0] * (m + 1) for _ in range(n + 1)]

    for i in range(n + 1):
        dp[i][0] = i * 1.0  # deletion cost
    for j in range(m + 1):
        dp[0][j] = j * 1.0  # insertion cost

    for i in range(1, n + 1):
        for j in range(1, m + 1):
            sub_cost = phoneme_distance(t_phonemes[i-1], s_phonemes[j-1])
            dp[i][j] = min(
                dp[i-1][j] + 1.0,        # deletion
                dp[i][j-1] + 1.0,        # insertion
                dp[i-1][j-1] + sub_cost  # substitution
            )

    weighted_distance = dp[n][m]
    max_possible = max(n, m)

    if max_possible == 0:
        return 100.0

    similarity = (1 - weighted_distance / max_possible) * 100
    return max(0.0, min(100.0, similarity))


class PronunciationService:
    """Multi-dimensional pronunciation analysis service"""

    def __init__(self):
        logger.info("✅ Pronunciation service initialized (Phoneme + Confidence mode)")

    def analyze_pronunciation(
        self,
        transcribed_text: str,
        target_word: str,
        word_details: List[Dict] = None,
    ) -> Dict[str, Any]:
        """
        Analyze pronunciation using three metrics:
        1. Phoneme accuracy (IPA comparison)
        2. Confidence score (Whisper word probability)
        3. Text accuracy (Levenshtein, kept for compatibility)

        Args:
            transcribed_text: Transcribed text from Whisper
            target_word: Expected word/phrase
            word_details: Per-word data from Whisper [{word, probability}, ...]
        """
        try:
            if not transcribed_text.strip():
                # Handle completely empty/silent recordings
                phoneme_score = 0.0
                confidence_score = 0.0
                text_score = 0.0
                overall_score = 0
            else:
                # ── Metric 1: Phoneme Accuracy ──
                phoneme_score = ipa_similarity_score(target_word, transcribed_text)

                # ── Metric 2: Whisper Confidence ──
                if word_details and len(word_details) > 0:
                    avg_confidence = sum(w.get("probability", 0) for w in word_details) / len(word_details)
                    confidence_score = avg_confidence * 100
                else:
                    confidence_score = 50.0  # neutral fallback

                # ── Metric 3: Text Accuracy (Levenshtein) ──
                t_norm = transcribed_text.lower().strip()
                r_norm = target_word.lower().strip()
                if t_norm == r_norm:
                    text_score = 100.0
                else:
                    distance = Levenshtein.distance(t_norm, r_norm)
                    max_len = max(len(t_norm), len(r_norm))
                    text_score = (1 - distance / max_len) * 100 if max_len > 0 else 0

                # ── Combined Score ──
                # Weighted average: phoneme (40%) + confidence (40%) + text (20%)
                overall_score = int(
                    phoneme_score * 0.4 +
                    confidence_score * 0.4 +
                    text_score * 0.2
                )
                overall_score = max(0, min(100, overall_score))

            # ── Per-word feedback ──
            words_feedback = []
            target_words = target_word.lower().strip().split()
            for i, tw in enumerate(target_words):
                word_fb = {
                    "word": tw,
                    "targetIPA": ipa.convert(tw),
                }
                # Match with Whisper word if available
                if word_details and i < len(word_details):
                    wd = word_details[i]
                    spoken = wd.get("word", "").strip().lower()
                    word_fb["spoken"] = spoken
                    word_fb["spokenIPA"] = ipa.convert(spoken) if spoken else ""
                    word_fb["confidence"] = round(wd.get("probability", 0) * 100, 1)
                    word_fb["phonemeScore"] = round(ipa_similarity_score(tw, spoken), 1)
                    word_fb["match"] = "correct" if spoken == tw else "incorrect"
                else:
                    word_fb["spoken"] = ""
                    word_fb["confidence"] = 0
                    word_fb["phonemeScore"] = 0
                    word_fb["match"] = "missing"

                words_feedback.append(word_fb)

            # Generate feedback
            feedback = self._generate_feedback(
                phoneme_score=phoneme_score,
                confidence_score=confidence_score,
                text_score=text_score,
                overall_score=overall_score,
                transcribed=transcribed_text,
                target=target_word,
                words=words_feedback,
            )

            return {
                "score": overall_score,
                "transcribed": transcribed_text,
                "target": target_word,
                "feedback": feedback,
            }

        except Exception as e:
            logger.error(f"❌ Pronunciation analysis failed: {e}")
            raise

    def _generate_feedback(
        self,
        phoneme_score: float,
        confidence_score: float,
        text_score: float,
        overall_score: int,
        transcribed: str,
        target: str,
        words: list,
    ) -> Dict[str, Any]:
        """Generate multi-dimensional feedback"""

        if overall_score >= 90:
            level = "Excellent"
            message = "Excellent pronunciation! Your speech sounds very natural."
            color = "green"
        elif overall_score >= 70:
            level = "Good"
            message = "Good pronunciation with minor areas for improvement."
            color = "blue"
        elif overall_score >= 50:
            level = "Fair"
            message = "Fair pronunciation. Focus on the highlighted problem areas."
            color = "yellow"
        else:
            level = "Needs Improvement"
            message = "Keep practicing. Listen to the correct pronunciation and try again."
            color = "red"

        return {
            "level": level,
            "message": message,
            "color": color,
            "details": {
                "transcribed": transcribed,
                "target": target,
                "targetIPA": ipa.convert(target.lower()),
                "transcribedIPA": ipa.convert(transcribed.lower()) if transcribed else "",
                "phonemeAccuracy": round(phoneme_score, 1),
                "confidenceScore": round(confidence_score, 1),
                "textAccuracy": round(text_score, 1),
                "overallScore": overall_score,
            },
            "words": words,
        }


# Singleton instance
_pronunciation_service = None


def get_pronunciation_service() -> PronunciationService:
    """Get or create pronunciation service instance"""
    global _pronunciation_service
    if _pronunciation_service is None:
        _pronunciation_service = PronunciationService()
    return _pronunciation_service
