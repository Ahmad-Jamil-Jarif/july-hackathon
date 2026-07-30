"""Application configuration loaded from environment variables.

Uses pathlib + python-dotenv. Defaults are Windows-friendly so the backend
boots cleanly out-of-the-box for the JulyDigonto hackathon demo.
"""
from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR: Path = Path(__file__).resolve().parent
load_dotenv(BASE_DIR.parent / ".env", override=False)

DATA_DIR: Path = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)
STORAGE_DIR: Path = BASE_DIR / "storage"
STORAGE_DIR.mkdir(exist_ok=True)
BLOB_DIR: Path = STORAGE_DIR / "blobs"
BLOB_DIR.mkdir(exist_ok=True)
TMP_DIR: Path = STORAGE_DIR / "tmp"
TMP_DIR.mkdir(exist_ok=True)
LEDGER_PATH: Path = STORAGE_DIR / "ledger.jsonl"

SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-change-me-in-prod")
AID_SALT: str = os.getenv("AID_SALT", "dev-aid-salt-rotate-in-prod")
RATE_LIMIT_PER_MIN: int = int(os.getenv("RATE_LIMIT_PER_MIN", "60"))
MAX_UPLOAD_MB: int = int(os.getenv("MAX_UPLOAD_MB", "80"))
IPFS_USE_PINATA: bool = os.getenv("IPFS_USE_PINATA", "false").lower() == "true"
PINATA_JWT: str = os.getenv("PINATA_JWT", "")
CORS_ALLOW_ORIGINS: list[str] = os.getenv(
    "CORS_ALLOW_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

DB_URL: str = "sqlite:///" + str(DATA_DIR / "julynexus.sqlite")
