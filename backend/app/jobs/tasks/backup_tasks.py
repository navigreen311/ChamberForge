"""Database backup tasks — automated S3 backup, integrity verification, rotation."""
import logging
import os
import subprocess
import tempfile
from datetime import datetime, timezone

import boto3

from app.core.config import settings
from app.jobs.celery_app import celery_app

logger = logging.getLogger(__name__)

S3_BACKUP_PREFIX = "backups/database/"
RETENTION_COUNT = 30


@celery_app.task(
    bind=True,
    name="app.jobs.tasks.backup_tasks.automated_db_backup",
    max_retries=3,
)
def automated_db_backup(self) -> dict:
    """Daily automated database backup to S3.

    1. pg_dump + gzip the database
    2. Upload compressed dump to S3
    3. Rotate old backups (keep last RETENTION_COUNT)
    4. Clean up local temp file
    """
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    filename = f"chamberforge_backup_{timestamp}.sql.gz"
    local_path = os.path.join(tempfile.gettempdir(), filename)

    try:
        # 1. pg_dump + gzip
        db_url = settings.DATABASE_URL
        cmd = f'pg_dump "{db_url}" | gzip > "{local_path}"'
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode != 0:
            logger.error("pg_dump failed: %s", result.stderr)
            raise self.retry(
                exc=RuntimeError(f"pg_dump failed: {result.stderr}"),
                countdown=300,
            )

        size_bytes = os.path.getsize(local_path)
        if size_bytes == 0:
            raise self.retry(
                exc=RuntimeError("Backup file is empty"),
                countdown=300,
            )

        logger.info("Backup dump created: %s (%d bytes)", filename, size_bytes)

        # 2. Upload to S3
        s3 = boto3.client("s3")
        s3_key = f"{S3_BACKUP_PREFIX}{filename}"
        s3.upload_file(local_path, settings.AWS_S3_BUCKET, s3_key)
        logger.info("Backup uploaded to s3://%s/%s", settings.AWS_S3_BUCKET, s3_key)

        # 3. Rotate old backups
        _rotate_old_backups(s3, settings.AWS_S3_BUCKET)

        return {
            "filename": filename,
            "s3_key": s3_key,
            "size_bytes": size_bytes,
            "timestamp": timestamp,
        }

    except self.MaxRetriesExceededError:
        logger.error("Backup failed after max retries")
        raise
    finally:
        # 4. Cleanup local file
        if os.path.exists(local_path):
            os.remove(local_path)


def _rotate_old_backups(s3_client, bucket: str) -> int:
    """Delete old backups beyond RETENTION_COUNT. Returns number deleted."""
    paginator = s3_client.get_paginator("list_objects_v2")
    objects = []
    for page in paginator.paginate(Bucket=bucket, Prefix=S3_BACKUP_PREFIX):
        for obj in page.get("Contents", []):
            objects.append(obj)

    # Sort by LastModified descending (newest first)
    objects.sort(key=lambda o: o["LastModified"], reverse=True)

    to_delete = objects[RETENTION_COUNT:]
    if not to_delete:
        return 0

    delete_keys = [{"Key": obj["Key"]} for obj in to_delete]
    s3_client.delete_objects(
        Bucket=bucket,
        Delete={"Objects": delete_keys},
    )
    logger.info("Rotated %d old backups", len(delete_keys))
    return len(delete_keys)


@celery_app.task(
    bind=True,
    name="app.jobs.tasks.backup_tasks.verify_backup_integrity",
    max_retries=2,
)
def verify_backup_integrity(self, s3_key: str) -> dict:
    """Verify a backup can be decompressed and contains valid SQL.

    Downloads from S3, decompresses, checks for CREATE TABLE / pg_dump header.
    """
    local_path = os.path.join(
        tempfile.gettempdir(), f"verify_{os.path.basename(s3_key)}"
    )

    try:
        # Download from S3
        s3 = boto3.client("s3")
        s3.download_file(settings.AWS_S3_BUCKET, s3_key, local_path)
        size_bytes = os.path.getsize(local_path)

        # Decompress and check contents
        result = subprocess.run(
            f'gunzip -c "{local_path}" | head -c 65536',
            shell=True,
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            return {
                "s3_key": s3_key,
                "valid": False,
                "error": f"Decompression failed: {result.stderr}",
            }

        content_sample = result.stdout
        has_pg_dump = "-- PostgreSQL database dump" in content_sample
        has_create = "CREATE TABLE" in content_sample or "CREATE " in content_sample
        has_sql = has_pg_dump or has_create

        return {
            "s3_key": s3_key,
            "valid": has_sql,
            "size_bytes": size_bytes,
            "has_pg_dump_header": has_pg_dump,
            "has_create_statements": has_create,
            "verified_at": datetime.now(timezone.utc).isoformat(),
        }

    except Exception as exc:
        logger.exception("Backup verification failed for %s", s3_key)
        raise self.retry(exc=exc, countdown=60)
    finally:
        if os.path.exists(local_path):
            os.remove(local_path)


def list_backups(limit: int = 30) -> list[dict]:
    """List recent backups from S3. Used by the admin API."""
    s3 = boto3.client("s3")
    paginator = s3.get_paginator("list_objects_v2")
    objects = []
    for page in paginator.paginate(Bucket=settings.AWS_S3_BUCKET, Prefix=S3_BACKUP_PREFIX):
        for obj in page.get("Contents", []):
            objects.append(obj)

    objects.sort(key=lambda o: o["LastModified"], reverse=True)

    return [
        {
            "s3_key": obj["Key"],
            "filename": obj["Key"].split("/")[-1],
            "size_bytes": obj["Size"],
            "last_modified": obj["LastModified"].isoformat(),
        }
        for obj in objects[:limit]
    ]
