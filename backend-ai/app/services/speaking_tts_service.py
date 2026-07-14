"""
Speaking TTS Service
====================

Turns the TEXT-ONLY structured JSON that Gemini extracts for an IELTS Intensive
Speaking mock exam into the final, player-ready contract by:

  1. Building the natural exam flow: a welcoming examiner introduction is prepended
     to Part 1's first question, a transitional bridge to Part 3's first question,
     and Part 2 carries a topic intro (``video``) + start-speaking cue (``video2``).
  2. Synthesising every examiner line into an .mp3 with Microsoft Edge neural TTS
     (``edge-tts``) using a high-quality British English voice.
  3. Uploading each .mp3 to Cloudinary and capturing the secure CDN URL.
  4. Assembling the final ``IntensiveSpeakingQuestionsJson`` shape — injecting the
     examiner block, the canonical part_type labels, and the audio URLs into the
     ``video`` / ``video2`` fields.

IMPORTANT — spoken text vs. stored text:
  The text passed to Edge-TTS is *cleaned* (textbook guide brackets like ``[Why?]``
  stripped, whitespace normalised) and, for the first question of Parts 1 & 3,
  *prefixed* with an examiner script. The original Gemini-extracted ``text`` stored
  in the JSON is NEVER mutated — it keeps its brackets verbatim for DB persistence
  and frontend rendering.

The Gemini extraction layer produces NO audio URLs; this service is the single
place that owns examiner-voice generation, mirroring how ``media_pipeline`` owns
image/audio asset upload for the Listening pipeline.
"""

import asyncio
import logging
import os
import re
import tempfile
import uuid

from typing import Any, Callable, Dict, List, Tuple

import edge_tts
import cloudinary
import cloudinary.uploader

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Matches textbook guide brackets such as "[Why?]" or "[Why/Why not?]" that appear
# in the printed question text. These must be removed before TTS so the examiner
# audio flows as natural prose — but kept in the stored JSON for the student UI.
_BRACKET_RE = re.compile(r"\[[^\]]*\]")


def clean_for_tts(text: str) -> str:
    """
    Strip textbook guide brackets and normalise whitespace for natural speech.

    e.g. "Have you ever forgotten to pay a bill? [Why/Why not?]"
         -> "Have you ever forgotten to pay a bill?"

    This is applied ONLY to the string handed to the Edge-TTS engine. The caller
    must keep the original (bracketed) text in the JSON payload.
    """
    cleaned = _BRACKET_RE.sub("", text or "")
    # Collapse any whitespace runs (incl. the double spaces left by removed
    # brackets and stray newlines) into a single space.
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned

# Canonical, player-facing labels keyed by part number. Set deterministically
# here (not by Gemini) so the committed exam always carries the exact strings.
PART_TYPE_LABELS: Dict[int, str] = {
    1: "Part 1: Interview",
    2: "Part 2: Long Turn (Cue Card)",
    3: "Part 3: Discussion Topics",
}

# Standard examiner transition spoken AFTER the candidate has had one minute to
# prepare the Part 2 long turn. Read into the `video2` audio file.
PART2_START_SCRIPT = (
    "All right? Remember, you have one to two minutes for this, "
    "so don't worry if I stop you. I'll tell you when the time is up. "
    "Can you start speaking now, please?"
)

# Bounded concurrency for synthesis+upload — keeps a full Part 3 (~10+ questions)
# fast without opening an unbounded number of sockets to Edge / Cloudinary.
_MAX_CONCURRENCY = 4
_MAX_RETRIES = 3


class SpeakingTtsService:
    """Generates examiner audio (edge-tts → Cloudinary) for Intensive Speaking exams."""

    def __init__(self) -> None:
        self.voice = settings.speaking_tts_voice
        self._cloudinary_ready = bool(
            settings.cloudinary_cloud_name
            and settings.cloudinary_api_key
            and settings.cloudinary_api_secret
        )
        if self._cloudinary_ready:
            cloudinary.config(
                cloud_name=settings.cloudinary_cloud_name,
                api_key=settings.cloudinary_api_key,
                api_secret=settings.cloudinary_api_secret,
                secure=True,
            )
            logger.info("✅ SpeakingTtsService initialised (voice=%s, Cloudinary ready)", self.voice)
        else:
            logger.warning(
                "⚠️ Cloudinary credentials missing — Intensive Speaking audio generation will fail. "
                "Set CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET."
            )

    # ------------------------------------------------------------------ #
    # Public orchestrator
    # ------------------------------------------------------------------ #
    async def build_intensive_speaking_exam(self, gemini_json: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert Gemini's text-only 3-part JSON into the final IntensiveSpeakingQuestionsJson.

        Input shape (from IntensiveSpeakingExamSchema):
            { "parts": [ { "part_number", "topic", "questions"?, "cue_card"? }, ... ] }

        Output shape:
            {
              "type": "speaking",
              "examiner": { "name", "role", "avatarUrl" },
              "parts": [ ...with audio URLs populated... ]   # exactly 3
            }
        """
        if not self._cloudinary_ready:
            raise RuntimeError(
                "Cloudinary is not configured on backend-ai — cannot upload synthesised speaking audio."
            )

        raw_parts: List[Dict[str, Any]] = sorted(
            gemini_json.get("parts", []),
            key=lambda p: int(p.get("part_number", 0)),
        )
        if len(raw_parts) != 3:
            raise ValueError(
                f"Intensive Speaking exam must contain exactly 3 parts, got {len(raw_parts)}."
            )

        final_parts: List[Dict[str, Any]] = []
        # Each job is (text_to_speak, setter) — setter writes the resulting URL
        # into the freshly-built part/question dict once synthesis completes.
        synthesis_jobs: List[Tuple[str, Callable[[str], None]]] = []

        examiner_name = settings.speaking_examiner_name
        # Part 3's transition script references the Part 2 topic, so resolve a
        # part_number -> topic lookup up-front (order-independent).
        topics_by_part: Dict[int, str] = {
            int(p.get("part_number", 0)): (p.get("topic") or "").strip() for p in raw_parts
        }

        for raw in raw_parts:
            part_number = int(raw.get("part_number", 0))
            part_type = PART_TYPE_LABELS.get(part_number, f"Part {part_number}")
            topic = (raw.get("topic") or "").strip()

            if part_number == 2:
                # --- Part 2: Long Turn (Cue Card) — no questions array, two fixed clips ---
                cue_card = (raw.get("cue_card") or "").strip()
                if not cue_card:
                    raise ValueError("Part 2 is missing the required cue_card text.")

                part_obj: Dict[str, Any] = {
                    "part_number": 2,
                    "part_type": part_type,
                    "topic": topic,
                    "cue_card": cue_card,       # raw, with \n — preserved for the UI
                    "video": "",                # examiner introduces the topic
                    "video2": "",               # examiner tells the candidate to start speaking
                }

                # `video`: dynamic intro keyed off the TOPIC (not the cue-card body).
                intro_script = self._build_part2_intro(topic)
                synthesis_jobs.append(
                    (intro_script, lambda url, p=part_obj: p.__setitem__("video", url))
                )
                # `video2`: fixed start-speaking cue after the 1-minute prep.
                synthesis_jobs.append(
                    (PART2_START_SCRIPT, lambda url, p=part_obj: p.__setitem__("video2", url))
                )
                final_parts.append(part_obj)
            else:
                # --- Part 1 (Interview) & Part 3 (Discussion) ---
                questions_src = raw.get("questions") or []
                if not questions_src:
                    raise ValueError(f"Part {part_number} has no questions to synthesise.")

                question_objs: List[Dict[str, str]] = []
                for idx, q in enumerate(questions_src):
                    # `raw_text` is stored verbatim (brackets intact) for DB + UI.
                    raw_text = (q.get("text") if isinstance(q, dict) else str(q) or "").strip()
                    if not raw_text:
                        raise ValueError(f"Part {part_number} contains an empty question text.")

                    # `spoken_text` is bracket-stripped for natural TTS prose, and the
                    # FIRST question is prefixed with the examiner's flow script.
                    spoken_text = clean_for_tts(raw_text)
                    if idx == 0:
                        if part_number == 1:
                            spoken_text = f"{self._build_part1_intro(examiner_name, topic)} {spoken_text}"
                        elif part_number == 3:
                            part2_topic = topics_by_part.get(2, "")
                            spoken_text = f"{self._build_part3_intro(part2_topic, topic)} {spoken_text}"

                    q_obj = {"text": raw_text, "video": ""}  # NOTE: raw_text, never spoken_text
                    synthesis_jobs.append(
                        (spoken_text, lambda url, d=q_obj: d.__setitem__("video", url))
                    )
                    question_objs.append(q_obj)

                final_parts.append(
                    {
                        "part_number": part_number,
                        "part_type": part_type,
                        "topic": topic,
                        "questions": question_objs,
                    }
                )

        # Run all synthesis+upload jobs with bounded concurrency.
        logger.info("🎙️ Synthesising %d examiner audio clips...", len(synthesis_jobs))
        await self._run_synthesis_jobs(synthesis_jobs)
        logger.info("✅ All %d speaking audio clips uploaded to Cloudinary", len(synthesis_jobs))

        return {
            "type": "speaking",
            "examiner": {
                "name": settings.speaking_examiner_name,
                "role": settings.speaking_examiner_role,
                "avatarUrl": settings.speaking_examiner_avatar_url,
            },
            "parts": final_parts,
        }

    # ------------------------------------------------------------------ #
    # Synthesis helpers
    # ------------------------------------------------------------------ #
    def _build_part1_intro(self, examiner_name: str, topic: str) -> str:
        """Official, time-neutral IELTS opening prepended to Part 1's FIRST question (TTS only)."""
        return (
            f"Hello. My name is {examiner_name}. "
            "In this first part of the test, I'd like to ask you some questions about yourself. "
            f"Let's talk about {topic}."
        )

    def _build_part2_intro(self, topic: str) -> str:
        """Examiner's Part 2 intro (the `video` clip) — exact standard Cambridge wording."""
        return (
            "Now, I'm going to give you a topic, and I'd like you to talk about it "
            "for one to two minutes. Before you talk, you'll have one minute to think "
            "about what you're going to say. You can make some notes if you wish. "
            f"Here is your topic: {topic}."
        )

    def _build_part3_intro(self, part2_topic: str, part3_topic: str) -> str:
        """Conversational Part 2 -> Part 3 bridge prepended to Part 3's FIRST question (TTS only)."""
        return (
            f"All right. We've been talking about {part2_topic}, "
            "and I'd like to discuss with you one or two more general questions related to this. "
            f"Let's consider, first of all, {part3_topic}."
        )

    async def _run_synthesis_jobs(
        self, jobs: List[Tuple[str, Callable[[str], None]]]
    ) -> None:
        semaphore = asyncio.Semaphore(_MAX_CONCURRENCY)

        async def _worker(text: str, setter: Callable[[str], None]) -> None:
            async with semaphore:
                url = await self._synthesize_to_cloudinary(text)
            setter(url)

        # gather propagates the first exception — a single failed clip fails the
        # whole job so the admin retries rather than committing a broken exam.
        await asyncio.gather(*(_worker(text, setter) for text, setter in jobs))

    async def _synthesize_to_cloudinary(self, text: str) -> str:
        """
        Synthesise `text` to a temporary .mp3 with edge-tts, upload it to
        Cloudinary, and return the secure CDN URL. Retries transient failures.
        """
        last_error: Exception | None = None
        for attempt in range(1, _MAX_RETRIES + 1):
            tmp_path = os.path.join(
                tempfile.gettempdir(), f"ielts_speaking_{uuid.uuid4().hex}.mp3"
            )
            try:
                # 1. Edge-TTS synthesis (async network call to Microsoft servers)
                communicate = edge_tts.Communicate(text, self.voice)
                await communicate.save(tmp_path)

                if not os.path.exists(tmp_path) or os.path.getsize(tmp_path) == 0:
                    raise RuntimeError("edge-tts produced an empty audio file")

                # 2. Cloudinary upload (sync SDK → offload to a thread)
                secure_url = await asyncio.to_thread(self._upload_audio, tmp_path)
                return secure_url
            except Exception as err:  # noqa: BLE001 — retry any transient failure
                last_error = err
                logger.warning(
                    "⚠️ TTS attempt %d/%d failed for text '%.40s...': %s",
                    attempt, _MAX_RETRIES, text, err,
                )
                await asyncio.sleep(attempt)  # linear backoff
            finally:
                if os.path.exists(tmp_path):
                    try:
                        os.remove(tmp_path)
                    except OSError as cleanup_err:
                        logger.warning("Could not remove temp file %s: %s", tmp_path, cleanup_err)

        raise RuntimeError(
            f"Failed to synthesise/upload speaking audio after {_MAX_RETRIES} attempts: {last_error}"
        )

    def _upload_audio(self, local_path: str) -> str:
        """Upload a local .mp3 to Cloudinary. Audio is uploaded as resource_type='video'."""
        result = cloudinary.uploader.upload(
            local_path,
            resource_type="video",  # Cloudinary treats audio files under the video resource type
            folder="ielts/speaking/intensive",
            public_id=f"examiner_{uuid.uuid4().hex}",
            overwrite=True,
        )
        secure_url = result.get("secure_url")
        if not secure_url:
            raise RuntimeError(f"Cloudinary upload returned no secure_url: {result}")
        return secure_url


# Singleton instance
_speaking_tts_service: SpeakingTtsService | None = None


def get_speaking_tts_service() -> SpeakingTtsService:
    global _speaking_tts_service
    if _speaking_tts_service is None:
        _speaking_tts_service = SpeakingTtsService()
    return _speaking_tts_service
