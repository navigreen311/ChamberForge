"""Tests for security headers middleware."""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_all_security_headers_present():
    """Every response must include all 7 security headers."""
    resp = client.get("/api/health")
    assert resp.status_code == 200

    assert resp.headers["Content-Security-Policy"] == (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
        "style-src 'self' 'unsafe-inline'"
    )
    assert resp.headers["X-Frame-Options"] == "DENY"
    assert resp.headers["X-Content-Type-Options"] == "nosniff"
    assert resp.headers["Strict-Transport-Security"] == "max-age=31536000; includeSubDomains"
    assert resp.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"
    assert resp.headers["Permissions-Policy"] == "camera=(), microphone=(), geolocation=()"
    # X-Request-ID should be a valid UUID
    request_id = resp.headers["X-Request-ID"]
    assert len(request_id) == 36  # UUID with dashes


def test_request_id_unique_per_request():
    """Each request should receive a distinct X-Request-ID."""
    ids = {client.get("/api/health").headers["X-Request-ID"] for _ in range(5)}
    assert len(ids) == 5
