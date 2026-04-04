# ChamberForge Change Management & Change Advisory Board (CAB)

**Document Owner**: Engineering Lead
**Last Reviewed**: 2026-04-03
**Version**: 1.0

---

## 1. Purpose

This document defines the Change Advisory Board (CAB) process for ChamberForge, ensuring all changes to production systems are reviewed, approved, tested, and verified in a controlled manner.

---

## 2. CAB Process Flow

```
Request → Review → Approve → Implement → Verify
```

### Phase 1: Request

- All changes originate as GitHub Issues or Pull Requests
- Change requester fills out the PR template with: description, type, risk assessment, rollback plan
- Change is categorized by type and risk level

### Phase 2: Review

- Automated checks run: linting, type checking, unit tests, integration tests, security tests
- At least one qualified reviewer (not the author) performs code review
- For critical changes, architecture review by a senior engineer
- Security-impacting changes require Security Lead review

### Phase 3: Approve

- Approval is granted via GitHub PR approval mechanism
- Approval requirements vary by change type (see Section 4)
- Emergency changes may be approved post-hoc within 24 hours

### Phase 4: Implement

- Merge to main triggers CI/CD deployment pipeline
- Deployment follows blue-green or rolling strategy via ECS
- Database migrations run automatically with rollback capability

### Phase 5: Verify

- Post-deployment health checks confirm service stability
- Smoke tests validate critical paths
- Monitoring dashboards checked for anomalies (Datadog)
- Change requester confirms expected behavior

---

## 3. Change Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **Infrastructure** | Changes to cloud resources, networking, or platform | ECS task definitions, RDS configuration, VPC changes, Terraform updates |
| **Application** | Changes to application code, APIs, or business logic | New endpoints, bug fixes, feature additions, dependency updates |
| **Database** | Schema changes, migrations, data modifications | Alembic migrations, index changes, data backfills |
| **Security** | Changes affecting authentication, authorization, encryption | RBAC updates, encryption changes, security patches, MFA configuration |
| **Configuration** | Environment variables, feature flags, operational settings | Rate limits, AI model parameters, logging levels |

---

## 4. Approval Requirements by Change Type

| Change Type | Risk Level | Required Approvers | Review Time | Rollback Plan Required |
|-------------|-----------|-------------------|-------------|----------------------|
| **Critical** (security patches, database migrations, infrastructure) | High | 2 approvers (including Security Lead or CTO) | 24 hours minimum | Yes — documented and tested |
| **Standard** (feature additions, bug fixes, UI changes) | Medium | 1 approver (qualified reviewer) | 4 hours minimum | Yes — documented |
| **Minor** (documentation, typos, config tweaks) | Low | 1 approver | 1 hour minimum | N/A |
| **Emergency** (P1 incident fix, critical CVE patch) | Critical | Post-hoc approval within 24 hours; 1 approver for immediate merge | Immediate | Yes — automated rollback |

---

## 5. GitHub PR Review as CAB Implementation

ChamberForge implements the CAB process through GitHub's native PR review system:

### Technical Controls

| Control | Implementation |
|---------|---------------|
| **Branch protection** | `main` branch requires PR; no direct pushes |
| **Required reviews** | Minimum 1 approval required before merge |
| **Status checks** | CI pipeline must pass (lint, test, security) before merge |
| **Dismiss stale reviews** | Code changes after approval require re-review |
| **Author restriction** | PR author cannot approve their own PR |
| **Conversation resolution** | All review comments must be resolved before merge |

### PR Template Checklist

Every PR must include:
- [ ] Description of changes and business justification
- [ ] Change category (infrastructure/application/database/security/configuration)
- [ ] Risk assessment (low/medium/high/critical)
- [ ] Test coverage for new code
- [ ] Rollback plan (for medium+ risk)
- [ ] Security impact assessment
- [ ] Database migration plan (if applicable)

---

## 6. Emergency Change Process

For P1/P2 incidents requiring immediate production changes:

1. **Declare emergency** — Incident commander authorizes emergency change
2. **Implement fix** — Engineer creates PR with `[EMERGENCY]` prefix
3. **Fast-track review** — One reviewer provides expedited review
4. **Deploy** — Merge and deploy immediately
5. **Post-hoc approval** — Full CAB review within 24 hours
6. **Retrospective** — Document in incident post-mortem

---

## 7. Change Freeze Windows

| Window | Duration | Exceptions |
|--------|----------|------------|
| Production freeze | Friday 5 PM — Monday 9 AM | P1 emergency fixes only |
| Quarter-end freeze | Last 3 business days of quarter | P1/P2 emergency fixes only |
| Holiday freeze | Company holidays | P1 emergency fixes only |

---

## 8. Audit Trail

All changes are automatically tracked via:
- **Git history** — Full commit log with conventional commit messages
- **GitHub PR records** — Review comments, approvals, status checks
- **AuditMiddleware** — Runtime logging of all mutations (POST/PUT/PATCH/DELETE)
- **CHANGELOG.md** — Human-readable change log per version

---

## 9. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-03 | Engineering Lead | Initial CAB process documentation |
