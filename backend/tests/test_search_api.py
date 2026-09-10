"""Tests for the /api/v1/search endpoints."""
from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

# Patch SearchService before importing the app so the router uses our mock.
_mock_service = MagicMock()
_mock_service.search = AsyncMock(return_value={
    "results": [{"id": "1", "index": "chamberforge_problems", "score": 1.0, "title": "Test"}],
    "total": 1,
    "page": 1,
    "size": 20,
})
_mock_service.health = AsyncMock(return_value={"status": "green", "number_of_nodes": 1, "active_shards": 5})
_mock_service.reindex_all = AsyncMock(return_value={"indexed": 0, "errors": 0})


@pytest.fixture(autouse=True)
def _patch_search_service():
    with patch("app.api.v1.search._get_service", return_value=_mock_service):
        yield


@pytest.fixture
def client():
    from app.main import app
    return TestClient(app)


def test_unified_search_returns_structure(client):
    resp = client.get("/api/v1/search/?q=test&index=problems")
    assert resp.status_code == 200
    body = resp.json()
    assert "results" in body
    assert "total" in body
    assert "page" in body
    assert "size" in body
    assert isinstance(body["results"], list)


def test_unified_search_all(client):
    resp = client.get("/api/v1/search/?q=hello&index=all")
    assert resp.status_code == 200
    body = resp.json()
    assert "results" in body


def test_search_health(client):
    resp = client.get("/api/v1/search/health")
    assert resp.status_code == 200
    body = resp.json()
    assert "status" in body


def test_reindex_endpoint(client):
    resp = client.post("/api/v1/search/reindex/chamberforge_problems")
    assert resp.status_code == 200
    body = resp.json()
    assert body["index"] == "chamberforge_problems"
    assert "indexed" in body
