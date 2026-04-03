"""Consent Ledger — immutable audit trail for client consent management."""
from datetime import datetime
from uuid import UUID

from sqlalchemy import and_, func
from sqlalchemy.orm import Session

from app.models.consent import ConsentRecord


VALID_CONSENT_TYPES = {"data_processing", "nda", "marketing", "third_party_sharing"}


class ConsentLedger:
    """Manages consent lifecycle: grant, revoke, query, and audit export."""

    @staticmethod
    def grant_consent(
        db: Session,
        workspace_id: UUID,
        client_id: UUID,
        consent_type: str,
        nda_url: str | None = None,
    ) -> ConsentRecord:
        """Grant a new consent record for a client."""
        if consent_type not in VALID_CONSENT_TYPES:
            raise ValueError(
                f"Invalid consent_type '{consent_type}'. "
                f"Must be one of: {', '.join(sorted(VALID_CONSENT_TYPES))}"
            )

        record = ConsentRecord(
            workspace_id=workspace_id,
            client_id=client_id,
            consent_type=consent_type,
            status="active",
            granted_at=datetime.utcnow(),
            nda_document_url=nda_url,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    def revoke_consent(db: Session, consent_id: UUID, reason: str | None = None) -> ConsentRecord:
        """Revoke an existing consent, recording the reason in notes."""
        record = db.query(ConsentRecord).filter(ConsentRecord.id == consent_id).first()
        if not record:
            raise ValueError(f"Consent record {consent_id} not found")
        if record.status == "revoked":
            raise ValueError(f"Consent record {consent_id} is already revoked")

        record.status = "revoked"
        record.revoked_at = datetime.utcnow()
        if reason:
            record.notes = (record.notes or "") + f"\nRevocation reason: {reason}"
        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    def get_client_consents(db: Session, client_id: UUID) -> list[ConsentRecord]:
        """Return all consent records for a given client."""
        return (
            db.query(ConsentRecord)
            .filter(ConsentRecord.client_id == client_id)
            .order_by(ConsentRecord.created_at.desc())
            .all()
        )

    @staticmethod
    def check_consent(db: Session, client_id: UUID, consent_type: str) -> bool:
        """Check whether the client has an active consent of the given type."""
        exists = (
            db.query(ConsentRecord)
            .filter(
                and_(
                    ConsentRecord.client_id == client_id,
                    ConsentRecord.consent_type == consent_type,
                    ConsentRecord.status == "active",
                )
            )
            .first()
        )
        return exists is not None

    @staticmethod
    def get_deletion_candidates(db: Session, workspace_id: UUID) -> list[dict]:
        """
        Return clients whose consents are ALL revoked (no active consents remain).
        These clients are candidates for data deletion under GDPR / right-to-erasure.
        """
        # Subquery: clients with at least one active consent
        active_sub = (
            db.query(ConsentRecord.client_id)
            .filter(
                and_(
                    ConsentRecord.workspace_id == workspace_id,
                    ConsentRecord.status == "active",
                )
            )
            .distinct()
            .subquery()
        )

        # Clients in workspace that have consent records but none active
        candidates = (
            db.query(
                ConsentRecord.client_id,
                func.max(ConsentRecord.revoked_at).label("last_revoked"),
            )
            .filter(
                and_(
                    ConsentRecord.workspace_id == workspace_id,
                    ConsentRecord.client_id.notin_(db.query(active_sub.c.client_id)),
                )
            )
            .group_by(ConsentRecord.client_id)
            .all()
        )

        return [
            {
                "client_id": str(c.client_id),
                "last_revoked_at": c.last_revoked.isoformat() if c.last_revoked else None,
            }
            for c in candidates
        ]

    @staticmethod
    def export_consent_report(db: Session, workspace_id: UUID) -> list[dict]:
        """Export an audit-ready consent report for the entire workspace."""
        records = (
            db.query(ConsentRecord)
            .filter(ConsentRecord.workspace_id == workspace_id)
            .order_by(ConsentRecord.client_id, ConsentRecord.created_at)
            .all()
        )
        return [r.to_dict() for r in records]
