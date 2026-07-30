"""Zero-Knowledge Identity Shield (test case #7).

Wraps beneficiary national IDs as 64-char hex HMAC-SHA256 commitments.
Original PII is never stored — only the commitment. A disburser can
verify a claim by recomputing the HMAC and constant-time comparing the
sig; the disburser_view helper returns the redacted record only.
"""
from __future__ import annotations

import hashlib
import hmac
import secrets
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone

from ... import config
from ...security import constant_time_compare, hash_id


@dataclass
class ShieldRecord:
    beneficiary_hash: str
    commitment: str
    registered_at: str


class ZKShield:
    def __init__(self, secret: str | None = None, salt: str | None = None) -> None:
        self.secret = secret or config.SECRET_KEY
        self.salt = salt or config.AID_SALT
        self._store: dict[str, ShieldRecord] = {}

    # ---------- public API ----------

    def register(self, national_id: str) -> tuple[str, str]:
        """Returns (beneficiary_hash, commitment). PII is discarded."""
        h = hash_id(national_id, self.salt)
        commitment = hmac.new(
            self.secret.encode("utf-8"),
            h.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        record = ShieldRecord(
            beneficiary_hash=h,
            commitment=commitment,
            registered_at=datetime.now(timezone.utc).isoformat(),
        )
        self._store[h] = record
        return h, commitment

    def verify(self, claim_hash: str, nonce: str, signature: str) -> bool:
        """Constant-time HMAC verification of a disbursement claim."""
        expected = hmac.new(
            self.secret.encode("utf-8"),
            f"{claim_hash}:{nonce}".encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        return constant_time_compare(expected, signature)

    def disburser_view(self, beneficiary_hash: str) -> dict:
        """Redacted projection of the record — no PII ever leaves this class."""
        record = self._store.get(beneficiary_hash)
        if record is None:
            return {}
        return {
            "beneficiary_hash": record.beneficiary_hash,
            "commitment": record.commitment,
            "registered_at": record.registered_at,
            "redacted_national_id": record.beneficiary_hash[:6] + "…" + record.beneficiary_hash[-4:],
        }

    def generate_nonce(self) -> str:
        return secrets.token_hex(16)

    @staticmethod
    def new_request_id() -> str:
        return str(uuid.uuid4())


shield = ZKShield()