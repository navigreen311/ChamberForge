"""WorkspaceBudget - per-workspace AI spend ceiling.

P-01 creates the table; P-04 enforces it. Today `AIRuntime.check_budget`
takes the budget as a request parameter and returns a boolean nobody reads,
which is why the platform has no kill switch. Persisting the ceiling is what
lets P-04 refuse a call instead of reporting on one.
"""
import uuid
from datetime import datetime, timezone

import sqlalchemy as sa

from app.db.session import Base


class WorkspaceBudget(Base):
    __tablename__ = "workspace_budgets"

    id = sa.Column(sa.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = sa.Column(sa.String(36), nullable=False, unique=True, index=True)
    monthly_budget_usd = sa.Column(sa.Float, nullable=False, default=250.0)
    period_start = sa.Column(
        sa.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    spent_usd = sa.Column(sa.Float, nullable=False, default=0.0)
    enforced = sa.Column(sa.Boolean, nullable=False, default=True)
    approval_threshold_usd = sa.Column(sa.Float, nullable=True)
    created_at = sa.Column(
        sa.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at = sa.Column(
        sa.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
