"""CSRF (Cross-Site Request Forgery) protection tests.

Verify that the CORS middleware rejects cross-origin state-changing requests.
"""
from fastapi.testclient import TestClient


class TestCORSOriginEnforcement:
    """Verify CORS middleware restricts cross-origin requests."""

    def test_preflight_from_allowed_origin(self, client: TestClient):
        """OPTIONS preflight from allowed origin should include CORS headers."""
        resp = client.options(
            "/api/v1/problems/",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Authorization, Content-Type",
            },
        )
        assert resp.headers.get("access-control-allow-origin") == "http://localhost:3000"

    def test_preflight_from_disallowed_origin(self, client: TestClient):
        """OPTIONS preflight from disallowed origin should not include CORS allow headers."""
        resp = client.options(
            "/api/v1/problems/",
            headers={
                "Origin": "https://evil-site.com",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Authorization, Content-Type",
            },
        )
        allow_origin = resp.headers.get("access-control-allow-origin")
        assert allow_origin is None or allow_origin != "https://evil-site.com", (
            "CORS should not allow requests from untrusted origins"
        )

    def test_post_from_disallowed_origin_lacks_cors_headers(self, client: TestClient, auth_headers: dict):
        """POST from a disallowed origin should not include CORS allow-origin header."""
        headers = {**auth_headers, "Origin": "https://evil-site.com"}
        resp = client.post(
            "/api/v1/problems/",
            json={
                "title": "CSRF test",
                "description": "Testing CSRF protection",
                "wealth_tier": "hnw",
                "pain_category": "tax_optimization",
            },
            headers=headers,
        )
        allow_origin = resp.headers.get("access-control-allow-origin")
        assert allow_origin is None or allow_origin != "https://evil-site.com"

    def test_credentials_not_allowed_for_wildcard(self, client: TestClient):
        """If allow_origins were '*', credentials should not be allowed (browser enforces this)."""
        resp = client.options(
            "/api/v1/problems/",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
            },
        )
        allow_origin = resp.headers.get("access-control-allow-origin", "")
        # When credentials are allowed, origin must be specific, not '*'
        if resp.headers.get("access-control-allow-credentials") == "true":
            assert allow_origin != "*", (
                "CORS must not combine allow-credentials with wildcard origin"
            )
