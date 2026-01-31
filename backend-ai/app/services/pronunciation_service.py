"""
Pronunciation Service
Handles pronunciation scoring logic using Levenshtein distance
"""

import logging
from typing import Dict, Any
import Levenshtein

logger = logging.getLogger(__name__)


class PronunciationService:
    """Service for analyzing and scoring pronunciation attempts"""

    def __init__(self):
        logger.info("✅ Pronunciation service initialized")

    def calculate_similarity_score(self, transcribed: str, target: str) -> int:
        """
        Calculate pronunciation score based on Levenshtein distance
        
        Args:
            transcribed: The transcribed text from user's audio
            target: The expected/target word
            
        Returns:
            Score from 0-100
        """
        # Normalize strings (lowercase, strip whitespace)
        transcribed_normalized = transcribed.lower().strip()
        target_normalized = target.lower().strip()
        
        # Exact match gets 100
        if transcribed_normalized == target_normalized:
            return 100
        
        # Calculate Levenshtein distance
        distance = Levenshtein.distance(transcribed_normalized, target_normalized)
        
        # Calculate similarity ratio
        max_len = max(len(transcribed_normalized), len(target_normalized))
        if max_len == 0:
            return 0
        
        # Convert distance to similarity score (0-100)
        similarity = (1 - (distance / max_len)) * 100
        
        # Ensure score is between 0 and 100
        score = max(0, min(100, int(similarity)))
        
        return score

    def analyze_pronunciation(
        self, 
        transcribed_text: str, 
        target_word: str
    ) -> Dict[str, Any]:
        """
        Analyze pronunciation and generate detailed feedback
        
        Args:
            transcribed_text: The transcribed text from audio
            target_word: The expected word
            
        Returns:
            Dictionary with score and feedback
        """
        try:
            # Calculate score
            score = self.calculate_similarity_score(transcribed_text, target_word)
            
            # Generate feedback based on score
            feedback = self._generate_feedback(
                score, 
                transcribed_text, 
                target_word
            )
            
            return {
                'score': score,
                'transcribed': transcribed_text,
                'target': target_word,
                'feedback': feedback
            }
            
        except Exception as e:
            logger.error(f"❌ Pronunciation analysis failed: {e}")
            raise

    def _generate_feedback(
        self, 
        score: int, 
        transcribed: str, 
        target: str
    ) -> Dict[str, Any]:
        """
        Generate detailed feedback based on score
        
        Args:
            score: Pronunciation score (0-100)
            transcribed: Transcribed text
            target: Target word
            
        Returns:
            Detailed feedback dictionary
        """
        # Determine performance level
        if score >= 90:
            level = "Excellent"
            message = "Perfect pronunciation! Well done!"
            color = "green"
        elif score >= 70:
            level = "Good"
            message = "Good pronunciation! Minor improvements possible."
            color = "blue"
        elif score >= 50:
            level = "Fair"
            message = "Fair pronunciation. Keep practicing to improve."
            color = "yellow"
        else:
            level = "Needs Improvement"
            message = "Your pronunciation needs improvement. Try listening to the correct pronunciation and practice more."
            color = "red"
        
        # Calculate character-level differences
        distance = Levenshtein.distance(transcribed.lower(), target.lower())
        
        return {
            'level': level,
            'message': message,
            'color': color,
            'details': {
                'transcribed': transcribed,
                'target': target,
                'editDistance': distance,
                'accuracy': f"{score}%"
            }
        }


# Singleton instance
_pronunciation_service = None


def get_pronunciation_service() -> PronunciationService:
    """Get or create pronunciation service instance"""
    global _pronunciation_service
    if _pronunciation_service is None:
        _pronunciation_service = PronunciationService()
    return _pronunciation_service
