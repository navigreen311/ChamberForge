"""Shared test fixtures for ChamberForge backend tests."""
import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.session import Base, get_db
from app.main import app
from app.services.backbone.playbook_engine import PlaybookEngine

# Import ALL models so Base.metadata knows every table before create_all.
# Use "from ... import ..." form to avoid rebinding the name ``app``.
from app.models.user import User as _User  # noqa: F401
from app.models.workspace import Workspace as _Workspace  # noqa: F401
from app.models.problem import Problem as _Problem  # noqa: F401
from app.models.evidence import Evidence as _Evidence  # noqa: F401
from app.models.offer import Offer as _Offer  # noqa: F401
from app.models.billing import Subscription as _Sub, Invoice as _Inv, Referral as _Ref  # noqa: F401
from app.models.client import Client as _Client  # noqa: F401
from app.models.consent import ConsentRecord as _Consent  # noqa: F401
from app.models.notification import Notification as _Notif  # noqa: F401
from app.models.playbook import Playbook as _PB  # noqa: F401
from app.models.playbook_activation import PlaybookActivation as _PBA  # noqa: F401
from app.models.risk_review import RiskReview as _RR  # noqa: F401
from app.models.household_graph import HouseholdGraph as _HG  # noqa: F401
from app.models.audit_log import AuditLog as _AL  # noqa: F401
from app.models.ai_usage import AIUsageLog as _AIU  # noqa: F401
from app.models.automation_rule import AutomationRule as _AR  # noqa: F401
from app.models.crisis_incident import CrisisIncident as _CI  # noqa: F401
from app.models.deletion_request import DeletionRequest as _DR  # noqa: F401
from app.models.document import Document as _Doc  # noqa: F401
from app.models.email_log import EmailLog as _EL  # noqa: F401
from app.models.feature_flag import FeatureFlag as _FF  # noqa: F401
from app.models.legal_hold import LegalHold as _LH  # noqa: F401
from app.models.message import SecureMessage as _Msg  # noqa: F401
from app.models.prompt_version import PromptVersion as _PV  # noqa: F401
from app.models.retention_policy import RetentionPolicy as _RP  # noqa: F401
from app.models.template_version import TemplateVersion as _TV  # noqa: F401
from app.models.drip_status import DripStatus as _DS  # noqa: F401


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_auth_header(user) -> dict:
    """Build an Authorization header from a user's JWT token."""
    from app.core.security import create_access_token

    payload = {
        "sub": str(user.id),
        "workspace_id": str(user.workspace_id) if user.workspace_id else None,
        "role": user.role,
    }
    token = create_access_token(payload)
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------------------
# Database fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def engine():
    """Create an in-memory SQLite engine for tests."""
    eng = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(eng)
    return eng


@pytest.fixture()
def db(engine):
    """Provide a transactional database session for each test."""
    connection = engine.connect()
    transaction = connection.begin()
    Session = sessionmaker(bind=connection)
    session = Session()

    # Seed playbooks
    PlaybookEngine.seed_playbooks(session)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


def _patch_uuid_for_sqlite():
    """Monkey-patch the PostgreSQL UUID type so it stores/loads strings in SQLite.

    The PostgreSQL UUID type's bind processor calls ``value.hex`` which fails
    when the caller passes a plain string.  We replace the bind/result
    processors so that both str and uuid.UUID inputs are handled.
    """
    from sqlalchemy.dialects.postgresql import UUID as PG_UUID
    import uuid as _uuid

    _orig_bind_processor = PG_UUID.bind_processor
    _orig_result_processor = PG_UUID.result_processor

    def _bind(self, dialect):
        if dialect.name == "sqlite":
            def process(value):
                if value is not None:
                    if isinstance(value, _uuid.UUID):
                        return str(value)
                    return str(value)
                return value
            return process
        return _orig_bind_processor(self, dialect)

    def _result(self, dialect, coltype):
        if dialect.name == "sqlite":
            if self.as_uuid:
                def process(value):
                    if value is not None:
                        if not isinstance(value, _uuid.UUID):
                            return _uuid.UUID(str(value))
                    return value
                return process
            return None
        return _orig_result_processor(self, dialect, coltype)

    PG_UUID.bind_processor = _bind
    PG_UUID.result_processor = _result


# Apply the patch at import time (before any engine is created)
_patch_uuid_for_sqlite()


@pytest.fixture()
def db_session():
    """Standalone in-memory session with StaticPool for integration tests."""
    eng = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=eng)
    Session = sessionmaker(bind=eng)
    session = Session()

    # Seed playbooks so playbook tests work
    PlaybookEngine.seed_playbooks(session)

    yield session
    session.close()


@pytest.fixture()
def client(db_session):
    """TestClient wired to the in-memory db_session."""
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def auth_headers(client):
    """Register a user and return auth headers."""
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@test.com",
            "password": "Test1234!",
            "name": "Test User",
            "workspace_name": "Test Workspace",
        },
    )
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "test@test.com", "password": "Test1234!"},
    )
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def workspace_id():
    """Provide a consistent test workspace UUID."""
    return uuid.UUID("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee")


# ---------------------------------------------------------------------------
# RBAC user fixtures (used by integration/test_rbac.py)
# ---------------------------------------------------------------------------

@pytest.fixture()
def admin_user(db_session):
    """Create an admin user in the test database."""
    from app.models.user import User
    from app.models.workspace import Workspace
    from app.core.security import get_password_hash

    ws = Workspace(
        id=str(uuid.uuid4()),
        name="Test Workspace",
        slug="test-workspace",
        plan="core",
        settings={},
    )
    db_session.add(ws)
    db_session.flush()

    user = User(
        id=str(uuid.uuid4()),
        email="admin@test.com",
        name="Admin User",
        hashed_password=get_password_hash("Test1234!"),
        role="admin",
        workspace_id=ws.id,
    )
    db_session.add(user)
    ws.owner_id = user.id
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture()
def operator_user(db_session, admin_user):
    """Create an operator user in the same workspace."""
    from app.models.user import User
    from app.core.security import get_password_hash

    user = User(
        id=str(uuid.uuid4()),
        email="operator@test.com",
        name="Operator User",
        hashed_password=get_password_hash("Test1234!"),
        role="operator",
        workspace_id=admin_user.workspace_id,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture()
def viewer_user(db_session, admin_user):
    """Create a viewer user in the same workspace."""
    from app.models.user import User
    from app.core.security import get_password_hash

    user = User(
        id=str(uuid.uuid4()),
        email="viewer@test.com",
        name="Viewer User",
        hashed_password=get_password_hash("Test1234!"),
        role="viewer",
        workspace_id=admin_user.workspace_id,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user
