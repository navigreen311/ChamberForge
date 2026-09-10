"""Integration tests for the Qualify API - validation, guardrails, risk queue.

P-13 gated all twelve qualify routes, so these use `authed_client`. They
previously ran anonymously and passed, which is what the auth-coverage guard
was counting.

`TestAnonymousAccess` at the bottom is the half that was missing: asserting
that an unauthenticated caller is refused. Without it, this file would pass
just as happily if the dependency were removed again.
"""
import uuid

WORKSPACE_ID = str(uuid.uuid4())


class TestValidation:
    def test_validate_problem(self, authed_client):
        problem_id = str(uuid.uuid4())
        resp = authed_client.post(f"/api/v1/qualify/validate/{problem_id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["problem_id"] == problem_id
        assert "validation" in data
        # P-04: with no API key the validator abstains rather than
        # returning a scorecard it did not compute. The endpoint surfaces
        # that marked result, which is the contract the UI renders.
        validation = data["validation"]
        assert validation["degraded"] is True
        assert "is_real" not in validation

    def test_validate_with_invalid_uuid(self, authed_client):
        resp = authed_client.post("/api/v1/qualify/validate/not-a-uuid")
        assert resp.status_code == 422


class TestBuyerProfile:
    def test_generate_buyer_profile(self, authed_client):
        resp = authed_client.post(
            "/api/v1/qualify/buyer-profile",
            json={
                "wealth_tier": "UHNWI",
                "life_stage": "Peak",
                "pain_category": "Coordination",
            },
        )
        assert resp.status_code == 200
        assert "profile" in resp.json()

    def test_buyer_profile_missing_fields(self, authed_client):
        resp = authed_client.post(
            "/api/v1/qualify/buyer-profile",
            json={"wealth_tier": "UHNWI"},
        )
        assert resp.status_code == 422


class TestGuardrails:
    def test_guardrails_check(self, authed_client):
        resp = authed_client.post(
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

    def test_guardrails_check_empty_offer(self, authed_client):
        resp = authed_client.post(
            "/api/v1/qualify/guardrails-check",
            json={"offer_data": {}},
        )
        assert resp.status_code == 200


class TestFeasibility:
    def test_assess_feasibility(self, authed_client):
        resp = authed_client.post(
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
    def test_get_geo_rules(self, authed_client):
        resp = authed_client.get("/api/v1/qualify/geo-rules/US")
        assert resp.status_code == 200

    def test_geo_compliance_check(self, authed_client):
        resp = authed_client.post(
            "/api/v1/qualify/geo-compliance",
            json={"jurisdictions": ["US", "UK", "CH"]},
        )
        assert resp.status_code == 200
        assert "compliance" in resp.json()


class TestRiskQueue:
    def test_get_empty_risk_queue(self, authed_client):
        # P-13: workspace_id was a query parameter, so any caller could
        # list another firm's pending risk reviews by naming it. It now
        # comes from the session.
        resp = authed_client.get("/api/v1/qualify/risk-queue")
        assert resp.status_code == 200
        data = resp.json()
        assert "items" in data
        assert isinstance(data["items"], list)

    def test_approve_nonexistent_risk_item(self, authed_client):
        fake_id = str(uuid.uuid4())
        resp = authed_client.post(
            f"/api/v1/qualify/risk-queue/{fake_id}/approve",
            # P-13: reviewer_id was caller-supplied and written straight
            # onto the review record, so an approval could be attributed to
            # anyone. It now comes from the session.
            json={"notes": "Approved after review"},
        )
        assert resp.status_code == 404


class TestFounderReadiness:
    def test_assess_founder_readiness(self, authed_client):
        resp = authed_client.post(
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


class TestAnonymousAccess:
    """No qualify route may be reached without a session.

    The risk-queue routes matter most: they read and write compliance
    decisions, and approve/reject write a reviewer's name onto a permanent
    record.
    """

    def test_validation_rejects_anonymous(self, client):
        resp = client.post(f"/api/v1/qualify/validate/{uuid.uuid4()}")
        assert resp.status_code in (401, 403)

    def test_risk_queue_rejects_anonymous(self, client):
        resp = client.get("/api/v1/qualify/risk-queue")
        assert resp.status_code in (401, 403)

    def test_risk_approval_rejects_anonymous(self, client):
        resp = client.post(
            f"/api/v1/qualify/risk-queue/{uuid.uuid4()}/approve",
            json={"notes": "Approved"},
        )
        assert resp.status_code in (401, 403), (
            "an anonymous caller could approve a compliance item"
        )

    def test_guardrails_rejects_anonymous(self, client):
        resp = client.post(
            "/api/v1/qualify/guardrails-check", json={"offer_data": {}}
        )
        assert resp.status_code in (401, 403)
