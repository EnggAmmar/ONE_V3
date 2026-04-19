from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import create_app


def test_taxonomy_endpoint_contains_expected_families_and_categories() -> None:
    client = TestClient(create_app())
    resp = client.get("/api/v1/taxonomy")
    assert resp.status_code == 200
    body = resp.json()

    assert body["version"] == "v1"
    families = {f["family_id"]: f for f in body["families"]}
    assert set(families.keys()) == {"remote_sensing", "iot_communication", "navigation"}

    expected = {
        "remote_sensing": {
            "hyperspectral",
            "multispectral",
            "vhr_optical",
            "thermal",
            "sar",
            "my_payload",
        },
        "iot_communication": {
            "iot_store_and_forward",
            "broadband_comms",
            "optical_comms",
            "secure_comms",
            "my_payload",
        },
        "navigation": {
            "pnt_augmentation",
            "ais_adsb_tracking",
            "rf_navigation_payload",
            "timing_navigation_experiment",
            "my_payload",
        },
    }

    for fam_id, fam in families.items():
        assert fam["label"]
        assert fam["description"]
        cats = {c["category_id"]: c for c in fam["payload_categories"]}
        assert set(cats.keys()) == expected[fam_id]
        assert "my_payload" in cats
        for cat in cats.values():
            assert cat["label"]
            assert cat["description"]
            assert "payloads" in cat
            assert isinstance(cat["payloads"], list)


def test_taxonomy_payload_grouping_matches_catalog() -> None:
    client = TestClient(create_app())
    body = client.get("/api/v1/taxonomy").json()
    families = {f["family_id"]: f for f in body["families"]}

    rs = families["remote_sensing"]
    cats = {c["category_id"]: c for c in rs["payload_categories"]}

    hyperspec_payload_ids = {p["payload_id"] for p in cats["hyperspectral"]["payloads"]}
    vhr_payload_ids = {p["payload_id"] for p in cats["vhr_optical"]["payloads"]}

    assert "rs_hyperspec_v1" in hyperspec_payload_ids
    assert "rs_vhr_optical_v1" in vhr_payload_ids


def test_legacy_family_and_category_endpoints_derive_from_taxonomy() -> None:
    client = TestClient(create_app())

    fam = client.get("/api/v1/mission-families").json()
    assert set(fam["families"]) == {"remote_sensing", "iot_communication", "navigation"}

    cats = client.get("/api/v1/payload-categories", params={"family": "navigation"}).json()
    cat_ids = {c["category_id"] for c in cats["categories"]}
    assert "my_payload" in cat_ids
    assert "pnt_augmentation" in cat_ids
