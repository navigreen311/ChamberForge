"""Shared test fixtures — in-memory SQLite for fast isolated tests."""
import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.session import Base, get_db
from app.main import app
from app.models.user import User
from app.models.workspace import Workspace
from app.core.security import get_password_hash, create_access_token

# Use in-memory SQLite for tests
SQLALCHEMY_TEST_URL = "sqlite://"
engine = create_engine(
    SQLALCHEMY_TEST_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# Enable foreign key support for SQLite
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def setup_db():
    """Create all tables before each test, drop after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db():
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client(db):
    """FastAPI test client with overridden DB dependency."""
    def _override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def workspace(db) -> Workspace:
    ws = Workspace(
        id=str(uuid.uuid4()),
        name="Test Workspace",
        slug="test-workspace",
        plan="core",
        settings={},
    )
    db.add(ws)
    db.commit()
    db.refresh(ws)
    return ws


@pytest.fixture()
def admin_user(db, workspace) -> User:
    user = User(
        id=str(uuid.uuid4()),
        email="admin@test.com",
        name="Admin User",
        hashed_password=get_password_hash("password123"),
        role="admin",
        workspace_id=workspace.id,
    )
    db.add(user)
    workspace.owner_id = user.id
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture()
def operator_user(db, workspace) -> User:
    user = User(
        id=str(uuid.uuid4()),
        email="operator@test.com",
        name="Operator User",
        hashed_password=get_password_hash("password123"),
        role="operator",
        workspace_id=workspace.id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture()
def viewer_user(db, workspace) -> User:
    user = User(
        id=str(uuid.uuid4()),
        email="viewer@test.com",
        name="Viewer User",
        hashed_password=get_password_hash("password123"),
        role="viewer",
        workspace_id=workspace.id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def make_auth_header(user: User) -> dict:
    """Build an Authorization header for the given user."""
    token = create_access_token({
        "sub": str(user.id),
        "workspace_id": str(user.workspace_id) if user.workspace_id else None,
        "role": user.role,
    })
    return {"Authorization": f"Bearer {token}"}
