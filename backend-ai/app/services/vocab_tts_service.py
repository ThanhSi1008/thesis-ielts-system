"""
Vocab Lab TTS Service
=====================

Generates pronunciation audio for Vocab Lab flashcards so a learner can press
to listen — the same experience as IELTS Foundation vocabulary (which plays a
stored ``audioUrl``).

The flow mirrors ``speaking_tts_service``: synthesise the text with Microsoft
Edge neural TTS (``edge-tts``), upload the resulting .mp3 to Cloudinary, and
return the secure CDN URL. It is intentionally self-contained and best-effort:
``synthesize_vocab_audio`` never raises — on any failure it returns ``None`` so
flashcard creation is never blocked by audio generation.
"""

import asyncio
import logging
import os
import re
import tempfile
import uuid

import edge_tts
import cloudinary
import cloudinary.uploader

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

_MAX_RETRIES = 2
# Skip synthesis for content that clearly isn't a word/phrase to pronounce
# (e.g. a long Q&A front). Words/short phrases stay well under this.
_MAX_CHARS = 200
# Strip any stray HTML so the engine never reads markup aloud.
_TAG_RE = re.compile(r"<[^>]+>")


def _clean(text: str) -> str:
    cleaned = _TAG_RE.sub(" ", text or "")
    return re.sub(r"\s+", " ", cleaned).strip()


def _cloudinary_ready() -> bool:
    ready = bool(
        settings.cloudinary_cloud_name
        and settings.cloudinary_api_key
        and settings.cloudinary_api_secret
    )
    if ready:
        cloudinary.config(
            cloud_name=settings.cloudinary_cloud_name,
            api_key=settings.cloudinary_api_key,
            api_secret=settings.cloudinary_api_secret,
            secure=True,
        )
    return ready


def _upload_audio(local_path: str) -> str:
    """Upload a local .mp3 to Cloudinary (audio uses resource_type='video')."""
    result = cloudinary.uploader.upload(
        local_path,
        resource_type="video",
        folder="vocab-lab/tts",
    )
    secure_url = result.get("secure_url")
    if not secure_url:
        raise RuntimeError(f"Cloudinary upload returned no secure_url: {result}")
    return secure_url


async def synthesize_vocab_audio(text: str) -> str | None:
    """
    Synthesise ``text`` to an .mp3 with edge-tts, upload to Cloudinary and return
    the secure CDN URL. Best-effort: returns ``None`` instead of raising so the
    caller can create the flashcard with or without audio.
    """
    cleaned = _clean(text)
    if not cleaned or len(cleaned) > _MAX_CHARS:
        return None

    if not _cloudinary_ready():
        logger.warning(
            "⚠️ Cloudinary credentials missing — skipping vocab flashcard TTS. "
            "Set CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET."
        )
        return None

    voice = settings.vocab_tts_voice
    for attempt in range(1, _MAX_RETRIES + 1):
        tmp_path = os.path.join(
            tempfile.gettempdir(), f"vocab_tts_{uuid.uuid4().hex}.mp3"
        )
        try:
            communicate = edge_tts.Communicate(cleaned, voice)
            await communicate.save(tmp_path)

            if not os.path.exists(tmp_path) or os.path.getsize(tmp_path) == 0:
                raise RuntimeError("edge-tts produced an empty audio file")

            secure_url = await asyncio.to_thread(_upload_audio, tmp_path)
            logger.info("✅ Vocab TTS generated for '%.40s' → %s", cleaned, secure_url)
            return secure_url
        except Exception as err:  # noqa: BLE001 — best-effort, retry transient failures
            logger.warning(
                "⚠️ Vocab TTS attempt %d/%d failed for '%.40s': %s",
                attempt, _MAX_RETRIES, cleaned, err,
            )
            await asyncio.sleep(attempt)
        finally:
            if os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                except OSError:
                    pass

    logger.error("❌ Vocab TTS failed for '%.40s' after %d attempts", cleaned, _MAX_RETRIES)
    return None
