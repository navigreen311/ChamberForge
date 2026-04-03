"""RetainerOps — Stripe-backed billing and subscription management."""
from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone

from app.core.config import settings

logger = logging.getLogger(__name__)

# Try to initialize Stripe
_stripe = None
try:
    import stripe as _stripe_lib
    if settings.STRIPE_SECRET_KEY:
        _stripe_lib.api_key = settings.STRIPE_SECRET_KEY
        _stripe = _stripe_lib
    else:
        logger.info("No STRIPE_SECRET_KEY set; RetainerOps will use mock mode")
except ImportError:
    logger.warning("stripe package not installed; RetainerOps will use mock mode")


class RetainerOps:
    """Manages retainer billing, subscriptions, and invoicing via Stripe."""

    @staticmethod
    def create_customer(client_name: str, email: str) -> dict:
        """Create a Stripe customer (or mock if no key configured)."""
        if _stripe:
            try:
                customer = _stripe.Customer.create(
                    name=client_name,
                    email=email,
                    metadata={"source": "chamberforge"},
                )
                return {"stripe_customer_id": customer.id}
            except Exception as exc:
                logger.error("Stripe create_customer failed: %s", exc)
                raise

        # Mock mode
        mock_id = f"cus_mock_{uuid.uuid4().hex[:12]}"
        logger.info("Mock: created customer %s for %s (%s)", mock_id, client_name, email)
        return {"stripe_customer_id": mock_id}

    @staticmethod
    def create_subscription(customer_id: str, monthly_amount: float, description: str) -> dict:
        """Create a subscription for a customer."""
        if _stripe:
            try:
                # Create a price object for the subscription
                price = _stripe.Price.create(
                    unit_amount=int(monthly_amount * 100),  # cents
                    currency="usd",
                    recurring={"interval": "month"},
                    product_data={"name": description},
                )
                subscription = _stripe.Subscription.create(
                    customer=customer_id,
                    items=[{"price": price.id}],
                )
                return {
                    "subscription_id": subscription.id,
                    "status": subscription.status,
                    "current_period_start": subscription.current_period_start,
                    "current_period_end": subscription.current_period_end,
                    "monthly_amount": monthly_amount,
                }
            except Exception as exc:
                logger.error("Stripe create_subscription failed: %s", exc)
                raise

        # Mock mode
        mock_id = f"sub_mock_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc)
        return {
            "subscription_id": mock_id,
            "status": "active",
            "current_period_start": now.isoformat(),
            "current_period_end": now.isoformat(),
            "monthly_amount": monthly_amount,
        }

    @staticmethod
    def create_invoice(customer_id: str, line_items: list, due_date: str) -> dict:
        """Create an invoice for a customer."""
        if _stripe:
            try:
                invoice = _stripe.Invoice.create(
                    customer=customer_id,
                    collection_method="send_invoice",
                    due_date=int(datetime.fromisoformat(due_date).timestamp()),
                )
                for item in line_items:
                    _stripe.InvoiceItem.create(
                        customer=customer_id,
                        invoice=invoice.id,
                        amount=int(item.get("amount", 0) * 100),
                        currency="usd",
                        description=item.get("description", "Service"),
                    )
                finalized = _stripe.Invoice.finalize_invoice(invoice.id)
                return {
                    "invoice_id": finalized.id,
                    "status": finalized.status,
                    "amount_due": finalized.amount_due / 100,
                    "due_date": due_date,
                    "hosted_invoice_url": finalized.hosted_invoice_url,
                }
            except Exception as exc:
                logger.error("Stripe create_invoice failed: %s", exc)
                raise

        # Mock mode
        mock_id = f"inv_mock_{uuid.uuid4().hex[:12]}"
        total = sum(item.get("amount", 0) for item in line_items)
        return {
            "invoice_id": mock_id,
            "status": "open",
            "amount_due": total,
            "due_date": due_date,
            "hosted_invoice_url": f"https://invoice.stripe.com/mock/{mock_id}",
        }

    @staticmethod
    def get_revenue_summary(workspace_id: str) -> dict:
        """Get revenue summary for a workspace (mock implementation).

        In production this would query Stripe subscriptions/invoices
        filtered by workspace metadata.
        """
        # In a real implementation, we would:
        # 1. Query all Stripe customers with workspace_id in metadata
        # 2. Aggregate subscription and invoice data
        # For now, return a structured mock.
        return {
            "workspace_id": workspace_id,
            "mrr": 0.0,
            "arr": 0.0,
            "active_subscriptions": 0,
            "pending_invoices": 0,
            "currency": "usd",
            "as_of": datetime.now(timezone.utc).isoformat(),
        }
