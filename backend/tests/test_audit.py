"""Tests for AuditService, AuditMiddleware, and audit API router."""
import uuid
from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy import create_engine, Column, String, DateTime, JSON, Uuid, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.services.backbone.audit_service import AuditService
from app.middleware.audit import (
    _extract_resource_type,
    _extract_resource_id,
    _should_skip,
)


# ── Isolated Base to avoid pg.UUID ↔ SQLite conflict ────────────────────────
# The production AuditLog model uses pg.UUID which conflicts with other models
# in the SQLite test environment.  We create a test-only mirror using the
# cross-database sa.Uuid type.


class _TestBase(DeclarativeBase):
    pass


class AuditLogTest(_TestBase):
    """Test-only mirror of AuditLog using sa.Uuid for SQLite compat."""
    __tablename__ = "audit_logs"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    workspace_id = Column(Uuid, nullable=False)
    user_id = Column(Uuid, nullable=True)
    action = Column(String, nullable=False)
    resource_type = Column(String, nullable=False)
    resource_id = Column(Uuid, nullable=True)
    details = Column(JSON, default=dict)
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"), nullable=False)


# Monkey-patch AuditService to use our test model for the duration of tests.
import app.services.backbone.audit_service as _audit_mod
_OrigAuditLog = _audit_mod.AuditLog
_audit_mod.AuditLog = AuditLogTest  # type: ignore[assignment]


# ── Fixtures ─────────────────────────────────────────────────────────────────


@pytest.fixture()
def db():
    """Create an in-memory SQLite database for testing."""
    engine = create_engine("sqlite:///:memory:")
    _TestBase.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


@pytest.fixture()
def workspace_id():
    return uuid.UUID("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee")


@pytest.fixture()
def user_id():
    return uuid.UUID("11111111-2222-3333-4444-555555555555")


# ── AuditService.log_action ─────────────────────────────────────────────────


def test_log_action_creates_record(db, workspace_id, user_id):
    entry = AuditService.log_action(
        db=db,
        workspace_id=workspace_id,
        user_id=user_id,
        action="POST /api/v1/problems",
        resource_type="problems",
        resource_id=None,
        details={"status_code": 201, "path": "/api/v1/problems"},
        ip_address="127.0.0.1",
    )
    assert entry.id is not None
    assert entry.workspace_id == workspace_id
    assert entry.user_id == user_id
    assert entry.action == "POST /api/v1/problems"
    assert entry.resource_type == "problems"
    assert entry.ip_address == "127.0.0.1"
    assert entry.details["status_code"] == 201

    # Verify persisted
    fetched = db.query(AuditLogTest).filter(AuditLogTest.id == entry.id).first()
    assert fetched is not None


# ── AuditService.get_audit_trail ─────────────────────────────────────────────


def test_get_audit_trail_filtering(db, workspace_id, user_id):
    other_ws = uuid.UUID("ffffffff-eeee-dddd-cccc-bbbbbbbbbbbb")
    AuditService.log_action(db, workspace_id, user_id, "POST /api/v1/offers", "offers")
    AuditService.log_action(db, workspace_id, user_id, "DELETE /api/v1/problems/x", "problems")
    AuditService.log_action(db, other_ws, user_id, "PUT /api/v1/clients/y", "clients")

    trail = AuditService.get_audit_trail(db, workspace_id)
    assert len(trail) == 2
    assert all(e.workspace_id == workspace_id for e in trail)

    # Filter by resource_type
    trail_offers = AuditService.get_audit_trail(db, workspace_id, resource_type="offers")
    assert len(trail_offers) == 1
    assert trail_offers[0].resource_type == "offers"


def test_get_audit_trail_date_filter(db, workspace_id, user_id):
    entry = AuditService.log_action(db, workspace_id, user_id, "POST /x", "x")
    now = datetime.now(timezone.utc)
    trail = AuditService.get_audit_trail(
        db, workspace_id, start_date=now - timedelta(minutes=5), end_date=now + timedelta(minutes=5)
    )
    assert any(e.id == entry.id for e in trail)


# ── AuditService.get_user_activity ───────────────────────────────────────────


def test_get_user_activity(db, workspace_id, user_id):
    AuditService.log_action(db, workspace_id, user_id, "PATCH /api/v1/offers/1", "offers")
    activity = AuditService.get_user_activity(db, user_id, days=30)
    assert len(activity) >= 1
    assert all(e.user_id == user_id for e in activity)


# ── AuditService.export_audit_trail ──────────────────────────────────────────


def test_export_audit_trail(db, workspace_id, user_id):
    AuditService.log_action(db, workspace_id, user_id, "POST /api/v1/build", "build")
    now = datetime.now(timezone.utc)
    exported = AuditService.export_audit_trail(
        db, workspace_id, start_date=now - timedelta(hours=1), end_date=now + timedelta(hours=1)
    )
    assert isinstance(exported, list)
    assert len(exported) >= 1
    row = exported[0]
    assert "id" in row
    assert "action" in row
    assert "timestamp" in row


# ── Middleware helper functions ───────────────────────────────────────────────


def test_extract_resource_type():
    assert _extract_resource_type("/api/v1/problems") == "problems"
    assert _extract_resource_type("/api/v1/offers/some-uuid") == "offers"
    assert _extract_resource_type("/api/v1/clients/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/notes") == "clients"
    assert _extract_resource_type("/api/health") == "health"


def test_extract_resource_id():
    rid = _extract_resource_id("/api/v1/problems/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee")
    assert rid == uuid.UUID("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee")
    assert _extract_resource_id("/api/v1/problems") is None


def test_should_skip():
    assert _should_skip("/api/health") is True
    assert _should_skip("/api/v1/auth/login") is True
    assert _should_skip("/api/v1/auth/register") is True
    assert _should_skip("/api/v1/metrics") is True
    assert _should_skip("/api/v1/webhooks/stripe") is True
    assert _should_skip("/api/v1/problems") is False
    assert _should_skip("/api/v1/offers") is False


# ── Middleware: skip GET ─────────────────────────────────────────────────────


def test_middleware_skips_get_requests():
    """GET requests should not be in the mutation methods set."""
    from app.middleware.audit import _MUTATION_METHODS
    assert "GET" not in _MUTATION_METHODS
    assert "OPTIONS" not in _MUTATION_METHODS
    assert "HEAD" not in _MUTATION_METHODS


def test_middleware_captures_post_requests():
    """POST/PUT/PATCH/DELETE should be in the mutation methods set."""
    from app.middleware.audit import _MUTATION_METHODS
    assert "POST" in _MUTATION_METHODS
    assert "PUT" in _MUTATION_METHODS
    assert "PATCH" in _MUTATION_METHODS
    assert "DELETE" in _MUTATION_METHODS
