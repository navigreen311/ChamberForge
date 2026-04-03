"""Shared test fixtures."""
import uuid
from unittest.mock import MagicMock
from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.session import Base, get_db
from app.main import app

# In-memory SQLite for tests
SQLALCHEMY_TEST_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
TestSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def setup_db():
    """Create tables before each test, drop after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    session = TestSession()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db_session):
    """FastAPI test client with overridden DB dependency."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def sample_offer_payload():
    return {
        "workspace_id": str(uuid.uuid4()),
        "name": "Test Offer",
        "description": "A test premium offer",
        "value_stack": [
            {
                "name": "Core Service",
                "description": "Primary delivery",
                "delivery_method": "retainer",
                "estimated_hours": 80,
            }
        ],
        "delivery_model": "retainer",
        "guarantee_framework": {"type": "performance", "terms": "95% SLA"},
        "pricing_model": {"monthly_price": 20000, "setup_fee": 5000},
        "status": "draft",
    }
