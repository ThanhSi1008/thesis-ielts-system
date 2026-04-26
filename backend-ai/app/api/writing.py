from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import logging

from app.services.writing_grader import grade_writing

router = APIRouter()
logger = logging.getLogger(__name__)


class WritingGradeRequest(BaseModel):
    session_id: str
    task1_prompt: str
    task2_prompt: str
    task1_image_url: Optional[str] = ""
    task1_essay: Optional[str] = ""
    task2_essay: Optional[str] = ""


@router.post("/grade")
async def grade_writing_task(request: WritingGradeRequest):
    """
    Receive a writing grading request, await the AI grading synchronously, 
    and return the grades immediately in the response.
    """
    try:
        logger.info(f"[Writing] Starting synchronous grading for session {request.session_id}")
        feedback = await grade_writing(
            task1_prompt=request.task1_prompt,
            task2_prompt=request.task2_prompt,
            task1_image_url=request.task1_image_url or "",
            task1_essay=request.task1_essay or "",
            task2_essay=request.task2_essay or "",
        )
        logger.info(f"[Writing] Grading complete for session {request.session_id}, band={feedback['overall_band']}")

        return {
            "overallBand": feedback["overall_band"],
            "task1Band": feedback["task1"]["band"],
            "task2Band": feedback["task2"]["band"],
            "feedback": feedback,
        }
    except Exception as e:
        error_str = str(e)
        if "503" in error_str or "429" in error_str:
            logger.warning(f"[Writing] AI grading service overloaded (503/429) for session {request.session_id}: {error_str}")
            raise HTTPException(
                status_code=503, 
                detail="The AI grading service is currently experiencing high demand. Please try again later."
            )
        
        logger.error(f"[Writing] Grading failed for session {request.session_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
