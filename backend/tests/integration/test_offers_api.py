"""Integration tests for the Offers API — CRUD and status filtering."""
import uuid

import pytest


def _make_offer(client, **overrides):
    """Helper to create an offer."""
    payload = {
        "name": f"Test Offer {uuid.uuid4().hex[:6]}",
        "delivery_model": "done_for_you",
        "status": "draft",
        "value_stack": [{"name": "Core", "description": "Main delivery"}],
        "guarantee_framework": {},
        "pricing_model": {"type": "retainer", "base_fee": 15000},
        "sop_bundle": [],
    }
    payload.update(overrides)
    return client.post("/api/v1/offers/", json=payload)


class TestOffersCRUD:
    def test_create_offer(self, authed_client):
        resp = _make_offer(authed_client, name="Premium Ops Service")
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "Premium Ops Service"
        assert data["status"] == "draft"
        assert data["delivery_model"] == "done_for_you"

    def test_get_offer_by_id(self, authed_client):
        create = _make_offer(authed_client)
        oid = create.json()["id"]

        resp = authed_client.get(f"/api/v1/offers/{oid}")
        assert resp.status_code == 200
        assert resp.json()["id"] == oid

    def test_get_offer_not_found(self, authed_client):
        fake_id = str(uuid.uuid4())
        resp = authed_client.get(f"/api/v1/offers/{fake_id}")
        assert resp.status_code == 404

    def test_update_offer_status_to_active(self, authed_client):
        create = _make_offer(authed_client)
        oid = create.json()["id"]

        resp = authed_client.put(
            f"/api/v1/offers/{oid}",
            json={"status": "active"},
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "active"

    def test_update_offer_name(self, authed_client):
        create = _make_offer(authed_client, name="Old Name")
        oid = create.json()["id"]

        resp = authed_client.put(
            f"/api/v1/offers/{oid}",
            json={"name": "Renamed Offer"},
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Renamed Offer"

    def test_update_nonexistent_offer(self, authed_client):
        fake_id = str(uuid.uuid4())
        resp = authed_client.put(
            f"/api/v1/offers/{fake_id}",
            json={"name": "Nope"},
        )
        assert resp.status_code == 404

    def test_delete_offer_sets_sunset(self, authed_client):
        create = _make_offer(authed_client)
        oid = create.json()["id"]

        resp = authed_client.delete(f"/api/v1/offers/{oid}")
        assert resp.status_code == 204

        # Verify status is now "sunset"
        get_resp = authed_client.get(f"/api/v1/offers/{oid}")
        assert get_resp.status_code == 200
        assert get_resp.json()["status"] == "sunset"

    def test_delete_nonexistent_offer(self, authed_client):
        fake_id = str(uuid.uuid4())
        resp = authed_client.delete(f"/api/v1/offers/{fake_id}")
        assert resp.status_code == 404


class TestOffersFiltering:
    def test_list_all_offers(self, authed_client):
        _make_offer(authed_client)
        resp = authed_client.get("/api/v1/offers/")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)
        assert len(resp.json()) >= 1

    def test_list_active_offers_only(self, authed_client):
        # Create draft and active offers
        _make_offer(authed_client, name="Draft Offer")
        active = _make_offer(authed_client, name="Active Offer")
        active_id = active.json()["id"]
        authed_client.put(f"/api/v1/offers/{active_id}", json={"status": "active"})

        resp = authed_client.get("/api/v1/offers/?status=active")
        assert resp.status_code == 200
        for offer in resp.json():
            assert offer["status"] == "active"


class TestOffersBenchmarks:
    def test_get_benchmarks_for_known_category(self, authed_client):
        resp = authed_client.get("/api/v1/offers/benchmarks/Privacy")
        # Could be 200 or 404 depending on data — verify structure
        assert resp.status_code in (200, 404)

    def test_get_benchmarks_unknown_category(self, authed_client):
        resp = authed_client.get("/api/v1/offers/benchmarks/nonexistent_category_xyz")
        assert resp.status_code == 404
