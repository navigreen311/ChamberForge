# ChamberForge Separation of Duties

**Document Owner**: Security Lead
**Last Reviewed**: 2026-04-03
**Version**: 1.0

---

## 1. Purpose

This document defines the separation of duties controls at ChamberForge, ensuring no single individual can perform conflicting actions that could compromise system integrity, confidentiality, or availability.

---

## 2. Role Matrix

### 2.1 Application Roles (RBAC)

ChamberForge enforces three application-level roles via `require_role()` in `core/dependencies.py`:

| Permission | Admin | Operator | Viewer |
|------------|:-----:|:--------:|:------:|
| View dashboards and reports | X | X | X |
| View client data (own workspace) | X | X | X |
| Create/edit content | X | X | |
| Manage client records | X | X | |
| Run AI agents | X | X | |
| Manage workspace settings | X | | |
| Manage users and roles | X | | |
| Access audit logs | X | | |
| Configure AI guardrails | X | | |
| Manage billing and subscriptions | X | | |
| Create/release legal holds | X | | |
| Access admin API endpoints | X | | |

### 2.2 Infrastructure Roles

| Permission | DevOps/SRE | Senior Engineer | Engineer | Read-Only |
|------------|:----------:|:---------------:|:--------:|:---------:|
| Deploy to production | X | | | |
| Access production database | X | | | |
| Modify infrastructure (Terraform) | X | | | |
| Access production logs | X | X | | |
| Merge to main branch | X | X | | |
| Approve PRs | X | X | X | |
| Create PRs | X | X | X | |
| View monitoring dashboards | X | X | X | X |

---

## 3. Key Separation Controls

### 3.1 Code Development vs. Code Review

| Principle | Implementation |
|-----------|---------------|
| **Author cannot approve own PR** | GitHub branch protection: "Dismiss stale reviews" + "Require review from code owners" |
| **Minimum 1 reviewer required** | Branch protection rule on `main` requires at least 1 approval |
| **Critical changes need 2 reviewers** | Security, infrastructure, and database changes require 2 approvals (see `docs/compliance/change-management.md`) |

### 3.2 Development vs. Deployment

| Principle | Implementation |
|-----------|---------------|
| **Developers cannot deploy directly** | Production deployment only via CI/CD pipeline triggered by merge to `main` |
| **Admin-only deploy access** | AWS ECS deployment permissions restricted to DevOps/SRE role |
| **No direct production access** | Engineers cannot SSH into production containers or access production database |
| **Deploy scripts require admin credentials** | Infrastructure scripts in `infra/` require elevated AWS IAM permissions |

### 3.3 User Management vs. System Operation

| Principle | Implementation |
|-----------|---------------|
| **Role assignment by admin only** | `require_role("admin")` guards user management endpoints |
| **Self-elevation prevented** | Users cannot change their own role; requires different admin user |
| **Audit trail for role changes** | `AuditMiddleware` logs all role assignment changes |

---

## 4. Technical Controls Enforcement

### 4.1 GitHub Branch Protection Rules

```
main branch:
  ├── Require pull request before merging: ON
  ├── Required approving reviews: 1 (2 for critical paths)
  ├── Dismiss stale pull request approvals: ON
  ├── Require review from code owners: ON
  ├── Require status checks to pass: ON
  │   ├── lint
  │   ├── test
  │   ├── security-scan
  │   └── type-check
  ├── Require branches to be up to date: ON
  ├── Include administrators: ON
  └── Restrict who can push: DevOps/SRE only (for emergency)
```

### 4.2 AWS IAM Policy Separation

| IAM Role | Permissions | Users |
|----------|------------|-------|
| `chamberforge-deploy` | ECS deploy, ECR push, S3 write | CI/CD pipeline service account |
| `chamberforge-sre` | Full infrastructure access | SRE team members |
| `chamberforge-readonly` | CloudWatch, Datadog read | Engineering team |
| `chamberforge-db-admin` | RDS admin access | Database admin only |
| `chamberforge-secrets` | Secrets Manager read/write | SRE + Security Lead |

### 4.3 Application-Level RBAC Enforcement

All protected endpoints enforce RBAC via FastAPI dependency injection:

```python
# Example: admin-only endpoint
@router.post("/admin/settings")
async def update_settings(
    current_user: User = Depends(require_role("admin"))
):
    ...

# Example: operator+ endpoint
@router.post("/clients")
async def create_client(
    current_user: User = Depends(require_role("operator"))
):
    ...
```

---

## 5. Conflict of Interest Matrix

The following action combinations must be performed by different individuals:

| Action A | Action B | Reason |
|----------|----------|--------|
| Write code | Approve same code for merge | Prevents unreviewed code in production |
| Request infrastructure change | Approve infrastructure change | Four-eyes principle for infra |
| Create user account | Assign admin role to same account | Prevents privilege escalation |
| Detect security incident | Approve incident closure | Independent verification of resolution |
| Approve vendor contract | Process vendor payment | Financial controls |
| Develop AI guardrails | Override AI guardrails | Prevents bypass of safety controls |

---

## 6. Periodic Access Reviews

| Review Type | Frequency | Reviewer | Action |
|-------------|-----------|----------|--------|
| Application role assignments | Quarterly | Security Lead | Verify least privilege |
| AWS IAM permissions | Quarterly | SRE Lead | Remove unused permissions |
| GitHub repository access | Quarterly | Engineering Lead | Remove departed members |
| Production database access | Monthly | SRE Lead | Verify need-to-access |
| Secrets Manager access | Monthly | Security Lead | Rotate if personnel changes |

---

## 7. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-03 | Security Lead | Initial separation of duties policy |
