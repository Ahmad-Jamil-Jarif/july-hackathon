"""Tests for the kiosk ingest route."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.db import init_db


@pytest.fixture(scope="module")
def client() -> TestClient:
    init_db()
    return TestClient(app)


def test_malformed_payload_returns_400(client: TestClient) -> None:
    resp = client.post("/api/v1/kiosk/event", json={"foo": "bar"})
    assert resp.status_code == 400
    body = resp.json()
    assert body["detail"]["error"] == "malformed_kiosk_payload"


def test_single_event_appends(client: TestClient) -> None:
    resp = client.post(
        "/api/v1/kiosk/event",
        json={"device_id": "kiosk-01", "event_type": "tribute", "payload": {"msg": "hi"}},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["device_id"] == "kiosk-01"
    assert body["event_type"] == "tribute"


def test_corrupted_rfid_returns_400(client: TestClient) -> None:
    resp = client.post(
        "/api/v1/kiosk/event",
        json={"device_id": "kiosk-01", "event_type": "rfid", "payload": {}},
    )
    assert resp.status_code == 400
    assert resp.json()["detail"]["error"] == "corrupted_rfid"


def test_batch_sync_returns_synced_count(client: TestClient) -> None:
    resp = client.post(
        "/api/v1/kiosk/sync",
        json={
            "device_id": "kiosk-02",
            "events": [
                {"device_id": "kiosk-02", "event_type": "heartbeat", "payload": {}},
                {"device_id": "kiosk-02", "event_type": "tribute", "payload": {"msg": "ok"}},
            ],
        },
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["synced"] == 2
    assert body["rejected"] == 0