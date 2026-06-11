"""SQLAlchemy ORM models for NIHO backend."""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from backend.database import Base
import enum


class Visibility(str, enum.Enum):
    PRIVATE = "private"
    DEPARTMENT = "department"
    COMPANY = "company"


class SopCheckStatus(str, enum.Enum):
    PASS = "pass"
    WARN = "warn"
    FAIL = "fail"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False)
    department = Column(String(50), default="销售部")
    role = Column(String(20), default="sales")  # sales / manager
    avatar = Column(String(200), default="")
    created_at = Column(DateTime, default=datetime.utcnow)


class KnowledgeItem(Base):
    __tablename__ = "knowledge_items"
    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    file_type = Column(String(20))  # pdf, docx, pptx, mp3, mp4
    file_size = Column(String(20))
    visibility = Column(String(20), default="department")  # private / department / company
    department = Column(String(50), default="销售部")
    uploader_id = Column(Integer, ForeignKey("users.id"))
    uploader_name = Column(String(50))
    tags = Column(String(500), default="")  # comma-separated
    content = Column(Text, default="")  # extracted text or transcription
    view_count = Column(Integer, default=0)
    duration = Column(String(20), default="")  # for audio/video
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class VoiceRecording(Base):
    __tablename__ = "voice_recordings"
    id = Column(Integer, primary_key=True)
    sales_id = Column(Integer, ForeignKey("users.id"))
    sales_name = Column(String(50))
    customer_name = Column(String(50))
    customer_company = Column(String(100), default="")
    customer_age = Column(Integer, default=0)
    duration_seconds = Column(Integer, default=0)
    duration_display = Column(String(20), default="")
    transcription = Column(Text, default="")  # AI转录文本
    emotion_positive = Column(Float, default=0)  # 正面情绪%
    emotion_neutral = Column(Float, default=0)  # 中性情绪%
    emotion_negative = Column(Float, default=0)  # 负面情绪%

    # SOP completion per step (JSON string)
    sop_completion = Column(Text, default="[]")
    sop_score = Column(Float, default=0)  # overall SOP %

    # Skill scores
    skill_need_discovery = Column(Float, default=0)
    skill_sop_completion = Column(Float, default=0)
    skill_objection_handling = Column(Float, default=0)
    skill_closing = Column(Float, default=0)

    improvement_points = Column(Text, default="[]")
    suggested_learning = Column(Text, default="[]")
    deal_result = Column(Boolean, default=None, nullable=True)  # 是否成交
    file_path = Column(String(300), default="")
    created_at = Column(DateTime, default=datetime.utcnow)


class SopTemplate(Base):
    __tablename__ = "sop_templates"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    steps = relationship("SopStep", back_populates="template", order_by="SopStep.order")


class SopStep(Base):
    __tablename__ = "sop_steps"
    id = Column(Integer, primary_key=True)
    template_id = Column(Integer, ForeignKey("sop_templates.id"))
    order = Column(Integer)
    name = Column(String(100))
    description = Column(Text, default="")
    required_actions = Column(Text, default="")  # JSON list
    check_points = Column(Text, default="")  # JSON list
    is_key_step = Column(Boolean, default=False)
    template = relationship("SopTemplate", back_populates="steps")


class SuccessGoal(Base):
    __tablename__ = "success_goals"
    id = Column(Integer, primary_key=True)
    name = Column(String(200))
    goal_type = Column(String(20), default="business_result")  # single_action / business_result
    rule_description = Column(Text, default="")
    target_team = Column(String(200), default="所有销售团队")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class CaseItem(Base):
    __tablename__ = "case_items"
    id = Column(Integer, primary_key=True)
    title = Column(String(200))
    scene = Column(String(200))
    sales_name = Column(String(50))
    deal_result = Column(String(50))  # e.g. "7天内签约"
    dialog_excerpt = Column(Text)
    dialog_timestamp = Column(String(20))
    success_points = Column(Text, default="[]")  # JSON list
    category = Column(String(50), default="异议处理")
    learning_count = Column(Integer, default=0)
    recording_id = Column(Integer, ForeignKey("voice_recordings.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
