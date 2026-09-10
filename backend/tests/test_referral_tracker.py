"""Tests for ReferralTracker — commission math and report aggregation."""
import uuid
from datetime import datetime, timezone
from unittest.mock import MagicMock

import pytest

from app.services.backbone.referral_tracker import ReferralTracker

# -- Commission calculation --------------------------------------------------

def test_commission_calculation_basic():
    result = ReferralTracker.calculate_commission(50000, 10)
    assert result == 5000.0


def test_commission_calculation_custom_pct():
    result = ReferralTracker.calculate_commission(100000, 7.5)
    assert result == 7500.0


def test_commission_calculation_zero():
    result = ReferralTracker.calculate_commission(0, 10)
    assert result == 0.0


# -- Create referral ---------------------------------------------------------

def test_create_referral():
    db = MagicMock()
    workspace_id = str(uuid.uuid4())
    referrer_id = str(uuid.uuid4())
    referred_id = str(uuid.uuid4())

    ref = ReferralTracker.create_referral(
        db, workspace_id, referrer_id, referred_id, 50000, 10.0
    )
    assert ref.commission_amount == 5000.0
    assert ref.status == "pending"
    db.add.assert_called_once()
    db.commit.assert_called_once()
    db.refresh.assert_called_once()


# -- Report aggregation ------------------------------------------------------

def test_referral_report_aggregation():
    workspace_id = str(uuid.uuid4())
    now = datetime.now(tz=timezone.utc)

    class FakeReferral:
        def __init__(self, commission, status):
            self.id = uuid.uuid4()
            self.referrer_id = uuid.uuid4()
            self.referred_client_id = uuid.uuid4()
            self.deal_value = commission * 10
            self.commission_pct = 10.0
            self.commission_amount = commission
            self.status = status
            self.created_at = now

    refs = [
        FakeReferral(5000, "paid"),
        FakeReferral(3000, "pending"),
        FakeReferral(2000, "paid"),
    ]

    db = MagicMock()
    query = MagicMock()
    query.filter.return_value = query
    query.order_by.return_value = query
    query.all.return_value = refs
    db.query.return_value = query

    report = ReferralTracker.get_referral_report(db, workspace_id)

    assert report["total_referrals"] == 3
    assert report["total_commission_earned"] == 7000.0
    assert report["total_commission_pending"] == 3000.0
    assert len(report["referrals"]) == 3


# -- Mark paid ---------------------------------------------------------------

def test_mark_paid():
    ref_id = str(uuid.uuid4())
    fake_ref = MagicMock()
    fake_ref.status = "pending"

    db = MagicMock()
    query = MagicMock()
    query.filter.return_value = query
    query.first.return_value = fake_ref
    db.query.return_value = query

    result = ReferralTracker.mark_paid(db, ref_id)
    assert result.status == "paid"
    db.commit.assert_called_once()


def test_mark_paid_not_found():
    db = MagicMock()
    query = MagicMock()
    query.filter.return_value = query
    query.first.return_value = None
    db.query.return_value = query

    with pytest.raises(ValueError, match="not found"):
        ReferralTracker.mark_paid(db, str(uuid.uuid4()))
