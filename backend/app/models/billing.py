"""Billing models — subscriptions, invoices, and referrals."""
import uuid
from datetime import date, datetime

from sqlalchemy import Column, Date, DateTime, Float, JSON, String, func
from sqlalchemy.dialects.postgresql import UUID

from app.db.session import Base


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    client_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    stripe_subscription_id = Column(String, unique=True, nullable=True)
    stripe_customer_id = Column(String, nullable=True)
    plan_name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="usd")
    status = Column(String, default="active")  # active | past_due | canceled
    current_period_start = Column(DateTime, nullable=True)
    current_period_end = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    client_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    stripe_invoice_id = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
    status = Column(String, default="draft")  # draft | sent | paid | overdue
    due_date = Column(Date, nullable=True)
    paid_at = Column(DateTime, nullable=True)
    line_items = Column(JSON, default=list)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)


class Referral(Base):
    __tablename__ = "referrals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    referrer_id = Column(UUID(as_uuid=True), nullable=False)
    referred_client_id = Column(UUID(as_uuid=True), nullable=False)
    deal_value = Column(Float, nullable=False)
    commission_pct = Column(Float, default=10.0)
    commission_amount = Column(Float, nullable=False)
    status = Column(String, default="pending")  # pending | paid
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
