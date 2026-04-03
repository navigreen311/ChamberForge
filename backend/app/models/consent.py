"""Consent record model for tracking client data-processing agreements."""
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.db.session import Base


class ConsentRecord(Base):
    __tablename__ = "consent_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    client_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    consent_type = Column(
        String(50),
        nullable=False,
        comment="data_processing | nda | marketing | third_party_sharing",
    )
    status = Column(String(20), nullable=False, default="active", comment="active | revoked")
    granted_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    revoked_at = Column(DateTime, nullable=True)
    nda_document_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": str(self.id),
            "workspace_id": str(self.workspace_id),
            "client_id": str(self.client_id),
            "consent_type": self.consent_type,
            "status": self.status,
            "granted_at": self.granted_at.isoformat() if self.granted_at else None,
            "revoked_at": self.revoked_at.isoformat() if self.revoked_at else None,
            "nda_document_url": self.nda_document_url,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
