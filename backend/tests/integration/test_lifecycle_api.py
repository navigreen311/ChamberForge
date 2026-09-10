"""Integration tests for the Lifecycle API — intel brief, health, scenario planner."""
import uuid


class TestIntelBrief:
    def test_generate_intel_brief(self, authed_client):
        client_id = str(uuid.uuid4())
        resp = authed_client.post(
            f"/api/v1/lifecycle/intel-brief/{client_id}",
            json={
                "client_data": {
                    "name": "John Doe",
                    "wealth_tier": "UHNWI",
                    "key_concerns": ["estate planning", "privacy"],
                },
                "meeting_context": "Quarterly review meeting",
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, dict)

    def test_intel_brief_minimal(self, authed_client):
        resp = authed_client.post(
            "/api/v1/lifecycle/intel-brief/test-client",
            json={"client_data": {}, "meeting_context": ""},
        )
        assert resp.status_code == 200


class TestClientHealth:
    def test_compute_health_score(self, client):
        resp = client.post(
            "/api/v1/lifecycle/health/score",
            json={
                "engagement": 0.8,
                "satisfaction": 0.9,
                "usage": 0.7,
                "payment": 1.0,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "score" in data
        assert 0 <= data["score"] <= 100

    def test_compute_health_score_low(self, client):
        resp = client.post(
            "/api/v1/lifecycle/health/score",
            json={
                "engagement": 0.1,
                "satisfaction": 0.2,
                "usage": 0.1,
                "payment": 0.3,
            },
        )
        assert resp.status_code == 200
        assert resp.json()["score"] < 50

    def test_get_client_health(self, authed_client):
        resp = authed_client.get("/api/v1/lifecycle/health/test-client-123")
        assert resp.status_code == 200
        data = resp.json()
        assert data["client_id"] == "test-client-123"
        assert "churn_analysis" in data

    def test_get_health_trend(self, client):
        resp = client.get(
            "/api/v1/lifecycle/health/trend/test-client-123?months=6"
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["client_id"] == "test-client-123"
        assert "trend" in data
        assert isinstance(data["trend"], list)

    def test_health_score_missing_fields(self, client):
        resp = client.post(
            "/api/v1/lifecycle/health/score",
            json={"engagement": 0.5},
        )
        assert resp.status_code == 422


class TestScenarioPlanner:
    def test_run_scenario(self, client):
        resp = client.post(
            "/api/v1/lifecycle/scenario",
            json={
                "base_price": 15000.0,
                "base_clients": 20,
                "adjustments": {"price_increase_pct": 10, "churn_pct": 5},
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, dict)

    def test_run_scenario_defaults(self, client):
        resp = client.post(
            "/api/v1/lifecycle/scenario",
            json={"base_price": 10000.0, "base_clients": 10},
        )
        assert resp.status_code == 200


class TestOfferBrand:
    def test_generate_brand_name(self, client):
        resp = client.post(
            "/api/v1/lifecycle/brand/name",
            json={
                "offer_data": {
                    "name": "Ops Service",
                    "pain_category": "Coordination",
                    "delivery_model": "done_for_you",
                },
            },
        )
        assert resp.status_code == 200

    def test_generate_brand_positioning(self, client):
        resp = client.post(
            "/api/v1/lifecycle/brand/positioning",
            json={
                "name": "ConciergeOps",
                "offer_data": {
                    "pain_category": "Coordination",
                    "delivery_model": "done_for_you",
                },
            },
        )
        assert resp.status_code == 200


class TestMobileAccess:
    def test_get_pending_approvals(self, authed_client):
        resp = authed_client.get("/api/v1/lifecycle/mobile/approvals")
        assert resp.status_code == 200

    def test_get_active_alerts(self, authed_client):
        resp = authed_client.get("/api/v1/lifecycle/mobile/alerts")
        assert resp.status_code == 200
