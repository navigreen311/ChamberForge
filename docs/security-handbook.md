# ChamberForge Employee Security Handbook

**Document Owner**: CTO
**Last Updated**: 2026-04-03
**Review Cycle**: Annual (next review: 2027-04-03)
**Classification**: Internal
**Applicability**: All employees, contractors, and AI agents with system access

---

## 1. Acceptable Use Policy

### 1.1 General Principles

- Company systems and accounts are for authorized business purposes
- Do not use company resources for illegal, unethical, or unauthorized activities
- Do not share company systems access with unauthorized individuals
- Report any suspected misuse to your manager or the security team

### 1.2 Permitted Use

- Software development and testing using approved tools and environments
- Communication with team members and clients via approved channels
- Access to production systems for authorized operational tasks only
- Use of AI tools (Claude, etc.) in accordance with the AI governance policy in `CLAUDE.md`

### 1.3 Prohibited Use

- Accessing systems or data beyond your role's authorization
- Installing unauthorized software on company devices
- Storing company data on personal devices or unapproved cloud services
- Sharing credentials, API keys, or access tokens with anyone
- Disabling security controls (encryption, antivirus, firewall)
- Using production data in development or testing environments
- Circumventing audit logging or monitoring systems

---

## 2. Password and Authentication Requirements

### 2.1 Password Policy

| Requirement | Standard |
|-------------|----------|
| Minimum length | 14 characters |
| Complexity | Mix of uppercase, lowercase, numbers, and symbols |
| Reuse | No reuse of last 12 passwords |
| Rotation | Every 90 days for service accounts; password manager recommended for personal accounts |
| Storage | Password manager required (e.g., 1Password, Bitwarden) — never in plaintext |

### 2.2 Multi-Factor Authentication (MFA)

**MFA is mandatory for all staff on all systems.**

| System | MFA Method | Enforcement |
|--------|-----------|-------------|
| AWS Console | Hardware key or TOTP | Required |
| GitHub | TOTP or WebAuthn | Required (org-enforced) |
| Email/Google Workspace | TOTP or hardware key | Required |
| ChamberForge Admin | TOTP | Required for admin/operator roles |
| VPN | Certificate + TOTP | Required |

### 2.3 API Keys and Secrets

- Never commit secrets to version control — use `.env` files (gitignored) or SSM Parameter Store
- Rotate API keys every 90 days
- Use least-privilege scoping for all API keys
- Revoke keys immediately when a team member departs

---

## 3. Device Security

### 3.1 Required Controls

All devices used to access company systems must have:

| Control | Requirement |
|---------|------------|
| Disk encryption | FileVault (macOS) or BitLocker (Windows) — full disk encryption mandatory |
| Screen lock | Automatic lock after 5 minutes of inactivity |
| OS updates | Install security updates within 7 days of release |
| Antivirus/EDR | Company-approved endpoint protection installed and active |
| Firewall | OS firewall enabled |
| Browser | Keep up to date; use only approved extensions |

### 3.2 Lost or Stolen Devices

If a device is lost or stolen:
1. **Immediately** notify the security team
2. Remotely wipe the device if possible
3. Revoke all active sessions and tokens
4. Change all passwords that may have been cached on the device
5. Security team will audit access logs for the device

### 3.3 Personal Devices (BYOD)

Personal devices may access company email and communication tools only if:
- Device meets all controls in Section 3.1
- MDM (Mobile Device Management) profile is installed
- Company data can be remotely wiped without affecting personal data
- Device is reported if lost or stolen

---

## 4. Data Handling and Classification

### 4.1 Classification Levels

| Level | Definition | Examples | Handling |
|-------|-----------|----------|---------|
| **Public** | Information intended for public consumption | Marketing materials, public docs, open-source code | No restrictions on sharing |
| **Internal** | Business information not intended for public | Internal procedures, architecture docs, meeting notes | Share within company only; no external sharing without approval |
| **Confidential** | Sensitive business or customer information | Customer data, financial reports, API keys, contracts | Encrypted at rest and in transit; access on need-to-know basis |
| **Restricted** | Highly sensitive data with regulatory implications | PII, payment data, health records, encryption keys | Field-level encryption; access requires explicit authorization; audit-logged |

### 4.2 Data Handling Rules

| Action | Public | Internal | Confidential | Restricted |
|--------|--------|----------|-------------|-----------|
| Email | OK | OK (internal only) | Encrypted only | Prohibited — use secure portal |
| Cloud storage | OK | Approved services only | Approved + encrypted | Approved + encrypted + access-controlled |
| Print | OK | OK | Minimize; shred when done | Prohibited unless required by law |
| Share externally | OK | With approval | With NDA + approval | With legal review + executive approval |
| Dispose | Normal deletion | Normal deletion | Secure deletion | Cryptographic erasure + audit record |

### 4.3 Customer Data

- All customer data is classified as **Confidential** or **Restricted**
- Never copy customer data to local machines or personal accounts
- Access customer data only when required for your role
- All customer data access is audit-logged
- Report any suspected unauthorized access immediately

---

## 5. Incident Reporting

### 5.1 What to Report

Report any of the following immediately:
- Suspected unauthorized access to any system
- Phishing emails or social engineering attempts
- Lost or stolen devices
- Accidental exposure of credentials or customer data
- Suspicious system behavior or unknown processes
- Violation of this security handbook by anyone (including yourself)

### 5.2 How to Report

| Method | Use When |
|--------|----------|
| Slack: `#security-incidents` | Non-urgent security concerns |
| Email: security@chamberforge.com | Detailed reports, evidence attachments |
| Phone: On-call security number | Urgent issues requiring immediate response |
| Crisis Console | Active incidents requiring coordination |

### 5.3 No-Blame Policy

ChamberForge maintains a **blameless reporting culture**. You will not be penalized for:
- Reporting your own accidental security mistakes
- Raising concerns about potential vulnerabilities
- Reporting policy violations by others

Failure to report known incidents, however, is a policy violation.

---

## 6. Onboarding Security Checklist

### New Employee / Contractor

- [ ] Sign security handbook acknowledgment
- [ ] Complete security awareness training
- [ ] Set up password manager with strong master password
- [ ] Enable MFA on all company accounts (GitHub, AWS, Google Workspace, etc.)
- [ ] Install required device security controls (encryption, EDR, firewall)
- [ ] Receive role-appropriate system access (principle of least privilege)
- [ ] Review data classification and handling procedures
- [ ] Review incident reporting procedures
- [ ] Receive physical office access (badge/key) if applicable
- [ ] Add to on-call rotation if applicable
- [ ] Review and acknowledge AI governance policy (`CLAUDE.md`)

### Access Provisioning

| System | Provisioned By | Access Level |
|--------|---------------|-------------|
| GitHub (organization) | Engineering Lead | Role-based (read/write/admin) |
| AWS Console | CTO / Infrastructure Lead | Role-based IAM |
| ChamberForge Admin | Engineering Lead | RBAC (admin/operator/viewer) |
| Google Workspace | People Ops | Standard |
| Monitoring (Sentry, Datadog) | Engineering Lead | Role-based |

---

## 7. Offboarding Security Checklist

### Departing Employee / Contractor

- [ ] Revoke all system access within 24 hours of last working day:
  - [ ] GitHub organization membership
  - [ ] AWS IAM user/role
  - [ ] ChamberForge admin account (deactivate, do not delete)
  - [ ] Google Workspace account (suspend)
  - [ ] Monitoring tools (Sentry, Datadog)
  - [ ] VPN certificates
  - [ ] Any third-party service accounts
- [ ] Rotate any shared secrets the departing person had access to
- [ ] Collect company devices and verify secure wipe
- [ ] Remove from on-call rotation
- [ ] Remove physical access (badge, office keys)
- [ ] Archive (do not delete) email account for 90 days
- [ ] Review recent access logs for anomalies
- [ ] Update emergency contact list if applicable
- [ ] Transfer ownership of any critical documents or projects

---

## 8. Remote Work Security Guidelines

### 8.1 Network Security

- Use company VPN when accessing production systems or sensitive data
- Do not use public Wi-Fi without VPN enabled
- Secure home Wi-Fi with WPA3 (or WPA2 minimum) and a strong password
- Do not share your home network password with non-household members who might access company resources

### 8.2 Physical Security

- Lock your screen when stepping away (even at home)
- Do not leave devices unattended in public places
- Use a privacy screen in public/shared spaces
- Ensure video calls do not expose sensitive information on screen

### 8.3 Communication Security

- Use company-approved communication tools (Slack, Google Meet) for business discussions
- Do not discuss confidential information on personal messaging apps
- Verify the identity of callers requesting sensitive information or actions
- Be vigilant against phishing — verify unexpected requests through a second channel

---

## 9. Security Awareness Training

### Training Schedule

| Training | Frequency | Audience | Format |
|----------|-----------|----------|--------|
| Security onboarding | At hire | All new employees | Self-paced + quiz |
| Annual security refresher | Annually | All employees | Live session + quiz |
| Phishing simulation | Quarterly | All employees | Simulated phishing emails |
| Secure coding practices | Semi-annually | Engineering team | Workshop |
| Incident response drill | Semi-annually | Engineering + Leadership | Tabletop exercise |

### Training Topics

- Phishing and social engineering recognition
- Password hygiene and MFA usage
- Data classification and handling
- Secure coding practices (OWASP Top 10)
- Incident reporting procedures
- Physical security and clean desk policy
- AI safety and ethical use guidelines
- Regulatory requirements (GDPR, SOC 2)

---

## 10. Policy Violations

Violations of this security handbook may result in:
- Mandatory additional security training
- Temporary restriction of system access
- Formal written warning
- Termination of employment (for severe or repeated violations)

All violations are documented and reviewed by management. The response is proportional to the severity and intent of the violation.

---

## 11. Acknowledgment

By accessing ChamberForge systems, you acknowledge that you have read, understood, and agree to comply with all policies in this security handbook. This acknowledgment is recorded as part of your onboarding documentation.

---

## Document History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2026-04-03 | 1.0 | Engineering | Initial security handbook |

## Audit trail integrity (P-03)

ChamberForge keeps **two audit surfaces** and never unifies them (D5a):

| | Prisma `AuditLog` | FastAPI `audit_logs` |
|---|---|---|
| Records | operator actions in the UI | system-layer mutations |
| Written by | `frontend/src/lib/audit.ts` | `AuditMiddleware` |

> **Operator audit trail: Prisma `AuditLog`. System audit trail: FastAPI `audit_logs`. Full compliance export joins both by timestamp range.**

### Three properties, and what enforces each

**Nothing is dropped.** The middleware used to return early whenever it could
not attribute a mutation to a workspace. With 187 routes still accepting
anonymous requests, that made the least-authenticated surface in the platform
also the least audited - an attacker's requests were the ones leaving no
trace. Anonymous mutations are now recorded against a sentinel workspace.
A row saying "we do not know who did this" is worth far more than no row.

**Tampering is detectable.** Each entry hashes its content together with the
previous entry's hash. Change a field and that entry stops matching; remove
an entry and the next one points at nothing. `verify_chain` names the first
row where the trail stops adding up, and reports every break rather than
stopping at the first - one tampered row makes every later link mismatch, and
being told only about the first makes a single edit look like a rewrite.

This is what the database trigger cannot give you. P-01's trigger stops
UPDATE and DELETE against the live database; the chain catches a restore from
a doctored backup, or a migration that dropped the trigger.

**A failed write is reported.** Previously the exception was logged and
swallowed, so audit loss was invisible to monitoring - the one failure mode
nobody notices is the trail quietly stopping. Failures now raise a Sentry
event and a `chamberforge.audit.write_failed` metric.

### The cross-language contract

Both surfaces use the same construction, so either can be verified alone and
a joined export verifies end to end. `canonical_payload` /
`canonicalPayload` and `compute_entry_hash` / `computeEntryHash` must stay
byte-identical; both test suites pin the same vector, so a change to one side
alone fails both.

Two deliberate choices in that payload:

- **Timestamps are epoch milliseconds, not ISO strings.** A tz-aware datetime
  written to the column came back naive, so Python hashed one string on write
  and a different one on read and every entry failed to verify. Python and
  JavaScript also format ISO differently (`+00:00` versus `Z`). An integer
  has one representation in both.
- **`details` is excluded.** It is free-form JSON whose serialisation differs
  between the two languages; a chain that breaks on key ordering catches
  nothing but itself.

### Verifying a trail

```python
AuditService.verify_chain(db, workspace_id)   # FastAPI surface
```
```ts
await verifyChain(userId)                     // operator surface
```
