"""SQLite database setup with SQLAlchemy."""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DB_PATH = "sqlite+aiosqlite:///./backend/data/nihopro.db"
SYNC_DB_PATH = "sqlite:///./backend/data/nihopro.db"

engine = create_engine(SYNC_DB_PATH, echo=False, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from backend.models import KnowledgeItem, VoiceRecording, SopTemplate, SopStep, SuccessGoal, CaseItem, User
    Base.metadata.create_all(bind=engine)
