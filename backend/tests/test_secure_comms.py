"""Tests for the Secure Communications service."""
import hashlib
import uuid

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.session import Base
from app.models.message import SecureMessage
from app.services.backbone.secure_comms import SecureComms


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
def sender_id():
    return uuid.uuid4()


@pytest.fixture
def recipient_id():
    return uuid.uuid4()


class TestCreateMessage:
    def test_creates_encrypted_message(self, db, workspace_id, sender_id, recipient_id):
        result = SecureComms.create_message(
            db, workspace_id, sender_id, recipient_id, "Hello secure world"
        )
        assert result["content"] == "Hello secure world"
        assert result["is_encrypted"] is True
        assert result["sender_id"] == str(sender_id)
        assert result["recipient_id"] == str(recipient_id)

    def test_creates_unencrypted_message(self, db, workspace_id, sender_id, recipient_id):
        result = SecureComms.create_message(
            db, workspace_id, sender_id, recipient_id, "Plain text", encrypted=False
        )
        assert result["is_encrypted"] is False
        assert result["content"] == "Plain text"

    def test_encrypted_content_stored_differently(self, db, workspace_id, sender_id, recipient_id):
        SecureComms.create_message(db, workspace_id, sender_id, recipient_id, "Secret")
        stored = db.query(SecureMessage).first()
        # Stored content should be base64-encoded, not the raw text
        assert stored.content != "Secret"


class TestGetMessages:
    def test_retrieves_user_messages(self, db, workspace_id, sender_id, recipient_id):
        SecureComms.create_message(db, workspace_id, sender_id, recipient_id, "msg1")
        SecureComms.create_message(db, workspace_id, recipient_id, sender_id, "msg2")

        messages = SecureComms.get_messages(db, workspace_id, sender_id)
        assert len(messages) == 2

    def test_filters_by_conversation(self, db, workspace_id, sender_id, recipient_id):
        other = uuid.uuid4()
        SecureComms.create_message(db, workspace_id, sender_id, recipient_id, "to recipient")
        SecureComms.create_message(db, workspace_id, sender_id, other, "to other")

        messages = SecureComms.get_messages(
            db, workspace_id, sender_id, conversation_with=recipient_id
        )
        assert len(messages) == 1
        assert messages[0]["content"] == "to recipient"

    def test_decrypts_messages_on_retrieval(self, db, workspace_id, sender_id, recipient_id):
        SecureComms.create_message(db, workspace_id, sender_id, recipient_id, "Decrypted text")
        messages = SecureComms.get_messages(db, workspace_id, sender_id)
        assert messages[0]["content"] == "Decrypted text"


class TestVerifyIdentity:
    def test_valid_passphrase(self):
        user_id = uuid.uuid4()
        valid_hash = hashlib.sha256(str(user_id).encode()).hexdigest()
        assert SecureComms.verify_identity(user_id, valid_hash) is True

    def test_invalid_passphrase(self):
        user_id = uuid.uuid4()
        assert SecureComms.verify_identity(user_id, "wrong_hash") is False


class TestAuditTrail:
    def test_returns_audit_entries(self, db, workspace_id, sender_id, recipient_id):
        SecureComms.create_message(db, workspace_id, sender_id, recipient_id, "audit msg")
        trail = SecureComms.get_audit_trail(db, workspace_id)
        assert len(trail) == 1
        assert "message_id" in trail[0]
        assert "content" not in trail[0]  # Audit trail excludes content

    def test_filters_by_user(self, db, workspace_id, sender_id, recipient_id):
        other = uuid.uuid4()
        SecureComms.create_message(db, workspace_id, sender_id, recipient_id, "msg1")
        SecureComms.create_message(db, workspace_id, other, recipient_id, "msg2")

        trail = SecureComms.get_audit_trail(db, workspace_id, user_id=sender_id)
        assert len(trail) == 1
