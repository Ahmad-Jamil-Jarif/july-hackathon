"""POST /api/v1/verify — image + video forensic analysis."""
from __future__ import annotations

import shutil
import tempfile
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status

from .. import config
from ..db import get_db
from ..models import VerifiedMedia
from ..ratelimit import get_limiter
from ..services.ai_engine.forensics import (
    analyze_deepfake_score,
    analyze_video_frames,
    detect_duplicate,
    extract_exif,
    perceptual_hash_hex,
    sha256_file,
)
from ..services.ipfs_vault.vault import vault
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/v1/verify", tags=["verify"])


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


def _save_upload(upload: UploadFile, suffix: str) -> Path:
    config.TMP_DIR.mkdir(parents=True, exist_ok=True)
    fd, tmp_name = tempfile.mkstemp(suffix=suffix, dir=str(config.TMP_DIR))
    tmp_path = Path(tmp_name)
    with open(fd, "wb") as out:
        shutil.copyfileobj(upload.file, out)
    upload.file.close()
    return tmp_path


@router.post("", status_code=status.HTTP_200_OK)
async def verify_image(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> dict:
    _enforce_rate_limit(request)
    suffix = Path(file.filename or "upload").suffix or ".bin"
    if suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".gif"}:
        raise HTTPException(status_code=400, detail={"error": "unsupported_image_type", "suffix": suffix})
    tmp = _save_upload(file, suffix)
    try:
        exif = extract_exif(tmp)
        phash = perceptual_hash_hex(tmp)
        deepfake = analyze_deepfake_score(tmp)
        dup, original_cid = detect_duplicate(tmp, db)
        exif["phash"] = phash
        exif["sha256"] = sha256_file(tmp)
        if dup:
            pinned = vault
            blob_bytes = tmp.read_bytes()
            pin = pinned.put_bytes(blob_bytes)
            cid = pin["cid"]
            record = VerifiedMedia(
                title=(file.filename or "upload"),
                ipfs_cid=cid,
                deepfake_score=deepfake,
                is_verified=False,
                exif_data={**exif, "duplicate_of": original_cid},
            )
            db.add(record)
            db.commit()
            return {
                "is_duplicate": True,
                "original_cid": original_cid,
                "deepfake_score": deepfake,
                "exif": exif,
                "tamper_flags": exif.get("tamper_flags", []),
                "cid": cid,
            }
        else:
            pin = vault.put_bytes(tmp.read_bytes())
            cid = pin["cid"]
            record = VerifiedMedia(
                title=(file.filename or "upload"),
                ipfs_cid=cid,
                deepfake_score=deepfake,
                is_verified=(deepfake < 0.5 and not exif.get("tamper_flags")),
                exif_data=exif,
            )
            db.add(record)
            db.commit()
            return {
                "is_duplicate": False,
                "original_cid": "",
                "deepfake_score": deepfake,
                "exif": exif,
                "tamper_flags": exif.get("tamper_flags", []),
                "cid": cid,
                "is_verified": record.is_verified,
            }
    finally:
        tmp.unlink(missing_ok=True)


@router.post("/video", status_code=status.HTTP_200_OK)
async def verify_video(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> dict:
    _enforce_rate_limit(request)
    suffix = Path(file.filename or "upload.mp4").suffix or ".mp4"
    if suffix.lower() not in {".mp4", ".mov", ".mkv", ".webm", ".avi"}:
        raise HTTPException(status_code=400, detail={"error": "unsupported_video_type", "suffix": suffix})
    tmp = _save_upload(file, suffix)
    try:
        result = analyze_video_frames(tmp, fps=1, max_frames=6)
        avg = float(result.get("avg_score", 0.0))
        pin = vault.put_bytes(tmp.read_bytes())
        cid = pin["cid"]
        record = VerifiedMedia(
            title=(file.filename or "video"),
            ipfs_cid=cid,
            deepfake_score=avg,
            is_verified=(avg < 0.5),
            exif_data={"frames": result.get("frames", 0), "per_frame": result.get("per_frame", [])},
        )
        db.add(record)
        db.commit()
        return {
            "cid": cid,
            "is_verified": record.is_verified,
            "deepfake_score": avg,
            "frames": result.get("frames", 0),
            "per_frame": result.get("per_frame", []),
        }
    finally:
        tmp.unlink(missing_ok=True)


@router.get("/cid/{cid}")
async def get_verified_by_cid(cid: str, request: Request, db: Session = Depends(get_db)) -> dict:
    _enforce_rate_limit(request)
    record = db.query(VerifiedMedia).filter(VerifiedMedia.ipfs_cid == cid).first()
    if record is None:
        raise HTTPException(status_code=404, detail={"error": "cid_not_found", "cid": cid})
    return {
        "id": record.id,
        "title": record.title,
        "ipfs_cid": record.ipfs_cid,
        "deepfake_score": record.deepfake_score,
        "is_verified": record.is_verified,
        "exif": record.exif_data,
        "created_at": record.created_at.isoformat() if record.created_at else None,
    }