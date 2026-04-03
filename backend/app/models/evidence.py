"""Evidence model."""
import uuid

import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg
from sqlalchemy.orm import relationship

from app.db.session import Base


class Evidence(Base):
    __tablename__ = "evidences"

    id = sa.Column(pg.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    problem_id = sa.Column(
        pg.UUID(as_uuid=True), sa.ForeignKey("problems.id"), nullable=True
    )
    workspace_id = sa.Column(pg.UUID(as_uuid=True), nullable=False)
    source_url = sa.Column(sa.String, nullable=True)
    source_type = sa.Column(sa.String, nullable=True)
    publication_date = sa.Column(sa.Date, nullable=True)
    credibility_score = sa.Column(sa.Float, nullable=True)
    extracted_claims = sa.Column(pg.JSON, default=list)
    contradiction_flags = sa.Column(pg.JSON, default=list)
    recency_decay_score = sa.Column(sa.Float, default=0)
    created_at = sa.Column(sa.DateTime, server_default=sa.func.now(), nullable=False)
    updated_at = sa.Column(
        sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False
    )

    problem = relationship("Problem", back_populates="evidences")
