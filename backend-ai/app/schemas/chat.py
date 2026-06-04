from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class ChatMessage(BaseModel):
    role: str  # "user" or "model"
    content: str

class UserContext(BaseModel):
    """Real-time user data injected for personalized responses (RAG Phase 2)."""
    name: Optional[str] = None
    currentPage: Optional[str] = None
    studyStreak: Optional[int] = None
    vocabDueCount: Optional[int] = None
    recentScores: Optional[Dict[str, Optional[float]]] = None
    activeContent: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    # Override system instruction (used by internal flows like word explanations)
    system_instruction: Optional[str] = None
    # Real-time user context for personalization (Phase 2)
    userContext: Optional[UserContext] = None
    stream: bool = True
