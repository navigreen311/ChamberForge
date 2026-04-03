"""CommunityInsight model — anonymized practitioner insights."""
import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime
from app.db.session import Base


class CommunityInsight(Base):
    __tablename__ = "community_insights"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    contributor_workspace_id = Column(String(36), nullable=False, index=True)

    insight_type = Column(
        String(50), nullable=False, index=True,
    )  # market_signal, pricing_intel, objection_pattern, delivery_tip
    content = Column(Text, nullable=False)
    category = Column(String(100), nullable=True, index=True)
    is_anonymized = Column(Boolean, nullable=False, default=True)

    upvotes = Column(Integer, nullable=False, default=0)
    downvotes = Column(Integer, nullable=False, default=0)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
