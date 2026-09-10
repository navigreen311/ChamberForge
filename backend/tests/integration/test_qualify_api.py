"""Integration tests for the Qualify API — validation, guardrails, risk queue."""
import uuid

WORKSPACE_ID = str(uuid.uuid4())


class TestValidation:
    def test_validate_problem(self, client):
        problem_id = str(uuid.uuid4())
        resp = client.post(f"/api/v1/qualify/validate/{problem_id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["problem_id"] == problem_id
        assert "validation" in data
        # Mock validator returns a structured scorecard
        validation = data["validation"]
        assert "is_real" in validation or "overall_score" in validation

    def test_validate_with_invalid_uuid(self, client):
        resp = client.post("/api/v1/qualify/validate/not-a-uuid")
        assert resp.status_code == 422


class TestBuyerProfile:
    def test_generate_buyer_profile(self, client):
        resp = client.post(
            "/api/v1/qualify/buyer-profile",
            json={
                "wealth_tier": "UHNWI",
                "life_stage": "Peak",
                "pain_category": "Coordination",
            },
        )
        assert resp.status_code == 200
        assert "profile" in resp.json()

    def test_buyer_profile_missing_fields(self, client):
        resp = client.post(
            "/api/v1/qualify/buyer-profile",
            json={"wealth_tier": "UHNWI"},
        )
        assert resp.status_code == 422


class TestGuardrails:
    def test_guardrails_check(self, client):
        resp = client.post(
            "/api/v1/qualify/guardrails-check",
            json={
                "offer_data": {
                    "name": "Test Offer",
                    "delivery_model": "done_for_you",
                    "pricing_model": {"base_fee": 15000},
                },
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        # GuardrailsEngine returns a result dict
        assert isinstance(data, dict)

    def test_guardrails_check_empty_offer(self, client):
        resp = client.post(
            "/api/v1/qualify/guardrails-check",
            json={"offer_data": {}},
        )
        assert resp.status_code == 200


class TestFeasibility:
    def test_assess_feasibility(self, client):
        resp = client.post(
            "/api/v1/qualify/feasibility",
            json={
                "monthly_price": 15000.0,
                "costs": {"staff": 5000, "tech": 1000},
                "volume": 10,
                "delivery_model": "done_for_you",
                "num_services": 5,
                "pain_category": "Coordination",
                "compliance_risk": "Low",
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "margins" in data
        assert "complexity_score" in data
        assert "liability" in data


class TestGeoIntelligence:
    def test_get_geo_rules(self, client):
        resp = client.get("/api/v1/qualify/geo-rules/US")
        assert resp.status_code == 200

    def test_geo_compliance_check(self, client):
        resp = client.post(
            "/api/v1/qualify/geo-compliance",
            json={"jurisdictions": ["US", "UK", "CH"]},
        )
        assert resp.status_code == 200
        assert "compliance" in resp.json()


class TestRiskQueue:
    def test_get_empty_risk_queue(self, client):
        resp = client.get(
            f"/api/v1/qualify/risk-queue?workspace_id={WORKSPACE_ID}"
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "items" in data
        assert isinstance(data["items"], list)

    def test_approve_nonexistent_risk_item(self, client):
        fake_id = str(uuid.uuid4())
        resp = client.post(
            f"/api/v1/qualify/risk-queue/{fake_id}/approve",
            json={
                "reviewer_id": str(uuid.uuid4()),
                "notes": "Approved after review",
            },
        )
        assert resp.status_code == 404


class TestFounderReadiness:
    def test_assess_founder_readiness(self, client):
        resp = client.post(
            "/api/v1/qualify/founder-readiness",
            json={
                "skills": {"operations": 8, "sales": 6, "tech": 7},
                "credentials": ["CPA", "CFP"],
                "network_score": 75,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, dict)
