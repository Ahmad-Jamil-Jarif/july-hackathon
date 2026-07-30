"""Tests for the AI forensics + trust scoring engine."""
from __future__ import annotations

from pathlib import Path

import pytest
from PIL import Image

from app.services.ai_engine.forensics import (
    analyze_deepfake_score,
    detect_duplicate,
    extract_exif,
    perceptual_hash_hex,
    sha256_file,
)
from app.services.ai_engine.trust_scorer import (
    get_claim_verdict,
    score_trust_report,
    split_claims,
)
from app.db import init_db, SessionLocal
from app.services.ipfs_vault.vault import vault


@pytest.fixture(scope="module")
def sample_image(tmp_path_factory) -> Path:
    img_path = tmp_path_factory.mktemp("imgs") / "sample.png"
    Image.new("RGB", (200, 200), (90, 120, 150)).save(img_path, "PNG")
    return img_path


@pytest.fixture(scope="module")
def sample_image2(tmp_path_factory) -> Path:
    img_path = tmp_path_factory.mktemp("imgs2") / "sample2.png"
    Image.new("RGB", (200, 200), (88, 122, 148)).save(img_path, "PNG")
    return img_path


def test_extract_exif_returns_dict(sample_image: Path) -> None:
    out = extract_exif(sample_image)
    assert "exif" in out
    assert "tamper_flags" in out
    assert isinstance(out["tamper_flags"], list)


def test_deepfake_score_in_range(sample_image: Path) -> None:
    score = analyze_deepfake_score(sample_image)
    assert 0.0 <= score <= 1.0


def test_perceptual_hash_and_sha256(sample_image: Path) -> None:
    h = perceptual_hash_hex(sample_image)
    assert len(h) == 16  # 64-bit hex
    sha = sha256_file(sample_image)
    assert len(sha) == 64


def test_duplicate_detection(sample_image: Path, sample_image2: Path) -> None:
    init_db()
    # First, store the image so future queries find it.
    from app.models import VerifiedMedia

    pin = vault.put_bytes(sample_image.read_bytes())
    with SessionLocal() as db:
        phash = perceptual_hash_hex(sample_image)
        db.add(VerifiedMedia(
            title="orig", ipfs_cid=pin["cid"], deepfake_score=0.1,
            is_verified=True, exif_data={"phash": phash},
        ))
        db.commit()
        is_dup, cid = detect_duplicate(sample_image2, db)
        assert is_dup is True
        assert cid == pin["cid"]


def test_split_claims() -> None:
    claims = split_claims("Hello world. This is a sentence. Another one here.")
    assert len(claims) >= 2


def test_claim_verdict_supported() -> None:
    verdict, conf, _ = get_claim_verdict("Tell me about shaheed minar protests.")
    assert verdict == "supported"
    assert conf > 0


def test_scam_pattern_detected() -> None:
    res = score_trust_report("text", "Click here NOW to claim your free iPhone!",
                             "text")
    assert res.scam_probability > 0.3
    assert res.trust_score < 80


def test_bias_term_detected() -> None:
    res = score_trust_report("text", "They all are infiltrators and traitors.",
                             "text")
    assert res.bias_score > 0.2


def test_overall_risk_buckets() -> None:
    high = score_trust_report("text",
                              "Click here! Wire transfer seed phrase for free iPhone!",
                              "text")
    assert high.overall_risk in {"medium", "high"}