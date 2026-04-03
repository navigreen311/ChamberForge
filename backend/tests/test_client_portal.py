"""Tests for ClientPortalService — token generation, validation, deliverables, KPIs, revocation."""
from __future__ import annotations

import uuid

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.session import Base
from app.models.client_portal import ClientPortalAccess
from app.services.backbone.client_portal import ClientPortalService


@pytest.fixture(scope="module")
def portal_engine():
    eng = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(eng)
    return eng


@pytest.fixture()
def portal_db(portal_engine):
    connection = portal_engine.connect()
    transaction = connection.begin()
    Session = sessionmaker(bind=connection)
    session = Session()
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture()
def client_id():
    return uuid.uuid4()


class TestCreatePortalAccess:
    def test_creates_access_with_token(self, portal_db, client_id):
        access = ClientPortalService.create_portal_access(portal_db, client_id)
        assert access.id is not None
        assert access.client_id == client_id
        assert access.portal_token is not None
        assert len(access.portal_token) > 20
        assert access.is_active is True

    def test_tokens_are_unique(self, portal_db, client_id):
        a1 = ClientPortalService.create_portal_access(portal_db, client_id)
        a2 = ClientPortalService.create_portal_access(portal_db, client_id)
        assert a1.portal_token != a2.portal_token


class TestValidateToken:
    def test_valid_token_returns_access(self, portal_db, client_id):
        access = ClientPortalService.create_portal_access(portal_db, client_id)
        result = ClientPortalService.validate_token(portal_db, access.portal_token)
        assert result is not None
        assert result.id == access.id

    def test_invalid_token_returns_none(self, portal_db):
        result = ClientPortalService.validate_token(portal_db, "bogus-token-value")
        assert result is None

    def test_revoked_token_returns_none(self, portal_db, client_id):
        access = ClientPortalService.create_portal_access(portal_db, client_id)
        ClientPortalService.revoke_access(portal_db, access.id)
        result = ClientPortalService.validate_token(portal_db, access.portal_token)
        assert result is None


class TestGetClientDeliverables:
    def test_returns_list_of_deliverables(self, portal_db, client_id):
        deliverables = ClientPortalService.get_client_deliverables(portal_db, client_id)
        assert isinstance(deliverables, list)
        assert len(deliverables) > 0
        for d in deliverables:
            assert "id" in d
            assert "name" in d
            assert "type" in d
            assert "created_at" in d


class TestGetClientKpis:
    def test_returns_kpis_with_required_fields(self, portal_db, client_id):
        kpis = ClientPortalService.get_client_kpis(portal_db, client_id)
        assert isinstance(kpis, list)
        assert len(kpis) > 0
        for kpi in kpis:
            assert "name" in kpi
            assert "current" in kpi
            assert "target" in kpi
            assert "status" in kpi
            assert kpi["status"] in ("on_track", "at_risk", "behind")

    def test_kpis_have_trend(self, portal_db, client_id):
        kpis = ClientPortalService.get_client_kpis(portal_db, client_id)
        for kpi in kpis:
            assert "trend" in kpi
            assert kpi["trend"] in ("up", "down", "flat")


class TestGetClientReports:
    def test_returns_reports(self, portal_db, client_id):
        reports = ClientPortalService.get_client_reports(portal_db, client_id)
        assert isinstance(reports, list)
        assert len(reports) > 0
        for r in reports:
            assert "id" in r
            assert "title" in r
            assert "period" in r
            assert "type" in r


class TestRevokeAccess:
    def test_revoke_existing(self, portal_db, client_id):
        access = ClientPortalService.create_portal_access(portal_db, client_id)
        assert ClientPortalService.revoke_access(portal_db, access.id) is True
        # Verify the record is now inactive
        refreshed = portal_db.query(ClientPortalAccess).filter_by(id=access.id).first()
        assert refreshed.is_active is False

    def test_revoke_nonexistent(self, portal_db):
        result = ClientPortalService.revoke_access(portal_db, uuid.uuid4())
        assert result is False


class TestUpdateLastAccessed:
    def test_updates_timestamp(self, portal_db, client_id):
        access = ClientPortalService.create_portal_access(portal_db, client_id)
        assert access.last_accessed_at is None
        ClientPortalService.update_last_accessed(portal_db, access.id)
        portal_db.refresh(access)
        assert access.last_accessed_at is not None
