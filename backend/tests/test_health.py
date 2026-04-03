"""Tests for health check endpoints."""
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


class TestHealthEndpoints:
    """Test /api/v1/health endpoints."""

    def test_health_returns_healthy(self, client):
        resp = client.get("/api/v1/health/")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "healthy"
        assert data["version"] == "0.1.0"

    def test_live_returns_alive(self, client):
        resp = client.get("/api/v1/health/live")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "alive"

    def test_ready_with_all_services_down(self, client):
        """When no services are reachable, readiness returns degraded."""
        with patch("app.db.session.engine") as mock_engine:
            mock_engine.connect.side_effect = Exception("no db")
            resp = client.get("/api/v1/health/ready")

        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "degraded"
        assert "checks" in data
        assert data["checks"]["db"] is False

    def test_ready_with_db_healthy(self, client):
        """When DB is reachable, the db check is True."""
        mock_conn = MagicMock()
        mock_engine = MagicMock()
        mock_engine.connect.return_value.__enter__ = MagicMock(return_value=mock_conn)
        mock_engine.connect.return_value.__exit__ = MagicMock(return_value=False)

        with patch("app.db.session.engine", mock_engine):
            resp = client.get("/api/v1/health/ready")

        data = resp.json()
        assert data["checks"]["db"] is True

    def test_legacy_health_endpoint(self, client):
        """The old /api/health route still works."""
        resp = client.get("/api/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "healthy"
