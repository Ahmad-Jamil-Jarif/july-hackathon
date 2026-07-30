"""Public chain explorer (test case #6 — tamper-evident ledger)."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request, status

from ..ratelimit import get_limiter
from ..services.ledger.chain import aid_ledger

router = APIRouter(prefix="/api/v1/ledger", tags=["ledger"])


def _enforce_rate_limit(request: Request) -> None:
    limiter = get_limiter()
    ip = request.client.host if request.client else "unknown"
    allowed, _ = limiter.allow(ip)
    if not allowed:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                            detail={"error": "rate_limit_exceeded", "ip": ip})


@router.get("")
async def public_explorer(request: Request, limit: int = 100) -> dict:
    _enforce_rate_limit(request)
    entries = aid_ledger.list_entries()[: max(1, min(limit, 500))]
    return {"length": len(entries), "entries": entries}


@router.get("/verify")
async def verify_chain(request: Request) -> dict:
    _enforce_rate_limit(request)
    ok, last_valid = aid_ledger.verify_chain()
    return {
        "ok": ok,
        "last_valid_index": last_valid,
        "length": len(aid_ledger.list_entries()),
    }