"""Seed sample data for JulyNexus.

Run: `python -m app.seed`
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image
from sqlalchemy import select

from . import config
from .db import SessionLocal, engine, Base, init_db
from .models import MemorialEntry, VerifiedMedia, VictimReliefLedger
from .services.ai_engine.forensics import perceptual_hash_hex, sha256_file
from .services.ipfs_vault.vault import vault
from .services.zk_identity.shield import shield
from .services.ledger.chain import aid_ledger


MARTYRS: list[dict] = [
    {"name": "Abu Sayed", "district": "Rangpur", "lat": 25.7439, "lng": 89.2752,
     "testimony": "Shot during quota reform protest on 16 July 2024."},
    {"name": "Mir Mugdho", "district": "Dhaka", "lat": 23.7806, "lng": 90.4074,
     "testimony": "Student volunteer who set up first-aid tents at Uttara."},
    {"name": "Sagor", "district": "Bogura", "lat": 24.8465, "lng": 89.3773,
     "testimony": "Local organizer; family filed missing-person report."},
    {"name": "Farhan Faiyaz", "district": "Dhaka", "lat": 23.7461, "lng": 90.3742,
     "testimony": "Beaten inside the Jagannath University dormitory."},
    {"name": "Rifat", "district": "Chattogram", "lat": 22.3569, "lng": 91.7832,
     "testimony": "Coordinated relief supply lines for port city."},
    {"name": "Shahriar", "district": "Khulna", "lat": 22.8456, "lng": 89.5403,
     "testimony": "Documented hospital admissions during the crackdown."},
    {"name": "Tahmid", "district": "Sylhet", "lat": 24.8949, "lng": 91.8687,
     "testimony": "Volunteer who livestreamed until the night of 5 August."},
    {"name": "Imran", "district": "Rajshahi", "lat": 24.3745, "lng": 88.6042,
     "testimony": "Waved black flag at the Shaheed Minar rally."},
    {"name": "Sabbir", "district": "Barishal", "lat": 22.7010, "lng": 90.3535,
     "testimony": "Youngest martyr in the southern division."},
    {"name": "Nashita", "district": "Gazipur", "lat": 23.9999, "lng": 90.4203,
     "testimony": "Nursing student; coordinated blood-donor registry."},
    {"name": "Mithun", "district": "Mymensingh", "lat": 24.7471, "lng": 90.4203,
     "testimony": "Cyclist ferry rider for messages between districts."},
    {"name": "Tania", "district": "Rangpur", "lat": 25.7777, "lng": 89.2444,
     "testimony": "Stitched first-aid bandages at the protest camp."},
]


def _seed_memorial(db) -> None:
    existing = db.execute(select(MemorialEntry)).scalars().first()
    if existing is not None:
        return
    for m in MARTYRS:
        payload = json.dumps({"name": m["name"], "district": m["district"],
                              "testimony": m["testimony"]}, ensure_ascii=False)
        pin = vault.put_bytes(payload.encode("utf-8"))
        record = MemorialEntry(
            name=m["name"], district=m["district"],
            lat=m["lat"], lng=m["lng"], testimony=m["testimony"],
            ipfs_cid=pin["cid"],
        )
        db.add(record)
    db.commit()


def _seed_aid_ledger(db) -> None:
    existing = db.execute(select(VictimReliefLedger)).scalars().first()
    if existing is not None:
        return
    national_ids = ["199012345678", "199523456789", "200034567890",
                    "199845612301", "200156789012"]
    amounts = [200000.0, 150000.0, 200000.0, 100000.0, 200000.0]
    statuses = ["disbursed", "disbursed", "pending", "disbursed", "disbursed"]
    for nid, amt, st in zip(national_ids, amounts, statuses):
        h, _c = shield.register(nid)
        _id, tx = aid_ledger.add_entry(h, amt, st)
        db.add(VictimReliefLedger(
            beneficiary_hash=h, amount_bdt=amt,
            disbursement_status=st, transaction_hash=tx,
        ))
    db.commit()


def _seed_verified_media(db, samples_dir: Path) -> None:
    existing = db.execute(select(VerifiedMedia)).scalars().first()
    if existing is not None:
        return
    samples_dir.mkdir(parents=True, exist_ok=True)
    images = []
    for i, (w, h, color) in enumerate([
        (320, 240, (180, 200, 220)),
        (480, 320, (40, 60, 80)),
        (640, 360, (210, 220, 230)),
    ]):
        path = samples_dir / f"sample_{i}.jpg"
        Image.new("RGB", (w, h), color).save(path, "JPEG", quality=85)
        exif_bytes = b"Exif\x00\x00II*\x00\x08\x00\x00\x00\x00\x00" + b"\x00" * 32
        try:
            path.write_bytes(path.read_bytes() + exif_bytes)
        except Exception:
            pass
        images.append(path)

    for i, path in enumerate(images):
        pin = vault.put_file(path)
        try:
            phash = perceptual_hash_hex(path)
            sha = sha256_file(path)
        except Exception:
            phash, sha = "", ""
        db.add(VerifiedMedia(
            title=path.name,
            ipfs_cid=pin["cid"],
            deepfake_score=0.15 + i * 0.05,
            is_verified=True,
            exif_data={"phash": phash, "sha256": sha, "seed": True},
        ))
    db.commit()


def main() -> None:
    init_db()
    samples_dir = config.TMP_DIR / "seed_samples"
    with SessionLocal() as db:
        _seed_memorial(db)
        _seed_aid_ledger(db)
        _seed_verified_media(db, samples_dir)
    print("Seed complete.")


if __name__ == "__main__":
    main()