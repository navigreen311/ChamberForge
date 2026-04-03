# Prompt 29: Monitoring, Observability & Error Tracking
Branch: ai-feature/monitoring-observability

## Mission
Build the monitoring and observability layer: structured logging, Sentry error tracking, health check endpoints, performance metrics, and AI cost monitoring.

## What to Build

### Backend
1. **core/logging.py** — Structured JSON logging configuration: request_id, user_id, workspace_id, latency, status_code. Middleware to inject request context.
2. **core/metrics.py** — Prometheus-style metrics: request_count, request_latency, ai_agent_invocations, ai_agent_cost, ai_agent_latency, active_websockets, background_job_count, db_query_count
3. **core/sentry.py** — Sentry SDK initialization with: environment tagging, user context, workspace context, performance tracing, custom breadcrumbs for AI agent calls
4. **middleware/request_logging.py** — Middleware: log every request with method, path, status, latency, user, workspace
5. **middleware/performance.py** — Middleware: track request latency, set Server-Timing headers
6. **api/v1/health.py** — Enhanced health checks: GET /health (basic), GET /health/ready (checks DB + Redis + ES), GET /health/live (k8s liveness)
7. **api/v1/metrics.py** — GET /metrics — Prometheus-compatible metrics endpoint
8. **services/backbone/ai_cost_tracker.py** — Track: tokens_in, tokens_out, cost_usd per AI call. Aggregate by agent, workspace, time. Alert when workspace exceeds budget.
9. **jobs/tasks/monitoring_tasks.py** — hourly_cost_report, daily_performance_summary, weekly_error_digest

### Frontend
1. **lib/sentry.ts** — Sentry browser SDK init with user context
2. **app/admin/monitoring/page.tsx** — Monitoring dashboard: error rate, latency percentiles, AI cost burn-down, system health

## Tests
- test structured log output format
- test health check endpoints (DB up/down scenarios)
- test AI cost tracking accumulation
- test metrics endpoint output format

## Commit
feat: add monitoring & observability — structured logging, Sentry, health checks, metrics, AI cost tracking
