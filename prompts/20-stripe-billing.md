# Prompt 20: Stripe Billing — Retainers, Milestones, Partner Payouts
Branch: ai-feature/stripe-billing

## Mission
Build the complete Stripe billing integration for recurring retainer billing, milestone invoicing, partner payouts, and referral tracking.

## What to Build

### Backend
1. **services/backbone/stripe_service.py** — StripeService:
   - create_customer(client_id, email, name) → stripe_customer_id
   - create_subscription(client_id, price_id, metadata) → Subscription — recurring retainer
   - create_invoice(client_id, line_items, due_date) → Invoice — milestone billing
   - process_payout(partner_id, amount, description) → Payout — partner payout via Stripe Connect
   - create_checkout_session(client_id, items) → session_url
   - handle_webhook(event) — process Stripe webhook events
   - get_revenue_dashboard(workspace_id) → RevenueDashboard — MRR, ARR, churn rate, LTV
2. **services/backbone/referral_tracker.py** — ReferralTracker:
   - create_referral(referrer_id, referred_client_id, deal_value)
   - calculate_commission(referral_id) → commission_amount
   - get_referral_report(workspace_id) → ReferralReport
3. **models/billing.py** — Subscription, Invoice, Payment, Payout, Referral models
4. **api/v1/billing.py** — All billing endpoints + Stripe webhook handler
5. **api/v1/webhooks/stripe.py** — POST /webhooks/stripe — verify signature, route events

### Frontend
1. **app/build/billing/page.tsx** — Billing dashboard: active subscriptions, upcoming invoices, revenue charts
2. **app/build/billing/clients/[id]/page.tsx** — Client billing detail: payment history, upcoming, actions
3. **app/build/billing/payouts/page.tsx** — Partner payout management
4. **app/build/billing/referrals/page.tsx** — Referral tracking dashboard
5. **components/modules/RevenueChart.tsx** — MRR/ARR time-series chart
6. **components/modules/SubscriptionCard.tsx** — Client subscription status card
7. **components/modules/InvoiceTable.tsx** — Invoice list with status badges

## Tests
- test Stripe customer/subscription creation (mocked)
- test webhook signature verification
- test revenue dashboard calculations
- test referral commission logic

## Commit
feat: add Stripe billing — retainer subscriptions, milestone invoicing, partner payouts, referral tracking, revenue dashboard
