from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import create_app


def test_mission_solve_ok() -> None:
    app = create_app()
    client = TestClient(app)

    req = {
        "input": {
            "family": "remote_sensing",
            "payload": {"type": "catalog", "payload_id": "rs_vhr_optical_v1"},
            "roi": {"type": "region", "query": "Pakistan"},
            "parameters": {"revisit_time_hours": 48},
        }
    }
    resp = client.post("/api/v1/mission/solve", json=req)
    assert resp.status_code == 200
    body = resp.json()
    assert body["solution"]["platform"]["bus_size_u"] in (6.0, 8.0, 3.0)
    assert body["constellation"]["satellites"] >= 1
    assert "budgets" in body["solution"]


def test_mission_report_markdown() -> None:
    app = create_app()
    client = TestClient(app)
    req = {
        "input": {
            "family": "remote_sensing",
            "payload": {"type": "catalog", "payload_id": "rs_hyperspec_v1"},
            "roi": {"type": "global"},
            "parameters": {"revisit_time_hours": 24},
        }
    }
    resp = client.post("/api/v1/mission/report", json=req)
    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("text/markdown")
    assert "# Mission Report" in resp.text
