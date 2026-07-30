"""Pydantic v2 request/response models for the public API."""
from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class _Base(BaseModel):
    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)


# ----- verify -----


class AnalyzeRequest(_Base):
    inputType: Literal["text", "image", "video", "audio"] = "text"
    text: str = Field(default="", max_length=10000)
    mediaType: str = Field(default="", max_length=64)


class ClaimVerdict(_Base):
    claim: str
    verdict: Literal["supported", "contradicted", "not_enough_evidence"]
    confidence: float = Field(ge=0.0, le=1.0)
    rationale: str = ""


class AnalyzeResponse(_Base):
    deepfake_score: float = Field(ge=0.0, le=1.0, default=0.0)
    bias_score: float = Field(ge=0.0, le=1.0, default=0.0)
    scam_probability: float = Field(ge=0.0, le=1.0, default=0.0)
    trust_score: float = Field(ge=0.0, le=100.0, default=50.0)
    overall_risk: Literal["low", "medium", "high"] = "low"
    claims: list[ClaimVerdict] = Field(default_factory=list)


class VerifyRequest(_Base):
    title: str = Field(default="", max_length=256)


class VaultPinResponse(_Base):
    cid: str
    sha256: str
    bytes: int
    ts: datetime
    pinned_remote: bool = False


# ----- aid -----


class AidRegisterRequest(_Base):
    national_id: str = Field(min_length=4, max_length=64)


class AidDisburseRequest(_Base):
    beneficiary_hash: str = Field(min_length=64, max_length=64)
    amount_bdt: float = Field(gt=0.0, le=10_000_000.0)
    disburser_id: str = Field(min_length=1, max_length=64)


class AidLedgerEntry(_Base):
    id: str
    beneficiary_hash: str
    amount_bdt: float
    disbursement_status: str
    transaction_hash: str
    updated_at: datetime


# ----- kiosk -----


class KioskEventIn(_Base):
    device_id: str = Field(min_length=1, max_length=64)
    event_type: Literal["tribute", "report", "panic", "rfid", "heartbeat"]
    payload: dict = Field(default_factory=dict)
    buffered_at: datetime | None = None


class KioskEventOut(_Base):
    id: str
    device_id: str
    event_type: str
    payload: dict
    buffered_at: datetime
    synced_at: datetime


class KioskBatchIn(_Base):
    device_id: str = Field(min_length=1, max_length=64)
    events: list[KioskEventIn] = Field(default_factory=list)


class KioskBatchOut(_Base):
    synced: int
    rejected: int
    accepted_ids: list[str] = Field(default_factory=list)


# ----- memorial -----


class MemorialEntryIn(_Base):
    name: str = Field(min_length=1, max_length=120)
    district: str = Field(min_length=1, max_length=64)
    lat: float = Field(ge=-90.0, le=90.0)
    lng: float = Field(ge=-180.0, le=180.0)
    testimony: str = Field(min_length=1, max_length=8000)


class MemorialEntryOut(_Base):
    id: str
    name: str
    district: str
    lat: float
    lng: float
    testimony: str
    ipfs_cid: str
    created_at: datetime