"""SohoJatra integration endpoints."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import JSONResponse

from .. import config
from ..ratelimit import get_limiter

router = APIRouter(prefix="/api/v1/sohojatra", tags=["sohojatra"])


def _enforce_rate_limit(request: Request) -> None:
    limiter = get_limiter()
    ip = request.client.host if request.client else "unknown"
    xff = request.headers.get("x-forwarded-for")
    if xff:
        ip = xff.split(",")[0].strip() or ip
    allowed, count = limiter.allow(ip)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"error": "rate_limit_exceeded", "ip": ip, "current_count": count},
        )


@router.get("", status_code=status.HTTP_200_OK)
async def sohojatra_info(
    request: Request,
) -> JSONResponse:
    _enforce_rate_limit(request)
    return JSONResponse(
        content={
            "message": "SohoJatra integration endpoint. This is a placeholder for the SohoJatra civic engagement platform.",
            "status": "placeholder",
        }
    )