# ChamberForge Annual Risk Assessment

**Document Owner**: CTO / Security Lead
**Last Reviewed**: 2026-04-03
**Next Review**: 2027-04-03
**Version**: 1.0

---

## 1. Risk Assessment Methodology

ChamberForge follows a four-phase risk assessment cycle aligned with NIST SP 800-30 and SOC 2 Trust Services Criteria.

### Phase 1: Identify

- Catalog all assets (data stores, APIs, third-party services, infrastructure)
- Identify threat sources (external attackers, insider threats, supply chain, natural disasters)
- Map vulnerabilities across the technology stack
- Review prior year's incidents and near-misses

### Phase 2: Assess

- Evaluate likelihood of each threat exploiting a vulnerability (1-5 scale)
- Evaluate impact if the threat materializes (1-5 scale)
- Calculate risk score: `Likelihood x Impact`
- Classify risk level: Low (1-6), Medium (7-12), High (13-19), Critical (20-25)

### Phase 3: Mitigate

- Select mitigation strategy: Accept, Mitigate, Transfer, Avoid
- Assign risk owner responsible for remediation
- Define specific mitigation actions with deadlines
- Allocate budget for mitigation controls

### Phase 4: Monitor

- Track mitigation progress quarterly
- Re-assess residual risk after controls are implemented
- Report risk posture to leadership monthly
- Trigger re-assessment on significant changes (new features, incidents, vendor changes)

---

## 2. Risk Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **Operational** | Risks to day-to-day service delivery | Service outages, data loss, performance degradation |
| **Security** | Threats to confidentiality, integrity, availability | Data breaches, unauthorized access, DDoS attacks |
| **Compliance** | Regulatory and legal obligations | GDPR violations, SOC 2 gaps, licensing issues |
| **Financial** | Revenue and cost impacts | AI cost overruns, customer churn, fraud |
| **Reputational** | Brand and trust damage | Data breach publicity, AI-generated harmful content, service unreliability |

---

## 3. Risk Scoring Matrix

| | Impact 1 (Negligible) | Impact 2 (Minor) | Impact 3 (Moderate) | Impact 4 (Major) | Impact 5 (Catastrophic) |
|---|---|---|---|---|---|
| **Likelihood 5 (Almost Certain)** | 5 - Medium | 10 - Medium | 15 - High | 20 - Critical | 25 - Critical |
| **Likelihood 4 (Likely)** | 4 - Low | 8 - Medium | 12 - Medium | 16 - High | 20 - Critical |
| **Likelihood 3 (Possible)** | 3 - Low | 6 - Low | 9 - Medium | 12 - Medium | 15 - High |
| **Likelihood 2 (Unlikely)** | 2 - Low | 4 - Low | 6 - Low | 8 - Medium | 10 - Medium |
| **Likelihood 1 (Rare)** | 1 - Low | 2 - Low | 3 - Low | 4 - Low | 5 - Medium |

---

## 4. Risk Register — ChamberForge Top 10 Risks

| # | Risk | Category | Likelihood | Impact | Score | Level | Owner | Mitigation Strategy | Status |
|---|------|----------|-----------|--------|-------|-------|-------|---------------------|--------|
| R1 | AI model generates misleading legal/financial content for HNW clients | Reputational | 3 | 5 | 15 | High | CTO | Guardrails engine, human-in-the-loop review queue, output scanning | Mitigated |
| R2 | Unauthorized access to client PII via API vulnerability | Security | 2 | 5 | 10 | Medium | Security Lead | JWT auth, RBAC, field-level encryption, 39 automated security tests, annual pen test | Mitigated |
| R3 | Third-party AI provider (Anthropic) data breach or outage | Operational | 2 | 4 | 8 | Medium | CTO | Data minimization in prompts, no PII in AI requests, multi-provider fallback plan | Mitigated |
| R4 | Cross-tenant data leakage between workspaces | Security | 1 | 5 | 5 | Medium | Engineering Lead | Workspace isolation (all queries scoped by workspace_id from JWT), automated isolation tests | Mitigated |
| R5 | GDPR/data privacy non-compliance leading to regulatory action | Compliance | 2 | 5 | 10 | Medium | Compliance Officer | Consent management, right to deletion, data minimization, PII detection, legal holds | Mitigated |
| R6 | Service outage during peak client usage | Operational | 3 | 3 | 9 | Medium | SRE Lead | Health checks, auto-scaling, disaster recovery plan, multi-AZ deployment | Mitigated |
| R7 | AI cost overruns from token-heavy operations | Financial | 3 | 3 | 9 | Medium | CTO | AI cost tracker, per-workspace usage limits, cost alerts via Datadog | Mitigated |
| R8 | Supply chain attack via compromised dependency | Security | 2 | 4 | 8 | Medium | Engineering Lead | Dependabot alerts, pip-audit, npm audit, weekly security patch cycle | Mitigated |
| R9 | Loss of encryption keys or secrets exposure | Security | 1 | 5 | 5 | Medium | Security Lead | AWS Secrets Manager, key rotation policy, no secrets in code, pre-commit scanning | Mitigated |
| R10 | Insider threat — unauthorized data exfiltration | Security | 1 | 4 | 4 | Low | Security Lead | RBAC, audit trail, separation of duties, least privilege, access reviews | Mitigated |

---

## 5. Annual Review Schedule

| Activity | Frequency | Owner | Q1 | Q2 | Q3 | Q4 |
|----------|-----------|-------|----|----|----|----|
| Full risk assessment | Annual (Q2) | CTO | | X | | |
| Risk register review | Quarterly | Security Lead | X | X | X | X |
| Incident-triggered reassessment | As needed | Security Lead | — | — | — | — |
| Third-party vendor risk review | Annual (Q3) | Compliance Officer | | | X | |
| Risk report to leadership | Monthly | CTO | X | X | X | X |
| Control effectiveness testing | Semi-annual | Security Lead | X | | X | |

---

## 6. Risk Acceptance Criteria

- **Low (1-6)**: Accept with monitoring. Review quarterly.
- **Medium (7-12)**: Mitigate within 90 days. Assign owner and track progress.
- **High (13-19)**: Mitigate within 30 days. Escalate to CTO. Weekly progress updates.
- **Critical (20-25)**: Immediate action required. Escalate to CEO. Daily progress updates until resolved.

---

## 7. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-03 | Security Lead | Initial risk assessment |
