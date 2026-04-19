from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import create_app
from app.schemas.radiation_screening import RadiationMissionProfile
from app.schemas.subsystem_selection import SelectedComponent
from app.services.radiation_screening import screen_architecture_radiation


def test_screening_flags_low_tid_for_harsh_mission() -> None:
    mission = RadiationMissionProfile(
        orbit_family="meo",
        mission_duration_months=36,
        shielding_assumption_mm_al=2.0,
    )
    out = screen_architecture_radiation(
        mission=mission,
        selected=[
            SelectedComponent(
                domain="comms",
                item_id="comm_xband",
                name="X-band Downlink",
                mass_kg=0.7,
                avg_power_w=10.0,
                peak_power_w=18.0,
                cost_kusd=95.0,
                risk_points=12.0,
                metadata={},
            )
        ],
        optional_selected=[],
    )
    assert out.flags, "Expected at least one radiation flag"
    assert out.flags[0].severity in {"medium", "high"}
    assert "required" in out.flags[0].message


def test_unknown_component_emits_low_severity_flag() -> None:
    mission = RadiationMissionProfile(orbit_family="leo", mission_duration_months=12)
    out = screen_architecture_radiation(
        mission=mission,
        selected=[
            SelectedComponent(
                domain="obc",
                item_id="unknown_part",
                name="Unknown",
                mass_kg=0.1,
                avg_power_w=1.0,
                peak_power_w=2.0,
                cost_kusd=1.0,
                risk_points=1.0,
                metadata={},
            )
        ],
    )
    assert out.flags
    assert out.flags[0].severity == "low"
    assert "No radiation record found" in out.flags[0].message


def test_api_endpoint_returns_flags() -> None:
    client = TestClient(create_app())
    resp = client.post(
        "/api/v1/radiation/screen",
        json={
            "mission": {
                "orbit_family": "sun_synchronous_leo",
                "mission_duration_months": 24,
                "shielding_assumption_mm_al": 2,
            },
            "selected": [
                {
                    "domain": "obc",
                    "item_id": "obc_high_storage",
                    "name": "OBC (High Storage)",
                    "mass_kg": 0.75,
                    "avg_power_w": 8,
                    "peak_power_w": 14,
                    "cost_kusd": 78,
                    "risk_points": 12,
                    "metadata": {},
                }
            ],
            "optional_selected": [],
        },
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert "flags" in body
    assert isinstance(body["flags"], list)
    assert any("tid_krad" in f["message"] for f in body["flags"])
