"""Tests for database backup Celery tasks."""
import os
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch, call

import pytest


# ---------------------------------------------------------------------------
# automated_db_backup
# ---------------------------------------------------------------------------


class TestAutomatedDbBackup:
    """Tests for the automated_db_backup task."""

    @patch("app.jobs.tasks.backup_tasks.boto3")
    @patch("app.jobs.tasks.backup_tasks.subprocess")
    @patch("app.jobs.tasks.backup_tasks.settings")
    def test_successful_backup(self, mock_settings, mock_subprocess, mock_boto3):
        """Backup creates dump, uploads to S3, and rotates old backups."""
        from app.jobs.tasks.backup_tasks import automated_db_backup

        mock_settings.DATABASE_URL = "postgresql://localhost:5432/chamberforge"
        mock_settings.AWS_S3_BUCKET = "test-bucket"

        # Simulate successful pg_dump
        mock_subprocess.run.return_value = MagicMock(returncode=0, stderr="")

        # Mock S3 client
        mock_s3 = MagicMock()
        mock_boto3.client.return_value = mock_s3

        # Mock paginator for rotation — return empty (no old backups)
        mock_paginator = MagicMock()
        mock_paginator.paginate.return_value = [{"Contents": []}]
        mock_s3.get_paginator.return_value = mock_paginator

        # Create a temp file so os.path.getsize works
        import tempfile

        tmp_dir = tempfile.gettempdir()
        # We need the file to exist when getsize is called
        with patch("app.jobs.tasks.backup_tasks.os.path.getsize", return_value=1024):
            with patch("app.jobs.tasks.backup_tasks.os.path.exists", return_value=True):
                with patch("app.jobs.tasks.backup_tasks.os.remove"):
                    result = automated_db_backup()

        assert "filename" in result
        assert result["filename"].startswith("chamberforge_backup_")
        assert result["filename"].endswith(".sql.gz")
        assert result["s3_key"].startswith("backups/database/")
        assert result["size_bytes"] == 1024

        # Verify S3 upload was called
        mock_s3.upload_file.assert_called_once()
        upload_args = mock_s3.upload_file.call_args
        assert upload_args[0][1] == "test-bucket"

    @patch("app.jobs.tasks.backup_tasks.boto3")
    @patch("app.jobs.tasks.backup_tasks.subprocess")
    @patch("app.jobs.tasks.backup_tasks.settings")
    def test_pgdump_failure_retries(self, mock_settings, mock_subprocess, mock_boto3):
        """Task retries when pg_dump fails."""
        from app.jobs.tasks.backup_tasks import automated_db_backup

        mock_settings.DATABASE_URL = "postgresql://localhost:5432/chamberforge"
        mock_settings.AWS_S3_BUCKET = "test-bucket"

        mock_subprocess.run.return_value = MagicMock(
            returncode=1, stderr="connection refused"
        )

        with patch("app.jobs.tasks.backup_tasks.os.path.exists", return_value=False):
            with pytest.raises(Exception):
                # In eager mode, retry raises the exception
                automated_db_backup()

    @patch("app.jobs.tasks.backup_tasks.boto3")
    @patch("app.jobs.tasks.backup_tasks.subprocess")
    @patch("app.jobs.tasks.backup_tasks.settings")
    def test_empty_backup_retries(self, mock_settings, mock_subprocess, mock_boto3):
        """Task retries when backup file is empty."""
        from app.jobs.tasks.backup_tasks import automated_db_backup

        mock_settings.DATABASE_URL = "postgresql://localhost:5432/chamberforge"
        mock_settings.AWS_S3_BUCKET = "test-bucket"

        mock_subprocess.run.return_value = MagicMock(returncode=0, stderr="")

        with patch("app.jobs.tasks.backup_tasks.os.path.getsize", return_value=0):
            with patch("app.jobs.tasks.backup_tasks.os.path.exists", return_value=True):
                with patch("app.jobs.tasks.backup_tasks.os.remove"):
                    with pytest.raises(Exception):
                        automated_db_backup()


# ---------------------------------------------------------------------------
# verify_backup_integrity
# ---------------------------------------------------------------------------


class TestVerifyBackupIntegrity:
    """Tests for the verify_backup_integrity task."""

    @patch("app.jobs.tasks.backup_tasks.boto3")
    @patch("app.jobs.tasks.backup_tasks.subprocess")
    @patch("app.jobs.tasks.backup_tasks.settings")
    def test_valid_backup(self, mock_settings, mock_subprocess, mock_boto3):
        """Verification passes for a valid SQL dump."""
        from app.jobs.tasks.backup_tasks import verify_backup_integrity

        mock_settings.AWS_S3_BUCKET = "test-bucket"

        mock_s3 = MagicMock()
        mock_boto3.client.return_value = mock_s3

        mock_subprocess.run.return_value = MagicMock(
            returncode=0,
            stdout="-- PostgreSQL database dump\nCREATE TABLE users (\n",
        )

        with patch("app.jobs.tasks.backup_tasks.os.path.getsize", return_value=2048):
            with patch("app.jobs.tasks.backup_tasks.os.path.exists", return_value=True):
                with patch("app.jobs.tasks.backup_tasks.os.remove"):
                    result = verify_backup_integrity("backups/database/test.sql.gz")

        assert result["valid"] is True
        assert result["has_pg_dump_header"] is True
        assert result["has_create_statements"] is True
        assert result["s3_key"] == "backups/database/test.sql.gz"

    @patch("app.jobs.tasks.backup_tasks.boto3")
    @patch("app.jobs.tasks.backup_tasks.subprocess")
    @patch("app.jobs.tasks.backup_tasks.settings")
    def test_invalid_backup(self, mock_settings, mock_subprocess, mock_boto3):
        """Verification fails for corrupt/non-SQL content."""
        from app.jobs.tasks.backup_tasks import verify_backup_integrity

        mock_settings.AWS_S3_BUCKET = "test-bucket"

        mock_s3 = MagicMock()
        mock_boto3.client.return_value = mock_s3

        # Decompression fails
        mock_subprocess.run.return_value = MagicMock(
            returncode=1, stdout="", stderr="not in gzip format"
        )

        with patch("app.jobs.tasks.backup_tasks.os.path.getsize", return_value=100):
            with patch("app.jobs.tasks.backup_tasks.os.path.exists", return_value=True):
                with patch("app.jobs.tasks.backup_tasks.os.remove"):
                    result = verify_backup_integrity("backups/database/bad.sql.gz")

        assert result["valid"] is False
        assert "error" in result


# ---------------------------------------------------------------------------
# _rotate_old_backups
# ---------------------------------------------------------------------------


class TestRotateOldBackups:
    """Tests for the backup rotation helper."""

    def test_no_deletion_when_under_limit(self):
        """No backups deleted when count is under retention limit."""
        from app.jobs.tasks.backup_tasks import _rotate_old_backups

        mock_s3 = MagicMock()
        mock_paginator = MagicMock()
        mock_paginator.paginate.return_value = [
            {
                "Contents": [
                    {"Key": f"backups/database/backup_{i}.sql.gz", "LastModified": datetime(2026, 1, i + 1, tzinfo=timezone.utc), "Size": 1000}
                    for i in range(10)
                ]
            }
        ]
        mock_s3.get_paginator.return_value = mock_paginator

        deleted = _rotate_old_backups(mock_s3, "test-bucket")
        assert deleted == 0
        mock_s3.delete_objects.assert_not_called()

    def test_deletion_when_over_limit(self):
        """Old backups beyond retention count are deleted."""
        from app.jobs.tasks.backup_tasks import _rotate_old_backups, RETENTION_COUNT

        mock_s3 = MagicMock()
        total = RETENTION_COUNT + 5
        mock_paginator = MagicMock()
        mock_paginator.paginate.return_value = [
            {
                "Contents": [
                    {"Key": f"backups/database/backup_{i:03d}.sql.gz", "LastModified": datetime(2026, 1, 1, 0, i, tzinfo=timezone.utc), "Size": 1000}
                    for i in range(total)
                ]
            }
        ]
        mock_s3.get_paginator.return_value = mock_paginator

        deleted = _rotate_old_backups(mock_s3, "test-bucket")
        assert deleted == 5
        mock_s3.delete_objects.assert_called_once()
        delete_call = mock_s3.delete_objects.call_args
        assert len(delete_call[1]["Delete"]["Objects"]) == 5


# ---------------------------------------------------------------------------
# list_backups
# ---------------------------------------------------------------------------


class TestListBackups:
    """Tests for the list_backups helper."""

    @patch("app.jobs.tasks.backup_tasks.boto3")
    @patch("app.jobs.tasks.backup_tasks.settings")
    def test_list_backups_returns_sorted(self, mock_settings, mock_boto3):
        """list_backups returns backups sorted by date descending."""
        from app.jobs.tasks.backup_tasks import list_backups

        mock_settings.AWS_S3_BUCKET = "test-bucket"

        mock_s3 = MagicMock()
        mock_boto3.client.return_value = mock_s3
        mock_paginator = MagicMock()
        mock_paginator.paginate.return_value = [
            {
                "Contents": [
                    {"Key": "backups/database/old.sql.gz", "LastModified": datetime(2026, 1, 1, tzinfo=timezone.utc), "Size": 500},
                    {"Key": "backups/database/new.sql.gz", "LastModified": datetime(2026, 3, 1, tzinfo=timezone.utc), "Size": 1500},
                ]
            }
        ]
        mock_s3.get_paginator.return_value = mock_paginator

        result = list_backups(limit=10)
        assert len(result) == 2
        assert result[0]["filename"] == "new.sql.gz"
        assert result[1]["filename"] == "old.sql.gz"
