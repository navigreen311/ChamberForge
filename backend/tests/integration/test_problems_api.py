"""Integration tests for the Problems API — full CRUD and filtering."""
import pytest


class TestProblemsCRUD:
    def test_create_problem(self, authed_client):
        resp = authed_client.post(
            "/api/v1/problems/",
            json={
                "title": "Estate planning coordination gap",
                "description": "UHNW families lack a single coordination layer.",
                "wealth_tier": "uhnw",
                "pain_category": "Coordination",
                "urgency_score": 8,
            },
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == "Estate planning coordination gap"
        assert data["workspace_id"] == authed_client._test_workspace_id
        assert data["urgency_score"] == 8

    def test_list_problems_returns_created(self, authed_client):
        # Create a problem
        authed_client.post(
            "/api/v1/problems/",
            json={
                "title": "Privacy breach risk",
                "pain_category": "Privacy",
            },
        )
        resp = authed_client.get("/api/v1/problems/")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] >= 1
        titles = [p["title"] for p in data["items"]]
        assert "Privacy breach risk" in titles

    def test_get_problem_by_id(self, authed_client):
        create = authed_client.post(
            "/api/v1/problems/",
            json={"title": "Get by ID test"},
        )
        pid = create.json()["id"]

        resp = authed_client.get(f"/api/v1/problems/{pid}")
        assert resp.status_code == 200
        assert resp.json()["id"] == pid
        assert resp.json()["title"] == "Get by ID test"

    def test_get_problem_not_found(self, authed_client):
        resp = authed_client.get("/api/v1/problems/nonexistent-id-12345")
        assert resp.status_code == 404

    def test_update_problem_title(self, authed_client):
        create = authed_client.post(
            "/api/v1/problems/",
            json={"title": "Old Title"},
        )
        pid = create.json()["id"]

        resp = authed_client.put(
            f"/api/v1/problems/{pid}",
            json={"title": "New Title"},
        )
        assert resp.status_code == 200
        assert resp.json()["title"] == "New Title"

    def test_update_nonexistent_problem(self, authed_client):
        resp = authed_client.put(
            "/api/v1/problems/nonexistent-id-99999",
            json={"title": "Nope"},
        )
        assert resp.status_code == 404

    def test_delete_problem(self, authed_client):
        create = authed_client.post(
            "/api/v1/problems/",
            json={"title": "To Delete"},
        )
        pid = create.json()["id"]

        resp = authed_client.delete(f"/api/v1/problems/{pid}")
        assert resp.status_code == 204

        # Verify it is gone
        resp2 = authed_client.get(f"/api/v1/problems/{pid}")
        assert resp2.status_code == 404

    def test_delete_nonexistent_problem(self, authed_client):
        resp = authed_client.delete("/api/v1/problems/no-such-id-000")
        assert resp.status_code == 404


class TestProblemsFiltering:
    def test_filter_by_wealth_tier(self, authed_client):
        authed_client.post(
            "/api/v1/problems/",
            json={
                "title": "HNW problem",
                "wealth_tier": "hnw",
            },
        )
        authed_client.post(
            "/api/v1/problems/",
            json={
                "title": "UHNW problem",
                "wealth_tier": "uhnw",
            },
        )
        resp = authed_client.get("/api/v1/problems/?wealth_tier=hnw")
        assert resp.status_code == 200
        for item in resp.json()["items"]:
            assert item["wealth_tier"] == "hnw"

    def test_filter_by_pain_category(self, authed_client):
        authed_client.post(
            "/api/v1/problems/",
            json={
                "title": "Security concern",
                "pain_category": "Security",
            },
        )
        resp = authed_client.get("/api/v1/problems/?pain_category=Security")
        assert resp.status_code == 200
        for item in resp.json()["items"]:
            assert item["pain_category"] == "Security"


class TestTrendingProblems:
    def test_trending_returns_list(self, authed_client):
        authed_client.post(
            "/api/v1/problems/",
            json={
                "title": "Trending test",
                "urgency_score": 10,
            },
        )
        resp = authed_client.get("/api/v1/problems/trending?limit=5")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)
