from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from typing import Any, Dict

class FeedItemResponse(BaseModel):
    id: int
    opportunity_type: str
    signal: str
    meaning: str
    impact: str
    relevance_score: int
    estimated_time: str
    action_path: List[str] = []
    opportunity_metadata: Dict[str, Any] = {}
    expected_output: Optional[str] = None
    proof_desc: str
    difficulty: str
    primary_skill: str

class StartTaskRequest(BaseModel):
    user_id: str
    task_id: int

class SubmitProofRequest(BaseModel):
    user_id: str
    task_id: int
    submission_type: str
    submission_content: str

class UserSkillResponse(BaseModel):
    skill_name: str
    level: int

class UserBadgeResponse(BaseModel):
    badge_name: str
    timestamp: datetime

class UserProfileResponse(BaseModel):
    id: str
    name: str
    current_streak: int
    longest_streak: int
    skill_progress: float
    domain: str
    skills: List[UserSkillResponse] = []
    badges: List[UserBadgeResponse] = []

class AiSaathiRequest(BaseModel):
    user_id: str
    task_id: int
    message: str
    context_code: str = ""

class AiSaathiResponse(BaseModel):
    reply: str
