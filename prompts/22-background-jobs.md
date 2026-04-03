# Prompt 22: Background Jobs — Celery + Redis Queue System
Branch: ai-feature/background-jobs

## Mission
Build the background job processing system using Celery + Redis for all async operations: AI agent invocations, evidence refresh, daily briefs, search sync, notification dispatch, report generation.

## What to Build

### Backend
1. **jobs/celery_app.py** — Celery app configuration with Redis broker, result backend, task routing, retry policies, dead letter queue
2. **jobs/tasks/__init__.py** — Task registry
3. **jobs/tasks/ai_tasks.py** — AI agent invocation tasks: run_problem_ai, run_research_ai, run_validator_ai, run_offer_ai, run_pricing_ai, run_fulfillment_ai, run_copy_ai, run_relationship_ai, run_proof_ai, run_command_ai_synthesis
4. **jobs/tasks/evidence_tasks.py** — evidence_refresh (weekly), recency_decay_recalc, stale_source_flagging
5. **jobs/tasks/brief_tasks.py** — generate_daily_briefs (all workspaces), generate_intel_brief (per client)
6. **jobs/tasks/search_tasks.py** — sync_to_elasticsearch (on entity change), full_reindex (manual trigger)
7. **jobs/tasks/notification_tasks.py** — dispatch_notification, send_email_notification, send_weekly_digest
8. **jobs/tasks/report_tasks.py** — generate_quarterly_scorecard, generate_revenue_report, generate_risk_report
9. **jobs/tasks/billing_tasks.py** — process_subscription_renewal, generate_invoice, calculate_partner_payouts
10. **jobs/schedules.py** — Celery Beat schedule: daily_brief (6am), evidence_refresh (Sunday 2am), weekly_digest (Monday 8am), recency_decay (daily midnight)
11. **api/v1/jobs.py** — GET /jobs/status, POST /jobs/trigger (admin), GET /jobs/history

### Frontend
1. **app/admin/jobs/page.tsx** — Job monitoring dashboard: active, scheduled, failed, retry queue
2. **components/modules/JobMonitor.tsx** — Real-time job status with progress indicators

## Tests
- test task execution with eager mode (synchronous)
- test retry logic on failure
- test schedule configuration
- test job status API

## Commit
feat: add Celery background jobs — AI tasks, evidence refresh, daily briefs, search sync, billing, schedules
