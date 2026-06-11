"""NIHO Backend - FastAPI Application Entry Point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import init_db
from backend.routers import knowledge, voice, manager, ai

app = FastAPI(
    title="NIHO API",
    description="NIHO销售赋能平台后端接口 - 知识库 + 语音分析 + AI助手",
    version="1.0.0",
)

# CORS - allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080", "http://localhost:4173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(knowledge.router)
app.include_router(voice.router)
app.include_router(manager.router)
app.include_router(ai.router)


@app.on_event("startup")
def on_startup():
    """Initialize database and seed data on startup."""
    from backend.seed import seed_all
    init_db()
    seed_all()


@app.get("/api/health")
def root():
    return {"status": "ok", "version": "1.0.0", "services": ["knowledge", "voice", "manager", "ai"]}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
