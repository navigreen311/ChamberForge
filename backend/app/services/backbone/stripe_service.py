"""Stripe billing service with automatic mock fallback when no API key is configured."""
from __future__ import annotations

import hashlib
import hmac
import json
import logging
import time
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.billing import Invoice, Subscription

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Mock helpers — deterministic fake data when Stripe key is absent
# ---------------------------------------------------------------------------

def _mock_id(prefix: str = "mock") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:16]}"


def _now_ts() -> int:
    return int(time.time())


# ---------------------------------------------------------------------------
# StripeService
# ---------------------------------------------------------------------------

class StripeService:
    """Unified Stripe interface.  Falls back to in-memory mock when
    ``STRIPE_SECRET_KEY`` is empty or missing so that the full billing
    flow works locally without a real Stripe account."""

    def __init__(self) -> None:
        self.mock_mode: bool = not settings.STRIPE_SECRET_KEY
        if self.mock_mode:
            logger.warning("Stripe API key not set — running in MOCK mode")
            self._mock_customers: dict[str, dict] = {}
            self._mock_subscriptions: dict[str, dict] = {}
            self._mock_invoices: dict[str, dict] = {}
        else:
            import stripe as _stripe
            _stripe.api_key = settings.STRIPE_SECRET_KEY
            self._stripe = _stripe

    # -- Customers -----------------------------------------------------------

    def create_customer(self, name: str, email: str, metadata: dict | None = None) -> dict:
        if self.mock_mode:
            cid = _mock_id("cus")
            self._mock_customers[cid] = {"id": cid, "name": name, "email": email, "metadata": metadata or {}}
            return {"stripe_customer_id": cid}
        customer = self._stripe.Customer.create(name=name, email=email, metadata=metadata or {})
        return {"stripe_customer_id": customer.id}

    # -- Subscriptions -------------------------------------------------------

    def create_subscription(
        self,
        customer_id: str,
        amount: float,
        plan_name: str,
        interval: str = "month",
    ) -> dict:
        if self.mock_mode:
            sid = _mock_id("sub")
            now = _now_ts()
            period_end = now + (30 * 86400 if interval == "month" else 365 * 86400)
            self._mock_subscriptions[sid] = {
                "id": sid,
                "customer": customer_id,
                "status": "active",
                "current_period_start": now,
                "current_period_end": period_end,
                "plan_name": plan_name,
                "amount": amount,
            }
            return {
                "subscription_id": sid,
                "status": "active",
                "current_period_end": datetime.fromtimestamp(period_end, tz=timezone.utc).isoformat(),
            }

        # Real Stripe — create a price then subscribe
        price = self._stripe.Price.create(
            unit_amount=int(amount * 100),
            currency="usd",
            recurring={"interval": interval},
            product_data={"name": plan_name},
        )
        sub = self._stripe.Subscription.create(customer=customer_id, items=[{"price": price.id}])
        return {
            "subscription_id": sub.id,
            "status": sub.status,
            "current_period_end": datetime.fromtimestamp(
                sub.current_period_end, tz=timezone.utc
            ).isoformat(),
        }

    def cancel_subscription(self, subscription_id: str) -> dict:
        if self.mock_mode:
            if subscription_id in self._mock_subscriptions:
                self._mock_subscriptions[subscription_id]["status"] = "canceled"
            return {"status": "canceled"}
        self._stripe.Subscription.modify(subscription_id, cancel_at_period_end=True)
        return {"status": "canceled"}

    # -- Invoices ------------------------------------------------------------

    def create_invoice(
        self,
        customer_id: str,
        line_items: list[dict],
        due_date: str | None = None,
    ) -> dict:
        total = sum(item.get("amount", 0) for item in line_items)
        if self.mock_mode:
            iid = _mock_id("inv")
            self._mock_invoices[iid] = {
                "id": iid,
                "customer": customer_id,
                "amount": total,
                "status": "draft",
                "line_items": line_items,
                "due_date": due_date,
            }
            return {"invoice_id": iid, "amount": total, "status": "draft"}

        invoice = self._stripe.Invoice.create(
            customer=customer_id,
            collection_method="send_invoice",
            due_date=int(
                datetime.fromisoformat(due_date).timestamp()
            ) if due_date else int((datetime.now(tz=timezone.utc) + timedelta(days=30)).timestamp()),
        )
        for item in line_items:
            self._stripe.InvoiceItem.create(
                customer=customer_id,
                invoice=invoice.id,
                amount=int(item.get("amount", 0) * 100),
                currency="usd",
                description=item.get("description", ""),
            )
        finalized = self._stripe.Invoice.finalize_invoice(invoice.id)
        return {
            "invoice_id": finalized.id,
            "amount": finalized.amount_due / 100,
            "status": finalized.status,
        }

    # -- Payment history -----------------------------------------------------

    def get_payment_history(self, customer_id: str) -> list[dict]:
        if self.mock_mode:
            return [
                {
                    "invoice_id": v["id"],
                    "amount": v["amount"],
                    "status": v["status"],
                }
                for v in self._mock_invoices.values()
                if v["customer"] == customer_id
            ]
        charges = self._stripe.Charge.list(customer=customer_id, limit=50)
        return [
            {
                "charge_id": c.id,
                "amount": c.amount / 100,
                "status": c.status,
                "created": datetime.fromtimestamp(c.created, tz=timezone.utc).isoformat(),
            }
            for c in charges.auto_paging_iter()
        ]

    # -- Webhooks ------------------------------------------------------------

    def handle_webhook(self, payload: bytes, signature: str) -> dict:
        """Parse and route a Stripe webhook event.  In mock mode we accept
        raw JSON without signature verification."""
        if self.mock_mode:
            event = json.loads(payload)
        else:
            event = self._stripe.Webhook.construct_event(
                payload, signature, settings.STRIPE_WEBHOOK_SECRET
            )

        event_type: str = event.get("type", "") if isinstance(event, dict) else event.type
        data_object: Any = (
            event.get("data", {}).get("object", {})
            if isinstance(event, dict)
            else event.data.object
        )

        handler_map = {
            "invoice.paid": self._on_invoice_paid,
            "invoice.payment_failed": self._on_invoice_failed,
            "customer.subscription.updated": self._on_subscription_updated,
            "customer.subscription.deleted": self._on_subscription_deleted,
        }

        handler = handler_map.get(event_type)
        if handler:
            return handler(data_object)
        return {"status": "ignored", "event_type": event_type}

    # -- Webhook handlers (private) ------------------------------------------

    @staticmethod
    def _on_invoice_paid(data: Any) -> dict:
        invoice_id = data.get("id") if isinstance(data, dict) else data.id
        return {"status": "processed", "event": "invoice.paid", "invoice_id": invoice_id}

    @staticmethod
    def _on_invoice_failed(data: Any) -> dict:
        invoice_id = data.get("id") if isinstance(data, dict) else data.id
        return {"status": "processed", "event": "invoice.payment_failed", "invoice_id": invoice_id}

    @staticmethod
    def _on_subscription_updated(data: Any) -> dict:
        sub_id = data.get("id") if isinstance(data, dict) else data.id
        status = data.get("status") if isinstance(data, dict) else data.status
        return {"status": "processed", "event": "customer.subscription.updated", "subscription_id": sub_id, "new_status": status}

    @staticmethod
    def _on_subscription_deleted(data: Any) -> dict:
        sub_id = data.get("id") if isinstance(data, dict) else data.id
        return {"status": "processed", "event": "customer.subscription.deleted", "subscription_id": sub_id}

    # -- Revenue dashboard ---------------------------------------------------

    def get_revenue_dashboard(self, db: Session, workspace_id: str) -> dict:
        """Compute revenue KPIs from local DB records."""
        now = datetime.now(tz=timezone.utc)
        year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)

        # Active subscriptions
        active_subs = (
            db.query(Subscription)
            .filter(Subscription.workspace_id == workspace_id, Subscription.status == "active")
            .all()
        )
        active_count = len(active_subs)
        mrr = sum(s.amount for s in active_subs)
        arr = mrr * 12

        # Total revenue YTD (paid invoices)
        total_revenue_ytd = (
            db.query(func.coalesce(func.sum(Invoice.amount), 0))
            .filter(
                Invoice.workspace_id == workspace_id,
                Invoice.status == "paid",
                Invoice.paid_at >= year_start,
            )
            .scalar()
        )

        # Avg revenue per client
        unique_clients = (
            db.query(func.count(func.distinct(Subscription.client_id)))
            .filter(Subscription.workspace_id == workspace_id, Subscription.status == "active")
            .scalar()
        ) or 0
        avg_revenue = mrr / unique_clients if unique_clients else 0.0

        # Churn rate (canceled in last 30 days / total start-of-period)
        thirty_days_ago = now - timedelta(days=30)
        canceled_count = (
            db.query(func.count(Subscription.id))
            .filter(
                Subscription.workspace_id == workspace_id,
                Subscription.status == "canceled",
                Subscription.created_at >= thirty_days_ago,
            )
            .scalar()
        ) or 0
        total_at_start = active_count + canceled_count
        churn_rate = (canceled_count / total_at_start * 100) if total_at_start else 0.0

        return {
            "mrr": round(mrr, 2),
            "arr": round(arr, 2),
            "active_subscriptions": active_count,
            "total_revenue_ytd": round(float(total_revenue_ytd), 2),
            "avg_revenue_per_client": round(avg_revenue, 2),
            "churn_rate": round(churn_rate, 2),
        }


# Module-level singleton
stripe_service = StripeService()
