"""Pydantic schemas for request/response validation."""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


# ── User ──
class UserOut(BaseModel):
    id: int
    name: str
    department: str
    role: str
    avatar: str = ""

    class Config:
        from_attributes = True


# ── Knowledge ──
class KnowledgeItemOut(BaseModel):
    id: int
    title: str
    file_type: str
    file_size: str = ""
    visibility: str
    department: str
    uploader_name: str
    tags: str = ""
    content: str = ""
    view_count: int = 0
    duration: str = ""
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class KnowledgeItemCreate(BaseModel):
    title: str
    file_type: str = "pdf"
    file_size: str = ""
    visibility: str = "department"
    department: str = "销售部"
    tags: str = ""
    content: str = ""
    duration: str = ""


class KnowledgeItemUpdate(BaseModel):
    title: Optional[str] = None
    visibility: Optional[str] = None
    tags: Optional[str] = None
    content: Optional[str] = None


class KnowledgeListOut(BaseModel):
    items: List[KnowledgeItemOut]
    total: int


# ── Voice ──
class VoiceRecordingOut(BaseModel):
    id: int
    sales_name: str
    customer_name: str
    customer_company: str = ""
    customer_age: int = 0
    duration_display: str
    transcription: str = ""
    emotion_positive: float
    emotion_neutral: float
    emotion_negative: float
    sop_completion: str = "[]"
    sop_score: float
    skill_need_discovery: float
    skill_sop_completion: float
    skill_objection_handling: float
    skill_closing: float
    improvement_points: str = "[]"
    suggested_learning: str = "[]"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SalesDashboardOut(BaseModel):
    today_uploads: int
    pending_analysis: int
    radar_scores: dict  # 五维分数
    team_avg_scores: dict
    trend_data: list
    today_rank: int
    rank_change: int
    recent_recordings: List[VoiceRecordingOut]


# ── Manager ──
class ManagerDashboardOut(BaseModel):
    today_uploads: int
    analyzed_count: int
    avg_deal_rate: float
    deal_rate_change: float
    best_sales: str
    best_rate: float
    top_improver: str
    top_improve_pct: float
    rankings: list
    high_conversion_features: list
    at_risk_sales: list


class SopStepOut(BaseModel):
    id: int
    order: int
    name: str
    description: str = ""
    required_actions: str = "[]"
    check_points: str = "[]"
    is_key_step: bool = False

    class Config:
        from_attributes = True


class SopTemplateOut(BaseModel):
    id: int
    name: str
    is_active: bool
    steps: List[SopStepOut]

    class Config:
        from_attributes = True


class SopStepCreate(BaseModel):
    order: int
    name: str
    description: str = ""
    required_actions: str = "[]"
    check_points: str = "[]"
    is_key_step: bool = False


class SopStepUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    required_actions: Optional[str] = None
    check_points: Optional[str] = None
    is_key_step: Optional[bool] = None
    order: Optional[int] = None


class SuccessGoalOut(BaseModel):
    id: int
    name: str
    goal_type: str
    rule_description: str
    target_team: str
    is_active: bool

    class Config:
        from_attributes = True


class SuccessGoalCreate(BaseModel):
    name: str
    goal_type: str = "business_result"
    rule_description: str = ""
    target_team: str = "所有销售团队"
    is_active: bool = True


class SuccessGoalUpdate(BaseModel):
    name: Optional[str] = None
    goal_type: Optional[str] = None
    rule_description: Optional[str] = None
    target_team: Optional[str] = None
    is_active: Optional[bool] = None


class CaseItemOut(BaseModel):
    id: int
    title: str
    scene: str
    sales_name: str
    deal_result: str
    dialog_excerpt: str
    dialog_timestamp: str
    success_points: str
    category: str
    learning_count: int

    class Config:
        from_attributes = True


class CaseItemCreate(BaseModel):
    title: str
    scene: str = ""
    sales_name: str = ""
    deal_result: str = ""
    dialog_excerpt: str = ""
    dialog_timestamp: str = ""
    success_points: str = "[]"
    category: str = "异议处理"


# ── AI ──
class AIQuestion(BaseModel):
    question: str
    user_id: int = 1
    department: str = "销售部"


class AIAnswer(BaseModel):
    answer_framework: str
    script_reference: str
    differentiation_points: list
    references: list


class VoiceAnalysisRequest(BaseModel):
    transcription: str
    recording_id: Optional[int] = None


class VoiceAnalysisResponse(BaseModel):
    emotion_positive: float
    emotion_neutral: float
    emotion_negative: float
    sop_completion: list  # [{step_name, status, feedback}]
    sop_score: float
    skills: dict
    improvement_points: list
    suggested_learning: list


class SopSuggestionRequest(BaseModel):
    context: str = ""


class SopSuggestionResponse(BaseModel):
    suggestions: list
    new_scripts: list
