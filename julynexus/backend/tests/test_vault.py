"""Tests for the IPFS-style content vault."""
from __future__ import annotations

from pathlib import Path

import pytest

from app.services.ipfs_vault.vault import Vault
from app import config


@pytest.fixture()
def fresh_vault(tmp_path: Path) -> Vault:
    return Vault(blob_dir=tmp_path / "blobs", ledger_path=tmp_path / "ledger.jsonl")


def test_put_then_get_round_trip(fresh_vault: Vault) -> None:
    payload = b"JulyNexus test payload 1234"
    out = fresh_vault.put_bytes(payload)
    cid = out["cid"]
    assert len(cid) == 64
    assert fresh_vault.get_bytes(cid) == payload


def test_cid_is_deterministic(fresh_vault: Vault) -> None:
    a = fresh_vault.put_bytes(b"abc")
    b = fresh_vault.put_bytes(b"abc")
    assert a["cid"] == b["cid"]


def test_ledger_append_count_increases(fresh_vault: Vault) -> None:
    initial = len(fresh_vault.list_cids())
    fresh_vault.put_bytes(b"first")
    fresh_vault.put_bytes(b"second")
    after = len(fresh_vault.list_cids())
    assert after - initial == 2


def test_verify_recomputes_sha256(fresh_vault: Vault) -> None:
    payload = b"verify me please"
    out = fresh_vault.put_bytes(payload)
    assert fresh_vault.verify(out["cid"]) is True
    # Tamper the blob directly and verify should fail
    blob_path = fresh_vault._blob_path(out["cid"])
    blob_path.write_bytes(b"corrupted")
    assert fresh_vault.verify(out["cid"]) is False


def test_put_file(fresh_vault: Vault, tmp_path: Path) -> None:
    p = tmp_path / "f.txt"
    p.write_bytes(b"hello file")
    out = fresh_vault.put_file(p)
    assert fresh_vault.get_bytes(out["cid"]) == b"hello file"