"""Conftest for Docker-based integration tests against real Postgres, Redis, ES."""
import os
import uuid
from datetime import datetime, timezone

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

# Override env vars BEFORE importing app modules
os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost:5433/chamberforge_test")
os.environ.setdefault("REDIS_URL", "redis://localhost:6380")
os.environ.setdefault("ELASTICSEARCH_URL", "http://localhost:9201")
os.environ.setdefault("JWT_SECRET", "test-secret-key")
os.environ.setdefault("APP_ENV", "testing")

from app.db.session import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402

# Import ALL models so Base.metadata knows every table.
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


@pytest.fixture(scope="session")
def docker_engine():
    """Create a real PostgreSQL engine for integration tests."""
    engine = create_engine(os.environ["DATABASE_URL"])
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db(docker_engine):
    """Provide a transactional database session for each test."""
    connection = docker_engine.connect()
    transaction = connection.begin()
    Session = sessionmaker(bind=connection)
    session = Session()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture()
def client(db):
    """FastAPI TestClient wired to the real Postgres session."""
    def _override_get_db():
        yield db

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def sample_workspace(db):
    """Create a test workspace in real Postgres."""
    from app.models.workspace import Workspace

    ws = Workspace(
        id=str(uuid.uuid4()),
        name="Test Workspace",
        slug=f"test-ws-{uuid.uuid4().hex[:8]}",
        plan="core",
        settings={},
    )
    db.add(ws)
    db.commit()
    db.refresh(ws)
    return ws


@pytest.fixture()
def sample_user(db, sample_workspace):
    """Create a test user in real Postgres."""
    from app.models.user import User

    user = User(
        id=str(uuid.uuid4()),
        email=f"test-{uuid.uuid4().hex[:8]}@example.com",
        name="Test User",
        hashed_password="$2b$12$fakehashfortest",
        role="admin",
        workspace_id=sample_workspace.id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
