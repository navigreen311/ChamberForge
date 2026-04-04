"""Evidence model for the Evidence Graph."""
import uuid
from datetime import date, datetime

from sqlalchemy import Column, Date, DateTime, Float, Index, JSON, String, func


from app.db.session import Base


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(String(36), primary_key=True, default=uuid.uuid4)
    problem_id = Column(String(36), nullable=True, index=True)
    workspace_id = Column(String(36), nullable=False, index=True)
    source_url = Column(String, nullable=False, index=True)
    source_type = Column(String, nullable=False, index=True)
    publication_date = Column(Date, nullable=False)
    credibility_score = Column(Float, nullable=False, default=5.0)
    extracted_claims = Column(JSON, default=list)
    contradiction_flags = Column(JSON, default=list)
    recency_decay_score = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index("ix_evidence_workspace_credibility", "workspace_id", "credibility_score"),
    )

    def __repr__(self) -> str:
        return f"<Evidence {self.id} type={self.source_type} credibility={self.credibility_score}>"
