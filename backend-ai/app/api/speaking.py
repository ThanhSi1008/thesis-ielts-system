from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
import logging

from app.services.speaking_grader import grade_speaking

router = APIRouter()
logger = logging.getLogger(__name__)

class SpeakingGradeRequest(BaseModel):
    session_id: str
    exam_questions: Dict[str, Any]
    audio_answers: Dict[str, str]

@router.post("/grade")
async def grade_speaking_exam(request: SpeakingGradeRequest):
    """
    Receive a speaking grading request, decode the audio base64 buffers, 
    transcribe using whisper, format prompt to LLM for IELTS Speaking grading criteria,
    and return the grade immediately.
    """
    try:
        logger.info(f"[Speaking] Starting synchronous grading for session {request.session_id}")
        
        feedback = await grade_speaking(
            session_id=request.session_id,
            exam_questions=request.exam_questions,
            audio_answers=request.audio_answers
        )
        
        logger.info(f"[Speaking] Grading complete for session {request.session_id}, band={feedback.get('overall_band', 0)}")
        
        return {
            "overallBand": feedback.get("overall_band", 0),
            "feedback": feedback,
        }
    except Exception as e:
        error_str = str(e)
        if "503" in error_str or "429" in error_str:
            logger.warning(f"[Speaking] AI grading service overloaded (503/429) for session {request.session_id}: {error_str}")
            raise HTTPException(
                status_code=503, 
                detail="The AI grading service is currently experiencing high demand. Please try again later."
            )
        
        logger.error(f"[Speaking] Grading failed for session {request.session_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
