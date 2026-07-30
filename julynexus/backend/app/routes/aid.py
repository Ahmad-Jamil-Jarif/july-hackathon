"""Anonymous aid registration + disbursement (test case #7)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import VictimReliefLedger
from ..ratelimit import get_limiter
from ..schemas import (
    AidDisburseRequest,
    AidLedgerEntry,
    AidRegisterRequest,
)
from ..security import sanitize_text
from ..services.ledger.chain import aid_ledger
from ..services.zk_identity.shield import shield

router = APIRouter(prefix="/api/v1/aid", tags=["aid"])


def _enforce_rate_limit(request: Request) -> None:
    limiter = get_limiter()
    ip = request.client.host if request.client else "unknown"
    allowed, _ = limiter.allow(ip)
    if not allowed:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                            detail={"error": "rate_limit_exceeded", "ip": ip})


@router.post("/register", status_code=status.HTTP_200_OK)
async def register(req: AidRegisterRequest, request: Request) -> dict:
    _enforce_rate_limit(request)
    national_id = sanitize_text(req.national_id, max_length=64)
    if len(national_id) < 4:
        raise HTTPException(status_code=400, detail={"error": "national_id_too_short"})
    beneficiary_hash, commitment = shield.register(national_id)
    return {
        "beneficiary_hash": beneficiary_hash,
        "commitment": commitment,
        "redacted_id": beneficiary_hash[:6] + "…" + beneficiary_hash[-4:],
    }


@router.post("/disburse", status_code=status.HTTP_200_OK)
async def disburse(req: AidDisburseRequest, request: Request,
                   db: Session = Depends(get_db)) -> dict:
    _enforce_rate_limit(request)
    if not shield._store.get(req.beneficiary_hash):
        raise HTTPException(status_code=404,
                            detail={"error": "unknown_beneficiary", "hash": req.beneficiary_hash[:8] + "…"})
    entry_id, tx_hash = aid_ledger.add_entry(
        beneficiary_hash=req.beneficiary_hash,
        amount_bdt=req.amount_bdt,
        status="disbursed",
    )
    disburser = sanitize_text(req.disburser_id, max_length=64)
    record = VictimReliefLedger(
        id=entry_id,
        beneficiary_hash=req.beneficiary_hash,
        amount_bdt=req.amount_bdt,
        disbursement_status="disbursed",
        transaction_hash=tx_hash,
    )
    db.add(record)
    db.commit()
    return {
        "id": entry_id,
        "transaction_hash": tx_hash,
        "disburser_id": disburser,
        "status": "disbursed",
    }


@router.get("/ledger", response_model=list[AidLedgerEntry])
async def get_ledger(request: Request, db: Session = Depends(get_db)) -> list[AidLedgerEntry]:
    _enforce_rate_limit(request)
    rows = db.query(VictimReliefLedger).order_by(VictimReliefLedger.updated_at.desc()).limit(500).all()
    return [AidLedgerEntry.model_validate(r) for r in rows]


@router.get("/{beneficiary_hash}")
async def get_for_beneficiary(beneficiary_hash: str, request: Request,
                              db: Session = Depends(get_db)) -> dict:
    _enforce_rate_limit(request)
    if len(beneficiary_hash) != 64:
        raise HTTPException(status_code=400, detail={"error": "invalid_hash_length"})
    rows = db.query(VictimReliefLedger).filter(
        VictimReliefLedger.beneficiary_hash == beneficiary_hash
    ).all()
    in_mem = aid_ledger.get_for_beneficiary(beneficiary_hash)
    return {
        "beneficiary_hash": beneficiary_hash,
        "db_entries": [AidLedgerEntry.model_validate(r).model_dump() for r in rows],
        "chain_entries": in_mem,
        "redacted_view": shield.disburser_view(beneficiary_hash),
    }