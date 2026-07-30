"""Kiosk offline ingest (test case #4 + #9)."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, HTTPException, Request, status
from pydantic import ValidationError

from ..models import KioskEvent
from ..ratelimit import get_limiter
from ..schemas import (
    KioskBatchIn,
    KioskBatchOut,
    KioskEventIn,
    KioskEventOut,
)
from ..db import SessionLocal

router = APIRouter(prefix="/api/v1/kiosk", tags=["kiosk"])


def _enforce_rate_limit(request: Request) -> None:
    limiter = get_limiter()
    ip = request.client.host if request.client else "unknown"
    allowed, _ = limiter.allow(ip)
    if not allowed:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                            detail={"error": "rate_limit_exceeded", "ip": ip})


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


@router.post("/event", response_model=KioskEventOut, status_code=status.HTTP_201_CREATED)
async def post_event(payload: dict, request: Request) -> KioskEventOut:
    _enforce_rate_limit(request)
    try:
        event = KioskEventIn.model_validate(payload)
    except ValidationError as exc:
        raise HTTPException(status_code=400, detail={
            "error": "malformed_kiosk_payload",
            "issues": [{"loc": list(e["loc"]), "msg": e["msg"], "type": e["type"]} for e in exc.errors()],
        })
    if event.event_type == "rfid" and not isinstance(event.payload, dict):
        raise HTTPException(status_code=400, detail={"error": "rfid_payload_must_be_object"})
    if event.event_type == "rfid" and not event.payload.get("uid"):
        raise HTTPException(status_code=400, detail={"error": "corrupted_rfid", "missing": "uid"})

    db = SessionLocal()
    try:
        record = KioskEvent(
            device_id=event.device_id,
            event_type=event.event_type,
            payload=event.payload,
            buffered_at=event.buffered_at or _utcnow(),
            synced_at=_utcnow(),
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return KioskEventOut.model_validate(record)
    finally:
        db.close()


@router.post("/sync", response_model=KioskBatchOut)
async def sync_batch(payload: dict, request: Request) -> KioskBatchOut:
    _enforce_rate_limit(request)
    try:
        batch = KioskBatchIn.model_validate(payload)
    except ValidationError as exc:
        raise HTTPException(status_code=400, detail={
            "error": "malformed_kiosk_batch",
            "issues": [{"loc": list(e["loc"]), "msg": e["msg"], "type": e["type"]} for e in exc.errors()],
        })

    accepted: list[str] = []
    rejected = 0
    db = SessionLocal()
    try:
        for ev in batch.events:
            try:
                if ev.event_type == "rfid" and not (ev.payload or {}).get("uid"):
                    rejected += 1
                    continue
                record = KioskEvent(
                    device_id=batch.device_id,
                    event_type=ev.event_type,
                    payload=ev.payload,
                    buffered_at=ev.buffered_at or _utcnow(),
                    synced_at=_utcnow(),
                )
                db.add(record)
                db.flush()
                accepted.append(record.id)
            except Exception:
                rejected += 1
        db.commit()
    finally:
        db.close()
    return KioskBatchOut(synced=len(accepted), rejected=rejected, accepted_ids=accepted)


@router.get("/events", response_model=list[KioskEventOut])
async def list_events(request: Request, limit: int = 200) -> list[KioskEventOut]:
    _enforce_rate_limit(request)
    db = SessionLocal()
    try:
        rows = db.query(KioskEvent).order_by(KioskEvent.synced_at.desc()).limit(min(limit, 1000)).all()
        return [KioskEventOut.model_validate(r) for r in rows]
    finally:
        db.close()