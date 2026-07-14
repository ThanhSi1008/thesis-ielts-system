import logging
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.services.refine_service import get_refine_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("")
async def refine(
    payload: str = Form(..., description="Current structured JSON of the exam (raw string)."),
    instruction: str = Form(..., description="Admin's natural-language repair instruction."),
    skill: Optional[str] = Form(None, description="IELTS skill, for prompt context."),
    image: Optional[UploadFile] = File(None, description="Optional screenshot of the error."),
):
    """AI-assisted refinement endpoint.

    Accepts a multipart/form-data request (JSON payload + text instruction +
    optional screenshot), invokes Gemini in multimodal mode to surgically repair
    the JSON, validates the result against the QuestionItem contract, and returns
    {"structuredJson": <repaired>}.
    """
    image_bytes: Optional[bytes] = None
    image_mime: Optional[str] = None
    if image is not None:
        content_type = (image.content_type or "").lower()
        if not content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Attached file must be an image.")
        image_bytes = await image.read()
        image_mime = content_type or "image/png"
        if not image_bytes:
            image_bytes = None  # treat an empty upload as "no image"

    service = get_refine_service()
    try:
        return await service.refine(
            payload_json=payload,
            instruction=instruction,
            skill=skill,
            image_bytes=image_bytes,
            image_mime=image_mime,
        )
    except ValueError as ve:
        # Bad input or a repair that fails the schema contract → 422 (client-fixable).
        logger.warning(f"⚠️ Refinement rejected: {ve}")
        raise HTTPException(status_code=422, detail=str(ve))
    except RuntimeError as re:
        logger.error(f"❌ Refinement failed: {re}")
        raise HTTPException(status_code=502, detail=str(re))
    except Exception as e:  # noqa: BLE001 — surface any unexpected failure cleanly
        logger.exception("❌ Unexpected error during refinement")
        raise HTTPException(status_code=500, detail=f"Refinement error: {e}")
