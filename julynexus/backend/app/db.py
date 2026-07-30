"""
SQLAlchemy database setup for JulyDigonto.
Uses SQLite for zero-config local development; easily swappable to Postgres.
All queries use the ORM (parameterized) to prevent SQL injection (test case #5).
"""
from __future__ import annotations

from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)
DB_PATH = DATA_DIR / "julynexus.sqlite"
DATABASE_URL = "sqlite:///" + str(DB_PATH)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a session and ensures cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create all tables. Idempotent."""
    # Import models module so all mappers register before create_all.
    from . import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
