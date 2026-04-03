"""WealthEvent model — tracks liquidity events, IPOs, inheritances, etc."""
import uuid
from datetime import datetime

from sqlalchemy import Column, String, Float, DateTime, Boolean, Text
from app.db.session import Base


class WealthEvent(Base):
    __tablename__ = "wealth_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36), nullable=False, index=True)

    event_type = Column(
        String(50), nullable=False, index=True,
    )  # exit, ipo, inheritance, divorce, board_appointment, prominence
    person_name = Column(String(255), nullable=False)
    company = Column(String(255), nullable=True)
    estimated_impact = Column(String(255), nullable=True)
    source_url = Column(Text, nullable=True)
    relevance_score = Column(Float, nullable=True, default=0.5)

    buying_window_status = Column(
        String(20), nullable=False, default="open",
    )  # open, closing, closed

    detected_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    linked_problem_id = Column(String(36), nullable=True, index=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
