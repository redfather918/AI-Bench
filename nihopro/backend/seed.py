"""Seed demo data into SQLite on first startup."""

import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine, Base
from backend.models import User, KnowledgeItem, VoiceRecording, SopTemplate, SopStep, SuccessGoal, CaseItem


def seed_all():
    """Seed all tables with demo data if empty."""
    from backend.models import Base
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            return  # already seeded

        # ── Users ──
        users = [
            User(name="李明", department="销售部", role="sales"),
            User(name="赵敏", department="销售部", role="sales"),
            User(name="孙丽", department="销售部", role="sales"),
            User(name="周杰", department="销售部", role="sales"),
            User(name="王经理", department="销售部", role="manager"),
        ]
        db.add_all(users)
        db.flush()

        # ── Knowledge Items ──
        now = datetime.utcnow()
        knowledge = [
            KnowledgeItem(title="2025-Q4产品发布会纪要", file_type="pdf", file_size="2.3 MB",
                          visibility="department", department="销售部", uploader_name="赵敏",
                          tags="会议纪要,产品发布", content="Q4产品发布会纪要...", view_count=45,
                          created_at=now - timedelta(hours=2)),
            KnowledgeItem(title="客户投诉处理SOP V3", file_type="docx", file_size="1.1 MB",
                          visibility="company", department="运营部", uploader_name="孙丽",
                          tags="SOP,客户服务", content="客户投诉标准处理流程...", view_count=67,
                          created_at=now - timedelta(hours=24)),
            KnowledgeItem(title="竞品分析报告-华为vs苹果", file_type="pptx", file_size="5.8 MB",
                          visibility="department", department="销售部", uploader_name="李明",
                          tags="竞品对比,市场分析", content="竞品对比分析...", view_count=89,
                          created_at=now - timedelta(hours=26)),
            KnowledgeItem(title="销售培训录音_20251215", file_type="mp3", file_size="15.2 MB",
                          visibility="department", department="销售部", uploader_name="张三",
                          tags="销售话术,客户异议处理,新人培训", content="培训录音转写...", view_count=34,
                          duration="00:32:15", created_at=now - timedelta(days=2)),
            KnowledgeItem(title="报价审批流程", file_type="pdf", file_size="0.5 MB",
                          visibility="company", department="财务部", uploader_name="管理员",
                          tags="价格政策,审批流程", content="报价审批标准流程...", view_count=23,
                          created_at=now - timedelta(days=3)),
            KnowledgeItem(title="金牌销售异议处理话术合集", file_type="docx", file_size="3.2 MB",
                          visibility="department", department="销售部", uploader_name="赵敏",
                          tags="销售话术,异议处理", content="异议处理话术...", view_count=89,
                          created_at=now - timedelta(days=1)),
            KnowledgeItem(title="2026春节活动政策", file_type="pdf", file_size="1.8 MB",
                          visibility="department", department="市场部", uploader_name="市场部",
                          tags="活动政策,春节", content="春节活动政策...", view_count=67,
                          created_at=now - timedelta(days=2)),
            KnowledgeItem(title="新员工入职培训手册", file_type="pdf", file_size="4.5 MB",
                          visibility="company", department="HR", uploader_name="HR",
                          tags="培训材料,入职", content="入职培训手册...", view_count=45,
                          created_at=now - timedelta(days=5)),
        ]
        db.add_all(knowledge)
        db.flush()

        # ── Voice Recordings ──
        recordings = []
        for i, (cust, dur, pos, neu, neg, score) in enumerate([
            ("王总", "15:23", 70, 25, 5, 75),
            ("李经理", "22:45", 60, 30, 10, 60),
            ("张总", "08:12", 85, 10, 5, 90),
            ("刘总", "18:30", 45, 35, 20, 40),
        ]):
            r = VoiceRecording(
                sales_id=1, sales_name="李明",
                customer_name=cust, customer_company="科技公司",
                customer_age=30 + i * 5,
                duration_display=dur,
                transcription=f"销售：您好{cust}... 客户：产品不错，价格方面... 销售：理解您的顾虑...",
                emotion_positive=pos, emotion_neutral=neu, emotion_negative=neg,
                sop_completion=json.dumps([
                    {"step_name": "开场破冰", "status": "pass", "feedback": "完成"},
                    {"step_name": "需求挖掘", "status": "pass", "feedback": "完成"},
                    {"step_name": "产品价值介绍", "status": "pass", "feedback": "完成"},
                    {"step_name": "异议处理", "status": "warn" if score < 80 else "pass", "feedback": "需加强"},
                    {"step_name": "促成与结尾", "status": "fail" if score < 70 else "pass", "feedback": "未明确下一步"},
                ], ensure_ascii=False),
                sop_score=score,
                skill_need_discovery=75 + i * 5,
                skill_sop_completion=70 + i * 3,
                skill_objection_handling=65 + i * 4,
                skill_closing=55 + i * 6,
                improvement_points=json.dumps(["客户询价处理不够充分"], ensure_ascii=False) if score < 80 else "[]",
                suggested_learning=json.dumps([{"title": "价格异议处理五步法"}], ensure_ascii=False) if score < 80 else "[]",
                created_at=now - timedelta(days=i),
            )
            recordings.append(r)
        db.add_all(recordings)
        db.flush()

        # ── SOP Template ──
        tpl = SopTemplate(name="销售标准流程", is_active=True)
        db.add(tpl)
        db.flush()

        steps = [
            SopStep(template_id=tpl.id, order=1, name="开场破冰（30秒内）",
                    description="自我介绍 + 感谢接听 + 说明来意",
                    required_actions=json.dumps(["自我介绍", "感谢接听", "说明来意"], ensure_ascii=False),
                    check_points=json.dumps(["是否在30秒内完成开场"], ensure_ascii=False), is_key_step=False),
            SopStep(template_id=tpl.id, order=2, name="需求挖掘",
                    description="提出至少2个开放性问题",
                    required_actions=json.dumps(["提出2个开放性问题", "了解客户使用场景"], ensure_ascii=False),
                    check_points=json.dumps(["是否问出客户痛点", "是否了解使用场景"], ensure_ascii=False), is_key_step=True),
            SopStep(template_id=tpl.id, order=3, name="产品价值介绍",
                    description="结合客户需求进行FAB介绍",
                    required_actions=json.dumps(["特征介绍", "优势对比", "利益展示"], ensure_ascii=False),
                    check_points=json.dumps(["是否结合客户需求"], ensure_ascii=False), is_key_step=False),
            SopStep(template_id=tpl.id, order=4, name="异议处理",
                    description="当客户提出价格、竞品等问题时，必须有回应",
                    required_actions=json.dumps(["识别异议", "共情回应", "提供证据"], ensure_ascii=False),
                    check_points=json.dumps(["是否有效回应客户疑问"], ensure_ascii=False), is_key_step=False),
            SopStep(template_id=tpl.id, order=5, name="促成与结尾",
                    description="明确下一步行动 + 约定下次联系时间",
                    required_actions=json.dumps(["明确下一步行动", "约定联系时间"], ensure_ascii=False),
                    check_points=json.dumps(["是否有明确的下一步"], ensure_ascii=False), is_key_step=False),
        ]
        db.add_all(steps)

        # ── Success Goals ──
        goals = [
            SuccessGoal(name="通话后7天内客户完成首单支付", goal_type="business_result",
                        rule_description="关联CRM中【订单状态】=【已支付】且【支付时间】≤ 通话后7天",
                        target_team="所有销售团队", is_active=True),
            SuccessGoal(name="通话中客户明确表达购买意向", goal_type="single_action",
                        rule_description="情绪>=80%且出现'定下来''成交'等关键词", is_active=False),
            SuccessGoal(name="通话结束后客户主动添加销售微信", goal_type="single_action",
                        rule_description="通话后24小时内客户扫码或主动添加", is_active=False),
            SuccessGoal(name="通话结束后客户索要报价单", goal_type="single_action",
                        rule_description="通话中提到'发个报价''给个价格'即视为成功", is_active=False),
        ]
        db.add_all(goals)

        # ── Case Items ──
        cases = [
            CaseItem(title="如何优雅处理价格异议", scene="客户说「太贵了」",
                     sales_name="赵敏", deal_result="7天内签约",
                     dialog_excerpt="王总，您觉得贵是因为...我们来看一下长期成本...",
                     dialog_timestamp="00:05:23",
                     success_points=json.dumps(["先共情，不直接反驳", "将价格拆解到每天成本", "提供对比数据"], ensure_ascii=False),
                     category="异议处理", learning_count=234),
            CaseItem(title="挖掘客户的隐性需求", scene="客户说「我再看看」",
                     sales_name="孙丽", deal_result="签约",
                     dialog_excerpt="您说再看看，是担心...其实我注意到您提到...",
                     dialog_timestamp="00:12:45",
                     success_points=json.dumps(["追问具体顾虑点", "关联客户之前提到的痛点", "提供针对性方案"], ensure_ascii=False),
                     category="需求挖掘", learning_count=189),
            CaseItem(title="开场3秒抓住注意力", scene="客户接听冷电话",
                     sales_name="李明", deal_result="预约下次通话",
                     dialog_excerpt="王总您好，我知道您很忙，就30秒——我们帮XX公司省了30%的成本...",
                     dialog_timestamp="00:00:03",
                     success_points=json.dumps(["尊重客户时间", "一句话说出价值", "社会证明引关注"], ensure_ascii=False),
                     category="开场破冰", learning_count=156),
            CaseItem(title="竞品对比的完美回答", scene="客户提起竞品A",
                     sales_name="赵敏", deal_result="7天内签约",
                     dialog_excerpt="竞品A我知道，他们强在XX，但我们的核心优势是...",
                     dialog_timestamp="00:08:30",
                     success_points=json.dumps(["不贬低竞品", "承认竞品优势", "突出自身差异化"], ensure_ascii=False),
                     category="竞品对比", learning_count=128),
        ]
        db.add_all(cases)

        db.commit()
        print(f"[Seed] Demo data created: {len(users)} users, {len(knowledge)} knowledge items, {len(recordings)} recordings, {len(cases)} cases")
    finally:
        db.close()


if __name__ == "__main__":
    seed_all()
