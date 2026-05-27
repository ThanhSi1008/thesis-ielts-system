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
    SpeakingPartSchema
)
from app.prompts.extraction.prompts import (
    LISTENING_EXTRACTION_PROMPT,
    READING_EXTRACTION_PROMPT,
    WRITING_EXTRACTION_PROMPT,
    SPEAKING_EXTRACTION_PROMPT
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

    def _get_cache_key(self, raw_text: str, skill: str) -> str:
        """Generates a stable SHA-256 hash representing rawText and target skill"""
        data = f"{raw_text.strip()}:{skill.strip().upper()}"
        return hashlib.sha256(data.encode("utf-8")).hexdigest()

    def _get_schema_and_prompt(self, skill: str) -> tuple:
        """Selects the whitelisted system prompt and response schema based on skill"""
        skill_upper = skill.upper()
        if skill_upper == "LISTENING":
            return ListeningPartSchema, LISTENING_EXTRACTION_PROMPT
        elif skill_upper == "READING":
            return ReadingPartSchema, READING_EXTRACTION_PROMPT
        elif skill_upper == "WRITING":
            return WritingPromptSchema, WRITING_EXTRACTION_PROMPT
        elif skill_upper == "SPEAKING":
            return SpeakingPartSchema, SPEAKING_EXTRACTION_PROMPT
        else:
            raise ValueError(f"Unsupported extraction skill type: {skill}")

    def _validate_extraction_result(self, result: Dict[str, Any], skill: str) -> bool:
        """
        Deep-validates Gemini output to guarantee compatibility with graders.
        Returns True if correct, False otherwise.
        """
        try:
            skill_upper = skill.upper()
            
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
                        
                    # Full whitelist — must match NestJS grading engine exactly
                    valid_types = {
                        # Basic types
                        "multiple_choice", "multiple_choice_multiple",
                        "short_answer", "fill_blank",
                        "form_completion", "note_completion", "sentence_completion",
                        "summary_completion", "table_completion",
                        # Matching family
                        "matching", "matching_features", "matching_information", "matching_headings",
                        # Evaluation types
                        "true_false_not_given", "yes_no_not_given",
                    }
                    if q_type not in valid_types:
                        logger.warning(f"[Extractor Validation] Question number {q_num} has invalid type: {q_type}")
                        return False
                        
            # For Writing, ensure tasks are TASK_1 or TASK_2
            elif skill_upper == "WRITING":
                task_type = result.get("taskType")
                prompt = result.get("prompt")
                if task_type not in ["TASK_1", "TASK_2"]:
                    logger.warning(f"[Extractor Validation] Writing prompt has invalid taskType: {task_type}")
                    return False
                if not prompt or str(prompt).strip() == "":
                    logger.warning("[Extractor Validation] Writing prompt has empty prompt text")
                    return False
                    
            # For Speaking, ensure questions are present
            elif skill_upper == "SPEAKING":
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

    async def extract_structured(self, raw_text: str, skill: str) -> Dict[str, Any]:
        """
        Transforms raw text or uploaded PDF reference into a clean structured JSON contract.
        Implements multimodal AI calls, Try-Catch model tiering (Flash -> Pro fallback),
        15,000 token Cost Guard, and safe Gemini file cleanup.
        """
        if not self.client:
            raise RuntimeError("Gemini client is not initialized")
            
        cache_key = self._get_cache_key(raw_text, skill)
        
        # 1. Context Cache Check (Save 100% of API tokens if matched)
        if cache_key in _extraction_cache:
            logger.info("🎯 Cache Hit! Returning stored JSON extraction results...")
            return _extraction_cache[cache_key]
            
        schema_model, system_prompt = self._get_schema_and_prompt(skill)
        
        # Models configuration for tiering
        flash_model = "gemini-2.5-flash"
        pro_model = "gemini-2.5-pro"
        
        selected_model = flash_model
        result_dict = {}
        tokens_used = 0
        
        # Parse Multimodal Cloud File URI if uploaded during Stage 1
        gemini_file_prefix = "gemini_file_uri:"
        gemini_file = None
        file_name = None
        contents_input = []
        
        if raw_text.startswith(gemini_file_prefix):
            # Format: gemini_file_uri:files/xxxx (header line only; no offline text cache)
            newline_idx = raw_text.find("\n")
            header_line = raw_text[:newline_idx] if newline_idx != -1 else raw_text
            file_name = header_line[len(gemini_file_prefix):].strip()
            logger.info(f"📁 Identified Gemini uploaded file: {file_name}")
            try:
                gemini_file = self.client.files.get(name=file_name)
                contents_input.append(gemini_file)
            except Exception as get_err:
                logger.error(f"❌ Failed to retrieve Gemini file reference {file_name}: {get_err}")
                raise RuntimeError(f"Could not load physical PDF from Gemini Files API: {get_err}")

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

        try:
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
                    
                is_valid = self._validate_extraction_result(result_dict, skill)
            except Exception as flash_err:
                logger.warning(f"⚠️ [Tier 1] {flash_model} failed execution or parsing: {flash_err}")
                is_valid = False

            # Tier 2 Fallback: If Flash failed validation, retry with gemini-2.5-pro
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
                is_valid = self._validate_extraction_result(result_dict, skill)
                if not is_valid:
                    logger.error(f"❌ [Tier 2] {pro_model} structured output also failed validation checks!")
                    raise ValueError("Structured extraction failed: Gemini Pro output is also incompatible with IELTS grading engine.")
                    
            logger.info(f"✅ Structuring completed using {selected_model}. Tokens used: {tokens_used}")
            
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
            # 5. SAFE GEMINI FILE CLEANUP: Delete the uploaded file from Google Cloud server immediately
            if file_name:
                try:
                    logger.info(f"🗑️ Deleting Gemini cloud file to keep storage clean: {file_name}")
                    self.client.files.delete(name=file_name)
                    logger.info(f"✅ Gemini cloud file deleted successfully.")
                except Exception as del_err:
                    logger.warning(f"⚠️ Failed to clean up Gemini file {file_name}: {del_err}")

# Singleton instance
_extraction_service = None

def get_extraction_service() -> ExtractionService:
    global _extraction_service
    if _extraction_service is None:
        _extraction_service = ExtractionService()
    return _extraction_service
