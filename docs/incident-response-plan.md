# ChamberForge Incident Response Plan

**Document Owner**: Engineering Lead
**Last Updated**: 2026-04-03
**Review Cycle**: Annual (next review: 2027-04-03)
**Classification**: Internal — Confidential

---

## 1. Purpose

This plan establishes a structured approach to detecting, responding to, and recovering from security incidents and service disruptions. It ensures consistent, timely responses that minimize impact to customers and the business.

---

## 2. Severity Levels

| Severity | Definition | Examples | Response Time | Update Frequency |
|----------|-----------|----------|---------------|-----------------|
| **P1 — Critical** | Complete service outage or confirmed data breach | Database down, data exfiltration, full API outage, ransomware | < 15 minutes | Every 30 minutes |
| **P2 — High** | Major feature degraded, potential security issue | AI features down, payment processing failing, elevated error rates (>5%), suspected unauthorized access | < 1 hour | Every 1 hour |
| **P3 — Medium** | Minor feature degraded, non-critical issue | Search degraded, email delivery delays, single tenant issue, non-sensitive configuration exposure | < 4 hours | Every 4 hours |
| **P4 — Low** | Cosmetic issue, minor bug, informational | UI glitch, non-blocking bug, security scan finding (informational) | Next business day | Resolution only |

---

## 3. Roles and Responsibilities

### Incident Commander (IC)
- Owns the incident from detection to resolution
- Coordinates response activities and resource allocation
- Makes escalation and communication decisions
- Ensures post-mortem is completed

### Tech Lead
- Leads technical investigation and remediation
- Provides technical status updates to IC
- Implements containment and recovery actions
- Documents technical timeline

### Communications Lead
- Drafts and sends customer notifications
- Updates status page
- Coordinates with legal/compliance on regulatory notifications
- Manages internal stakeholder updates

### On-Call Engineer
- First responder for alerts and reports
- Performs initial triage and severity assessment
- Escalates to IC if severity warrants
- Begins containment actions

### Role Assignment

| Severity | Incident Commander | Tech Lead | Communications Lead |
|----------|--------------------|-----------|-------------------|
| P1 | CTO or Engineering Lead | Senior Engineer | CEO or designated |
| P2 | Engineering Lead | Assigned Engineer | Engineering Lead |
| P3 | On-call Engineer | On-call Engineer | N/A |
| P4 | Assigned Engineer | Assigned Engineer | N/A |

---

## 4. Response Phases

### Phase 1: Detect

**Sources of detection**:
- Automated monitoring alerts (Sentry, CloudWatch, health checks)
- Customer reports (support channels)
- Internal discovery (engineer observation)
- Third-party notification (AWS, vendor, security researcher)
- Audit log anomaly detection

**Actions**:
1. Acknowledge the alert/report
2. Create an incident record (crisis console: `POST /api/v1/polish/crisis`)
3. Perform initial triage — assign severity level
4. Notify the appropriate responders per the escalation matrix

### Phase 2: Assess

**Actions**:
1. Confirm the scope and severity of the incident
2. Identify affected systems, data, and customers
3. Determine if the incident is ongoing or contained
4. Adjust severity level if needed
5. Begin incident timeline documentation

**Key questions**:
- What systems are affected?
- Is customer data at risk?
- Is the incident ongoing or has it stopped?
- What is the blast radius (number of affected tenants)?
- Is this a security incident or an availability incident?

### Phase 3: Contain

**Actions**:
1. Implement immediate containment measures:
   - Revoke compromised credentials
   - Block malicious IPs/users
   - Activate crisis lockdown if needed (`POST /api/v1/polish/crisis/{id}/lockdown`)
   - Isolate affected systems
2. Preserve evidence (logs, snapshots, memory dumps)
3. Communicate containment status to stakeholders

### Phase 4: Eradicate

**Actions**:
1. Identify and remove the root cause
2. Patch vulnerabilities
3. Remove unauthorized access
4. Verify eradication is complete
5. Update security controls to prevent recurrence

### Phase 5: Recover

**Actions**:
1. Restore affected systems from clean backups (see `docs/disaster-recovery.md`)
2. Verify system integrity before restoring service
3. Monitor closely for recurrence (increased alerting thresholds)
4. Gradually restore normal operations
5. Confirm with customers that service is restored

### Phase 6: Post-Mortem

**Timeline**: Complete within 5 business days of incident resolution.

**Actions**:
1. Schedule post-mortem meeting with all responders
2. Complete post-mortem document (template in Section 6)
3. Identify action items with owners and due dates
4. Share findings with the team (blameless culture)
5. Track action items to completion
6. Update runbooks and this plan if needed

---

## 5. Communication Templates

### 5.1 P1 — Critical Incident (Initial Notification)

**Subject**: [ChamberForge] Service Disruption — We Are Investigating

```
We are currently experiencing a service disruption affecting [describe affected functionality].

Our engineering team was alerted at [TIME] and is actively investigating.

What we know:
- [Brief description of impact]
- [Which features/services are affected]

What we are doing:
- Our incident response team has been mobilized
- We are working to restore full service as quickly as possible

We will provide an update within 30 minutes. For urgent matters, contact [support email].

— The ChamberForge Team
```

### 5.2 P1 — Critical Incident (Update)

**Subject**: [ChamberForge] Service Disruption — Update

```
Update on the service disruption first reported at [TIME]:

Current status: [Investigating / Identified / Monitoring / Resolved]

What happened:
- [Brief technical explanation appropriate for customers]

Current impact:
- [What is/isn't working]

Next steps:
- [What the team is doing]
- Next update expected at [TIME]

— The ChamberForge Team
```

### 5.3 P1 — Critical Incident (Resolution)

**Subject**: [ChamberForge] Service Disruption — Resolved

```
The service disruption that began at [START TIME] has been resolved as of [END TIME].

Total duration: [DURATION]

What happened:
- [Root cause explanation]

What we did:
- [Resolution steps taken]

What we are doing to prevent this:
- [Preventive measures]

We sincerely apologize for the disruption. If you experience any residual issues, please contact [support email].

— The ChamberForge Team
```

### 5.4 P2 — High Severity

**Subject**: [ChamberForge] Degraded Performance — [Feature Name]

```
We are aware of degraded performance affecting [feature/service].

Impact: [Description of what users may experience]
Status: Our team is actively working on a fix.

Workaround: [If applicable]

We will update you when the issue is resolved.

— The ChamberForge Team
```

### 5.5 Data Breach Notification

**Subject**: [ChamberForge] Important Security Notice

```
We are writing to inform you of a security incident that may have affected your data.

What happened:
- [Description of the incident]
- [When it occurred and when it was discovered]

What data was involved:
- [Types of data potentially affected]

What we have done:
- [Containment and remediation steps]
- [Steps taken to prevent recurrence]

What you should do:
- [Recommended actions for the customer]

We take the security of your data seriously and sincerely apologize for this incident. For questions, contact [security email] or call [phone number].

— The ChamberForge Team
```

---

## 6. Post-Mortem Template

```markdown
# Post-Mortem: [Incident Title]

**Date**: [YYYY-MM-DD]
**Severity**: [P1/P2/P3/P4]
**Incident Commander**: [Name]
**Author**: [Name]
**Status**: [Draft / Final]

## Summary

[2-3 sentence summary of what happened and the impact]

## Impact

- **Duration**: [Start time] to [End time] ([total duration])
- **Affected users**: [Number or percentage of users affected]
- **Affected services**: [List of services]
- **Data impact**: [Was data lost, corrupted, or exposed?]
- **Financial impact**: [Revenue loss, credits issued, etc.]

## Timeline (all times UTC)

| Time | Event |
|------|-------|
| HH:MM | [First sign of the issue] |
| HH:MM | [Alert fired / Customer report received] |
| HH:MM | [Incident declared, IC assigned] |
| HH:MM | [Root cause identified] |
| HH:MM | [Containment action taken] |
| HH:MM | [Fix deployed] |
| HH:MM | [Service restored, monitoring] |
| HH:MM | [Incident resolved] |

## Root Cause

[Detailed technical explanation of what caused the incident]

## Resolution

[What was done to resolve the incident]

## What Went Well

- [Things that helped during the response]

## What Went Poorly

- [Things that hindered the response or could be improved]

## Action Items

| # | Action | Owner | Priority | Due Date | Status |
|---|--------|-------|----------|----------|--------|
| 1 | [Action] | [Name] | [P1-P4] | [Date] | [Open/Done] |
| 2 | [Action] | [Name] | [P1-P4] | [Date] | [Open/Done] |

## Lessons Learned

[Key takeaways for the team]
```

---

## 7. Incident Tracking

All incidents are tracked in:
- **Crisis Console**: `POST /api/v1/polish/crisis` — real-time incident management
- **Post-mortems**: Stored in `docs/post-mortems/` directory
- **Action items**: Tracked in project management tool with `incident-action` label

### Metrics Tracked

| Metric | Target | Measurement |
|--------|--------|-------------|
| Mean Time to Detect (MTTD) | < 5 minutes (P1) | Alert time minus incident start time |
| Mean Time to Respond (MTTR) | < 15 minutes (P1) | First responder action minus alert time |
| Mean Time to Resolve | < 1 hour (P1) | Resolution time minus detection time |
| Post-mortem completion rate | 100% for P1/P2 | Completed within 5 business days |
| Action item completion rate | > 90% | Completed by due date |

---

## Document History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2026-04-03 | 1.0 | Engineering | Initial incident response plan |
