"""FastAPI entry point for JulyDigonto backend."""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from . import config
from .db import init_db
from .ratelimit import get_limiter
from .routes import (
    aid,
    analyze,
    chatbot,
    factcheck,
    kiosk,
    ledger,
    memorial,
    report,
    sync,
    vault,
    verify,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="JulyDigonto API",
        version="0.1.0",
        description="Evidentiary Truth, Civic Dignity, Verified Memory.",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.CORS_ALLOW_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.middleware("http")
    async def input_sanitizer(request: Request, call_next):
        # Test case #10: lightweight top-level guardrail; per-route rate limiting
        # lives inside the routes themselves.
        url = str(request.url.path)
        if any(bad in url for bad in ("/../", "/./", "//")):
            return JSONResponse(status_code=400, content={"error": "suspicious_path"})
        # Cheap spam-bot filter: reject user-agents with sql/xss signatures
        ua = (request.headers.get("user-agent") or "").lower()
        if any(sig in ua for sig in ("sqlmap", "nikto", "acunetix", "nmap")):
            return JSONResponse(status_code=403, content={"error": "blocked_ua"})
        return await call_next(request)

    app.include_router(verify.router)
    app.include_router(vault.router)
    app.include_router(aid.router)
    app.include_router(kiosk.router)
    app.include_router(ledger.router)
    app.include_router(memorial.router)
    app.include_router(analyze.router)
    app.include_router(chatbot.router)
    app.include_router(sync.router)
    app.include_router(report.router)
    app.include_router(factcheck.router)

    @app.get("/health")
    async def health() -> dict:
        return {
            "status": "ok",
            "service": "julydigonto",
            "version": "0.1.0",
            "rate_limiter": get_limiter().max_requests,
        }

    @app.get("/")
    async def root() -> dict:
        return {
            "name": "JulyDigonto",
            "docs": "/docs",
            "health": "/health",
        }

    return app


app = create_app()