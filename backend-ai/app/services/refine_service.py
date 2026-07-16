import json
import logging
from typing import Any, Dict, List, Optional

from google import genai
from google.genai import types
from pydantic import ValidationError

from app.config import get_settings
from app.prompts.extraction.schemas import QuestionItem

logger = logging.getLogger(__name__)
settings = get_settings()

# Surgical JSON repair agent — minimal-edit, schema-preserving system instruction.
REFINE_SYSTEM_INSTRUCTION = (
    "You are a surgical JSON repair agent. Your task is to modify the provided JSON "
    "structure based on the Admin's textual instructions and the provided screenshot "
    "context. You must ONLY fix the areas pointed out by the Admin. Keep all other "
    "fields, structures, IDs, and existing Cloudinary asset URLs entirely intact. "
    "Output ONLY the strictly valid, updated JSON object matching our system schema "
    "contract, without markdown code block backticks."
)

# Question types accepted by the IELTS grading engine — mirrors the NestJS commit gate
# and the extraction whitelist so a repair can never introduce an unsupported type.
_VALID_QUESTION_TYPES = {
    "multiple_choice", "multiple_choice_multiple", "short_answer", "fill_blank",
    "form_completion", "note_completion", "sentence_completion", "summary_completion",
    "table_completion", "flowchart_completion", "diagram_completion",
    "matching", "matching_features", "matching_information", "matching_headings",
    "matching_sentence_endings",
    "map_labelling", "plan_labelling", "diagram_labelling", "map_labeling",
    "true_false_not_given", "yes_no_not_given",
}


class RefineService:
    """AI-assisted refinement: repairs an extraction's JSON state from an Admin's
    natural-language instruction and an optional screenshot, using Gemini multimodal."""

    def __init__(self):
        self.api_key = settings.gemini_api_key
        self.client = None
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
            logger.info("✅ Gemini refine client initialized successfully")
        else:
            logger.warning("⚠️ GEMINI_API_KEY is empty — refinement calls will fail!")

    def _collect_question_items(self, data: Any) -> List[Dict[str, Any]]:
        """Gathers every question-item dict from a Listening/Reading structured JSON.
        Items live at parts[].content[] (multi-part) or at a top-level content[]."""
        items: List[Dict[str, Any]] = []
        if not isinstance(data, dict):
            return items
        parts = data.get("parts")
        if isinstance(parts, list):
            for part in parts:
                if isinstance(part, dict) and isinstance(part.get("content"), list):
                    items.extend([c for c in part["content"] if isinstance(c, dict)])
        if isinstance(data.get("content"), list):
            items.extend([c for c in data["content"] if isinstance(c, dict)])
        return items

    def _validate_structure(self, data: Any) -> None:
        """Validates the repaired JSON's structural integrity. Listening/Reading
        question items are validated against the Pydantic QuestionItem model;
        Writing/Speaking payloads (no question items) only need to be a JSON object.
        Raises ValueError on any structural violation."""
        if not isinstance(data, dict):
            raise ValueError("Repaired output must be a JSON object.")

        items = self._collect_question_items(data)
        for idx, item in enumerate(items):
            try:
                QuestionItem.model_validate(item)
            except ValidationError as ve:
                raise ValueError(
                    f"Repaired question item #{idx + 1} "
                    f"(question_number={item.get('question_number')}) violates the "
                    f"QuestionItem schema: {ve.errors(include_url=False)}"
                )
            q_type = item.get("type")
            if q_type not in _VALID_QUESTION_TYPES:
                raise ValueError(
                    f"Repaired question item #{idx + 1} has a non-whitelisted type "
                    f"'{q_type}'."
                )

    async def refine(
        self,
        payload_json: str,
        instruction: str,
        skill: Optional[str] = None,
        image_bytes: Optional[bytes] = None,
        image_mime: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Repairs the structured JSON per the Admin's instruction (+ optional screenshot).

        Args:
            payload_json: the current structured JSON of the exam as a raw string.
            instruction: the Admin's natural-language repair request.
            skill: optional IELTS skill (LISTENING/READING/...) for prompt context.
            image_bytes / image_mime: optional pasted screenshot of the error.

        Returns the repaired JSON as {"structuredJson": <dict>}.
        """
        if not self.client:
            raise RuntimeError("Gemini client is not initialized")

        if not instruction or not instruction.strip():
            raise ValueError("A refinement instruction is required.")

        # Confirm the incoming payload is valid JSON before spending a Gemini call.
        try:
            json.loads(payload_json)
        except (json.JSONDecodeError, TypeError) as e:
            raise ValueError(f"The provided JSON payload is not valid JSON: {e}")

        skill_line = f"IELTS skill of this exam: {skill.upper()}.\n" if skill else ""
        user_text = (
            f"{skill_line}"
            "Here is the CURRENT structured JSON state of the exam that needs repair:\n"
            "```json\n"
            f"{payload_json}\n"
            "```\n\n"
            "Admin's repair instruction:\n"
            f"{instruction.strip()}\n\n"
            "Apply ONLY this requested change. Return the COMPLETE updated JSON object "
            "(every other field unchanged) and nothing else."
        )

        contents: List[Any] = [types.Part.from_text(text=user_text)]
        if image_bytes:
            mime = image_mime or "image/png"
            contents.append(types.Part.from_bytes(data=image_bytes, mime_type=mime))
            logger.info(f"🖼️ Refinement includes a screenshot ({mime}, {len(image_bytes)} bytes)")

        logger.info(f"🛠️ Refining structured JSON (skill={skill or 'n/a'}) — calling Gemini...")
        response = await self.client.aio.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=REFINE_SYSTEM_INSTRUCTION,
                temperature=0.1,
                response_mime_type="application/json",
            ),
        )

        if not response.text:
            raise RuntimeError("Gemini returned an empty refinement response.")

        try:
            repaired = json.loads(response.text)
        except json.JSONDecodeError as e:
            logger.error(f"❌ Gemini returned non-JSON refinement output: {e}")
            raise RuntimeError("Gemini returned malformed JSON; refinement aborted.")

        # Structural integrity gate before handing the repair back to NestJS.
        self._validate_structure(repaired)

        logger.info("✅ Refinement completed and validated against QuestionItem schema.")
        return {"structuredJson": repaired}


_refine_service: Optional[RefineService] = None


def get_refine_service() -> RefineService:
    global _refine_service
    if _refine_service is None:
        _refine_service = RefineService()
    return _refine_service
