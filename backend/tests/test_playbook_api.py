"""Tests for playbook API endpoints."""
import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

from app.models import Playbook, PlaybookActivation  # noqa: F401 — register models
from app.db.session import Base, get_db
from app.main import app
from app.services.backbone.playbook_engine import PlaybookEngine


WORKSPACE_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"

# Use a file-based SQLite to persist across sessions within the test module
_engine = create_engine("sqlite:///test_api.db")
_SessionLocal = sessionmaker(bind=_engine)


@pytest.fixture(scope="module", autouse=True)
def setup_db():
    """Create tables and seed data, then tear down after module."""
    Base.metadata.create_all(_engine)
    db = _SessionLocal()
    PlaybookEngine.seed_playbooks(db)
    db.close()

    def _override():
        db = _SessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = _override
    yield
    app.dependency_overrides.clear()
    Base.metadata.drop_all(_engine)
    import os
    try:
        os.remove("test_api.db")
    except OSError:
        pass


@pytest.fixture()
def client():
    return TestClient(app)


# ── Tests ─────────────────────────────────────────────────────────────

class TestListPlaybooks:
    def test_list_returns_10(self, client):
        resp = client.get("/api/v1/playbooks/")
        assert resp.status_code == 200
        data = resp.json()
        assert data["count"] == 10
        assert len(data["playbooks"]) == 10

    def test_list_playbooks_have_required_fields(self, client):
        resp = client.get("/api/v1/playbooks/")
        for p in resp.json()["playbooks"]:
            assert "slug" in p
            assert "name" in p
            assert "target_buyer" in p


class TestGetPlaybook:
    def test_get_existing(self, client):
        resp = client.get("/api/v1/playbooks/private-ops-office")
        assert resp.status_code == 200
        data = resp.json()
        assert data["slug"] == "private-ops-office"
        assert data["name"] == "Private Ops Office"

    def test_get_nonexistent(self, client):
        resp = client.get("/api/v1/playbooks/does-not-exist")
        assert resp.status_code == 404


class TestActivatePlaybook:
    def test_activate_success(self, client):
        resp = client.post(
            "/api/v1/playbooks/private-ops-office/activate",
            json={"workspace_id": WORKSPACE_ID},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["message"] == "Playbook activated"
        assert data["activation"]["status"] == "active"

    def test_activate_nonexistent(self, client):
        resp = client.post(
            "/api/v1/playbooks/fake-slug/activate",
            json={"workspace_id": WORKSPACE_ID},
        )
        assert resp.status_code == 404


class TestCustomizeAndProgress:
    def _activate(self, client, slug="ecosystem-orchestrator"):
        resp = client.post(
            f"/api/v1/playbooks/{slug}/activate",
            json={"workspace_id": WORKSPACE_ID},
        )
        return resp.json()["activation"]["id"]

    def test_customize(self, client):
        aid = self._activate(client)
        resp = client.put(
            f"/api/v1/playbooks/activations/{aid}/customize",
            json={"overrides": {"target_buyer": "Custom Buyer"}},
        )
        assert resp.status_code == 200
        assert resp.json()["activation"]["customizations"]["target_buyer"] == "Custom Buyer"

    def test_get_progress(self, client):
        aid = self._activate(client, "family-cyber-command")
        resp = client.get(f"/api/v1/playbooks/activations/{aid}/progress")
        assert resp.status_code == 200
        data = resp.json()
        assert data["completion_pct"] == 0.0
        assert len(data["sections"]) == 8

    def test_update_section(self, client):
        aid = self._activate(client, "footprint-reduction")
        resp = client.put(
            f"/api/v1/playbooks/activations/{aid}/sections/ICP Definition",
            json={"status": "complete"},
        )
        assert resp.status_code == 200
        assert resp.json()["activation"]["completed_sections"] == 1

    def test_export(self, client):
        aid = self._activate(client, "household-workforce")
        resp = client.get(f"/api/v1/playbooks/activations/{aid}/export")
        assert resp.status_code == 200
        data = resp.json()
        assert data["slug"] == "household-workforce"
        assert "activation" in data
        assert "exported_at" in data
