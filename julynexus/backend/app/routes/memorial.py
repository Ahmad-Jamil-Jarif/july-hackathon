"""Memorial tributes — geo-pin + testimony."""
from __future__ import annotations

import json
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import MemorialEntry
from ..ratelimit import get_limiter
from ..schemas import MemorialEntryIn, MemorialEntryOut
from ..security import sanitize_text
from ..services.ipfs_vault.vault import vault

router = APIRouter(prefix="/api/v1/memorial", tags=["memorial"])


def _enforce_rate_limit(request: Request) -> None:
    limiter = get_limiter()
    ip = request.client.host if request.client else "unknown"
    allowed, _ = limiter.allow(ip)
    if not allowed:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                            detail={"error": "rate_limit_exceeded", "ip": ip})


@router.post("", response_model=MemorialEntryOut, status_code=status.HTTP_201_CREATED)
async def submit(entry: MemorialEntryIn, request: Request,
                 db: Session = Depends(get_db)) -> MemorialEntryOut:
    _enforce_rate_limit(request)
    payload = {
        "name": sanitize_text(entry.name, max_length=120),
        "district": sanitize_text(entry.district, max_length=64),
        "lat": entry.lat,
        "lng": entry.lng,
        "testimony": sanitize_text(entry.testimony, max_length=8000),
    }
    pin = vault.put_bytes(json.dumps(payload, ensure_ascii=False).encode("utf-8"))
    record = MemorialEntry(
        name=payload["name"],
        district=payload["district"],
        lat=entry.lat,
        lng=entry.lng,
        testimony=payload["testimony"],
        ipfs_cid=pin["cid"],
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return MemorialEntryOut.model_validate(record)


@router.get("", response_model=list[MemorialEntryOut])
async def list_entries(request: Request, db: Session = Depends(get_db),
                       limit: int = 200) -> list[MemorialEntryOut]:
    _enforce_rate_limit(request)
    rows = db.query(MemorialEntry).order_by(MemorialEntry.created_at.desc()).limit(min(limit, 1000)).all()
    return [MemorialEntryOut.model_validate(r) for r in rows]


@router.get("/geojson")
async def geojson(request: Request, db: Session = Depends(get_db)) -> dict[str, Any]:
    _enforce_rate_limit(request)
    rows = db.query(MemorialEntry).filter(MemorialEntry.lat != 0).limit(2000).all()
    features = [
        {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [r.lng, r.lat]},
            "properties": {
                "id": r.id,
                "name": r.name,
                "district": r.district,
                "ipfs_cid": r.ipfs_cid,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            },
        }
        for r in rows
    ]
    return {"type": "FeatureCollection", "features": features}