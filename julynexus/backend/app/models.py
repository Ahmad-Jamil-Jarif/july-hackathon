"""SQLAlchemy 2.0 ORM models for JulyNexus.

Tables (one per public surface area of the platform):
- verified_media       (pillar 1: AI forensics + provenance)
- victim_relief_ledger (pillar 3: aid disbursement)
- kiosk_events         (pillar 3: offline-first IoT ingest)
- memorial_entries     (pillar 2: tributes + geo points)
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Float,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _uuid_str() -> str:
    return str(uuid.uuid4())


class VerifiedMedia(Base):
    __tablename__ = "verified_media"
    __table_args__ = (UniqueConstraint("ipfs_cid", name="uq_verified_media_cid"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid_str)
    title: Mapped[str] = mapped_column(Text, default="")
    ipfs_cid: Mapped[str] = mapped_column(String(128), index=True)
    deepfake_score: Mapped[float] = mapped_column(Float, default=0.0)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    exif_data: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utc_now)


class VictimReliefLedger(Base):
    __tablename__ = "victim_relief_ledger"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid_str)
    beneficiary_hash: Mapped[str] = mapped_column(String(128), index=True)
    amount_bdt: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    disbursement_status: Mapped[str] = mapped_column(String(32), default="pending")
    transaction_hash: Mapped[str] = mapped_column(String(128), index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utc_now)


class KioskEvent(Base):
    __tablename__ = "kiosk_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid_str)
    device_id: Mapped[str] = mapped_column(String(64), index=True)
    event_type: Mapped[str] = mapped_column(String(32))
    payload: Mapped[dict] = mapped_column(JSON, default=dict)
    buffered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utc_now)
    synced_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utc_now)


class MemorialEntry(Base):
    __tablename__ = "memorial_entries"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid_str)
    name: Mapped[str] = mapped_column(String(120), default="")
    district: Mapped[str] = mapped_column(String(64), default="")
    lat: Mapped[float] = mapped_column(Float, default=0.0)
    lng: Mapped[float] = mapped_column(Float, default=0.0)
    testimony: Mapped[str] = mapped_column(Text, default="")
    ipfs_cid: Mapped[str] = mapped_column(String(128), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utc_now)
