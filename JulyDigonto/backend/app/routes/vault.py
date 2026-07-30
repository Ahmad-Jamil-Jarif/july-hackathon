"""GET /api/v1/vault — content-addressed blob retrieval."""
from __future__ import annotations

import mimetypes
from pathlib import Path

from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import Response

from ..ratelimit import get_limiter
from ..services.ipfs_vault.vault import vault

router = APIRouter(prefix="/api/v1/vault", tags=["vault"])


def _enforce_rate_limit(request: Request) -> None:
    limiter = get_limiter()
    ip = request.client.host if request.client else "unknown"
    allowed, _ = limiter.allow(ip)
    if not allowed:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                            detail={"error": "rate_limit_exceeded", "ip": ip})


@router.get("")
async def list_cids(request: Request) -> dict:
    _enforce_rate_limit(request)
    return {"cids": vault.list_cids()}


@router.get("/{cid}/meta")
async def cid_meta(cid: str, request: Request) -> dict:
    _enforce_rate_limit(request)
    for entry in vault.list_cids():
        if entry.get("cid") == cid:
            return {"verified": vault.verify(cid), **entry}
    raise HTTPException(status_code=404, detail={"error": "cid_not_found", "cid": cid})


@router.get("/{cid}")
async def get_blob(cid: str, request: Request) -> Response:
    _enforce_rate_limit(request)
    try:
        data = vault.get_bytes(cid)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail={"error": "cid_not_found", "cid": cid})
    media_type, _ = mimetypes.guess_type(f"{cid}.bin")
    return Response(content=data, media_type=media_type or "application/octet-stream")


@router.post("/pin")
async def pin_remote(payload: dict, request: Request) -> dict:
    _enforce_rate_limit(request)
    cid = payload.get("cid", "")
    if not cid:
        raise HTTPException(status_code=400, detail={"error": "cid_required"})
    ok = vault.pin_to_remote(cid)
    return {"cid": cid, "pinned_remote": ok}