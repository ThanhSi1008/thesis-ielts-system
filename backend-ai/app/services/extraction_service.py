import os
import json
import logging
import hashlib
from typing import Dict, Any, Optional
from google import genai
from google.genai import types

from app.config import get_settings
from app.prompts.extraction.schemas import (
    ListeningPartSchema,
    ReadingPartSchema,
    WritingPromptSchema,
    WritingExamSchema,
    SpeakingPartSchema,
    IntensiveSpeakingExamSchema
)
from app.prompts.extraction.prompts import (
    LISTENING_EXTRACTION_PROMPT,
    READING_EXTRACTION_PROMPT,
    WRITING_EXTRACTION_PROMPT,
    SPEAKING_EXTRACTION_PROMPT,
    INTENSIVE_SPEAKING_EXTRACTION_PROMPT
)

logger = logging.getLogger(__name__)
settings = get_settings()

# In-memory dictionary cache to prevent redundant Gemini calls
_extraction_cache: Dict[str, Dict[str, Any]] = {}

class ExtractionService:
    """Service for parsing raw texts into structured IELTS JSON Contracts using Gemini"""

    def __init__(self):
        self.api_key = settings.gemini_api_key
        self.client = None
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
            logger.info("✅ Gemini extraction client initialized successfully")
        else:
            logger.warning("⚠️ GEMINI_API_KEY is empty — structured extraction calls will fail!")

    def _get_cache_key(
        self,
        raw_text: str,
        skill: str,
        media_assets: list | None = None,
        target_system: str = "ADVANCED",
    ) -> str:
        """Generates a stable SHA-256 hash representing rawText, skill, target system, and media asset URLs."""
        asset_key = ":".join(
            sorted(a.get("storedUrl", "") for a in (media_assets or []) if isinstance(a, dict))
        )
        # target_system is part of the key because INTENSIVE vs ADVANCED SPEAKING
        # use different schemas/prompts and must not share a cached result.
        data = f"{raw_text.strip()}:{skill.strip().upper()}:{target_system.strip().upper()}:{asset_key}"
        return hashlib.sha256(data.encode("utf-8")).hexdigest()

    async def _detect_pdf_skill(self, file_parts: list) -> str | None:
        """
        Lightweight Gemini classification to detect the IELTS test type from uploaded PDF(s).
        Returns 'LISTENING', 'READING', 'WRITING', 'SPEAKING', 'FULL_TEST', or None.
        'FULL_TEST' means the PDF contains more than one skill section (e.g. a full Cambridge book).
        None means detection failed — caller should not block on this result.
        """
        try:
            response = await self.client.aio.models.generate_content(
                model="gemini-2.5-flash",
                contents=file_parts + [
                    "What type of IELTS test content does this document contain? "
                    "Reply with EXACTLY one word from this list: LISTENING, READING, WRITING, SPEAKING, FULL_TEST. "
                    "Use FULL_TEST if the document contains more than one skill section (e.g. a complete Cambridge IELTS book with Listening + Reading + Writing + Speaking). "
                    "No explanation, no punctuation — one word only."
                ],
                config=types.GenerateContentConfig(
                    temperature=0.0,
                    max_output_tokens=10,
                ),
            )
            if not response.text:
                return None
            detected = response.text.strip().upper().split()[0]
            valid = {"LISTENING", "READING", "WRITING", "SPEAKING", "FULL_TEST"}
            return detected if detected in valid else None
        except Exception as e:
            logger.warning(f"⚠️ Skill type detection call failed (mismatch guard skipped): {e}")
            return None

    def _get_schema_and_prompt(self, skill: str, target_system: str = "ADVANCED") -> tuple:
        """Selects the whitelisted system prompt and response schema based on skill + target system"""
        skill_upper = skill.upper()
        target_upper = (target_system or "ADVANCED").upper()
        if skill_upper == "LISTENING":
            return ListeningPartSchema, LISTENING_EXTRACTION_PROMPT
        elif skill_upper == "READING":
            return ReadingPartSchema, READING_EXTRACTION_PROMPT
        elif skill_upper == "WRITING":
            return WritingExamSchema, WRITING_EXTRACTION_PROMPT
        elif skill_upper == "SPEAKING":
            # INTENSIVE mock exams need the full 3-part exam in one extraction;
            # the ADVANCED bank stores one part per job (legacy SpeakingPartSchema).
            if target_upper == "INTENSIVE":
                return IntensiveSpeakingExamSchema, INTENSIVE_SPEAKING_EXTRACTION_PROMPT
            return SpeakingPartSchema, SPEAKING_EXTRACTION_PROMPT
        else:
            raise ValueError(f"Unsupported extraction skill type: {skill}")

    def _validate_extraction_result(
        self, result: Dict[str, Any], skill: str, target_system: str = "ADVANCED"
    ) -> bool:
        """
        Deep-validates Gemini output to guarantee compatibility with graders.
        Returns True if correct, False otherwise.
        """
        try:
            skill_upper = skill.upper()
            target_upper = (target_system or "ADVANCED").upper()

            # For Listening/Reading, ensure every question has a valid answer
            if skill_upper in ["LISTENING", "READING"]:
                parts = result.get("parts", [])
                if not parts:
                    logger.warning(f"[Extractor Validation] Parts list is empty for {skill_upper}")
                    return False
                
                questions = []
                for p in parts:
                    questions.extend(p.get("content", []))
                    
                if not questions:
                    logger.warning(f"[Extractor Validation] Combined question list is empty for {skill_upper}")
                    return False
                
                for idx, q in enumerate(questions):
                    q_num = q.get("question_number")
                    ans = q.get("answer")
                    q_type = q.get("type")
                    
                    if q_num is None:
                        logger.warning(f"[Extractor Validation] Question index {idx} has missing question_number")
                        return False
                        
                    if ans is None or str(ans).strip() == "":
                        logger.warning(f"[Extractor Validation] Question number {q_num} has empty or missing answer key")
                        return False
                        
                    # Full-spectrum whitelist — MUST stay in sync with the NestJS commit
                    # gate (ielts-content-commit.service `whitelistedTypes`), the prompt
                    # whitelists, and refine_service._VALID_QUESTION_TYPES.
                    valid_types = {
                        # Basic types
                        "multiple_choice", "multiple_choice_multiple",
                        "short_answer", "fill_blank",
                        # Completion family (text gap-fill)
                        "form_completion", "note_completion", "sentence_completion",
                        "summary_completion", "table_completion", "flowchart_completion",
                        "diagram_completion",
                        # Matching family
                        "matching", "matching_features", "matching_information",
                        "matching_headings", "matching_sentence_endings",
                        # Visual labelling family
                        "map_labelling", "plan_labelling", "diagram_labelling",
                        # Evaluation types
                        "true_false_not_given", "yes_no_not_given",
                        # Tolerated aliases (US spelling / flow-chart variants)
                        "map_labeling", "flow_chart", "flow_chart_completion",
                    }
                    if q_type not in valid_types:
                        logger.warning(f"[Extractor Validation] Question number {q_num} has invalid type: {q_type}")
                        return False
                        
            # For Writing, validate WritingExamSchema — must have tasks array with TASK_1 and TASK_2
            elif skill_upper == "WRITING":
                tasks = result.get("tasks", [])
                if not tasks or len(tasks) < 2:
                    logger.warning(f"[Extractor Validation] Writing exam must contain at least 2 tasks (TASK_1 + TASK_2), got {len(tasks)}")
                    return False
                task_types = {t.get("taskType") for t in tasks}
                if not {"TASK_1", "TASK_2"}.issubset(task_types):
                    logger.warning(f"[Extractor Validation] Writing exam is missing TASK_1 or TASK_2 (found: {task_types})")
                    return False
                for t in tasks:
                    if not t.get("prompt", "").strip():
                        logger.warning(f"[Extractor Validation] Writing task {t.get('taskType')} has empty prompt text")
                        return False
                    
            # For Speaking, validation depends on the target system.
            elif skill_upper == "SPEAKING":
                if target_upper == "INTENSIVE":
                    # INTENSIVE: full 3-part exam. Validate structure BEFORE TTS so we
                    # never synthesise audio for a malformed extraction.
                    parts = result.get("parts", [])
                    if len(parts) != 3:
                        logger.warning(f"[Extractor Validation] Intensive Speaking must have exactly 3 parts, got {len(parts)}")
                        return False
                    seen = set()
                    for p in parts:
                        pn = p.get("part_number")
                        if pn not in (1, 2, 3):
                            logger.warning(f"[Extractor Validation] Invalid intensive speaking part_number: {pn}")
                            return False
                        seen.add(pn)
                        if pn == 2:
                            if not (p.get("cue_card") or "").strip():
                                logger.warning("[Extractor Validation] Part 2 is missing cue_card text")
                                return False
                        else:
                            qs = p.get("questions") or []
                            if not qs or any(not (q.get("text") or "").strip() for q in qs):
                                logger.warning(f"[Extractor Validation] Part {pn} has missing or empty questions")
                                return False
                    if seen != {1, 2, 3}:
                        logger.warning(f"[Extractor Validation] Intensive Speaking parts must be exactly 1,2,3 (got {seen})")
                        return False
                else:
                    # ADVANCED: single part per job (legacy schema).
                    questions = result.get("questions", [])
                    part_num = result.get("partNumber")
                    if part_num not in [1, 2, 3]:
                        logger.warning(f"[Extractor Validation] Speaking part has invalid partNumber: {part_num}")
                        return False
                    if not questions:
                        logger.warning("[Extractor Validation] Speaking part questions list is empty")
                        return False

            return True
        except Exception as err:
            logger.error(f"[Extractor Validation] Error during verification checks: {err}")
            return False

    async def extract_structured(
        self,
        raw_text: str,
        skill: str,
        media_assets: list | None = None,
        target_system: str = "ADVANCED",
    ) -> Dict[str, Any]:
        """
        Transforms raw text or uploaded PDF reference into a clean structured JSON contract.
        Implements multimodal AI calls, Try-Catch model tiering (Flash -> Pro fallback),
        15,000 token Cost Guard, and safe Gemini file cleanup.

        media_assets: optional list of uploaded asset dicts forwarded from the NestJS job
          payload (fields: storedUrl, kind, partIndex, originalUrl). When present for
          LISTENING jobs, the exact URLs are injected into the Gemini prompt so the model
          can populate audioUrl/imageUrl directly, and a post-processing pass guarantees
          hydration even if the model ignores the instruction.

        target_system: "ADVANCED" (single-part bank) or "INTENSIVE" (full mock exam).
          For SPEAKING this selects between the legacy per-part schema and the full
          3-part IntensiveSpeakingExamSchema. Examiner audio for INTENSIVE speaking is
          generated downstream by SpeakingTtsService, not here.
        """
        if not self.client:
            raise RuntimeError("Gemini client is not initialized")

        cache_key = self._get_cache_key(raw_text, skill, media_assets, target_system)

        # 1. Context Cache Check (Save 100% of API tokens if matched)
        if cache_key in _extraction_cache:
            logger.info("🎯 Cache Hit! Returning stored JSON extraction results...")
            return _extraction_cache[cache_key]

        schema_model, system_prompt = self._get_schema_and_prompt(skill, target_system)
        
        # Models configuration for tiering
        flash_model = "gemini-2.5-flash"
        pro_model = "gemini-3.5-flash"
        
        selected_model = flash_model
        result_dict = {}
        tokens_used = 0
        
        # Parse Multimodal Cloud File URI(s) uploaded during Stage 1
        gemini_file_prefix = "gemini_file_uri:"
        audioscript_prefix = "audioscript_uri:"
        gemini_file = None
        file_name = None
        audioscript_file_name = None
        contents_input = []

        if raw_text.startswith(gemini_file_prefix):
            # Line 1: gemini_file_uri:files/xxxx  (Question Booklet)
            # Line 2 (optional): audioscript_uri:files/yyyy  (Audioscripts PDF, LISTENING only)
            lines = raw_text.strip().splitlines()
            file_name = lines[0][len(gemini_file_prefix):].strip()
            logger.info(f"📁 Identified Question Booklet Gemini file: {file_name}")
            try:
                gemini_file = self.client.files.get(name=file_name)
                contents_input.append(gemini_file)
            except Exception as get_err:
                logger.error(f"❌ Failed to retrieve Gemini file reference {file_name}: {get_err}")
                raise RuntimeError(f"Could not load physical PDF from Gemini Files API: {get_err}")

            # Check for optional second PDF (Audioscripts)
            for line in lines[1:]:
                line = line.strip()
                if line.startswith(audioscript_prefix):
                    audioscript_file_name = line[len(audioscript_prefix):].strip()
                    logger.info(f"📄 Identified Audioscripts Gemini file: {audioscript_file_name}")
                    try:
                        audioscript_file = self.client.files.get(name=audioscript_file_name)
                        contents_input.append(audioscript_file)
                    except Exception as get_err:
                        logger.error(f"❌ Failed to retrieve audioscript file {audioscript_file_name}: {get_err}")
                        raise RuntimeError(f"Could not load Audioscripts PDF from Gemini Files API: {get_err}")

            if audioscript_file_name:
                prompt_instruction = (
                    "You have been provided TWO PDF files: "
                    "(1) the Question Booklet — extract question numbers, question text, answer choices, and question types from it; "
                    "(2) the Audioscripts — extract the full transcript for each part and the correct answers from it. "
                    "Merge both into a single structured JSON output. "
                    "Populate the 'transcript' field for each part from the Audioscripts PDF. "
                    "For Reading passages, return the COMPLETE, FULL passage verbatim in clean Markdown — do NOT truncate."
                )
            else:
                prompt_instruction = (
                    "Please extract the complete structured JSON from this PDF file according to instructions. "
                    "For Reading passages, you MUST read the passage text directly from the PDF and return the "
                    "COMPLETE, FULL content verbatim in clean Markdown format in the 'passage' field. "
                    "Do NOT truncate, do NOT summarize, and do NOT return a seed text."
                )
            contents_input.append(prompt_instruction)
        else:
            # RAW_TEXT_PASTE path: raw text supplied directly, no PDF upload needed
            contents_input.append(f"Please extract structured content from the following raw text:\n\n{raw_text}")

        # Inject media asset URLs into the prompt for LISTENING jobs so Gemini can
        # populate audioUrl per part and imageUrl at root directly from the context.
        if skill.upper() == "LISTENING" and media_assets:
            audio_assets = sorted(
                [a for a in media_assets if a.get("kind") == "audio"],
                key=lambda a: (a.get("partIndex") or 0)
            )
            image_asset = next((a for a in media_assets if a.get("kind") == "image"), None)

            if audio_assets or image_asset:
                lines = [
                    "",
                    "=== AVAILABLE MEDIA ASSETS — inject these exact URLs into the JSON output ===",
                ]
                for audio in audio_assets:
                    part_idx = audio.get("partIndex") or (audio_assets.index(audio) + 1)
                    url = audio.get("storedUrl", "")
                    name = audio.get("originalUrl", f"part{part_idx}.mp3")
                    lines.append(
                        f"  Audio Part {part_idx}  →  audioUrl for parts[{part_idx - 1}]: \"{url}\"  (file: {name})"
                    )
                if image_asset:
                    url = image_asset.get("storedUrl", "")
                    name = image_asset.get("originalUrl", "answer_key.jpg")
                    lines.append(
                        f"  Answer Key Image  →  imageUrl at root level: \"{url}\"  (file: {name})"
                    )
                lines += [
                    "=== END OF MEDIA ASSETS ===",
                    "CRITICAL: copy each URL above verbatim into the corresponding audioUrl / imageUrl field. Do NOT leave them null.",
                ]
                asset_block = "\n".join(lines)

                if isinstance(contents_input[-1], str):
                    contents_input[-1] += asset_block
                else:
                    contents_input.append(asset_block)

        try:
            # 1. SKILL MISMATCH GUARD: reject PDFs whose content type doesn't match the requested skill.
            # Only runs for PDF uploads (not RAW_TEXT_PASTE — no API cost needed there).
            # FULL_TEST PDFs always pass because they legitimately contain all skill sections.
            if raw_text.startswith(gemini_file_prefix):
                pdf_parts = [p for p in contents_input if not isinstance(p, str)]
                detected_skill = await self._detect_pdf_skill(pdf_parts)
                if detected_skill and detected_skill not in ("FULL_TEST", skill.upper()):
                    raise ValueError(
                        f"Skill mismatch: The uploaded PDF appears to be an IELTS {detected_skill} test, "
                        f"but this import job is configured for {skill.upper()}. "
                        f"Please upload the correct {skill.upper()} PDF file, "
                        f"or create a new import job with the skill set to {detected_skill}."
                    )
                logger.info(
                    f"✅ Skill detection: PDF={detected_skill or 'undetermined (guard skipped)'}, Job={skill.upper()}"
                )

            # 2. COST GUARD: Verify token limit before invoking generation
            try:
                token_count_resp = self.client.models.count_tokens(
                    model=flash_model,
                    contents=contents_input
                )
                total_tokens = token_count_resp.total_tokens
                logger.info(f"📊 Cost Guard Token Check: {total_tokens} total tokens.")
                if total_tokens > 15000:
                    raise ValueError(f"Job size ({total_tokens} tokens) exceeds the budget safety limit of 15,000 tokens. Aborting to prevent budget runaway.")
            except Exception as token_err:
                if "exceeds the budget safety limit" in str(token_err):
                    raise
                logger.warning(f"⚠️ Could not check token count (continuing anyway): {token_err}")

            # 3. CONTEXT CACHING: If the size is huge and supported, we could cache the schema.
            # (Note: Flash 2.5 context caches require min 32,768 tokens, which our 15k limit avoids, but we remain compliant)

            # 4. TIERED GENERATION CALL WITH FALLBACKS
            try:
                # Tier 1: Try using cheap and fast gemini-2.5-flash
                logger.info(f"⚡ [Tier 1] Calling {flash_model} for {skill} structuring...")
                response = await self.client.aio.models.generate_content(
                    model=flash_model,
                    contents=contents_input,
                    config=types.GenerateContentConfig(
                        system_instruction=system_prompt,
                        temperature=0.1,
                        response_mime_type="application/json",
                        response_schema=schema_model,
                    ),
                )
                
                result_dict = json.loads(response.text)
                if response.usage_metadata:
                    tokens_used = response.usage_metadata.total_token_count
                    
                is_valid = self._validate_extraction_result(result_dict, skill, target_system)
            except Exception as flash_err:
                logger.warning(f"⚠️ [Tier 1] {flash_model} failed execution or parsing: {flash_err}")
                is_valid = False

            # Tier 2 Fallback: If Flash failed validation, retry with gemini-3.5-flash
            if not is_valid:
                logger.warning(f"⚠️ [Tier 1] Flash structuring validation failed! Falling back to {pro_model}...")
                selected_model = pro_model
                
                # Append high-fidelity instructions
                if isinstance(contents_input[-1], str):
                    contents_input[-1] += " (Ensure 100% answer keys correctness and strict schema compliance)"
                
                response = await self.client.aio.models.generate_content(
                    model=pro_model,
                    contents=contents_input,
                    config=types.GenerateContentConfig(
                        system_instruction=system_prompt,
                        temperature=0.1,
                        response_mime_type="application/json",
                        response_schema=schema_model,
                    ),
                )
                
                result_dict = json.loads(response.text)
                if response.usage_metadata:
                    tokens_used = response.usage_metadata.total_token_count
                    
                # Re-validate Pro output
                is_valid = self._validate_extraction_result(result_dict, skill, target_system)
                if not is_valid:
                    logger.error(f"❌ [Tier 2] {pro_model} structured output also failed validation checks!")
                    raise ValueError("Structured extraction failed: Gemini Pro output is also incompatible with IELTS grading engine.")
                    
            logger.info(f"✅ Structuring completed using {selected_model}. Tokens used: {tokens_used}")

            # Post-processing: guarantee audioUrl/imageUrl are always populated for
            # LISTENING jobs regardless of whether Gemini honoured the URL injection.
            if skill.upper() == "LISTENING" and media_assets:
                audio_assets = sorted(
                    [a for a in media_assets if a.get("kind") == "audio"],
                    key=lambda a: (a.get("partIndex") or 0)
                )
                image_asset = next((a for a in media_assets if a.get("kind") == "image"), None)

                for part in result_dict.get("parts", []):
                    part_num = part.get("partNumber", 0)
                    # Prefer partIndex match; fall back to positional slot (Part N → index N-1)
                    matched_audio = next(
                        (a for a in audio_assets if (a.get("partIndex") or 0) == part_num),
                        audio_assets[part_num - 1] if 0 < part_num <= len(audio_assets) else None
                    )
                    if matched_audio and not part.get("audioUrl"):
                        part["audioUrl"] = matched_audio.get("storedUrl")
                        logger.info(f"  ↳ Hydrated audioUrl for Part {part_num}: {part['audioUrl']}")

                if image_asset and not result_dict.get("imageUrl"):
                    result_dict["imageUrl"] = image_asset.get("storedUrl")
                    logger.info(f"  ↳ Hydrated root imageUrl: {result_dict['imageUrl']}")

            # Post-processing: inject chart image URL into TASK_1's imageUrl for WRITING jobs.
            if skill.upper() == "WRITING" and media_assets:
                chart_asset = next(
                    (a for a in media_assets if a.get("kind") == "chart_image"),
                    None
                )
                if chart_asset:
                    for task in result_dict.get("tasks", []):
                        if task.get("taskType") == "TASK_1" and not task.get("imageUrl"):
                            task["imageUrl"] = chart_asset.get("storedUrl")
                            logger.info(f"  ↳ Hydrated TASK_1 imageUrl from chart asset: {task['imageUrl']}")

            # Form final payload
            output = {
                "structuredJson": result_dict,
                "geminiModel": selected_model,
                "tokensUsed": tokens_used
            }
            
            # Cache the successful result
            _extraction_cache[cache_key] = output
            return output
            
        except Exception as e:
            logger.error(f"❌ Gemini structuring pipeline failed: {e}")
            raise
        finally:
            # 5. SAFE GEMINI FILE CLEANUP: Delete uploaded files from Google Cloud storage immediately
            for name_to_delete in filter(None, [file_name, audioscript_file_name]):
                try:
                    logger.info(f"🗑️ Deleting Gemini cloud file to keep storage clean: {name_to_delete}")
                    self.client.files.delete(name=name_to_delete)
                    logger.info(f"✅ Gemini cloud file deleted successfully: {name_to_delete}")
                except Exception as del_err:
                    logger.warning(f"⚠️ Failed to clean up Gemini file {name_to_delete}: {del_err}")

# Singleton instance
_extraction_service = None

def get_extraction_service() -> ExtractionService:
    global _extraction_service
    if _extraction_service is None:
        _extraction_service = ExtractionService()
    return _extraction_service
