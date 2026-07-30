"""Tests for ZK identity shield + aid ledger."""
from __future__ import annotations

import pytest

from app.services.zk_identity.shield import ZKShield
from app.services.ledger.chain import AidLedger
from app import config


def test_register_returns_hash_and_commitment() -> None:
    shield = ZKShield(secret="s", salt="a")
    h, c = shield.register("199012345678")
    assert len(h) == 64
    assert len(c) == 64
    assert h != c


def test_disburser_view_has_no_pii() -> None:
    shield = ZKShield(secret="s", salt="a")
    h, _ = shield.register("1234567890")
    view = shield.disburser_view(h)
    assert "1234567890" not in str(view)
    assert view["beneficiary_hash"] == h


def test_two_beneficiaries_different_hashes_same_salt() -> None:
    shield_a = ZKShield(secret="s", salt="same")
    shield_b = ZKShield(secret="s", salt="same")
    h1, _ = shield_a.register("999999999")
    h2, _ = shield_b.register("999999999")
    assert h1 == h2


def test_two_salts_produce_different_hashes() -> None:
    a = ZKShield(secret="s", salt="salt-a")
    b = ZKShield(secret="s", salt="salt-b")
    ha, _ = a.register("999999999")
    hb, _ = b.register("999999999")
    assert ha != hb


def test_chain_validates() -> None:
    ledger = AidLedger()
    h1, _ = ZKShield("s", "a").register("111")
    h2, _ = ZKShield("s", "a").register("222")
    ledger.add_entry(h1, 100.0, "disbursed")
    ledger.add_entry(h2, 200.0, "pending")
    ok, last = ledger.verify_chain()
    assert ok is True
    assert last == 1


def test_chain_tamper_detection() -> None:
    ledger = AidLedger()
    h1, _ = ZKShield("s", "a").register("333")
    _eid, _tx = ledger.add_entry(h1, 50.0, "disbursed")
    ledger._entries[0]["amount_bdt"] = 9999.0
    ok, _ = ledger.verify_chain()
    assert ok is False