"""LLM service layer - unified interface for AI capabilities.

Supports OpenAI-compatible APIs. Falls back to smart mock data when no API key is configured.
"""

import os
import json
import re
from typing import Optional
from openai import AsyncOpenAI

# Read API config from environment
API_KEY = os.getenv("OPENAI_API_KEY", "")
API_BASE = os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1")
MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")

_client: Optional[AsyncOpenAI] = None


def get_client() -> Optional[AsyncOpenAI]:
    """Get or create OpenAI client. Returns None if no API key configured."""
    global _client
    if API_KEY and not _client:
        _client = AsyncOpenAI(api_key=API_KEY, base_url=API_BASE)
    return _client


async def chat_completion(system_prompt: str, user_message: str, temperature: float = 0.7) -> str:
    """Generic chat completion. Falls back to mock if no client."""
    client = get_client()
    if client:
        try:
            resp = await client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                temperature=temperature,
                max_tokens=2048,
            )
            return resp.choices[0].message.content or ""
        except Exception as e:
            print(f"[LLM] API error: {e}, falling back to mock")
    return _mock_chat(system_prompt, user_message)


# ═══════════════════════════════════════════════
#  Mock fallback logic (used when no API key)
# ═══════════════════════════════════════════════

def _mock_chat(system_prompt: str, user_message: str) -> str:
    """Smart mock that extracts context keywords and returns plausible responses."""
    msg_lower = user_message.lower()

    if "区别" in user_message or "对比" in user_message or "竞品" in user_message:
        return json.dumps({
            "answer_framework": "1. 先认同客户的比较行为\\n2. 从功能、性价比、售后服务三维度对比\\n3. 自然过渡到自身产品优势",
            "script_reference": "王总，您提到竞品A我很了解。我们最大的区别在于技术架构和私有化部署...我们的私有化部署成本比竞品A低约30%，售后服务响应时间承诺2小时。",
            "differentiation_points": [
                "支持实时语音分析，竞品A需要手动上传",
                "私有化部署成本低30%",
                "售后服务响应2小时（行业平均24小时）"
            ],
            "references": [
                {"title": "竞品分析报告-2025Q4.pdf", "page": "第8页"},
                {"title": "产品销售FAQ_V2.docx", "section": "异议处理章节"}
            ]
        }, ensure_ascii=False)
    elif "话术" in user_message or "怎么回答" in user_message or "异议" in user_message:
        return json.dumps({
            "answer_framework": "1. 共情并确认客户的顾虑\\n2. 用FAB方法重新构建价值\\n3. 提供社会证明（案例/数据）",
            "script_reference": "我完全理解您的顾虑。其实和我们合作的XX公司最初也有同样的担忧。让我分享一下他们后来是怎么看这个问题的...",
            "differentiation_points": [
                "先用共情拉近距离，不直接反驳",
                "引入第三方成功案例作为佐证",
                "将价格拆解为每日成本，降低感知"
            ],
            "references": [
                {"title": "异议处理话术合集.docx", "section": "价格异议"},
                {"title": "金牌案例库", "section": "案例1：如何优雅处理价格异议"}
            ]
        }, ensure_ascii=False)
    elif "价格" in user_message or "贵" in user_message:
        return json.dumps({
            "answer_framework": "1. 认同客户感受（先共情）\\n2. 拆分价格到每日/每次成本\\n3. 强调长期价值和ROI",
            "script_reference": "我理解价格是重要考量。让我帮您算一笔账——按3年使用周期，每天的成本其实只有XX元，但您能获得...",
            "differentiation_points": [
                "价格拆解为日成本，降低客户感知",
                "对比竞品总拥有成本（TCO）",
                "强调售后和升级的价值"
            ],
            "references": [
                {"title": "价格异议处理五步法.pdf", "section": "第二步"},
                {"title": "产品ROI计算器.xlsx", "section": "Sheet1"}
            ]
        }, ensure_ascii=False)
    else:
        return json.dumps({
            "answer_framework": "基于知识库检索结果，为您整理以下要点:",
            "script_reference": f"根据您提到的「{user_message[:30]}...」，建议从以下角度切入...",
            "differentiation_points": [
                "从客户需求出发，个性化推荐",
                "引用知识库中的最新数据",
                "提供下一步行动的明确建议"
            ],
            "references": [
                {"title": "销售标准话术手册.docx", "section": "通用场景"}
            ]
        }, ensure_ascii=False)


async def analyze_voice(transcription: str) -> dict:
    """Analyze voice transcription: emotion, SOP compliance, skills."""
    client = get_client()
    if client:
        try:
            resp = await client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": "你是销售通话分析专家。分析以下通话内容，输出JSON格式的情绪分析、SOP完成度和能力评分。只输出JSON，不要其他文字。"},
                    {"role": "user", "content": f"分析这段销售通话:\n{transcription}"},
                ],
                temperature=0.3,
                max_tokens=2048,
                response_format={"type": "json_object"},
            )
            return json.loads(resp.choices[0].message.content or "{}")
        except Exception as e:
            print(f"[LLM] Voice analysis error: {e}, falling back to mock")

    # Mock voice analysis
    return {
        "emotion_positive": 70.0,
        "emotion_neutral": 25.0,
        "emotion_negative": 5.0,
        "sop_completion": [
            {"step_name": "开场破冰", "status": "pass", "feedback": "30秒内完成自我介绍和来意说明"},
            {"step_name": "需求挖掘", "status": "pass", "feedback": "提出了2个开放性问题，成功挖掘客户痛点"},
            {"step_name": "产品价值介绍", "status": "pass", "feedback": "结合客户需求做了FAB介绍"},
            {"step_name": "异议处理", "status": "warn", "feedback": "客户提出价格异议时未充分展开，建议补充ROI计算"},
            {"step_name": "促成与结尾", "status": "fail", "feedback": "未明确下一步行动或约定下次联系时间"},
        ],
        "sop_score": 75.0,
        "skills": {
            "need_discovery": 85,
            "sop_completion": 75,
            "objection_handling": 70,
            "closing": 55,
        },
        "improvement_points": [
            "客户2次询价，未有效处理价格异议",
            "通话结尾未明确下一步行动",
        ],
        "suggested_learning": [
            {"title": "价格异议处理五步法", "type": "文档"},
            {"title": "促成话术模板V3", "type": "话术集"},
        ],
    }


async def suggest_sop_improvements(features: list) -> dict:
    """Suggest SOP improvements based on high-conversion feature analysis."""
    client = get_client()
    if client:
        try:
            resp = await client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": "你是销售流程优化专家。根据高转化特征数据，建议SOP优化方案。输出JSON。"},
                    {"role": "user", "content": f"高转化特征:\n{json.dumps(features, ensure_ascii=False)}"},
                ],
                temperature=0.5,
                max_tokens=1024,
                response_format={"type": "json_object"},
            )
            return json.loads(resp.choices[0].message.content or "{}")
        except Exception as e:
            print(f"[LLM] SOP suggestion error: {e}, falling back to mock")

    return {
        "suggestions": [
            "建议在SOP「需求挖掘」步骤中增加「30秒内明确客户需求」的强制性检查",
            "建议新增话术模板：「客户提价后立刻追问使用场景」",
            "建议强化「促成与结尾」步骤中「明确下一步行动」的要求",
        ],
        "new_scripts": [
            {
                "title": "针对价格敏感型客户的标准沟通流程V2",
                "steps": ["开场共情", "成本拆分", "ROI对比", "案例佐证", "促成"],
            }
        ],
    }


async def generate_knowledge_tags(content: str) -> list:
    """Auto-generate tags for knowledge content."""
    tags = []
    tag_keywords = {
        "产品参数": ["参数", "规格", "配置", "型号", "性能", "CPU", "内存"],
        "销售话术": ["话术", "回答", "异议", "客户说", "怎么说", "应对"],
        "竞品对比": ["竞品", "对比", "华为", "苹果", "vs", "竞对"],
        "会议纪要": ["会议", "纪要", "讨论", "周会", "月会", "纪要"],
        "培训材料": ["培训", "入职", "新人", "学习", "手册", "指南"],
        "价格政策": ["价格", "报价", "折扣", "优惠", "政策", "审批"],
        "客户案例": ["案例", "客户", "签约", "成功", "成交"],
    }
    content_lower = content.lower()
    for tag, keywords in tag_keywords.items():
        if any(kw.lower() in content_lower for kw in keywords):
            tags.append(tag)
    return tags[:5]


async def auto_tag_recommend(content: str, existing_tags: str = "") -> list:
    """Recommend tags based on content analysis."""
    client = get_client()
    if client:
        try:
            resp = await client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": "你是内容标签专家。根据文档内容推荐3-5个标签，输出JSON数组。"},
                    {"role": "user", "content": f"文档内容:\n{content[:2000]}\n已有标签: {existing_tags}"},
                ],
                temperature=0.3,
                max_tokens=256,
                response_format={"type": "json_object"},
            )
            result = json.loads(resp.choices[0].message.content or "{}")
            return result.get("tags", [])
        except Exception as e:
            print(f"[LLM] Tag recommendation error: {e}")
    return await generate_knowledge_tags(content)
