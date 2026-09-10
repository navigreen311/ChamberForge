"""Tests for the Consent Ledger service."""
import uuid

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.session import Base
from app.services.backbone.consent_ledger import ConsentLedger


@pytest.fixture
def db():
    """Create an in-memory SQLite database for testing."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


@pytest.fixture
def workspace_id():
    return uuid.uuid4()


@pytest.fixture
def client_id():
    return uuid.uuid4()


class TestGrantConsent:
    def test_grant_creates_active_record(self, db, workspace_id, client_id):
        record = ConsentLedger.grant_consent(db, workspace_id, client_id, "data_processing")
        assert record.status == "active"
        assert record.consent_type == "data_processing"
        assert record.client_id == client_id
        assert record.workspace_id == workspace_id
        assert record.granted_at is not None

    def test_grant_with_nda_url(self, db, workspace_id, client_id):
        record = ConsentLedger.grant_consent(
            db, workspace_id, client_id, "nda", nda_url="https://example.com/nda.pdf"
        )
        assert record.nda_document_url == "https://example.com/nda.pdf"

    def test_grant_invalid_type_raises(self, db, workspace_id, client_id):
        with pytest.raises(ValueError, match="Invalid consent_type"):
            ConsentLedger.grant_consent(db, workspace_id, client_id, "invalid_type")

    def test_grant_all_valid_types(self, db, workspace_id, client_id):
        for ctype in ["data_processing", "nda", "marketing", "third_party_sharing"]:
            record = ConsentLedger.grant_consent(db, workspace_id, client_id, ctype)
            assert record.consent_type == ctype


class TestRevokeConsent:
    def test_revoke_sets_status_and_timestamp(self, db, workspace_id, client_id):
        record = ConsentLedger.grant_consent(db, workspace_id, client_id, "marketing")
        revoked = ConsentLedger.revoke_consent(db, record.id, reason="Client requested")
        assert revoked.status == "revoked"
        assert revoked.revoked_at is not None
        assert "Client requested" in revoked.notes

    def test_revoke_nonexistent_raises(self, db):
        with pytest.raises(ValueError, match="not found"):
            ConsentLedger.revoke_consent(db, uuid.uuid4(), reason="test")

    def test_revoke_already_revoked_raises(self, db, workspace_id, client_id):
        record = ConsentLedger.grant_consent(db, workspace_id, client_id, "marketing")
        ConsentLedger.revoke_consent(db, record.id, reason="first")
        with pytest.raises(ValueError, match="already revoked"):
            ConsentLedger.revoke_consent(db, record.id, reason="second")


class TestCheckConsent:
    def test_check_active_returns_true(self, db, workspace_id, client_id):
        ConsentLedger.grant_consent(db, workspace_id, client_id, "data_processing")
        assert ConsentLedger.check_consent(db, client_id, "data_processing") is True

    def test_check_revoked_returns_false(self, db, workspace_id, client_id):
        record = ConsentLedger.grant_consent(db, workspace_id, client_id, "marketing")
        ConsentLedger.revoke_consent(db, record.id, reason="test")
        assert ConsentLedger.check_consent(db, client_id, "marketing") is False

    def test_check_nonexistent_returns_false(self, db, client_id):
        assert ConsentLedger.check_consent(db, client_id, "nda") is False


class TestGetClientConsents:
    def test_returns_all_client_records(self, db, workspace_id, client_id):
        ConsentLedger.grant_consent(db, workspace_id, client_id, "data_processing")
        ConsentLedger.grant_consent(db, workspace_id, client_id, "nda")
        consents = ConsentLedger.get_client_consents(db, client_id)
        assert len(consents) == 2

    def test_returns_empty_for_unknown_client(self, db):
        consents = ConsentLedger.get_client_consents(db, uuid.uuid4())
        assert consents == []


class TestDeletionCandidates:
    def test_client_with_all_revoked_is_candidate(self, db, workspace_id):
        client_id = uuid.uuid4()
        r1 = ConsentLedger.grant_consent(db, workspace_id, client_id, "data_processing")
        r2 = ConsentLedger.grant_consent(db, workspace_id, client_id, "marketing")
        ConsentLedger.revoke_consent(db, r1.id, "test")
        ConsentLedger.revoke_consent(db, r2.id, "test")

        candidates = ConsentLedger.get_deletion_candidates(db, workspace_id)
        client_ids = [c["client_id"] for c in candidates]
        assert str(client_id) in client_ids

    def test_client_with_active_consent_is_not_candidate(self, db, workspace_id):
        client_id = uuid.uuid4()
        r1 = ConsentLedger.grant_consent(db, workspace_id, client_id, "data_processing")
        ConsentLedger.grant_consent(db, workspace_id, client_id, "marketing")
        ConsentLedger.revoke_consent(db, r1.id, "test")

        candidates = ConsentLedger.get_deletion_candidates(db, workspace_id)
        client_ids = [c["client_id"] for c in candidates]
        assert str(client_id) not in client_ids
