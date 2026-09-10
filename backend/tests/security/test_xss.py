"""XSS (Cross-Site Scripting) prevention tests.

Verify that HTML/script input is not reflected back unescaped in responses.
"""
from fastapi.testclient import TestClient

XSS_PAYLOADS = [
    "<script>alert('xss')</script>",
    '<img onerror=alert(1) src=x>',
    '"><script>document.cookie</script>',
    "javascript:alert('xss')",
]


class TestXSSProblemEndpoints:
    """XSS tests for problem title and description fields."""

    def test_problem_title_xss_not_executed(self, client: TestClient, auth_headers: dict):
        """Script tags in problem title should be stored as-is (escaped by frontend) or rejected."""
        payload = "<script>alert('xss')</script>"
        resp = client.post(
            "/api/v1/problems/",
            json={
                "title": payload,
                "description": "Safe description",
                "wealth_tier": "hnw",
                "pain_category": "tax_optimization",
            },
            headers=auth_headers,
        )
        if resp.status_code == 201:
            data = resp.json()
            # The response Content-Type must be application/json, not text/html
            assert "application/json" in resp.headers.get("content-type", "")
            # If stored, the title should be returned as data, not rendered
            assert data.get("title") == payload or "<script>" not in data.get("title", "")

    def test_problem_description_xss_escaped(self, client: TestClient, auth_headers: dict):
        """HTML in problem description should be treated as literal text in JSON responses."""
        payload = '<img onerror=alert(1) src=x>'
        resp = client.post(
            "/api/v1/problems/",
            json={
                "title": "Normal title",
                "description": payload,
                "wealth_tier": "hnw",
                "pain_category": "tax_optimization",
            },
            headers=auth_headers,
        )
        if resp.status_code == 201:
            assert "application/json" in resp.headers.get("content-type", "")


class TestXSSResponseHeaders:
    """Verify Content-Type and security headers prevent XSS rendering."""

    def test_api_responses_are_json(self, client: TestClient):
        """All API responses should have application/json content type."""
        resp = client.get("/api/health")
        content_type = resp.headers.get("content-type", "")
        assert "application/json" in content_type

    def test_x_content_type_options_nosniff(self, client: TestClient):
        """X-Content-Type-Options: nosniff prevents MIME type sniffing."""
        resp = client.get("/api/health")
        assert resp.headers.get("X-Content-Type-Options") == "nosniff"

    def test_content_security_policy_present(self, client: TestClient):
        """Content-Security-Policy header should restrict script sources."""
        resp = client.get("/api/health")
        csp = resp.headers.get("Content-Security-Policy", "")
        assert "default-src" in csp


class TestXSSNotificationBody:
    """XSS tests for notification endpoints."""

    def test_notification_body_with_script_tag(self, client: TestClient, auth_headers: dict):
        """Script tags in notification body should not be rendered as HTML."""
        resp = client.post(
            "/api/v1/notifications/",
            json={
                "title": "Test Notification",
                "body": "<script>alert('xss')</script>",
                "type": "info",
            },
            headers=auth_headers,
        )
        if resp.status_code in (200, 201):
            assert "application/json" in resp.headers.get("content-type", "")
