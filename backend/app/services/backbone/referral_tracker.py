"""Referral tracking and commission management."""
from __future__ import annotations

import uuid

from sqlalchemy.orm import Session

from app.models.billing import Referral


class ReferralTracker:
    """Manages partner/client referral commissions."""

    @staticmethod
    def calculate_commission(deal_value: float, commission_pct: float) -> float:
        return round(deal_value * (commission_pct / 100), 2)

    @staticmethod
    def create_referral(
        db: Session,
        workspace_id: str,
        referrer_id: str,
        referred_client_id: str,
        deal_value: float,
        commission_pct: float = 10.0,
    ) -> Referral:
        commission = ReferralTracker.calculate_commission(deal_value, commission_pct)
        referral = Referral(
            id=uuid.uuid4(),
            workspace_id=workspace_id,
            referrer_id=referrer_id,
            referred_client_id=referred_client_id,
            deal_value=deal_value,
            commission_pct=commission_pct,
            commission_amount=commission,
            status="pending",
        )
        db.add(referral)
        db.commit()
        db.refresh(referral)
        return referral

    @staticmethod
    def get_referral_report(db: Session, workspace_id: str) -> dict:
        referrals = (
            db.query(Referral)
            .filter(Referral.workspace_id == workspace_id)
            .order_by(Referral.created_at.desc())
            .all()
        )
        total_earned = sum(r.commission_amount for r in referrals if r.status == "paid")
        total_pending = sum(r.commission_amount for r in referrals if r.status == "pending")
        return {
            "total_referrals": len(referrals),
            "total_commission_earned": round(total_earned, 2),
            "total_commission_pending": round(total_pending, 2),
            "referrals": [
                {
                    "id": str(r.id),
                    "referrer_id": str(r.referrer_id),
                    "referred_client_id": str(r.referred_client_id),
                    "deal_value": r.deal_value,
                    "commission_pct": r.commission_pct,
                    "commission_amount": r.commission_amount,
                    "status": r.status,
                    "created_at": r.created_at.isoformat() if r.created_at else None,
                }
                for r in referrals
            ],
        }

    @staticmethod
    def mark_paid(db: Session, referral_id: str) -> Referral:
        referral = db.query(Referral).filter(Referral.id == referral_id).first()
        if not referral:
            raise ValueError(f"Referral {referral_id} not found")
        referral.status = "paid"
        db.commit()
        db.refresh(referral)
        return referral


referral_tracker = ReferralTracker()
