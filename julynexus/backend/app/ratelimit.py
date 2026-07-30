"""In-process sliding-window rate limiter (test case #8 + #10).

Per-IP deque of request timestamps. Old entries outside the window are
pruned on each check. Bounded queue depth prevents unbounded memory.
"""
from __future__ import annotations

import threading
import time
from collections import deque
from typing import Deque

from .config import RATE_LIMIT_PER_MIN


class SlidingWindowLimiter:
    """Thread-safe sliding-window counter."""

    def __init__(self, max_requests: int = RATE_LIMIT_PER_MIN, window_seconds: int = 60) -> None:
        self.max_requests = max_requests
        self.window = window_seconds
        self._buckets: dict[str, Deque[float]] = {}
        self._lock = threading.Lock()
        self._max_tracked_ips = 50_000

    def allow(self, key: str) -> tuple[bool, int]:
        """Returns (allowed, current_count_in_window)."""
        now = time.monotonic()
        cutoff = now - self.window
        with self._lock:
            if len(self._buckets) >= self._max_tracked_ips and key not in self._buckets:
                return False, 0
            bucket = self._buckets.setdefault(key, deque())
            while bucket and bucket[0] < cutoff:
                bucket.popleft()
            if len(bucket) >= self.max_requests:
                return False, len(bucket)
            bucket.append(now)
            return True, len(bucket)


# Shared singleton
_limiter = SlidingWindowLimiter()


def get_limiter() -> SlidingWindowLimiter:
    return _limiter
