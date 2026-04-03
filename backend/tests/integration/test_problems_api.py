"""Integration tests for the Problems API — full CRUD and filtering."""
import pytest

WORKSPACE_ID = "default"


class TestProblemsCRUD:
    def test_create_problem(self, client):
        resp = client.post(
            "/api/v1/problems/",
            json={
                "title": "Estate planning coordination gap",
                "description": "UHNW families lack a single coordination layer.",
                "workspace_id": WORKSPACE_ID,
                "wealth_tier": "uhnw",
                "pain_category": "Coordination",
                "urgency_score": 8,
            },
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == "Estate planning coordination gap"
        assert data["workspace_id"] == WORKSPACE_ID
        assert data["urgency_score"] == 8

    def test_list_problems_returns_created(self, client):
        # Create a problem
        client.post(
            "/api/v1/problems/",
            json={
                "title": "Privacy breach risk",
                "workspace_id": WORKSPACE_ID,
                "pain_category": "Privacy",
            },
        )
        resp = client.get(f"/api/v1/problems/?workspace_id={WORKSPACE_ID}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] >= 1
        titles = [p["title"] for p in data["items"]]
        assert "Privacy breach risk" in titles

    def test_get_problem_by_id(self, client):
        create = client.post(
            "/api/v1/problems/",
            json={"title": "Get by ID test", "workspace_id": WORKSPACE_ID},
        )
        pid = create.json()["id"]

        resp = client.get(f"/api/v1/problems/{pid}")
        assert resp.status_code == 200
        assert resp.json()["id"] == pid
        assert resp.json()["title"] == "Get by ID test"

    def test_get_problem_not_found(self, client):
        resp = client.get("/api/v1/problems/nonexistent-id-12345")
        assert resp.status_code == 404

    def test_update_problem_title(self, client):
        create = client.post(
            "/api/v1/problems/",
            json={"title": "Old Title", "workspace_id": WORKSPACE_ID},
        )
        pid = create.json()["id"]

        resp = client.put(
            f"/api/v1/problems/{pid}",
            json={"title": "New Title"},
        )
        assert resp.status_code == 200
        assert resp.json()["title"] == "New Title"

    def test_update_nonexistent_problem(self, client):
        resp = client.put(
            "/api/v1/problems/nonexistent-id-99999",
            json={"title": "Nope"},
        )
        assert resp.status_code == 404

    def test_delete_problem(self, client):
        create = client.post(
            "/api/v1/problems/",
            json={"title": "To Delete", "workspace_id": WORKSPACE_ID},
        )
        pid = create.json()["id"]

        resp = client.delete(f"/api/v1/problems/{pid}")
        assert resp.status_code == 204

        # Verify it is gone
        resp2 = client.get(f"/api/v1/problems/{pid}")
        assert resp2.status_code == 404

    def test_delete_nonexistent_problem(self, client):
        resp = client.delete("/api/v1/problems/no-such-id-000")
        assert resp.status_code == 404


class TestProblemsFiltering:
    def test_filter_by_wealth_tier(self, client):
        client.post(
            "/api/v1/problems/",
            json={
                "title": "HNW problem",
                "workspace_id": WORKSPACE_ID,
                "wealth_tier": "hnw",
            },
        )
        client.post(
            "/api/v1/problems/",
            json={
                "title": "UHNW problem",
                "workspace_id": WORKSPACE_ID,
                "wealth_tier": "uhnw",
            },
        )
        resp = client.get(
            f"/api/v1/problems/?workspace_id={WORKSPACE_ID}&wealth_tier=hnw"
        )
        assert resp.status_code == 200
        for item in resp.json()["items"]:
            assert item["wealth_tier"] == "hnw"

    def test_filter_by_pain_category(self, client):
        client.post(
            "/api/v1/problems/",
            json={
                "title": "Security concern",
                "workspace_id": WORKSPACE_ID,
                "pain_category": "Security",
            },
        )
        resp = client.get(
            f"/api/v1/problems/?workspace_id={WORKSPACE_ID}&pain_category=Security"
        )
        assert resp.status_code == 200
        for item in resp.json()["items"]:
            assert item["pain_category"] == "Security"


class TestTrendingProblems:
    def test_trending_returns_list(self, client):
        client.post(
            "/api/v1/problems/",
            json={
                "title": "Trending test",
                "workspace_id": WORKSPACE_ID,
                "urgency_score": 10,
            },
        )
        resp = client.get(
            f"/api/v1/problems/trending?workspace_id={WORKSPACE_ID}&limit=5"
        )
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)
