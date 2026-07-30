"""Local IPFS-style content-addressed vault (test case #6).

- Each blob is stored under  blob_dir/<cid[:2]>/<cid>
- cid = SHA-256 hex of the raw bytes
- Append-only ledger at STORAGE_DIR/ledger.jsonl
- Optional Pinata pass-through when IPFS_USE_PINATA=true + PINATA_JWT set
"""
from __future__ import annotations

import hashlib
import json
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

import httpx

from ... import config


class Vault:
    def __init__(self, blob_dir: Path | None = None, ledger_path: Path | None = None) -> None:
        self.blob_dir: Path = Path(blob_dir) if blob_dir else config.BLOB_DIR
        self.ledger_path: Path = Path(ledger_path) if ledger_path else config.LEDGER_PATH
        self.blob_dir.mkdir(parents=True, exist_ok=True)
        self.ledger_path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.Lock()

    # ---------- core ----------

    @staticmethod
    def _cid_of(data: bytes) -> str:
        return hashlib.sha256(data).hexdigest()

    def put_bytes(self, data: bytes) -> dict:
        cid = self._cid_of(data)
        path = self._blob_path(cid)
        with self._lock:
            if not path.exists():
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(data)
            self._append_ledger(cid, len(data))
        return {"cid": cid, "sha256": cid, "bytes": len(data),
                "ts": datetime.now(timezone.utc).isoformat()}

    def get_bytes(self, cid: str) -> bytes:
        path = self._blob_path(cid)
        if not path.exists():
            raise FileNotFoundError(cid)
        return path.read_bytes()

    def put_file(self, file_path: Path | str) -> dict:
        return self.put_bytes(Path(file_path).read_bytes())

    def list_cids(self) -> list[dict]:
        out: list[dict] = []
        for entry in self._iter_ledger():
            out.append(entry)
        return out

    def verify(self, cid: str) -> bool:
        path = self._blob_path(cid)
        if not path.exists():
            return False
        actual = hashlib.sha256(path.read_bytes()).hexdigest()
        return actual == cid

    # ---------- optional pinata ----------

    def pin_to_remote(self, cid: str, jwt: str | None = None) -> bool:
        if not (config.IPFS_USE_PINATA and (jwt or config.PINATA_JWT)):
            return False
        token = jwt or config.PINATA_JWT
        try:
            with httpx.Client(timeout=15.0) as client:
                resp = client.post(
                    "https://api.pinata.cloud/pinning/pinByHash",
                    headers={"Authorization": f"Bearer {token}"},
                    json={"hashToPin": cid},
                )
                return resp.status_code in (200, 202)
        except httpx.HTTPError:
            return False

    # ---------- internals ----------

    def _blob_path(self, cid: str) -> Path:
        return self.blob_dir / cid[:2] / cid

    def _append_ledger(self, cid: str, size: int) -> None:
        entry = {
            "cid": cid,
            "sha256": cid,
            "bytes": size,
            "ts": datetime.now(timezone.utc).isoformat(),
        }
        with self.ledger_path.open("a", encoding="utf-8") as fp:
            fp.write(json.dumps(entry, ensure_ascii=False) + "\n")

    def _iter_ledger(self) -> Iterable[dict]:
        if not self.ledger_path.exists():
            return []
        with self.ledger_path.open("r", encoding="utf-8") as fp:
            for line in fp:
                line = line.strip()
                if not line:
                    continue
                try:
                    yield json.loads(line)
                except json.JSONDecodeError:
                    continue


# Singleton
vault = Vault()