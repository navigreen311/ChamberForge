"""Integration tests for the Evidence API — CRUD, linking, analyst queue."""
import uuid


def _make_evidence(client, **overrides):
    """Helper to create an evidence record."""
    payload = {
        "source_url": f"https://example.com/{uuid.uuid4().hex[:8]}",
        "source_type": "industry_report",
        "publication_date": "2025-06-15",
        "credibility_score": 7.0,
        "extracted_claims": [{"claim_text": "Test claim", "confidence": 0.9, "category": "factual"}],
        "contradiction_flags": [],
    }
    payload.update(overrides)
    return client.post("/api/v1/evidence/", json=payload)


class TestEvidenceCRUD:
    def test_create_evidence(self, authed_client):
        resp = _make_evidence(authed_client)
        assert resp.status_code == 201
        data = resp.json()
        assert data["source_type"] == "industry_report"
        assert data["credibility_score"] == 7.0

    def test_get_evidence_by_id(self, authed_client):
        create = _make_evidence(authed_client)
        eid = create.json()["id"]

        resp = authed_client.get(f"/api/v1/evidence/{eid}")
        assert resp.status_code == 200
        assert resp.json()["id"] == eid

    def test_get_evidence_not_found(self, authed_client):
        fake_id = str(uuid.uuid4())
        resp = authed_client.get(f"/api/v1/evidence/{fake_id}")
        assert resp.status_code == 404

    def test_update_evidence(self, authed_client):
        create = _make_evidence(authed_client)
        eid = create.json()["id"]

        resp = authed_client.put(
            f"/api/v1/evidence/{eid}",
            json={"credibility_score": 9.0},
        )
        assert resp.status_code == 200
        assert resp.json()["credibility_score"] == 9.0

    def test_update_nonexistent_evidence(self, authed_client):
        fake_id = str(uuid.uuid4())
        resp = authed_client.put(
            f"/api/v1/evidence/{fake_id}",
            json={"credibility_score": 5.0},
        )
        assert resp.status_code == 404

    def test_delete_evidence(self, authed_client):
        create = _make_evidence(authed_client)
        eid = create.json()["id"]

        resp = authed_client.delete(f"/api/v1/evidence/{eid}")
        assert resp.status_code == 204

        # Verify gone
        resp2 = authed_client.get(f"/api/v1/evidence/{eid}")
        assert resp2.status_code == 404

    def test_delete_nonexistent_evidence(self, authed_client):
        fake_id = str(uuid.uuid4())
        resp = authed_client.delete(f"/api/v1/evidence/{fake_id}")
        assert resp.status_code == 404

    def test_duplicate_source_url_rejected(self, authed_client):
        url = f"https://example.com/unique-{uuid.uuid4().hex[:8]}"
        resp1 = _make_evidence(authed_client, source_url=url)
        assert resp1.status_code == 201

        resp2 = _make_evidence(authed_client, source_url=url)
        assert resp2.status_code == 409
        assert "Duplicate" in resp2.json().get("message", resp2.json().get("detail", ""))


class TestEvidenceList:
    def test_list_evidence_with_workspace_filter(self, authed_client):
        _make_evidence(authed_client)
        resp = authed_client.get("/api/v1/evidence/")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)
        assert len(resp.json()) >= 1

    def test_list_evidence_by_source_type(self, authed_client):
        _make_evidence(authed_client, source_type="regulatory")
        resp = authed_client.get("/api/v1/evidence/?source_type=regulatory")
        assert resp.status_code == 200
        for item in resp.json():
            assert item["source_type"] == "regulatory"

    def test_list_evidence_with_min_credibility(self, authed_client):
        _make_evidence(authed_client, credibility_score=2.0)
        _make_evidence(authed_client, credibility_score=9.0)
        resp = authed_client.get("/api/v1/evidence/?min_credibility=8.0")
        assert resp.status_code == 200
        for item in resp.json():
            assert item["credibility_score"] >= 8.0


class TestEvidenceLinking:
    def test_link_evidence_to_problem(self, authed_client):
        ev = _make_evidence(authed_client)
        eid = ev.json()["id"]
        # Use a fake problem_id (UUID format)
        pid = str(uuid.uuid4())

        resp = authed_client.post(f"/api/v1/evidence/{eid}/link/{pid}")
        assert resp.status_code == 200
        assert resp.json()["problem_id"] == pid

    def test_link_nonexistent_evidence(self, authed_client):
        fake_eid = str(uuid.uuid4())
        fake_pid = str(uuid.uuid4())
        resp = authed_client.post(f"/api/v1/evidence/{fake_eid}/link/{fake_pid}")
        assert resp.status_code == 404


class TestAnalystQueue:
    def test_analyst_queue_low_credibility(self, authed_client):
        _make_evidence(authed_client, credibility_score=3.0)
        resp = authed_client.get("/api/v1/evidence/analyst-queue")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)
        # At least the low-credibility item should appear
        scores = [e["credibility_score"] for e in resp.json()]
        assert any(s < 5.0 for s in scores)
