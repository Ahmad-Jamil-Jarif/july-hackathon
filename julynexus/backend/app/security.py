"""Security helpers for JulyNexus.

- HMAC-SHA256 identity hashing (test case #7 — anonymous aid, never store PII)
- Constant-time compare helpers
- Text sanitization against SQL/XSS payloads (test case #5/#10)
- Parameterized query note: never string-interpolate user input into SQL;
  use SQLAlchemy ORM or bound parameters.
"""
from __future__ import annotations

import hashlib
import hmac
import re
from typing import Final

_BAD_CHARS_RE: Final[re.Pattern[str]] = re.compile(r"[<>\"';]")
_WHITESPACE_RE: Final[re.Pattern[str]] = re.compile(r"\s+")


def hash_id(national_id: str, salt: str) -> str:
    """Return a 64-char hex HMAC-SHA256(national_id, salt).

    Same input + same salt always yields the same hash; rotating the salt
    re-anonymizes the entire beneficiary set.
    """
    if not isinstance(national_id, str) or not national_id:
        raise ValueError("national_id must be a non-empty string")
    if not isinstance(salt, str) or not salt:
        raise ValueError("salt must be a non-empty string")
    digest = hmac.new(
        salt.encode("utf-8"),
        national_id.strip().lower().encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return digest


def constant_time_compare(a: str, b: str) -> bool:
    """Constant-time string comparison; falls back gracefully on length mismatch."""
    try:
        return hmac.compare_digest(a.encode("utf-8"), b.encode("utf-8"))
    except (AttributeError, TypeError):
        return False


def sanitize_text(value: str | None, *, max_length: int = 5000) -> str:
    """Strip dangerous characters and collapse whitespace.

    Removes: < > " ' ;
    Used for free-text fields before persistence to neutralize trivial
    SQL injection (test case #5) and XSS payloads (test case #10).
    """
    if value is None:
        return ""
    cleaned = _BAD_CHARS_RE.sub(" ", str(value))
    cleaned = _WHITESPACE_RE.sub(" ", cleaned).strip()
    return cleaned[:max_length]


# Parameterized-query reminder: SQLAlchemy ORM emits bound parameters.
# Example pattern (DO NOT copy verbatim):
#   session.execute(select(Model).where(Model.col == user_value))
# Never: f"SELECT * FROM t WHERE col = '{user_value}'"
