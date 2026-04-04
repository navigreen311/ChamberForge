# ChamberForge Third-Party Vendor Risk Assessment

**Document Owner**: Compliance Officer
**Last Reviewed**: 2026-04-03
**Next Review**: 2027-04-03
**Version**: 1.0

---

## 1. Vendor Risk Assessment Process

### Assessment Criteria

All third-party vendors handling ChamberForge data are evaluated on:

1. **Security posture** — SOC 2 compliance, encryption, access controls
2. **Data handling** — What data is shared, where it's stored, retention policies
3. **Availability** — SLA commitments, historical uptime, redundancy
4. **Compliance** — GDPR, CCPA, industry-specific regulations
5. **Business continuity** — Disaster recovery, geographic redundancy
6. **Contract terms** — Data processing agreements, liability, termination rights

### Risk Rating

| Rating | Criteria | Review Frequency |
|--------|----------|-----------------|
| **Critical** | Handles PII, core to service delivery, no alternative | Quarterly |
| **High** | Handles sensitive data, important to operations | Semi-annually |
| **Medium** | Limited data access, replaceable | Annually |
| **Low** | No data access, commodity service | Every 2 years |

---

## 2. Vendor Risk Register

### 2.1 Anthropic (Claude AI)

| Attribute | Assessment |
|-----------|-----------|
| **Service** | AI language model API (Claude) |
| **Risk Rating** | Critical |
| **Data Shared** | Prompts containing workspace context (no raw PII — data minimization enforced) |
| **SOC 2** | Yes (Type II) |
| **Data Retention** | No training on customer data; prompts not retained beyond request lifecycle |
| **Encryption** | TLS 1.2+ in transit; encrypted at rest |
| **DPA** | Data Processing Agreement in place |
| **SLA** | 99.9% uptime target |
| **Mitigation** | Data minimization in prompts (`data_minimization.py`), PII detection on output, AI cost tracking, guardrails engine |
| **Fallback Plan** | Multi-provider abstraction layer planned; graceful degradation if API unavailable |

### 2.2 AWS (Amazon Web Services)

| Attribute | Assessment |
|-----------|-----------|
| **Service** | Cloud infrastructure (ECS, RDS, ElastiCache, S3, Secrets Manager) |
| **Risk Rating** | Critical |
| **Data Shared** | All application data hosted on AWS infrastructure |
| **SOC 2** | Yes (Type II), SOC 1, SOC 3, ISO 27001, FedRAMP |
| **Data Retention** | Customer controlled |
| **Encryption** | AES-256 at rest, TLS in transit |
| **DPA** | AWS Data Processing Addendum |
| **SLA** | 99.99% (ECS), 99.95% (RDS Multi-AZ) |
| **Mitigation** | Multi-AZ deployment, automated backups, infrastructure as code, DR plan |
| **Shared Responsibility** | AWS responsible for physical security, network infrastructure; ChamberForge responsible for configuration, access management, data encryption |

### 2.3 Stripe

| Attribute | Assessment |
|-----------|-----------|
| **Service** | Payment processing and subscription management |
| **Risk Rating** | High |
| **Data Shared** | Customer email, subscription tier (no financial data stored by ChamberForge) |
| **SOC 2** | Yes (Type II), PCI DSS Level 1 |
| **Data Retention** | Per Stripe retention policy; configurable |
| **Encryption** | TLS 1.2+ in transit; AES-256 at rest |
| **DPA** | Stripe Data Processing Agreement |
| **SLA** | 99.99% uptime |
| **Mitigation** | No credit card data touches ChamberForge servers; webhook signature verification |

### 2.4 Resend

| Attribute | Assessment |
|-----------|-----------|
| **Service** | Transactional email delivery |
| **Risk Rating** | Medium |
| **Data Shared** | Recipient email addresses, email content |
| **SOC 2** | Type II in progress |
| **Data Retention** | 30-day email log retention |
| **Encryption** | TLS in transit |
| **DPA** | Data Processing Agreement in place |
| **SLA** | 99.9% uptime |
| **Mitigation** | No sensitive PII in email bodies; template-based emails with minimal data |

### 2.5 Pusher

| Attribute | Assessment |
|-----------|-----------|
| **Service** | Real-time WebSocket communication |
| **Risk Rating** | Medium |
| **Data Shared** | Real-time event payloads (notifications, status updates) |
| **SOC 2** | Yes (Type II) |
| **Data Retention** | Messages not persisted beyond delivery |
| **Encryption** | TLS in transit; encrypted channels |
| **DPA** | Data Processing Agreement in place |
| **SLA** | 99.997% uptime |
| **Mitigation** | No PII in real-time messages; authenticated channels; event data minimization |

### 2.6 GitHub

| Attribute | Assessment |
|-----------|-----------|
| **Service** | Source code hosting, CI/CD (GitHub Actions) |
| **Risk Rating** | High |
| **Data Shared** | Source code, CI/CD secrets (encrypted) |
| **SOC 2** | Yes (Type II), ISO 27001 |
| **Data Retention** | Customer controlled |
| **Encryption** | TLS in transit; AES-256 at rest |
| **DPA** | GitHub Data Protection Agreement |
| **SLA** | 99.9% uptime |
| **Mitigation** | Branch protection, required reviews, secret scanning, Dependabot |

### 2.7 Datadog

| Attribute | Assessment |
|-----------|-----------|
| **Service** | Application performance monitoring, alerting, dashboards |
| **Risk Rating** | Medium |
| **Data Shared** | Application metrics, traces, logs (PII scrubbed before export) |
| **SOC 2** | Yes (Type II), ISO 27001 |
| **Data Retention** | Configurable (15-day default for logs) |
| **Encryption** | TLS in transit; AES-256 at rest |
| **DPA** | Data Processing Agreement in place |
| **SLA** | 99.9% uptime |
| **Mitigation** | PII scrubbing in logging pipeline before export to Datadog |

### 2.8 Sentry

| Attribute | Assessment |
|-----------|-----------|
| **Service** | Error tracking and monitoring |
| **Risk Rating** | Medium |
| **Data Shared** | Error stack traces, user context (user ID, workspace ID) |
| **SOC 2** | Yes (Type II) |
| **Data Retention** | 90 days (configurable) |
| **Encryption** | TLS in transit; encrypted at rest |
| **DPA** | Data Processing Agreement in place |
| **SLA** | 99.9% uptime |
| **Mitigation** | `before_send` hook strips sensitive data; no PII in error context |

---

## 3. Vendor Review Schedule

| Vendor | Risk Rating | Last Review | Next Review |
|--------|------------|-------------|-------------|
| Anthropic | Critical | 2026-04-03 | 2026-07-03 |
| AWS | Critical | 2026-04-03 | 2026-07-03 |
| Stripe | High | 2026-04-03 | 2026-10-03 |
| GitHub | High | 2026-04-03 | 2026-10-03 |
| Resend | Medium | 2026-04-03 | 2027-04-03 |
| Pusher | Medium | 2026-04-03 | 2027-04-03 |
| Datadog | Medium | 2026-04-03 | 2027-04-03 |
| Sentry | Medium | 2026-04-03 | 2027-04-03 |

---

## 4. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-03 | Compliance Officer | Initial vendor risk assessments |
