"""POST /api/v1/chatbot — evidence-tagged Q&A.

Uses the canned constitution corpus + trust_scorer. Includes an SSE
streaming variant for parity with sohojatra.
"""
from __future__ import annotations

import asyncio
import json
import re
from typing import AsyncIterator

from fastapi import APIRouter, Request, status
from fastapi.responses import StreamingResponse

from ..ratelimit import get_limiter
from ..services.ai_engine.trust_scorer import (
    EVIDENCE_CORPUS,
    get_claim_verdict,
    split_claims,
)

router = APIRouter(prefix="/api/v1/chatbot", tags=["chatbot"])


def _enforce_rate_limit(request: Request) -> None:
    from fastapi import HTTPException

    limiter = get_limiter()
    ip = request.client.host if request.client else "unknown"
    allowed, _ = limiter.allow(ip)
    if not allowed:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                            detail={"error": "rate_limit_exceeded", "ip": ip})


def _answer(question: str) -> dict:
    q = (question or "").strip()
    if not q:
        return {"answer": "Please ask a question about the July Uprising.",
                "evidence": [], "confidence": 0.0}
    lowered = q.lower()
    matched: list[dict] = []
    for topic, evidence in EVIDENCE_CORPUS.items():
        if topic.replace("_", " ") in lowered or any(w in lowered for w in topic.split("_")):
            for line in evidence:
                matched.append({"topic": topic, "text": line})
    if not matched:
        # fallback to claim verdict
        verdict, conf, rationale = get_claim_verdict(q)
        return {
            "answer": f"Not enough evidence in the canned corpus. Verdict: {verdict}.",
            "evidence": [],
            "confidence": conf,
            "verdict": verdict,
            "rationale": rationale,
        }
    answer = " ".join(m["text"] for m in matched[:3])
    return {"answer": answer, "evidence": matched, "confidence": 0.82}


@router.post("")
async def chat(payload: dict, request: Request) -> dict:
    _enforce_rate_limit(request)
    question = (payload.get("question") or "").strip()
    return _answer(question)


@router.post("/stream")
async def chat_stream(payload: dict, request: Request) -> StreamingResponse:
    _enforce_rate_limit(request)
    question = (payload.get("question") or "").strip()

    async def event_source() -> AsyncIterator[bytes]:
        result = _answer(question)
        answer = result["answer"]
        # Word-by-word streaming for a nice UX
        words = re.split(r"(\s+)", answer)
        for w in words:
            chunk = {"type": "delta", "text": w}
            yield f"data: {json.dumps(chunk, ensure_ascii=False)}\n\n".encode("utf-8")
            await asyncio.sleep(0.02)
        yield f"data: {json.dumps({'type': 'done', 'evidence': result.get('evidence', [])}, ensure_ascii=False)}\n\n".encode("utf-8")

    return StreamingResponse(event_source(), media_type="text/event-stream")