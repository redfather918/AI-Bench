"""Manager Dashboard, SOP & Case Library API router."""

import json
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import (
    VoiceRecording, User, SopTemplate, SopStep, SuccessGoal, CaseItem,
)
from backend.schemas import (
    ManagerDashboardOut, SopTemplateOut, SopStepOut, SopStepCreate, SopStepUpdate,
    SuccessGoalOut, SuccessGoalCreate, SuccessGoalUpdate,
    CaseItemOut, CaseItemCreate, SopSuggestionResponse,
)
from backend.services.llm import suggest_sop_improvements

router = APIRouter(prefix="/api/manager", tags=["管理者"])


# ── Dashboard ──
@router.get("/dashboard")
def get_manager_dashboard(db: Session = Depends(get_db)):
    """获取管理者仪表盘数据。"""
    all_recs = db.query(VoiceRecording).all()

    # Mock rankings
    rankings = [
        {"name": "赵敏", "rate": 85, "change": 1},
        {"name": "孙丽", "rate": 78, "change": 0},
        {"name": "李明", "rate": 72, "change": 3},
        {"name": "周杰", "rate": 65, "change": -1},
        {"name": "吴迪", "rate": 58, "change": 0},
    ]

    # High-conversion features (mock)
    features = [
        {
            "rank": 1, "name": "开场30秒内明确客户需求",
            "hit_rate": 78, "miss_rate": 23, "diff": 55,
        },
        {
            "rank": 2, "name": "客户提价后立刻追问使用场景",
            "hit_rate": 65, "miss_rate": 18, "diff": 47,
        },
        {
            "rank": 3, "name": "结束前明确下一步行动",
            "hit_rate": 82, "miss_rate": 31, "diff": 51,
        },
    ]

    at_risk = [
        {"name": "陈七", "rate": 25, "weakness": "异议处理", "recommend": "价格异议话术"},
        {"name": "林八", "rate": 18, "weakness": "需求挖掘", "recommend": "SPIN提问法"},
    ]

    return {
        "today_uploads": len(all_recs),
        "analyzed_count": len([r for r in all_recs if r.sop_score > 0]),
        "avg_deal_rate": 52,
        "deal_rate_change": 5,
        "best_sales": "赵敏",
        "best_rate": 85,
        "top_improver": "李明",
        "top_improve_pct": 15,
        "rankings": rankings,
        "high_conversion_features": features,
        "at_risk_sales": at_risk,
    }


# ── SOP Templates ──
@router.get("/sop", response_model=list[SopTemplateOut])
def list_sop_templates(db: Session = Depends(get_db)):
    """获取所有SOP模板（含步骤）。"""
    return db.query(SopTemplate).all()


@router.get("/sop/{template_id}", response_model=SopTemplateOut)
def get_sop_template(template_id: int, db: Session = Depends(get_db)):
    """获取单个SOP模板。"""
    tpl = db.query(SopTemplate).filter(SopTemplate.id == template_id).first()
    if not tpl:
        raise HTTPException(status_code=404, detail="SOP模板不存在")
    return tpl


@router.post("/sop/{template_id}/steps", response_model=SopStepOut)
def add_sop_step(template_id: int, data: SopStepCreate, db: Session = Depends(get_db)):
    """添加SOP步骤。"""
    step = SopStep(template_id=template_id, **data.model_dump())
    db.add(step)
    db.commit()
    db.refresh(step)
    return step


@router.put("/sop/steps/{step_id}", response_model=SopStepOut)
def update_sop_step(step_id: int, data: SopStepUpdate, db: Session = Depends(get_db)):
    """更新SOP步骤。"""
    step = db.query(SopStep).filter(SopStep.id == step_id).first()
    if not step:
        raise HTTPException(status_code=404, detail="步骤不存在")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(step, key, value)
    db.commit()
    db.refresh(step)
    return step


@router.delete("/sop/steps/{step_id}")
def delete_sop_step(step_id: int, db: Session = Depends(get_db)):
    """删除SOP步骤。"""
    step = db.query(SopStep).filter(SopStep.id == step_id).first()
    if not step:
        raise HTTPException(status_code=404, detail="步骤不存在")
    db.delete(step)
    db.commit()
    return {"ok": True}


# ── Success Goals ──
@router.get("/goals", response_model=list[SuccessGoalOut])
def list_goals(db: Session = Depends(get_db)):
    return db.query(SuccessGoal).all()


@router.post("/goals", response_model=SuccessGoalOut)
def create_goal(data: SuccessGoalCreate, db: Session = Depends(get_db)):
    goal = SuccessGoal(**data.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.put("/goals/{goal_id}", response_model=SuccessGoalOut)
def update_goal(goal_id: int, data: SuccessGoalUpdate, db: Session = Depends(get_db)):
    goal = db.query(SuccessGoal).filter(SuccessGoal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="目标不存在")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(goal, key, value)
    db.commit()
    db.refresh(goal)
    return goal


@router.delete("/goals/{goal_id}")
def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    goal = db.query(SuccessGoal).filter(SuccessGoal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="目标不存在")
    db.delete(goal)
    db.commit()
    return {"ok": True}


# ── Case Library ──
@router.get("/cases", response_model=list[CaseItemOut])
def list_cases(
    category: str = Query(""),
    search: str = Query(""),
    skip: int = Query(0),
    limit: int = Query(50),
    db: Session = Depends(get_db),
):
    """获取案例列表，支持分类和搜索。"""
    query = db.query(CaseItem).order_by(CaseItem.learning_count.desc())
    if category:
        query = query.filter(CaseItem.category == category)
    if search:
        query = query.filter(
            CaseItem.title.contains(search) | CaseItem.scene.contains(search)
        )
    total = query.count()
    return query.offset(skip).limit(limit).all()


@router.get("/cases/top", response_model=list[CaseItemOut])
def top_cases(limit: int = Query(5), db: Session = Depends(get_db)):
    """获取热门案例Top N。"""
    return db.query(CaseItem).order_by(CaseItem.learning_count.desc()).limit(limit).all()


@router.get("/cases/{case_id}", response_model=CaseItemOut)
def get_case(case_id: int, db: Session = Depends(get_db)):
    case = db.query(CaseItem).filter(CaseItem.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="案例不存在")
    case.learning_count += 1
    db.commit()
    return case


@router.post("/cases", response_model=CaseItemOut)
def create_case(data: CaseItemCreate, db: Session = Depends(get_db)):
    case = CaseItem(**data.model_dump())
    db.add(case)
    db.commit()
    db.refresh(case)
    return case


# ── AI Suggestions ──
@router.post("/sop-suggestions")
async def get_sop_suggestions(db: Session = Depends(get_db)):
    """基于当前高转化特征生成SOP优化建议（LLM）。"""
    features = [
        {"rank": 1, "name": "开场30秒内明确客户需求", "hit_rate": 78, "miss_rate": 23, "diff": 55},
        {"rank": 2, "name": "客户提价后立刻追问使用场景", "hit_rate": 65, "miss_rate": 18, "diff": 47},
        {"rank": 3, "name": "结束前明确下一步行动", "hit_rate": 82, "miss_rate": 31, "diff": 51},
    ]
    result = await suggest_sop_improvements(features)
    return result
