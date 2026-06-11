"""Voice Recording & Analysis API router."""

import json
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import VoiceRecording, User
from backend.schemas import VoiceRecordingOut, VoiceAnalysisRequest, VoiceAnalysisResponse, SalesDashboardOut
from backend.services.llm import analyze_voice

router = APIRouter(prefix="/api/voice", tags=["语音分析"])


@router.get("/recordings", response_model=list[VoiceRecordingOut])
def list_recordings(
    user_id: int = Query(1),
    skip: int = Query(0),
    limit: int = Query(20),
    db: Session = Depends(get_db),
):
    """获取用户的通话录音列表。"""
    items = (
        db.query(VoiceRecording)
        .filter(VoiceRecording.sales_id == user_id)
        .order_by(VoiceRecording.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return items


@router.get("/recordings/{recording_id}", response_model=VoiceRecordingOut)
def get_recording(recording_id: int, db: Session = Depends(get_db)):
    """获取单条录音详情。"""
    recording = db.query(VoiceRecording).filter(VoiceRecording.id == recording_id).first()
    if not recording:
        raise HTTPException(status_code=404, detail="录音不存在")
    return recording


@router.post("/upload")
def upload_recording(
    sales_id: int = Query(1),
    sales_name: str = Query("李明"),
    customer_name: str = Query("客户"),
    duration_display: str = Query("00:00"),
    transcription: str = Query(""),
    db: Session = Depends(get_db),
):
    """上传录音（模拟），创建分析记录。实际使用时需文件上传+异步转写。"""
    recording = VoiceRecording(
        sales_id=sales_id,
        sales_name=sales_name,
        customer_name=customer_name,
        duration_display=duration_display,
        transcription=transcription,
    )
    db.add(recording)
    db.commit()
    db.refresh(recording)
    return {"id": recording.id, "status": "pending_analysis"}


@router.post("/analyze", response_model=VoiceAnalysisResponse)
async def run_analysis(req: VoiceAnalysisRequest):
    """对录音进行AI分析（情绪+SOP+能力）。"""
    result = await analyze_voice(req.transcription)
    return result


@router.post("/recordings/{recording_id}/analyze", response_model=VoiceRecordingOut)
async def analyze_and_save(recording_id: int, db: Session = Depends(get_db)):
    """对已有录音进行AI分析并将结果持久化。"""
    rec = db.query(VoiceRecording).filter(VoiceRecording.id == recording_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="录音不存在")
    if not rec.transcription:
        rec.transcription = "模拟通话转写文本：销售：您好王总... 客户：价格有点高... 销售：我理解，但从长期来看..."

    result = await analyze_voice(rec.transcription)

    rec.emotion_positive = result["emotion_positive"]
    rec.emotion_neutral = result["emotion_neutral"]
    rec.emotion_negative = result["emotion_negative"]
    rec.sop_completion = json.dumps(result["sop_completion"], ensure_ascii=False)
    rec.sop_score = result["sop_score"]
    rec.skill_need_discovery = result["skills"]["need_discovery"]
    rec.skill_sop_completion = result["skills"]["sop_completion"]
    rec.skill_objection_handling = result["skills"]["objection_handling"]
    rec.skill_closing = result["skills"]["closing"]
    rec.improvement_points = json.dumps(result["improvement_points"], ensure_ascii=False)
    rec.suggested_learning = json.dumps(result["suggested_learning"], ensure_ascii=False)

    db.commit()
    db.refresh(rec)
    return rec


@router.get("/dashboard")
def get_sales_dashboard(
    user_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """获取销售个人仪表盘数据。"""
    recordings = (
        db.query(VoiceRecording)
        .filter(VoiceRecording.sales_id == user_id)
        .order_by(VoiceRecording.created_at.desc())
        .all()
    )

    if not recordings:
        return {
            "today_uploads": 0,
            "pending_analysis": 0,
            "radar_scores": {"需求挖掘": 0, "SOP完成度": 0, "异议处理": 0, "促成": 0, "产品知识": 0},
            "team_avg_scores": {"需求挖掘": 60, "SOP完成度": 55, "异议处理": 50, "促成": 45, "产品知识": 65},
            "trend_data": [],
            "today_rank": 0,
            "rank_change": 0,
            "recent_recordings": [],
        }

    latest = recordings[0] if recordings else None
    radar = {
        "需求挖掘": latest.skill_need_discovery if latest else 0,
        "SOP完成度": latest.skill_sop_completion if latest else 0,
        "异议处理": latest.skill_objection_handling if latest else 0,
        "促成": latest.skill_closing if latest else 0,
        "产品知识": 75,
    }

    # Mock trend data
    trend = [
        {"date": f"12/{9+i}", "rate": max(30, min(95, 40 + i * 8 + (i % 3) * 5))}
        for i in range(7)
    ]

    return {
        "today_uploads": len([r for r in recordings if r.created_at]),
        "pending_analysis": 2,
        "radar_scores": radar,
        "team_avg_scores": {"需求挖掘": 60, "SOP完成度": 55, "异议处理": 50, "促成": 45, "产品知识": 65},
        "trend_data": trend,
        "today_rank": 8,
        "rank_change": 2,
        "recent_recordings": recordings[:5],
    }
