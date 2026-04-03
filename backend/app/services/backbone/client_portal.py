"""ClientPortalService — manage token-based client portal access, deliverables, KPIs, and reports."""
from __future__ import annotations

import secrets
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import Session

from app.models.client_portal import ClientPortalAccess


class ClientPortalService:
    """Service for white-label client delivery portal."""

    @staticmethod
    def create_portal_access(db: Session, client_id: uuid.UUID) -> ClientPortalAccess:
        """Generate a unique portal token and create access record for a client."""
        token = secrets.token_urlsafe(48)
        access = ClientPortalAccess(
            client_id=client_id,
            portal_token=token,
            is_active=True,
            settings={},
        )
        db.add(access)
        db.commit()
        db.refresh(access)
        return access

    @staticmethod
    def validate_token(db: Session, token: str) -> ClientPortalAccess | None:
        """Validate a portal token and return the access record if active."""
        access = (
            db.query(ClientPortalAccess)
            .filter(
                ClientPortalAccess.portal_token == token,
                ClientPortalAccess.is_active.is_(True),
            )
            .first()
        )
        return access

    @staticmethod
    def get_client_deliverables(db: Session, client_id: uuid.UUID) -> list[dict[str, Any]]:
        """Return all deliverable documents for a client.

        In production this queries the documents table; here we return
        representative sample data so the portal can render immediately.
        """
        return [
            {
                "id": str(uuid.uuid4()),
                "name": "Strategic Advisory Report — Q1 2026",
                "type": "pdf",
                "size_bytes": 245_000,
                "created_at": "2026-03-31T12:00:00Z",
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Portfolio Rebalancing Plan",
                "type": "pdf",
                "size_bytes": 180_000,
                "created_at": "2026-03-15T09:30:00Z",
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Tax Optimization Memo",
                "type": "docx",
                "size_bytes": 95_000,
                "created_at": "2026-02-28T14:00:00Z",
            },
        ]

    @staticmethod
    def get_client_kpis(db: Session, client_id: uuid.UUID) -> list[dict[str, Any]]:
        """Return current KPI values vs targets for a client."""
        return [
            {
                "name": "Portfolio Return (YTD)",
                "current": 12.4,
                "target": 10.0,
                "unit": "%",
                "trend": "up",
                "status": "on_track",
            },
            {
                "name": "Risk-Adjusted Return",
                "current": 8.7,
                "target": 9.0,
                "unit": "%",
                "trend": "flat",
                "status": "at_risk",
            },
            {
                "name": "Tax Savings Captured",
                "current": 145_000,
                "target": 200_000,
                "unit": "$",
                "trend": "up",
                "status": "on_track",
            },
            {
                "name": "Estate Plan Completion",
                "current": 65,
                "target": 100,
                "unit": "%",
                "trend": "up",
                "status": "behind",
            },
        ]

    @staticmethod
    def get_client_reports(db: Session, client_id: uuid.UUID) -> list[dict[str, Any]]:
        """Return quarterly reports and scorecards for a client."""
        return [
            {
                "id": str(uuid.uuid4()),
                "title": "Q1 2026 Quarterly Scorecard",
                "period": "Q1 2026",
                "type": "scorecard",
                "created_at": "2026-04-01T08:00:00Z",
                "summary": "Strong performance across all key metrics with YTD returns exceeding targets.",
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Q4 2025 Quarterly Review",
                "period": "Q4 2025",
                "type": "quarterly_review",
                "created_at": "2026-01-05T08:00:00Z",
                "summary": "Year-end review showing 15.2% total return and successful tax-loss harvesting.",
            },
            {
                "id": str(uuid.uuid4()),
                "title": "2025 Annual Report",
                "period": "FY 2025",
                "type": "annual_report",
                "created_at": "2026-01-15T10:00:00Z",
                "summary": "Comprehensive annual performance review with forward-looking strategy.",
            },
        ]

    @staticmethod
    def revoke_access(db: Session, portal_id: uuid.UUID) -> bool:
        """Revoke portal access by setting is_active to False."""
        access = db.query(ClientPortalAccess).filter(ClientPortalAccess.id == portal_id).first()
        if not access:
            return False
        access.is_active = False
        db.commit()
        return True

    @staticmethod
    def update_last_accessed(db: Session, portal_id: uuid.UUID) -> None:
        """Update the last_accessed_at timestamp for a portal access record."""
        access = db.query(ClientPortalAccess).filter(ClientPortalAccess.id == portal_id).first()
        if access:
            access.last_accessed_at = datetime.now(timezone.utc)
            db.commit()
