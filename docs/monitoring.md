# ChamberForge Monitoring Guide

## Datadog APM Setup

### Prerequisites

- A Datadog account with APM enabled.
- The Datadog Agent running on each host (or as a sidecar in Kubernetes).

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DD_API_KEY` | Yes | — | Datadog API key |
| `DD_AGENT_HOST` | No | `localhost` | Hostname of the Datadog Agent |
| `DD_TRACE_AGENT_PORT` | No | `8126` | Trace-agent port |
| `DD_ENV` | No | `development` | Environment tag (`staging`, `production`) |

Set these in `.env` (see `.env.example`).

### How It Works

On startup, `app.core.datadog_config.init_datadog()` checks for `DD_API_KEY`.
When present it configures `ddtrace` and patches FastAPI, SQLAlchemy, Redis,
Elasticsearch, Requests, and HTTPX for automatic distributed tracing.

The `DatadogMetricsMiddleware` emits custom StatsD metrics on every request.

---

## Dashboard Import

Import `infra/datadog/dashboard.json` via the Datadog API or UI:

```bash
curl -X POST "https://api.datadoghq.com/api/v1/dashboard" \
  -H "DD-API-KEY: ${DD_API_KEY}" \
  -H "DD-APPLICATION-KEY: ${DD_APP_KEY}" \
  -H "Content-Type: application/json" \
  -d @infra/datadog/dashboard.json
```

### Widgets

| Widget | Type | What It Shows |
|---|---|---|
| Request Rate | Timeseries | Total inbound requests/sec |
| Error Rate | Timeseries | 4xx/5xx responses |
| P95 Latency | Timeseries | 95th-percentile response time |
| AI Agent Costs (24h) | Query Value | Rolling 24h AI spend |
| Active Users | Query Value | Unique users in last 5 min |
| DB Query Latency | Timeseries | Average SQLAlchemy query time |
| Redis Cache Hit Rate | Query Value | Cache effectiveness % |
| Celery Task Queue | Timeseries | Active background tasks |

---

## Alert Configuration

Import monitors from `infra/datadog/monitors.json`:

```bash
for monitor in $(jq -c '.[]' infra/datadog/monitors.json); do
  curl -X POST "https://api.datadoghq.com/api/v1/monitor" \
    -H "DD-API-KEY: ${DD_API_KEY}" \
    -H "DD-APPLICATION-KEY: ${DD_APP_KEY}" \
    -H "Content-Type: application/json" \
    -d "$monitor"
done
```

### Active Monitors

| Monitor | Threshold | Description |
|---|---|---|
| High Error Rate | > 50 errors / 5 min | Fires when error count spikes |
| High P95 Latency | > 2 s | Fires when tail latency degrades |
| AI Cost Budget | > $100 / day | Prevents runaway AI spend |
| DB Connection Pool | Overflow > 0 | Detects exhausted DB connections |

---

## Custom Metrics Reference

All custom metrics use the `chamberforge.` prefix.

| Metric | Type | Tags | Source |
|---|---|---|---|
| `chamberforge.request_count` | Increment | endpoint, method, status | `DatadogMetricsMiddleware` |
| `chamberforge.request_duration` | Histogram (ms) | endpoint, method, status | `DatadogMetricsMiddleware` |
| `chamberforge.active_users` | Gauge | — | `DatadogMetricsMiddleware` |
| `chamberforge.cache_hits` | Increment | endpoint, method, status | `DatadogMetricsMiddleware` (X-Cache header) |
| `chamberforge.cache_misses` | Increment | endpoint, method, status | `DatadogMetricsMiddleware` (X-Cache header) |
| `chamberforge.ai_cost` | Increment ($) | endpoint | `DatadogMetricsMiddleware` (X-AI-Cost header) |

To emit ad-hoc metrics from application code:

```python
from app.core.datadog_config import create_custom_metric

create_custom_metric("db_pool_overflow", 1, tags=["db:primary"])
```
