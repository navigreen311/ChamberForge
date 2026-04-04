"""Tests for enhanced health check endpoints."""
import sys
from unittest.mock import MagicMock, patch

import fastapi
import pytest
import sqlalchemy
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


class TestBasicHealth:
    """Test /api/v1/health/ base endpoint."""

    def test_health_returns_healthy(self, client):
        resp = client.get("/api/v1/health/")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "healthy"
        assert data["version"] == "0.4.0"


class TestLiveness:
    """Test /api/v1/health/live endpoint."""

    def test_live_returns_alive(self, client):
        resp = client.get("/api/v1/health/live")
        assert resp.status_code == 200
        assert resp.json()["status"] == "alive"


class TestReadiness:
    """Test /api/v1/health/ready endpoint with detailed checks."""

    def test_ready_structure_has_checks_and_timestamp(self, client):
        """Response always has status, checks dict, and timestamp."""
        resp = client.get("/api/v1/health/ready")
        assert resp.status_code == 200
        data = resp.json()
        assert "status" in data
        assert "checks" in data
        assert "timestamp" in data
        # Should have all expected keys
        for key in ("database", "redis", "elasticsearch", "anthropic", "stripe", "s3"):
            assert key in data["checks"], f"Missing check: {key}"

    def test_ready_db_up(self, client):
        """When DB is reachable, database check is up with latency."""
        mock_conn = MagicMock()
        mock_engine = MagicMock()
        mock_engine.connect.return_value.__enter__ = MagicMock(return_value=mock_conn)
        mock_engine.connect.return_value.__exit__ = MagicMock(return_value=False)

        with patch("app.api.v1.health.text"):
            with patch("app.db.session.engine", mock_engine):
                resp = client.get("/api/v1/health/ready")

        data = resp.json()
        assert data["checks"]["database"]["status"] == "up"
        assert "latency_ms" in data["checks"]["database"]
        assert data["status"] == "ready"

    def test_ready_db_down(self, client):
        """When DB is unreachable, status is not_ready and error is reported."""
        with patch("app.db.session.engine") as mock_engine:
            mock_engine.connect.side_effect = Exception("connection refused")
            resp = client.get("/api/v1/health/ready")

        data = resp.json()
        assert data["checks"]["database"]["status"] == "down"
        assert "error" in data["checks"]["database"]
        assert "connection refused" in data["checks"]["database"]["error"]
        assert data["status"] == "not_ready"

    def test_ready_api_keys_configured(self, client):
        """Anthropic/Stripe/S3 report configured when keys are set."""
        with patch("app.api.v1.health.settings") as mock_settings:
            mock_settings.ANTHROPIC_API_KEY = "sk-test"
            mock_settings.STRIPE_SECRET_KEY = "sk_test_123"
            mock_settings.AWS_ACCESS_KEY_ID = "AKIA..."
            mock_settings.REDIS_URL = "redis://localhost:6379"
            mock_settings.ELASTICSEARCH_URL = "http://localhost:9200"
            # DB/Redis/ES will fail, but API key checks should still work
            resp = client.get("/api/v1/health/ready")

        data = resp.json()
        assert data["checks"]["anthropic"]["status"] == "configured"
        assert data["checks"]["stripe"]["status"] == "configured"
        assert data["checks"]["s3"]["status"] == "configured"

    def test_ready_api_keys_not_configured(self, client):
        """Anthropic/Stripe/S3 report not_configured when keys are empty."""
        with patch("app.api.v1.health.settings") as mock_settings:
            mock_settings.ANTHROPIC_API_KEY = ""
            mock_settings.STRIPE_SECRET_KEY = ""
            mock_settings.AWS_ACCESS_KEY_ID = ""
            mock_settings.REDIS_URL = "redis://localhost:6379"
            mock_settings.ELASTICSEARCH_URL = "http://localhost:9200"
            resp = client.get("/api/v1/health/ready")

        data = resp.json()
        assert data["checks"]["anthropic"]["status"] == "not_configured"
        assert data["checks"]["stripe"]["status"] == "not_configured"
        assert data["checks"]["s3"]["status"] == "not_configured"


class TestDependencies:
    """Test /api/v1/health/dependencies endpoint."""

    def test_dependencies_returns_versions(self, client):
        resp = client.get("/api/v1/health/dependencies")
        assert resp.status_code == 200
        data = resp.json()
        assert data["python"] == sys.version
        assert data["fastapi"] == fastapi.__version__
        assert data["sqlalchemy"] == sqlalchemy.__version__
        assert data["app_version"] == "0.4.0"
        assert "environment" in data

    def test_dependencies_environment_value(self, client):
        """Environment comes from settings."""
        with patch("app.api.v1.health.settings") as mock_settings:
            mock_settings.APP_ENV = "production"
            resp = client.get("/api/v1/health/dependencies")

        data = resp.json()
        assert data["environment"] == "production"
