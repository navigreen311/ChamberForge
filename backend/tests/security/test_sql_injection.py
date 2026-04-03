"""SQL injection prevention tests.

Verify that parameterized queries prevent injection on all text-input endpoints.
"""
import pytest
from fastapi.testclient import TestClient


SQL_PAYLOADS = [
    "' OR 1=1--",
    "'; DROP TABLE users;--",
    '" UNION SELECT * FROM users--',
]


class TestSQLInjectionProblems:
    """SQL injection tests for /api/v1/problems endpoints."""

    def test_create_problem_title_injection(self, client: TestClient, auth_headers: dict):
        """SQL payloads in problem title should be stored as literal strings, not executed."""
        for payload in SQL_PAYLOADS:
            resp = client.post(
                "/api/v1/problems/",
                json={
                    "title": payload,
                    "description": "Normal description",
                    "wealth_tier": "hnw",
                    "pain_category": "tax_optimization",
                },
                headers=auth_headers,
            )
            # Should succeed (201) or fail validation (422) — never 500
            assert resp.status_code in (201, 422), (
                f"Unexpected status {resp.status_code} for payload: {payload}"
            )

    def test_create_problem_description_injection(self, client: TestClient, auth_headers: dict):
        """SQL payloads in problem description should be treated as literal text."""
        for payload in SQL_PAYLOADS:
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
            assert resp.status_code in (201, 422), (
                f"Unexpected status {resp.status_code} for payload: {payload}"
            )


class TestSQLInjectionEvidence:
    """SQL injection tests for /api/v1/evidence endpoints."""

    def test_create_evidence_source_url_injection(self, client: TestClient, auth_headers: dict):
        """SQL payloads in evidence source_url should be stored safely."""
        for payload in SQL_PAYLOADS:
            resp = client.post(
                "/api/v1/evidence/",
                json={
                    "source_url": payload,
                    "source_type": "article",
                    "publication_date": "2025-01-01",
                    "credibility_score": 5.0,
                    "extracted_claims": [],
                },
                headers=auth_headers,
            )
            assert resp.status_code in (201, 409, 422), (
                f"Unexpected status {resp.status_code} for payload: {payload}"
            )

    def test_evidence_list_source_type_injection(self, client: TestClient, auth_headers: dict):
        """SQL payloads in evidence source_type filter should not cause errors."""
        for payload in SQL_PAYLOADS:
            resp = client.get(
                "/api/v1/evidence/",
                params={"source_type": payload},
                headers=auth_headers,
            )
            assert resp.status_code in (200, 422), (
                f"Unexpected status {resp.status_code} for payload: {payload}"
            )


class TestSQLInjectionSearch:
    """SQL injection tests for /api/v1/search endpoint."""

    def test_search_query_injection(self, client: TestClient):
        """SQL payloads in search query should be handled safely."""
        for payload in SQL_PAYLOADS:
            resp = client.get(
                "/api/v1/search/",
                params={"q": payload},
            )
            # Search may return 200 (empty results) or 500 if ES is down — never a DB error
            assert resp.status_code != 500 or "sql" not in resp.text.lower(), (
                f"Possible SQL injection for payload: {payload}"
            )

    def test_search_index_injection(self, client: TestClient):
        """SQL payloads in search index parameter should not cause SQL errors."""
        for payload in SQL_PAYLOADS:
            resp = client.get(
                "/api/v1/search/",
                params={"q": "test", "index": payload},
            )
            assert resp.status_code != 500 or "sql" not in resp.text.lower(), (
                f"Possible SQL injection via index param: {payload}"
            )


class TestSQLInjectionListEndpoints:
    """SQL injection tests for filter/list endpoints."""

    def test_problems_list_filter_injection(self, client: TestClient, auth_headers: dict):
        """SQL payloads in query parameters for list endpoints should be safe."""
        for payload in SQL_PAYLOADS:
            resp = client.get(
                "/api/v1/problems/",
                params={"wealth_tier": payload},
                headers=auth_headers,
            )
            # Should be 200 (ignored filter) or 422 (validation error) — never 500
            assert resp.status_code in (200, 422), (
                f"Unexpected status {resp.status_code} for payload: {payload}"
            )

    def test_get_problem_id_injection(self, client: TestClient, auth_headers: dict):
        """SQL payloads in path parameters should not cause SQL errors."""
        for payload in SQL_PAYLOADS:
            resp = client.get(
                f"/api/v1/problems/{payload}",
                headers=auth_headers,
            )
            # Should be 404 or 422, never a raw SQL error
            assert resp.status_code in (404, 422), (
                f"Unexpected status {resp.status_code} for payload: {payload}"
            )
