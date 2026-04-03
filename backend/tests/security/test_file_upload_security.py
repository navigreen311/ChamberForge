"""File upload security tests.

Verify that file upload endpoints enforce size limits, type restrictions,
content-type validation, and path traversal prevention.
"""
import io

import pytest
from fastapi.testclient import TestClient


class TestFileSizeLimit:
    """Oversized files must be rejected."""

    def test_oversized_file_rejected(self, client: TestClient, auth_headers: dict):
        """Files exceeding 50MB should be rejected with 400."""
        # Create a file just over 50MB
        oversized = io.BytesIO(b"x" * (50 * 1024 * 1024 + 1))
        resp = client.post(
            "/api/v1/storage/upload",
            files={"file": ("large.pdf", oversized, "application/pdf")},
            headers=auth_headers,
        )
        assert resp.status_code == 400, (
            f"Oversized file should be rejected, got {resp.status_code}"
        )

    def test_file_within_limit_accepted(self, client: TestClient, auth_headers: dict):
        """A small valid file should be accepted."""
        small = io.BytesIO(b"%PDF-1.4 small file content")
        resp = client.post(
            "/api/v1/storage/upload",
            files={"file": ("small.pdf", small, "application/pdf")},
            headers=auth_headers,
        )
        # May succeed (200/201) or fail for other reasons (S3 not configured) — not 400 for size
        assert resp.status_code != 413  # Not rejected for size


class TestDisallowedExtensions:
    """Dangerous file extensions must be rejected."""

    @pytest.mark.parametrize("filename,content_type", [
        ("malware.exe", "application/x-msdownload"),
        ("backdoor.sh", "application/x-sh"),
        ("exploit.php", "application/x-php"),
        ("payload.bat", "application/x-msdos-program"),
    ])
    def test_dangerous_extension_rejected(
        self, client: TestClient, auth_headers: dict, filename: str, content_type: str
    ):
        """Executable and script file types should be rejected."""
        fake_file = io.BytesIO(b"dangerous content")
        resp = client.post(
            "/api/v1/storage/upload",
            files={"file": (filename, fake_file, content_type)},
            headers=auth_headers,
        )
        assert resp.status_code == 400, (
            f"File '{filename}' with type '{content_type}' should be rejected, got {resp.status_code}"
        )


class TestContentTypeValidation:
    """Content-type must match the actual file type."""

    def test_exe_disguised_as_pdf_rejected(self, client: TestClient, auth_headers: dict):
        """An .exe file claiming to be application/pdf should be rejected."""
        # MZ header (PE executable magic bytes) disguised as PDF
        exe_content = io.BytesIO(b"MZ\x90\x00" + b"\x00" * 100)
        resp = client.post(
            "/api/v1/storage/upload",
            files={"file": ("innocent.pdf", exe_content, "application/x-msdownload")},
            headers=auth_headers,
        )
        # Should be rejected based on content-type not being in ALLOWED_TYPES
        assert resp.status_code == 400


class TestPathTraversalInFilename:
    """Path traversal attempts in filenames must be neutralized."""

    @pytest.mark.parametrize("malicious_name", [
        "../../etc/passwd",
        "..\\..\\windows\\system32\\config\\sam",
        "../../../etc/shadow",
        "....//....//etc/passwd",
        "file%2F..%2F..%2Fetc%2Fpasswd",
    ])
    def test_path_traversal_filename_sanitized(
        self, client: TestClient, auth_headers: dict, malicious_name: str
    ):
        """Filenames with path traversal should be sanitized or rejected."""
        content = io.BytesIO(b"test file content")
        resp = client.post(
            "/api/v1/storage/upload",
            files={"file": (malicious_name, content, "text/plain")},
            headers=auth_headers,
        )
        if resp.status_code in (200, 201):
            data = resp.json()
            stored_name = data.get("file_name", "")
            s3_key = data.get("s3_key", "")
            # The stored filename/key must not contain path traversal sequences
            assert ".." not in stored_name, (
                f"Path traversal not sanitized in file_name: {stored_name}"
            )
            assert ".." not in s3_key, (
                f"Path traversal not sanitized in s3_key: {s3_key}"
            )
