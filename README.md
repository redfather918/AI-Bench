# NIHO — 智能销售赋能平台

> B2B 销售团队的企业级 SaaS 产品，整合知识管理、语音分析、AI 问答与 SOP 优化。

[![PRD](https://img.shields.io/badge/文档-PRD-blue)](./NIHO_PRD.md)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

---

## 产品概览

NIHO 由两个核心子系统构成：

| 子系统 | 定位 | 页面 |
|--------|------|------|
| **企业内部智能知识库** | 三级权限（个人/部门/公司）知识管理 + AI 问答 | 知识库首页、知识详情、AI 问答助手 |
| **销售语音分析与 SOP 优化** | 通话录音 AI 分析 + 管理看板 + SOP 迭代 | 销售工作台、管理者看板、SOP 配置、案例库 |

---

## 技术架构

```
┌─────────────────────────────────────────┐
│  前端 (React 19 + Vite 8 + Ant Design 6) │
│  端口: 8080                              │
└──────────────┬──────────────────────────┘
               │ axios (http://localhost:8001)
┌──────────────▼──────────────────────────┐
│  后端 (FastAPI + SQLAlchemy + SQLite)     │
│  端口: 8001                              │
│  ┌──────────────────────────────────┐    │
│  │  knowledge  │ voice  │ manager   │    │
│  │  ai (RAG)   │ LLM 服务层 (OpenAI) │    │
│  └──────────────────────────────────┘    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  SQLite (nihopro/backend/data/nihopro.db)│
└──────────────────────────────────────────┘
```

---

## 快速开始

### 环境要求

- **Node.js** >= 18（推荐 22）
- **Python** >= 3.10（推荐 3.13）
- **npm** >= 9

### 1. 克隆项目

```bash
git clone https://github.com/redfather918/AI-Bench.git
cd AI-Bench/nihopro
```

### 2. 安装前端依赖

```bash
npm install
```

### 3. 安装后端依赖

```bash
cd backend

# 创建虚拟环境（推荐）
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
cd ..
```

### 4. 启动后端

```bash
cd backend
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8001
```

启动后访问 [http://localhost:8001/docs](http://localhost:8001/docs) 查看 API 文档。

### 5. 启动前端

```bash
# 在 nihopro/ 目录下
npm run dev
```

打开 [http://localhost:8080](http://localhost:8080) 查看页面。

### 6. LLM 配置（可选）

配置 OpenAI 兼容 API 以启用真实 AI 能力。创建 `nihopro/backend/.env`：

```env
OPENAI_API_KEY=sk-your-key
OPENAI_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
```

未配置时，AI 助手将使用 Mock 模式返回预设话术框架。

---

## 项目结构

```
AI-Bench/
├── NIHO_PRD.md                  # 产品需求文档
├── NIHO_产品说明书_V2.pdf         # 产品说明书（含页面截图）
│
└── nihopro/                     # 主项目
    ├── package.json             # 前端依赖
    ├── vite.config.ts           # Vite 构建配置
    │
    ├── backend/                 # Python 后端
    │   ├── main.py              # FastAPI 入口
    │   ├── database.py          # SQLAlchemy 数据库配置
    │   ├── models.py            # 7 个 ORM 模型
    │   ├── schemas.py           # Pydantic 请求/响应模型
    │   ├── seed.py              # 种子数据
    │   ├── requirements.txt     # Python 依赖清单
    │   ├── routers/             # API 路由
    │   │   ├── knowledge.py     # 知识库 CRUD + 搜索
    │   │   ├── voice.py         # 录音上传 + 分析仪表盘
    │   │   ├── manager.py       # 管理看板 + SOP + 案例
    │   │   └── ai.py            # AI 问答（RAG 检索增强）
    │   └── services/
    │       └── llm.py           # LLM 服务抽象层
    │
    └── src/                     # React 前端
        ├── App.tsx              # 路由 + 角色切换
        ├── api/client.ts        # Axios 客户端
        ├── mock/api.ts          # API 适配层（后端优先，失败降级 mock）
        ├── types/index.ts       # TypeScript 类型定义
        ├── components/Layout/   # 布局组件（侧边栏）
        └── pages/               # 7 个业务页面
            ├── KnowledgeHome.tsx    # 知识库首页
            ├── KnowledgeDetail.tsx  # 知识详情
            ├── AIAssistant.tsx      # AI 问答助手
            ├── SalesWorkbench.tsx   # 销售工作台
            ├── ManagerDashboard.tsx # 管理者看板
            ├── SOPConfig.tsx        # SOP 配置
            └── CaseLibrary.tsx      # 案例库
```

---

## API 概览

| 路由前缀 | 端点数 | 说明 |
|----------|--------|------|
| `/api/knowledge` | 7 | 知识列表/详情/搜索/标签 CRUD |
| `/api/voice` | 4 | 录音上传/分析/仪表盘/趋势 |
| `/api/manager` | 9 | 团队排名/特征挖掘/SOP/目标/案例 CRUD |
| `/api/ai` | 2 | AI 问答（RAG）/ 健康检查 |

完整文档 → [http://localhost:8001/docs](http://localhost:8001/docs)

---

## 构建生产版本

```bash
# 前端构建
npm run build          # 输出到 dist/

# 后端部署
cd backend
pip install -r requirements.txt
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```
