# ChamberForge Patch Management Policy

**Document Owner**: Engineering Lead
**Last Reviewed**: 2026-04-03
**Version**: 1.0

---

## 1. Purpose

This policy defines the process for identifying, evaluating, testing, and deploying patches and dependency updates across the ChamberForge platform to maintain security posture and system stability.

---

## 2. Dependency Update Schedule

| Update Type | Frequency | Scope | Process |
|-------------|-----------|-------|---------|
| **Critical security patches** | Immediate (within 24 hours) | CVEs with CVSS >= 9.0 | Emergency patch process |
| **High security patches** | Within 7 days | CVEs with CVSS 7.0-8.9 | Standard patch process |
| **Medium security patches** | Within 30 days | CVEs with CVSS 4.0-6.9 | Standard patch process |
| **Minor version updates** | Monthly (1st week) | Non-breaking updates | Standard change process |
| **Major version updates** | Quarterly | Breaking changes | Full CAB review |
| **OS/runtime patches** | Monthly | Docker base images, Python, Node.js | Standard change process |

---

## 3. Patch Management Process

### 3.1 Identification

Sources for vulnerability and patch identification:

| Source | Tool | Frequency |
|--------|------|-----------|
| Python dependencies | Dependabot (GitHub) | Continuous |
| Python security audit | `pip-audit` | CI/CD pipeline (every PR) |
| Node.js dependencies | `npm audit` | CI/CD pipeline (every PR) |
| Container images | AWS ECR image scanning | On push |
| CVE databases | GitHub Security Advisories, NVD | Continuous via Dependabot |
| Infrastructure | AWS Security Hub | Continuous |

### 3.2 Evaluation

For each identified vulnerability or available patch:

1. **Assess severity** — CVSS score, exploitability, affected component
2. **Determine exposure** — Is the vulnerable component reachable? Is it in production?
3. **Check compatibility** — Will the patch break existing functionality?
4. **Classify urgency** — Critical/High/Medium/Low based on severity + exposure

### 3.3 Testing

All patches must pass through the testing pipeline before production deployment:

1. **Automated tests** — Full test suite including security tests (39 security tests)
2. **Integration tests** — Docker-based integration tests with real services (PostgreSQL, Redis, Elasticsearch)
3. **Staging deployment** — Deploy to staging environment and verify
4. **Smoke tests** — Verify critical paths on staging

### 3.4 Deployment

| Patch Type | Deployment Method | Approval |
|------------|------------------|----------|
| Critical CVE (CVSS >= 9.0) | Emergency deploy | Post-hoc CAB review within 24 hours |
| High CVE (CVSS 7.0-8.9) | Standard deploy pipeline | 1 reviewer approval |
| Routine patches | Standard deploy pipeline | 1 reviewer approval |
| Major version upgrades | Scheduled maintenance window | 2 reviewer approvals (CAB) |

### 3.5 Verification

Post-deployment verification:
- Health check endpoints return 200 (`/api/v1/health/ready`, `/api/v1/health/live`)
- Datadog monitors show no anomalies
- Error rate remains below baseline
- No new Sentry errors related to the patch

---

## 4. Emergency Patching Process

For critical CVEs (CVSS >= 9.0) or actively exploited vulnerabilities:

```
1. Alert received (Dependabot, NVD, vendor advisory)
   ↓
2. Security Lead assesses impact (< 1 hour)
   ↓
3. Engineer creates patch branch with [EMERGENCY] prefix
   ↓
4. Run automated test suite (CI/CD)
   ↓
5. Deploy to staging → verify → deploy to production
   ↓
6. Post-hoc CAB review within 24 hours
   ↓
7. Document in incident log
```

**SLA**: Critical CVE patches must be deployed to production within 24 hours of identification.

---

## 5. Dependency Management Tools

| Tool | Purpose | Configuration |
|------|---------|---------------|
| **Dependabot** | Automated dependency update PRs | `.github/dependabot.yml` — weekly security updates, monthly version updates |
| **pip-audit** | Python dependency vulnerability scanning | Runs in CI/CD pipeline on every PR |
| **npm audit** | Node.js dependency vulnerability scanning | Runs in CI/CD pipeline on every PR |
| **AWS ECR Scanning** | Container image vulnerability scanning | Scans on image push |
| **GitHub Security Advisories** | Vulnerability notifications | Enabled for repository |

### Dependabot Configuration

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "pip"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
      - "security"

  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

---

## 6. Patch Compliance Reporting

Monthly patch compliance report includes:

- Total vulnerabilities identified this month
- Vulnerabilities remediated within SLA
- Outstanding vulnerabilities with justification
- Average time-to-patch by severity
- Dependency versions vs. latest available

---

## 7. Exceptions

If a patch cannot be applied within SLA:

1. Document the reason (compatibility issue, vendor dependency, etc.)
2. Implement compensating controls (WAF rule, network restriction, etc.)
3. Security Lead approves the exception with a remediation deadline
4. Track in the risk register until resolved

---

## 8. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-03 | Engineering Lead | Initial patch management policy |
