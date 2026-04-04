"""Integration tests for the Compliance API — consent lifecycle and audit trail."""
import uuid

import pytest

CLIENT_ID = str(uuid.uuid4())


class TestConsentLifecycle:
    def test_grant_consent(self, authed_client):
        resp = authed_client.post(
            "/api/v1/compliance/consent",
            json={
                "client_id": CLIENT_ID,
                "consent_type": "data_processing",
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "active"
        assert data["consent_type"] == "data_processing"
        assert data["client_id"] == CLIENT_ID

    def test_grant_consent_with_nda(self, authed_client):
        resp = authed_client.post(
            "/api/v1/compliance/consent",
            json={
                "client_id": CLIENT_ID,
                "consent_type": "nda",
                "nda_url": "https://docs.example.com/nda-signed.pdf",
            },
        )
        assert resp.status_code == 200
        assert resp.json()["nda_document_url"] == "https://docs.example.com/nda-signed.pdf"

    def test_grant_consent_invalid_type(self, authed_client):
        resp = authed_client.post(
            "/api/v1/compliance/consent",
            json={
                "client_id": CLIENT_ID,
                "consent_type": "invalid_type",
            },
        )
        assert resp.status_code == 422

    def test_check_consent_active(self, authed_client):
        # Grant consent first
        authed_client.post(
            "/api/v1/compliance/consent",
            json={
                "client_id": CLIENT_ID,
                "consent_type": "marketing",
            },
        )
        resp = authed_client.get(
            f"/api/v1/compliance/consent/check/{CLIENT_ID}/marketing"
        )
        assert resp.status_code == 200
        assert resp.json()["active"] is True

    def test_check_consent_not_granted(self, authed_client):
        new_client = str(uuid.uuid4())
        resp = authed_client.get(
            f"/api/v1/compliance/consent/check/{new_client}/data_processing"
        )
        assert resp.status_code == 200
        assert resp.json()["active"] is False

    def test_revoke_consent(self, authed_client):
        # Grant
        grant = authed_client.post(
            "/api/v1/compliance/consent",
            json={
                "client_id": CLIENT_ID,
                "consent_type": "third_party_sharing",
            },
        )
        consent_id = grant.json()["id"]

        # Revoke
        resp = authed_client.post(
            f"/api/v1/compliance/consent/{consent_id}/revoke",
            json={"reason": "Client requested data deletion"},
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "revoked"
        assert resp.json()["revoked_at"] is not None

    def test_revoke_already_revoked(self, authed_client):
        # Grant and revoke
        grant = authed_client.post(
            "/api/v1/compliance/consent",
            json={
                "client_id": str(uuid.uuid4()),
                "consent_type": "data_processing",
            },
        )
        consent_id = grant.json()["id"]
        authed_client.post(
            f"/api/v1/compliance/consent/{consent_id}/revoke",
            json={"reason": "First revoke"},
        )

        # Try to revoke again
        resp = authed_client.post(
            f"/api/v1/compliance/consent/{consent_id}/revoke",
            json={"reason": "Second revoke"},
        )
        assert resp.status_code == 404  # already revoked raises ValueError -> 404

    def test_revoke_nonexistent_consent(self, authed_client):
        fake_id = str(uuid.uuid4())
        resp = authed_client.post(
            f"/api/v1/compliance/consent/{fake_id}/revoke",
            json={"reason": "test"},
        )
        assert resp.status_code == 404

    def test_check_consent_after_revoke(self, authed_client):
        cid = str(uuid.uuid4())
        # Grant
        grant = authed_client.post(
            "/api/v1/compliance/consent",
            json={
                "client_id": cid,
                "consent_type": "data_processing",
            },
        )
        consent_id = grant.json()["id"]

        # Check active
        check1 = authed_client.get(f"/api/v1/compliance/consent/check/{cid}/data_processing")
        assert check1.json()["active"] is True

        # Revoke
        authed_client.post(
            f"/api/v1/compliance/consent/{consent_id}/revoke",
            json={"reason": "Test revoke"},
        )

        # Check again — should be false
        check2 = authed_client.get(f"/api/v1/compliance/consent/check/{cid}/data_processing")
        assert check2.json()["active"] is False


class TestConsentQuery:
    def test_get_client_consents(self, authed_client):
        cid = str(uuid.uuid4())
        authed_client.post(
            "/api/v1/compliance/consent",
            json={
                "client_id": cid,
                "consent_type": "data_processing",
            },
        )
        authed_client.post(
            "/api/v1/compliance/consent",
            json={
                "client_id": cid,
                "consent_type": "marketing",
            },
        )

        resp = authed_client.get(f"/api/v1/compliance/consent/client/{cid}")
        assert resp.status_code == 200
        records = resp.json()
        assert len(records) >= 2
        types = {r["consent_type"] for r in records}
        assert "data_processing" in types
        assert "marketing" in types

    def test_get_deletion_candidates(self, authed_client):
        resp = authed_client.get(
            f"/api/v1/compliance/consent/deletion-candidates"
        )
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


class TestExplainability:
    def test_generate_explainability_report(self, authed_client):
        resp = authed_client.post(
            "/api/v1/compliance/explainability",
            json={
                "agent_name": "ValidatorAI",
                "input_data": {"problem_id": "123", "title": "Test problem"},
                "output_data": {"is_real": True, "score": 8.5},
                "sources_used": [{"url": "https://example.com", "type": "report"}],
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, dict)


class TestAuditTrail:
    def test_get_comms_audit_trail(self, authed_client):
        resp = authed_client.get(
            f"/api/v1/compliance/comms/audit-trail"
        )
        assert resp.status_code == 200
