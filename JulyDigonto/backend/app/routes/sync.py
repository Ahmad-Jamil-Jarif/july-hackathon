"""POST /api/v1/sync — offline-first kiosk batch flush."""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Request, status
from pydantic import ValidationError

from ..db import SessionLocal
from ..models import KioskEvent
from ..ratelimit import get_limiter
from ..schemas import KioskBatchIn

router = APIRouter(prefix="/api/v1/sync", tags=["sync"])


def _enforce_rate_limit(request: Request) -> None:
    limiter = get_limiter()
    ip = request.client.host if request.client else "unknown"
    allowed, _ = limiter.allow(ip)
    if not allowed:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                            detail={"error": "rate_limit_exceeded", "ip": ip})


@router.post("")
async def flush(payload: dict, request: Request) -> dict:
    _enforce_rate_limit(request)
    try:
        batch = KioskBatchIn.model_validate(payload)
    except ValidationError as exc:
        raise HTTPException(status_code=400, detail={
            "error": "malformed_sync_payload",
            "issues": [{"loc": list(e["loc"]), "msg": e["msg"], "type": e["type"]} for e in exc.errors()],
        })

    accepted: list[str] = []
    rejected: list[dict] = []
    db = SessionLocal()
    try:
        for ev in batch.events:
            if ev.event_type == "rfid" and not (ev.payload or {}).get("uid"):
                rejected.append({"reason": "corrupted_rfid", "event_type": ev.event_type})
                continue
            record = KioskEvent(
                device_id=batch.device_id,
                event_type=ev.event_type,
                payload=ev.payload,
                buffered_at=ev.buffered_at or datetime.now(timezone.utc),
                synced_at=datetime.now(timezone.utc),
            )
            db.add(record)
            try:
                db.flush()
                accepted.append(record.id)
            except Exception as exc:
                rejected.append({"reason": f"{type(exc).__name__}", "event_type": ev.event_type})
        db.commit()
    finally:
        db.close()
    return {"synced": len(accepted), "rejected": len(rejected),
            "accepted_ids": accepted, "rejected_details": rejected}