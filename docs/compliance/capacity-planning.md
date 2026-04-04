# ChamberForge Capacity Planning

**Document Owner**: SRE Lead
**Last Reviewed**: 2026-04-03
**Next Review**: 2026-07-03 (Quarterly)
**Version**: 1.0

---

## 1. Current Capacity

### 1.1 Compute — ECS (Fargate)

| Service | Current Config | Min Tasks | Max Tasks | CPU | Memory |
|---------|---------------|-----------|-----------|-----|--------|
| API (FastAPI) | 2 tasks | 2 | 10 | 512 CPU units | 1024 MB |
| Celery Worker | 2 tasks | 1 | 8 | 512 CPU units | 1024 MB |
| Celery Beat | 1 task | 1 | 1 | 256 CPU units | 512 MB |

### 1.2 Database — RDS (PostgreSQL 16)

| Attribute | Current | Scaling Path |
|-----------|---------|-------------|
| Instance Type | db.t3.medium | db.r6g.large → db.r6g.xlarge |
| Storage | 100 GB gp3 | Auto-expand to 500 GB |
| Max Connections | 100 | Increase with instance size |
| Read Replicas | 0 | Add 1-2 for read-heavy workloads |
| Multi-AZ | Enabled | Automatic failover |
| Backup Retention | 7 days | Point-in-time recovery |

### 1.3 Cache — Redis (ElastiCache)

| Attribute | Current | Scaling Path |
|-----------|---------|-------------|
| Instance Type | cache.t3.small | cache.r6g.large |
| Memory | 1.37 GB | 13.07 GB (r6g.large) |
| Cluster Mode | Disabled | Enable for horizontal scaling |
| Eviction Policy | allkeys-lru | — |

### 1.4 Search — Elasticsearch 8.17

| Attribute | Current | Scaling Path |
|-----------|---------|-------------|
| Instance Type | t3.small.search | r6g.large.search |
| Storage | 50 GB gp3 | 500 GB |
| Data Nodes | 2 | Scale to 3-5 |
| Replicas | 1 | Increase with node count |

### 1.5 External Services

| Service | Current Tier | Rate Limits | Scaling Path |
|---------|-------------|-------------|-------------|
| Anthropic (Claude) | Standard | Model-dependent | Upgrade to enterprise tier |
| Stripe | Standard | 100 req/s | Contact for higher limits |
| Resend | Pro | 1000 emails/day | Enterprise tier |
| Pusher | Startup | 200 concurrent connections | Business tier |

---

## 2. Scaling Triggers

| Metric | Warning Threshold | Critical Threshold | Action |
|--------|------------------|-------------------|--------|
| **CPU Utilization** | > 60% sustained 5 min | > 70% sustained 3 min | Scale out ECS tasks |
| **Memory Utilization** | > 70% sustained 5 min | > 80% sustained 3 min | Scale out ECS tasks |
| **API Response Time (p95)** | > 1.5s | > 2s | Scale out + investigate |
| **Celery Queue Depth** | > 50 pending tasks | > 100 pending tasks | Scale out workers |
| **RDS CPU** | > 60% sustained 10 min | > 80% sustained 5 min | Read replica or instance upgrade |
| **RDS Connections** | > 70% of max | > 85% of max | Connection pooling or instance upgrade |
| **Redis Memory** | > 70% capacity | > 85% capacity | Instance upgrade or eviction review |
| **ES Disk Usage** | > 70% | > 85% | Expand storage or add nodes |
| **Error Rate (5xx)** | > 1% of requests | > 5% of requests | Investigate + scale if needed |

### Datadog Alert Configuration

All scaling triggers are monitored via Datadog with the following alert routing:
- **Warning** — Slack `#alerts-warning` channel
- **Critical** — PagerDuty on-call rotation + Slack `#alerts-critical`

---

## 3. Scaling Procedures

### 3.1 Horizontal Scaling (ECS)

ECS auto-scaling is configured with target tracking policies:

```
Scale Out: CPU > 70% for 3 minutes → add 1 task (max 10)
Scale In:  CPU < 30% for 10 minutes → remove 1 task (min 2)
Cooldown:  Scale out: 60s, Scale in: 300s
```

For manual scaling, see `docs/runbooks/scaling.md`.

### 3.2 Vertical Scaling (RDS/Redis/ES)

Vertical scaling requires a maintenance window:

1. Schedule during low-traffic period (Sunday 2-4 AM UTC)
2. Create snapshot before upgrade
3. Modify instance type via AWS Console or Terraform
4. Verify connectivity and performance post-upgrade
5. Update this document with new capacity

### 3.3 Emergency Scaling

For unexpected traffic spikes:
1. Immediately increase ECS desired count to max (10 API, 8 workers)
2. Enable RDS read replica if database is the bottleneck
3. Activate CDN caching for static/cacheable endpoints
4. Engage incident response if scaling alone doesn't resolve

---

## 4. Quarterly Capacity Review Checklist

Performed every quarter by the SRE Lead:

- [ ] **Usage trends** — Review 90-day metrics for CPU, memory, storage, connections
- [ ] **Growth projections** — Estimate next quarter's usage based on client growth rate
- [ ] **Headroom assessment** — Verify at least 30% headroom on all resources
- [ ] **Cost analysis** — Review infrastructure costs vs. budget; identify optimization opportunities
- [ ] **Scaling test** — Verify auto-scaling policies work correctly (trigger a scale-out event)
- [ ] **Bottleneck identification** — Identify the current system bottleneck and plan mitigation
- [ ] **External service limits** — Verify API rate limits and plan tier upgrades if needed
- [ ] **Load test** — Run load test against staging (see `docs/load-testing.md`)
- [ ] **Database performance** — Review slow query log, index usage, connection patterns
- [ ] **Action items** — Document scaling actions needed before next review

### Review Schedule

| Quarter | Review Date | Reviewer | Status |
|---------|------------|----------|--------|
| Q2 2026 | 2026-04-03 | SRE Lead | Initial |
| Q3 2026 | 2026-07-03 | SRE Lead | Planned |
| Q4 2026 | 2026-10-03 | SRE Lead | Planned |
| Q1 2027 | 2027-01-03 | SRE Lead | Planned |

---

## 5. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-03 | SRE Lead | Initial capacity planning document |
