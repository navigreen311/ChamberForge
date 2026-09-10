"""Tests for deletion service (unit-level, mocked DB)."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from unittest.mock import MagicMock

from app.models.deletion_request import DeletionRequest
from app.services.backbone.deletion_service import (
    execute_deletion,
    request_deletion,
    verify_deletion,
)


def _fake_deletion_request(**overrides) -> DeletionRequest:
    defaults = dict(
        id=uuid.uuid4(),
        workspace_id=uuid.uuid4(),
        client_id=uuid.uuid4(),
        requested_by=uuid.uuid4(),
        status="pending",
        tables_cleaned=[],
        records_deleted=0,
        requested_at=datetime.now(timezone.utc),
        completed_at=None,
    )
    defaults.update(overrides)
    obj = MagicMock(spec=DeletionRequest)
    for k, v in defaults.items():
        setattr(obj, k, v)
    return obj


def test_request_deletion_creates_pending_record():
    db = MagicMock()
    db.add = MagicMock()
    db.commit = MagicMock()

    ws = uuid.uuid4()
    cid = uuid.uuid4()
    by = uuid.uuid4()

    # We need to capture what gets added to db
    added_obj = None

    def capture_add(obj):
        nonlocal added_obj
        added_obj = obj

    db.add.side_effect = capture_add
    db.refresh = lambda obj: None

    request_deletion(db, ws, cid, by)
    assert db.add.called
    assert db.commit.called


def test_execute_deletion_cascade():
    """execute_deletion should attempt DELETE on all client tables."""
    req = _fake_deletion_request()
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = req

    # Simulate rowcount for each table
    mock_result = MagicMock()
    mock_result.rowcount = 2
    db.execute.return_value = mock_result

    execute_deletion(db, req.id)
    # Should have called DELETE for every client table
    assert db.execute.call_count == 8  # 8 tables in _CLIENT_TABLES
    assert req.status == "completed"
    assert req.records_deleted == 16  # 8 tables * 2 rows each


def test_verify_deletion_confirms_clean():
    db = MagicMock()
    # All tables return 0
    mock_result = MagicMock()
    mock_result.scalar.return_value = 0
    db.execute.return_value = mock_result

    cid = uuid.uuid4()
    result = verify_deletion(db, cid)
    assert result["verified_clean"] is True
    assert result["records_remaining"] == {}


def test_verify_deletion_detects_remaining():
    db = MagicMock()
    mock_result = MagicMock()
    mock_result.scalar.return_value = 5
    db.execute.return_value = mock_result

    cid = uuid.uuid4()
    result = verify_deletion(db, cid)
    assert result["verified_clean"] is False
    assert len(result["records_remaining"]) > 0
