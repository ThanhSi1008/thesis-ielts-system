"""
Transcription Service using Faster-Whisper
Handles speech-to-text conversion for Speaking tests
"""

import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Try to import faster_whisper, use mock if not available
try:
    from faster_whisper import WhisperModel
    from app.core.config import get_settings
    settings = get_settings()
    HAS_WHISPER = True
except ImportError:
    HAS_WHISPER = False
    logger.warning("⚠️ faster-whisper not available, using mock transcription")


class TranscriptionService:
    """Service for transcribing audio files using Faster-Whisper"""

    def __init__(self):
        self.model = None
        if HAS_WHISPER:
            self._load_model()
        else:
            logger.info("📢 Running in MOCK mode - will return demo transcriptions")

    def _load_model(self):
        """Load Whisper model"""
        try:
            logger.info(f"Loading Whisper model: {settings.whisper_model}")
            self.model = WhisperModel(
                settings.whisper_model,
                device=settings.whisper_device,
                compute_type=settings.whisper_compute_type
            )
            logger.info("✅ Whisper model loaded successfully")
        except Exception as e:
            logger.error(f"❌ Failed to load Whisper model: {e}")
            raise

    def transcribe(self, audio_path: str, language: str = "en") -> dict:
        """
        Transcribe audio file to text

        Args:
            audio_path: Path to audio file
            language: Language code (default: "en")

        Returns:
            Dictionary containing transcription and metadata
        """
        # MOCK MODE: Return demo transcription
        if not HAS_WHISPER or self.model is None:
            logger.info(f"🎭 MOCK: Transcribing audio: {audio_path}")
            # Simple mock - return "hello" for demo
            result = {
                "text": "hello",
                "segments": [{"start": 0.0, "end": 1.0, "text": "hello"}],
                "language": "en",
                "language_probability": 0.99,
                "duration": 1.0
            }
            logger.info(f"✅ MOCK transcription completed: hello")
            return result

        # REAL MODE: Use actual Whisper model
        try:
            logger.info(f"Transcribing audio: {audio_path}")
            
            segments, info = self.model.transcribe(
                audio_path,
                language=language,
                beam_size=5,
                vad_filter=False,  # Disabled: VAD aggressively filters out short single-word recordings
                word_timestamps=True  # Enable per-word confidence scores
            )

            # Collect all segments
            transcription_segments = []
            word_details = []
            full_text = ""

            for segment in segments:
                segment_data = {
                    "start": segment.start,
                    "end": segment.end,
                    "text": segment.text.strip(),
                    "avg_logprob": segment.avg_logprob
                }
                transcription_segments.append(segment_data)
                full_text += segment.text.strip() + " "

                # Collect per-word confidence scores
                if segment.words:
                    for word in segment.words:
                        word_details.append({
                            "word": word.word.strip(),
                            "start": word.start,
                            "end": word.end,
                            "probability": word.probability
                        })

            result = {
                "text": full_text.strip(),
                "segments": transcription_segments,
                "words": word_details,
                "language": info.language,
                "language_probability": info.language_probability,
                "duration": info.duration
            }

            logger.info(f"✅ Transcription completed: {len(transcription_segments)} segments")
            return result

        except Exception as e:
            logger.error(f"❌ Transcription failed: {e}")
            raise


# Singleton instance
_transcription_service: Optional[TranscriptionService] = None


def get_transcription_service() -> TranscriptionService:
    """Get or create transcription service instance"""
    global _transcription_service
    if _transcription_service is None:
        _transcription_service = TranscriptionService()
    return _transcription_service

