"""Tests for Offers API endpoints."""
import uuid

import pytest


class TestOffersCRUD:
    def test_create_offer(self, authed_client, sample_offer_payload):
        res = authed_client.post("/api/v1/offers/", json=sample_offer_payload)
        assert res.status_code == 201
        data = res.json()
        assert data["name"] == "Test Offer"
        assert data["status"] == "draft"
        assert "id" in data

    def test_list_offers(self, authed_client, sample_offer_payload):
        # Create two offers with same workspace
        workspace_id = sample_offer_payload["workspace_id"]
        authed_client.post("/api/v1/offers/", json=sample_offer_payload)
        authed_client.post("/api/v1/offers/", json={**sample_offer_payload, "name": "Second Offer"})

        res = authed_client.get(f"/api/v1/offers/?workspace_id={workspace_id}")
        assert res.status_code == 200
        data = res.json()
        assert len(data) == 2

    def test_list_offers_filter_by_status(self, authed_client, sample_offer_payload):
        workspace_id = sample_offer_payload["workspace_id"]
        authed_client.post("/api/v1/offers/", json=sample_offer_payload)
        authed_client.post("/api/v1/offers/", json={**sample_offer_payload, "name": "Active", "status": "active"})

        res = authed_client.get(f"/api/v1/offers/?workspace_id={workspace_id}&status=active")
        assert res.status_code == 200
        data = res.json()
        assert len(data) == 1
        assert data[0]["status"] == "active"

    def test_get_offer(self, authed_client, sample_offer_payload):
        create_res = authed_client.post("/api/v1/offers/", json=sample_offer_payload)
        offer_id = create_res.json()["id"]

        res = authed_client.get(f"/api/v1/offers/{offer_id}")
        assert res.status_code == 200
        assert res.json()["id"] == offer_id

    def test_get_offer_not_found(self, authed_client):
        res = authed_client.get(f"/api/v1/offers/{uuid.uuid4()}")
        assert res.status_code == 404

    def test_update_offer(self, authed_client, sample_offer_payload):
        create_res = authed_client.post("/api/v1/offers/", json=sample_offer_payload)
        offer_id = create_res.json()["id"]

        res = authed_client.put(f"/api/v1/offers/{offer_id}", json={"name": "Updated Name", "status": "active"})
        assert res.status_code == 200
        assert res.json()["name"] == "Updated Name"
        assert res.json()["status"] == "active"

    def test_delete_offer_sets_sunset(self, authed_client, sample_offer_payload):
        create_res = authed_client.post("/api/v1/offers/", json=sample_offer_payload)
        offer_id = create_res.json()["id"]

        res = authed_client.delete(f"/api/v1/offers/{offer_id}")
        assert res.status_code == 204

        # Verify it's sunset
        get_res = authed_client.get(f"/api/v1/offers/{offer_id}")
        assert get_res.json()["status"] == "sunset"

    def test_delete_offer_not_found(self, authed_client):
        res = authed_client.delete(f"/api/v1/offers/{uuid.uuid4()}")
        assert res.status_code == 404


class TestOffersAIEndpoints:
    def test_generate_offer(self, authed_client):
        res = authed_client.post(
            "/api/v1/offers/generate",
            json={"problem_id": str(uuid.uuid4()), "problem_data": {"description": "Test problem"}},
        )
        assert res.status_code == 200
        data = res.json()
        assert "name" in data
        assert "value_stack" in data

    def test_generate_offer_missing_problem(self, authed_client):
        res = authed_client.post("/api/v1/offers/generate", json={})
        assert res.status_code == 422

    def test_simulate_margins(self, authed_client):
        res = authed_client.post(
            "/api/v1/offers/simulate-margins",
            json={
                "monthly_price": 25000,
                "setup_fee": 5000,
                "costs": {"staff": 10000, "tools": 3000},
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "monthly_revenue" in data
        assert "gross_margin_pct" in data

    def test_get_benchmarks(self, authed_client):
        res = authed_client.get("/api/v1/offers/benchmarks/coordination")
        assert res.status_code == 200
        data = res.json()
        assert len(data) > 0

    def test_get_benchmarks_unknown(self, authed_client):
        res = authed_client.get("/api/v1/offers/benchmarks/nonexistent")
        assert res.status_code == 404


class TestServiceDesignEndpoints:
    def test_generate_sops(self, authed_client, sample_offer_payload):
        create_res = authed_client.post("/api/v1/offers/", json=sample_offer_payload)
        offer_id = create_res.json()["id"]

        res = authed_client.post(f"/api/v1/offers/{offer_id}/sops")
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, list)
        assert len(data) > 0

    def test_generate_journey(self, authed_client, sample_offer_payload):
        create_res = authed_client.post("/api/v1/offers/", json=sample_offer_payload)
        offer_id = create_res.json()["id"]

        res = authed_client.post(f"/api/v1/offers/{offer_id}/journey")
        assert res.status_code == 200
        data = res.json()
        assert "stages" in data
        assert "total_duration" in data
