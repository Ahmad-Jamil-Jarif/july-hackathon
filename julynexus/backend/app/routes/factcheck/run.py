"""Fact-checking API routes."""
from __future__ import annotations

import asyncio
from typing import Any, Dict, List

from fastapi import APIRouter, BackgroundTasks, HTTPException, Request, status
from fastapi.responses import JSONResponse

from .. import config
from ..ratelimit import get_limiter
from .factcheck.pipeline import stream_pipeline

router = APIRouter(prefix="/api/v1/factcheck", tags=["factcheck"])


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


@router.post("", status_code=status.HTTP_200_OK)
async def run_factcheck(
    request: Request,
    payload: Dict[str, Any],
) -> JSONResponse:
    """
    Run the fact-check pipeline on a video URL.
    Expected payload: { "url": str, "language": str | None, ... }
    Returns a list of events from the pipeline.
    """
    _enforce_rate_limit(request)
    url = payload.get("url")
    if not url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "missing_url"},
        )
    # Extract optional parameters with defaults
    language = payload.get("language")
    model_size = payload.get("model_size", "large-v3")
    device = payload.get("device", "auto")
    initial_prompt_override = payload.get("initial_prompt_override")
    skip_initial_prompt = payload.get("skip_initial_prompt", False)
    skip_transcript_edit = payload.get("skip_transcript_edit", False)
    # Note: sources_path is hardcoded to the default; could be made configurable
    concurrency = payload.get("concurrency", 5)
    fallback_to_open_web = payload.get("fallback_to_open_web", True)
    llm_provider = payload.get("llm_provider", "claude")

    events: List[Dict[str, Any]] = []

    async def collect_events():
        async for event in stream_pipeline(
            url,
            language=language,
            model_size=model_size,
            device=device,
            initial_prompt_override=initial_prompt_override,
            skip_initial_prompt=skip_initial_prompt,
            skip_transcript_edit=skip_transcript_edit,
            concurrency=concurrency,
            fallback_to_open_web=fallback_to_open_web,
            llm_provider=llm_provider,
        ):
            events.append(event)

    try:
        await collect_events()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": f"factcheck_failed: {e}"},
        )

    return JSONResponse(content={"events": events})