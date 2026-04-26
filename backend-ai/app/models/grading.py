from pydantic import BaseModel
from typing import Optional

class GradingRequest(BaseModel):
    """Grading request model"""
    session_id: str
    audio_url: Optional[str] = None
    text_response: Optional[str] = None
    exam_type: str


class GradingResponse(BaseModel):
    """Grading response model"""
    session_id: str
    status: str
    message: str
