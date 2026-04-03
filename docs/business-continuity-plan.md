# ChamberForge Business Continuity Plan (BCP)

**Document Owner**: CTO / Head of Engineering
**Last Updated**: 2026-04-03
**Review Cycle**: Annual (next review: 2027-04-03)
**Classification**: Internal — Confidential

---

## 1. Purpose and Scope

This Business Continuity Plan (BCP) ensures ChamberForge can maintain critical operations during and after a disruptive event. It covers all production systems, data stores, third-party integrations, and the personnel responsible for operating them.

**In Scope**:
- ChamberForge SaaS platform (API, frontend, background workers)
- All production data stores (PostgreSQL, Redis, Elasticsearch, S3)
- Third-party integrations (Anthropic, Stripe, Resend, Pusher)
- AWS infrastructure (ECS, RDS, ElastiCache, ALB, Route 53, CloudFront)
- Internal tooling (GitHub, CI/CD pipelines, monitoring)

**Out of Scope**:
- Client-side systems and networks
- Non-production environments (dev, staging) — these are rebuilt from code

---

## 2. Recovery Objectives

### Recovery Time Objectives (RTO)

| Service | RTO | Justification |
|---------|-----|---------------|
| API (FastAPI on ECS) | < 1 hour | Core business functionality; ECS auto-recovery handles most cases in minutes |
| Frontend (CloudFront/S3) | < 1 hour | Static assets served via CDN; redeployment is fast |
| Database (RDS PostgreSQL) | < 2 hours | Multi-AZ failover is automatic (~minutes); cross-region restore takes longer |
| Search (Elasticsearch) | < 4 hours | Rebuild from database if snapshots unavailable; degraded mode acceptable |
| Redis Cache | < 1 hour | ElastiCache Multi-AZ failover; cold start acceptable |
| Background Workers (Celery) | < 1 hour | ECS auto-replaces failed tasks; queue backlog processes on recovery |

### Recovery Point Objectives (RPO)

| Data Type | RPO | Backup Method |
|-----------|-----|---------------|
| Database (PostgreSQL) | 1 hour | RDS automated backups with point-in-time recovery (5-min granularity) |
| File uploads (S3) | 24 hours | S3 versioning + daily cross-region replication |
| Search index (Elasticsearch) | 24 hours | Daily snapshots to S3; full rebuild from DB as fallback |
| Redis cache | N/A (ephemeral) | Cache is rebuilt on startup; no RPO required |
| Audit logs | 1 hour | Stored in PostgreSQL, covered by DB RPO |

---

## 3. Disaster Scenarios and Response

### 3.1 Database Failure

**Scenario**: Primary RDS instance becomes unavailable (hardware failure, corruption, AZ outage).

**Response**:
1. **Automatic**: RDS Multi-AZ failover promotes standby replica (typically 1-3 minutes)
2. **If failover fails**: Restore from latest automated backup or point-in-time recovery
3. **Cross-region**: Restore from cross-region read replica or S3 backup snapshot

**Runbook**: See `docs/disaster-recovery.md` Section 1 — RDS Recovery

### 3.2 Application Server Failure

**Scenario**: ECS tasks crash, become unresponsive, or an entire AZ hosting tasks goes down.

**Response**:
1. **Automatic**: ALB health checks detect unhealthy tasks within 30 seconds
2. **Automatic**: ECS service scheduler replaces failed tasks across healthy AZs
3. **Manual escalation**: If all tasks fail, check for deployment issues, rollback via CI/CD

**Runbook**: See `docs/disaster-recovery.md` Section 5 — ECS Recovery

### 3.3 Region Failure

**Scenario**: Entire AWS region (e.g., us-east-1) becomes unavailable.

**Response**:
1. **Assess**: Confirm region-wide outage via AWS Status Dashboard
2. **DNS failover**: Update Route 53 health check to route traffic to secondary region
3. **Promote read replicas**: Promote RDS cross-region read replica to primary
4. **Restore services**: Deploy application stack to secondary region via IaC
5. **Validate**: Run smoke tests against secondary region endpoints

**Note**: Region failover is a manual process. Target time to initiate: 30 minutes after confirmed region outage.

**Runbook**: See `docs/disaster-recovery.md` Section 1.3 — Cross-Region Recovery

### 3.4 Data Breach

**Scenario**: Unauthorized access to customer data detected.

**Response**:
1. **Contain**: Rotate all compromised credentials immediately
2. **Lockdown**: Activate crisis console (`/api/v1/polish/crisis`) to restrict platform access
3. **Assess**: Determine scope — which data, which tenants, what timeframe
4. **Notify**: Inform affected customers within 72 hours per GDPR/regulatory requirements
5. **Forensics**: Preserve audit logs, review access patterns, engage third-party forensics if needed
6. **Remediate**: Patch vulnerability, update security controls, document lessons learned

**Runbook**: See `docs/incident-response-plan.md` — Severity P1

### 3.5 Key Person Unavailable

**Scenario**: Critical team member (e.g., sole infrastructure admin) is suddenly unavailable.

**Response**:
1. All operational procedures are documented in `docs/runbooks/`
2. Shared credentials stored in secrets vault (AWS SSM Parameter Store) — accessible to authorized team members
3. Emergency access procedures documented with break-glass accounts
4. Cross-training schedule ensures no single point of failure for critical systems

---

## 4. Communication Plan

### 4.1 Internal Escalation Matrix

| Severity | First Responder | Escalation (15 min) | Executive (30 min) |
|----------|----------------|---------------------|-------------------|
| P1 — Critical | On-call engineer | Engineering Lead / CTO | CEO |
| P2 — High | On-call engineer | Engineering Lead | CTO |
| P3 — Medium | Assigned engineer | Engineering Lead | — |
| P4 — Low | Assigned engineer | — | — |

### 4.2 External Communication

| Audience | Channel | Timing | Owner |
|----------|---------|--------|-------|
| Affected customers | Email (Resend) | Within 1 hour of confirmed impact | Communications Lead |
| All customers | Status page | Within 30 minutes of detection | On-call engineer |
| Regulators | Formal written notice | Within 72 hours (if data breach) | Legal / CEO |
| Partners/vendors | Email | As needed | CTO |

### 4.3 Communication Templates

Templates for each severity level are maintained in `docs/incident-response-plan.md` Section 5.

---

## 5. Testing Schedule

| Test Type | Frequency | Scope | Owner |
|-----------|-----------|-------|-------|
| Tabletop exercise | Quarterly | Walk through a scenario verbally; validate runbooks | Engineering Lead |
| Failover test (DB) | Semi-annually | Trigger RDS Multi-AZ failover in staging | Infrastructure Lead |
| Full DR test | Annually | Simulate region failure; recover in secondary region | CTO |
| Backup restore test | Quarterly | Restore database from backup; validate data integrity | Infrastructure Lead |
| Incident response drill | Semi-annually | Simulate P1 incident; test communication chain | Incident Commander |

### Test Documentation

Each test must produce:
- Date and participants
- Scenario tested
- Steps executed
- Issues discovered
- Remediation actions and owners
- Sign-off by test owner

---

## 6. Recovery Procedures

### 6.1 Database Recovery

1. Check RDS console for instance status
2. If Multi-AZ failover occurred, verify application reconnected
3. If instance is unrecoverable:
   - Identify latest recovery point (automated backup or snapshot)
   - Initiate point-in-time recovery via AWS Console or CLI:
     ```bash
     aws rds restore-db-instance-to-point-in-time \
       --source-db-instance-identifier chamberforge-prod \
       --target-db-instance-identifier chamberforge-prod-restored \
       --restore-time "2026-04-03T10:00:00Z"
     ```
   - Update application connection string to point to restored instance
   - Run data integrity checks
   - Update DNS/service discovery

### 6.2 Application Recovery

1. Check ECS service status: `aws ecs describe-services --cluster chamberforge-prod`
2. If tasks are not being replaced:
   - Check for resource constraints (CPU/memory limits)
   - Check for ECR image availability
   - Check for secrets/configuration availability
3. Force new deployment: `aws ecs update-service --cluster chamberforge-prod --service api --force-new-deployment`
4. If deployment fails, rollback to previous task definition revision

### 6.3 Search Recovery

1. Check Elasticsearch cluster health: `GET _cluster/health`
2. If cluster is red:
   - Check node availability and disk space
   - Attempt shard reallocation
3. If cluster is unrecoverable:
   - Deploy new Elasticsearch cluster
   - Restore from latest S3 snapshot
   - If no snapshot available, trigger full reindex from PostgreSQL
4. Verify search functionality via smoke tests

### 6.4 Cache Recovery

1. Check ElastiCache cluster status
2. If failover occurred, verify application reconnected
3. If cluster is unrecoverable:
   - Create new ElastiCache cluster from latest snapshot
   - Update application connection string
   - Application handles cold cache gracefully (falls through to database)

### 6.5 Full Region Recovery

1. Confirm region outage (AWS Status Dashboard + independent verification)
2. Activate secondary region infrastructure:
   ```bash
   # Deploy infrastructure to secondary region
   cd infra/ && terraform apply -var="region=us-west-2"
   ```
3. Promote RDS cross-region read replica
4. Restore Elasticsearch from cross-region S3 snapshot
5. Deploy application via CI/CD targeting secondary region
6. Update Route 53 DNS to point to secondary region ALB
7. Validate all endpoints via smoke tests
8. Notify customers of region migration

---

## 7. Vendor Dependencies

| Vendor | Service | Impact if Unavailable | Mitigation |
|--------|---------|----------------------|------------|
| AWS | Infrastructure (ECS, RDS, S3, etc.) | Full platform outage | Multi-AZ deployment; cross-region DR plan |
| Anthropic | AI/LLM (Claude API) | AI features unavailable | Graceful degradation; queue requests for retry |
| Stripe | Payment processing | Cannot process new payments | Webhook retry; manual invoicing as fallback |
| Resend | Transactional email | Emails delayed | Queue emails; switch to SES as backup |
| Pusher | Real-time notifications | Live updates unavailable | Polling fallback; notifications delivered on next page load |
| GitHub | Source code / CI/CD | Cannot deploy new code | Local git mirrors; manual deployment procedure |

---

## 8. Plan Maintenance

- This plan is reviewed and updated **annually** or after any significant incident
- All changes require approval from the CTO
- Updated version is distributed to all team members
- Recovery procedures are validated through the testing schedule in Section 5

---

## Appendix A: Emergency Contacts Template

| Role | Name | Phone | Email | Backup |
|------|------|-------|-------|--------|
| CEO | _______________ | _______________ | _______________ | _______________ |
| CTO | _______________ | _______________ | _______________ | _______________ |
| Engineering Lead | _______________ | _______________ | _______________ | _______________ |
| On-call Engineer | _______________ | _______________ | _______________ | _______________ |
| AWS Account Rep | _______________ | _______________ | _______________ | _______________ |
| Legal Counsel | _______________ | _______________ | _______________ | _______________ |

## Appendix B: Critical System Access

| System | Access Method | Credential Location |
|--------|-------------|-------------------|
| AWS Console | SSO / IAM | AWS SSO Portal |
| RDS (Production) | IAM Auth / SSM | SSM Parameter Store: `/prod/db/*` |
| GitHub | Personal tokens / SSO | Individual accounts + Org SSO |
| Stripe Dashboard | Email/password + MFA | Shared vault |
| Sentry | Email/password | Individual accounts |
| Domain Registrar | Email/password + MFA | Shared vault |

## Appendix C: Document History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2026-04-03 | 1.0 | Engineering | Initial BCP creation |
