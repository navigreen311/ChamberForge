"""Billing models — subscriptions, invoices, and referrals."""
import uuid

import sqlalchemy as sa
from sqlalchemy import JSON, Column, Date, DateTime, Float, String, func

from app.db.session import Base


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(sa.String(36), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(sa.String(36), nullable=False, index=True)
    client_id = Column(sa.String(36), nullable=False, index=True)
    stripe_subscription_id = Column(String, unique=True, nullable=True)
    stripe_customer_id = Column(String, nullable=True, index=True)
    plan_name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="usd")
    status = Column(String, default="active")  # active | past_due | canceled
    current_period_start = Column(DateTime, nullable=True)
    current_period_end = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    __table_args__ = (
        sa.Index("ix_subscriptions_workspace_status", "workspace_id", "status"),
    )


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(sa.String(36), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(sa.String(36), nullable=False, index=True)
    client_id = Column(sa.String(36), nullable=False, index=True)
    stripe_invoice_id = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
    status = Column(String, default="draft")  # draft | sent | paid | overdue
    due_date = Column(Date, nullable=True, index=True)
    paid_at = Column(DateTime, nullable=True)
    line_items = Column(JSON, default=list)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    __table_args__ = (
        sa.Index("ix_invoices_workspace_status", "workspace_id", "status"),
    )


class Referral(Base):
    __tablename__ = "referrals"

    id = Column(sa.String(36), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(sa.String(36), nullable=False, index=True)
    referrer_id = Column(sa.String(36), nullable=False)
    referred_client_id = Column(sa.String(36), nullable=False)
    deal_value = Column(Float, nullable=False)
    commission_pct = Column(Float, default=10.0)
    commission_amount = Column(Float, nullable=False)
    status = Column(String, default="pending")  # pending | paid
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
