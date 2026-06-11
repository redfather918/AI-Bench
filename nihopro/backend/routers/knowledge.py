"""Knowledge Base API router."""

import json
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import KnowledgeItem, User
from backend.schemas import KnowledgeItemOut, KnowledgeItemCreate, KnowledgeItemUpdate, KnowledgeListOut
from backend.services.llm import auto_tag_recommend

router = APIRouter(prefix="/api/knowledge", tags=["知识库"])


@router.get("/list", response_model=KnowledgeListOut)
def list_knowledge(
    space: str = Query("all", description="all / private / department / company"),
    tag: str = Query("", description="筛选标签"),
    search: str = Query("", description="搜索关键词"),
    sort: str = Query("recent", description="recent / hot"),
    user_id: int = Query(1),
    department: str = Query("销售部"),
    skip: int = Query(0),
    limit: int = Query(50),
    db: Session = Depends(get_db),
):
    """获取知识列表，支持空间筛选、标签筛选、搜索和排序。"""
    query = db.query(KnowledgeItem)

    # 空间权限过滤
    if space == "private":
        query = query.filter(KnowledgeItem.visibility == "private", KnowledgeItem.uploader_id == user_id)
    elif space == "department":
        query = query.filter(
            (KnowledgeItem.visibility == "department") & (KnowledgeItem.department == department)
            | (KnowledgeItem.visibility == "private") & (KnowledgeItem.uploader_id == user_id)
        )
    elif space == "company":
        query = query.filter(KnowledgeItem.visibility == "company")
    # else: "all" -> no filter (but respect basic visibility)

    if tag:
        query = query.filter(KnowledgeItem.tags.contains(tag))
    if search:
        query = query.filter(
            KnowledgeItem.title.contains(search) | KnowledgeItem.content.contains(search)
        )

    total = query.count()
    if sort == "hot":
        query = query.order_by(KnowledgeItem.view_count.desc())
    else:
        query = query.order_by(KnowledgeItem.created_at.desc())

    items = query.offset(skip).limit(limit).all()
    return KnowledgeListOut(items=[KnowledgeItemOut.model_validate(i) for i in items], total=total)


@router.get("/{item_id}", response_model=KnowledgeItemOut)
def get_knowledge(item_id: int, db: Session = Depends(get_db)):
    """获取单个知识条目详情。"""
    item = db.query(KnowledgeItem).filter(KnowledgeItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="知识条目不存在")
    item.view_count += 1
    db.commit()
    return item


@router.post("/", response_model=KnowledgeItemOut)
def create_knowledge(data: KnowledgeItemCreate, user_id: int = Query(1), user_name: str = Query("李明"), db: Session = Depends(get_db)):
    """创建新知识条目。"""
    item = KnowledgeItem(
        title=data.title,
        file_type=data.file_type,
        file_size=data.file_size,
        visibility=data.visibility,
        department=data.department,
        uploader_id=user_id,
        uploader_name=user_name,
        tags=data.tags,
        content=data.content,
        duration=data.duration,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{item_id}", response_model=KnowledgeItemOut)
def update_knowledge(item_id: int, data: KnowledgeItemUpdate, db: Session = Depends(get_db)):
    """更新知识条目（权限、标签等）。"""
    item = db.query(KnowledgeItem).filter(KnowledgeItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="知识条目不存在")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}")
def delete_knowledge(item_id: int, db: Session = Depends(get_db)):
    """删除知识条目。"""
    item = db.query(KnowledgeItem).filter(KnowledgeItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="知识条目不存在")
    db.delete(item)
    db.commit()
    return {"ok": True}


@router.get("/tags/suggest")
async def suggest_tags(content: str = Query(""), existing: str = Query("")):
    """基于内容推荐标签（支持LLM）。"""
    tags = await auto_tag_recommend(content, existing)
    return {"tags": tags}
