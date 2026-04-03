# Incident Response Runbook

## Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| SEV1 | Total service outage | 15 minutes | Database down, app unreachable |
| SEV2 | Major feature degraded | 30 minutes | AI agents failing, search broken |
| SEV3 | Minor feature impacted | 2 hours | Slow queries, non-critical errors |
| SEV4 | Cosmetic / low impact | Next business day | UI glitch, minor data issue |

## Incident Response Steps

### 1. Detection & Triage
- Check monitoring dashboard: `/admin/monitoring`
- Review alerts panel for threshold violations
- Check `GET /api/v1/metrics/detailed` for system health
- Determine severity level

### 2. Communication
- **SEV1/SEV2**: Notify team immediately via Slack `#chamberforge-incidents`
- Post incident channel message with:
  - What is impacted
  - Current severity
  - Who is investigating
- Update status page if applicable

### 3. Investigation
```bash
# Check application logs
docker compose logs --tail=200 backend

# Check database connectivity
make health-check

# Check recent deployments
git log --oneline -10

# Check resource usage
docker stats
```

### 4. Mitigation
- **Rollback** if caused by recent deployment:
  ```bash
  git revert HEAD
  # or redeploy previous version
  ```
- **Scale up** if resource exhaustion:
  - See [scaling.md](scaling.md)
- **Database issues**:
  - See [database-maintenance.md](database-maintenance.md)
- **AI cost spike**:
  - See [ai-cost-management.md](ai-cost-management.md)

### 5. Resolution
- Confirm service restored via monitoring dashboard
- Verify key user flows work end-to-end
- Update incident channel with resolution

### 6. Post-Incident
- Write post-mortem within 48 hours (SEV1/SEV2)
- Include: timeline, root cause, impact, remediation steps
- Create follow-up tickets for preventive measures
- Share learnings in team retro

## Key Contacts
| Role | Contact |
|------|---------|
| On-call engineer | Check PagerDuty schedule |
| Platform lead | See team directory |
| Database admin | See team directory |

## Useful Commands
```bash
# Quick health check
make health-check

# Database backup before risky operations
make backup

# View recent errors in logs
docker compose logs backend 2>&1 | grep -i error | tail -50
```
