"""Append-only aid ledger with SHA-256 chain hashing (test case #6)."""
from __future__ import annotations

import hashlib
import json
import threading
import uuid
from datetime import datetime, timezone
from typing import Iterable


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class AidLedger:
    def __init__(self) -> None:
        self._entries: list[dict] = []
        self._lock = threading.Lock()
        self._genesis = "0" * 64

    def add_entry(self, beneficiary_hash: str, amount_bdt: float, status: str) -> tuple[str, str]:
        prev_hash = self._entries[-1]["transaction_hash"] if self._entries else self._genesis
        entry_id = str(uuid.uuid4())
        payload = {
            "id": entry_id,
            "beneficiary_hash": beneficiary_hash,
            "amount_bdt": float(amount_bdt),
            "disbursement_status": status,
            "previous_hash": prev_hash,
            "ts": _now(),
        }
        tx_hash = hashlib.sha256(
            json.dumps(payload, sort_keys=True).encode("utf-8")
        ).hexdigest()
        record = {**payload, "transaction_hash": tx_hash}
        with self._lock:
            self._entries.append(record)
        return entry_id, tx_hash

    def list_entries(self) -> list[dict]:
        with self._lock:
            return [dict(e) for e in self._entries]

    def get_for_beneficiary(self, beneficiary_hash: str) -> list[dict]:
        with self._lock:
            return [dict(e) for e in self._entries if e["beneficiary_hash"] == beneficiary_hash]

    def verify_chain(self) -> tuple[bool, int]:
        """Returns (ok, last_valid_index)."""
        prev = self._genesis
        for idx, entry in enumerate(self._entries):
            if entry["previous_hash"] != prev:
                return False, idx - 1
            payload = {k: entry[k] for k in
                       ("id", "beneficiary_hash", "amount_bdt", "disbursement_status", "previous_hash", "ts")}
            expected = hashlib.sha256(
                json.dumps(payload, sort_keys=True).encode("utf-8")
            ).hexdigest()
            if expected != entry["transaction_hash"]:
                return False, idx - 1
            prev = entry["transaction_hash"]
        return True, len(self._entries) - 1

    def iter_entries(self) -> Iterable[dict]:
        with self._lock:
            return iter([dict(e) for e in self._entries])


aid_ledger = AidLedger()