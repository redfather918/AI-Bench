"""AI & LLM API router."""

import json
from fastapi import APIRouter, Query
from backend.schemas import AIQuestion, AIAnswer
from backend.services.llm import chat_completion

router = APIRouter(prefix="/api/ai", tags=["AI助手"])


KNOWLEDGE_QA_PROMPT = """你是NIHO销售赋能平台的知识助手。基于企业知识库内容回答用户问题。

规则：
1. 只基于用户有权限访问的知识范围回答
2. 每个关键信息都标注引用来源
3. 如果知识库中没有相关信息，如实告知
4. 回答结构清晰，包含：建议框架、具体话术、差异化要点
5. 回复为 JSON 格式：{"answer_framework","script_reference","differentiation_points","references"}

知识库内容参考（模拟）：
- 竞品分析报告-2025Q4.pdf：竞品A需要手动上传，我们支持实时语音分析；私有化部署成本低30%
- 产品销售FAQ_V2.docx：包含常见异议处理和产品对比信息
- 金牌销售异议处理话术合集：包含价格异议、竞品对比、客户犹豫等场景的话术
- 价格异议处理五步法：共情→拆分成本→ROI对比→案例佐证→促成"""


@router.post("/ask")
async def ask_question(req: AIQuestion):
    """AI知识问答 - 基于知识库的内容生成回答。"""
    response = await chat_completion(KNOWLEDGE_QA_PROMPT, req.question, temperature=0.7)
    try:
        data = json.loads(response)
        return AIAnswer(**data)
    except (json.JSONDecodeError, Exception):
        return AIAnswer(
            answer_framework="为您整理的参考框架",
            script_reference=response,
            differentiation_points=[],
            references=[],
        )


@router.get("/health")
def ai_health():
    """AI服务健康检查。"""
    return {
        "status": "ok",
        "model": "gpt-4o-mini (mock fallback active)",
        "features": ["知识问答", "语音分析", "SOP优化建议", "智能标签"],
    }
