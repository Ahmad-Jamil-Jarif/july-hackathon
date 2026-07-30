"""POST /api/v1/analyze — textual trust scoring."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request, status

from ..ratelimit import get_limiter
from ..schemas import AnalyzeRequest, AnalyzeResponse
from ..services.ai_engine.trust_scorer import score_from_request

router = APIRouter(prefix="/api/v1/analyze", tags=["analyze"])


def _enforce_rate_limit(request: Request) -> None:
    limiter = get_limiter()
    ip = request.client.host if request.client else "unknown"
    allowed, _ = limiter.allow(ip)
    if not allowed:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                            detail={"error": "rate_limit_exceeded", "ip": ip})


@router.post("", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest, request: Request) -> AnalyzeResponse:
    _enforce_rate_limit(request)
    return score_from_request(req)