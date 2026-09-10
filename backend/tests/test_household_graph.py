"""Tests for HouseholdGraphService — uses in-memory SQLite."""
import uuid

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.session import Base
from app.models.client import Client
from app.services.backbone.household_graph import HouseholdGraphService


@pytest.fixture
def db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


@pytest.fixture
def client_id(db):
    """Create a client row and return its id."""
    cid = uuid.uuid4()
    client = Client(
        id=cid,
        workspace_id=uuid.uuid4(),
        name="Test Client",
        company="Test Corp",
    )
    db.add(client)
    db.commit()
    return str(cid)


@pytest.fixture
def svc():
    return HouseholdGraphService()


def test_create_household_graph(db, client_id, svc):
    data = {
        "members": [{"name": "John Doe", "relationship": "principal"}],
        "properties": [{"address": "123 Main St", "type": "primary_residence"}],
        "staff": [],
        "vendors": [],
    }
    graph = svc.create(db, client_id, data)
    assert graph is not None
    assert str(graph.client_id) == client_id
    assert len(graph.members) == 1
    assert graph.members[0]["name"] == "John Doe"


def test_get_household_graph(db, client_id, svc):
    svc.create(db, client_id, {"members": [{"name": "Jane"}]})
    graph = svc.get(db, client_id)
    assert graph is not None
    assert graph.members[0]["name"] == "Jane"


def test_get_nonexistent_returns_none(db, svc):
    result = svc.get(db, str(uuid.uuid4()))
    assert result is None


def test_update_merges_members(db, client_id, svc):
    svc.create(db, client_id, {"members": [{"name": "Alice"}]})
    updated = svc.update(db, client_id, {"members": [{"name": "Bob"}]})
    assert updated is not None
    names = [m["name"] for m in updated.members]
    assert "Alice" in names
    assert "Bob" in names


def test_add_member(db, client_id, svc):
    svc.create(db, client_id, {"members": []})
    graph = svc.add_member(db, client_id, {"name": "Spouse", "relationship": "spouse"})
    assert len(graph.members) == 1
    assert graph.members[0]["relationship"] == "spouse"


def test_add_property(db, client_id, svc):
    svc.create(db, client_id, {})
    graph = svc.add_property(db, client_id, {"address": "456 Park Ave", "type": "vacation_home"})
    assert len(graph.properties) == 1


def test_add_staff(db, client_id, svc):
    svc.create(db, client_id, {})
    graph = svc.add_staff(db, client_id, {"name": "Butler", "role": "household_manager"})
    assert len(graph.staff) == 1


def test_add_vendor(db, client_id, svc):
    svc.create(db, client_id, {})
    graph = svc.add_vendor(db, client_id, {"name": "LawFirm LLC", "service": "legal"})
    assert len(graph.vendors) == 1


def test_get_risk_summary(db, client_id, svc):
    svc.create(db, client_id, {
        "risk_exposures": [
            {"category": "legal", "level": "high", "description": "Pending litigation"},
            {"category": "financial", "level": "medium", "description": "Concentration risk"},
            {"category": "legal", "level": "low", "description": "Contract renewal"},
        ],
        "jurisdictions": ["US-NY", "UK"],
    })
    summary = svc.get_risk_summary(db, client_id)
    assert summary["total_risks"] == 3
    assert summary["severity_counts"]["high"] == 1
    assert summary["severity_counts"]["medium"] == 1
    assert summary["severity_counts"]["low"] == 1
    assert summary["categories"]["legal"] == 2
    assert summary["categories"]["financial"] == 1
    assert "US-NY" in summary["jurisdictions"]


def test_risk_summary_not_found(db, svc):
    summary = svc.get_risk_summary(db, str(uuid.uuid4()))
    assert summary["total_risks"] == 0
    assert "error" in summary
