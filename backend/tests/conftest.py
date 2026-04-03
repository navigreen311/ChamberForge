"""Shared test fixtures for ChamberForge backend tests."""
import uuid

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.session import Base
from app.services.backbone.playbook_engine import PlaybookEngine


@pytest.fixture(scope="session")
def engine():
    """Create an in-memory SQLite engine for tests."""
    eng = create_engine("sqlite:///:memory:")
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


@pytest.fixture()
def workspace_id():
    """Provide a consistent test workspace UUID."""
    return uuid.UUID("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee")
