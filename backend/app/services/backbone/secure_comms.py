"""Secure Communications — encrypted messaging with full audit trail."""
import base64
import hashlib
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.models.message import SecureMessage


class SecureComms:
    """
    Encrypted inter-user messaging with identity verification and audit logging.
    All messages are persisted with encryption flags and read receipts.
    """

    @staticmethod
    def _simple_encrypt(content: str) -> str:
        """
        Basic base64 encoding as a placeholder for real encryption.
        In production, replace with AES-256-GCM or envelope encryption via AWS KMS.
        """
        return base64.b64encode(content.encode("utf-8")).decode("utf-8")

    @staticmethod
    def _simple_decrypt(content: str) -> str:
        """Reverse the placeholder encryption."""
        try:
            return base64.b64decode(content.encode("utf-8")).decode("utf-8")
        except Exception:
            return content  # Return as-is if decryption fails

    @classmethod
    def create_message(
        cls,
        db: Session,
        workspace_id: UUID,
        sender_id: UUID,
        recipient_id: UUID,
        content: str,
        encrypted: bool = True,
    ) -> dict:
        """Create and persist a new secure message."""
        stored_content = cls._simple_encrypt(content) if encrypted else content

        message = SecureMessage(
            workspace_id=workspace_id,
            sender_id=sender_id,
            recipient_id=recipient_id,
            content=stored_content,
            is_encrypted=encrypted,
        )
        db.add(message)
        db.commit()
        db.refresh(message)

        result = message.to_dict()
        # Return decrypted content in response
        result["content"] = content
        return result

    @classmethod
    def get_messages(
        cls,
        db: Session,
        workspace_id: UUID,
        user_id: UUID,
        conversation_with: UUID | None = None,
    ) -> list[dict]:
        """
        Retrieve messages for a user within a workspace.
        If conversation_with is specified, filter to that conversation pair.
        """
        query = db.query(SecureMessage).filter(
            and_(
                SecureMessage.workspace_id == workspace_id,
                or_(
                    SecureMessage.sender_id == user_id,
                    SecureMessage.recipient_id == user_id,
                ),
            )
        )

        if conversation_with:
            query = query.filter(
                or_(
                    and_(
                        SecureMessage.sender_id == user_id,
                        SecureMessage.recipient_id == conversation_with,
                    ),
                    and_(
                        SecureMessage.sender_id == conversation_with,
                        SecureMessage.recipient_id == user_id,
                    ),
                )
            )

        messages = query.order_by(SecureMessage.created_at.asc()).all()

        results = []
        for msg in messages:
            d = msg.to_dict()
            if msg.is_encrypted:
                d["content"] = cls._simple_decrypt(msg.content)
            results.append(d)

        return results

    @staticmethod
    def verify_identity(user_id: UUID, passphrase_hash: str) -> bool:
        """
        Verify user identity via passphrase hash comparison.
        In production, this checks against a stored bcrypt/argon2 hash.
        Here we demonstrate the interface with a deterministic check.
        """
        # Deterministic verification: hash the user_id and compare prefix
        expected = hashlib.sha256(str(user_id).encode()).hexdigest()
        return passphrase_hash == expected

    @classmethod
    def get_audit_trail(
        cls,
        db: Session,
        workspace_id: UUID,
        user_id: UUID | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> list[dict]:
        """
        Retrieve a chronological audit trail of all messages in a workspace.
        Supports filtering by user and date range.
        """
        query = db.query(SecureMessage).filter(
            SecureMessage.workspace_id == workspace_id
        )

        if user_id:
            query = query.filter(
                or_(
                    SecureMessage.sender_id == user_id,
                    SecureMessage.recipient_id == user_id,
                )
            )

        if start_date:
            query = query.filter(SecureMessage.created_at >= start_date)

        if end_date:
            query = query.filter(SecureMessage.created_at <= end_date)

        messages = query.order_by(SecureMessage.created_at.asc()).all()

        return [
            {
                "message_id": str(msg.id),
                "sender_id": str(msg.sender_id),
                "recipient_id": str(msg.recipient_id),
                "is_encrypted": msg.is_encrypted,
                "read_at": msg.read_at.isoformat() if msg.read_at else None,
                "created_at": msg.created_at.isoformat() if msg.created_at else None,
                # Audit trail does NOT include message content for security
            }
            for msg in messages
        ]
