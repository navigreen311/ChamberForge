"""Verify the FastAPI app boots correctly and all routes are registered."""
import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client():
    # Import inside fixture to catch import errors
    from app.main import app
    return TestClient(app)


def test_app_imports():
    """App module imports without error."""
    from app.main import app
    assert app is not None
    assert app.title == "ChamberForge API"


def test_health_endpoint(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "healthy"


def test_docs_endpoint(client):
    r = client.get("/api/docs")
    assert r.status_code == 200


def test_all_routers_registered(client):
    """Verify all expected route prefixes exist."""
    routes = [r.path for r in client.app.routes]
    expected_prefixes = [
        "/api/v1/auth",
        "/api/v1/users",
        "/api/v1/workspaces",
        "/api/v1/problems",
        "/api/v1/discovery",
        "/api/v1/evidence",
        "/api/v1/qualify",
        "/api/v1/offers",
        "/api/v1/build",
        "/api/v1/household",
        "/api/v1/billing",
        "/api/v1/sell",
        "/api/v1/command",
        "/api/v1/compliance",
        "/api/v1/lifecycle",
        "/api/v1/polish",
        "/api/v1/primitives",
        "/api/v1/admin",
        "/api/v1/playbooks",
        "/api/v1/voiceforge",
        "/api/v1/visionaudio",
        "/api/v1/search",
        "/api/v1/notifications",
        "/api/v1/email",
        "/api/v1/storage",
        "/api/v1/exports",
        "/api/v1/jobs",
        "/api/v1/health",
        "/api/v1/metrics",
        "/api/v1/security",
        "/api/v1/profile",
        "/api/v1/workspace-settings",
        "/api/v1/mfa",
        "/api/v1/ontology",
        "/api/v1/community",
        "/api/v1/onboarding",
        "/api/v1/portal",
    ]
    for prefix in expected_prefixes:
        assert any(prefix in r for r in routes), f"Missing route prefix: {prefix}"


def test_middleware_stack(client):
    """Verify security headers are set."""
    r = client.get("/api/health")
    # Check for security-related headers (case-insensitive)
    lower_headers = {k.lower(): v for k, v in r.headers.items()}
    assert "x-request-id" in lower_headers or "x-content-type-options" in lower_headers


def test_openapi_schema(client):
    r = client.get("/openapi.json")
    assert r.status_code == 200
    schema = r.json()
    assert schema["info"]["title"] == "ChamberForge API"
    assert len(schema["paths"]) > 50  # Should have many endpoints
