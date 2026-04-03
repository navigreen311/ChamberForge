# ChamberForge Security Documentation

## Overview

ChamberForge handles sensitive data for High-Net-Worth (HNW) and Ultra-High-Net-Worth (UHNW) individuals. This document describes the security architecture, controls, and compliance posture of the platform.

---

## 1. Authentication

### JWT Token System

- **Access tokens**: Short-lived JWTs (configurable, default 30 minutes) containing `sub` (user ID), `workspace_id`, `role`, and `exp` claims.
- **Refresh tokens**: Long-lived JWTs (7 days) for token rotation without re-authentication.
- **Algorithm**: HS256 via `python-jose`.
- **Token validation**: Every authenticated request passes through `get_current_user` dependency which validates the token, checks the `sub` claim, verifies the user exists and is active.

### Password Security

- **Hashing**: bcrypt via `passlib` with automatic salt generation.
- **Verification**: Constant-time comparison to prevent timing attacks.
- **No plaintext storage**: Passwords are hashed before database persistence.

### Token Refresh Flow

```
Client -> POST /api/v1/auth/refresh { refresh_token }
Server -> Validates refresh token (type=refresh, not expired)
Server -> Issues new access_token + refresh_token pair
Server -> Returns tokens to client
```

---

## 2. Authorization (RBAC)

### Role Hierarchy

| Role | Description | Permissions |
|------|-------------|-------------|
| `admin` | Workspace administrator | Full CRUD, user management, settings, billing, admin endpoints |
| `operator` | Service operator | Create/read/update on business entities, run AI agents, manage clients |
| `viewer` | Read-only viewer | Read access to dashboards, reports, and playbook content |

### Enforcement

- **Dependency injection**: `require_role("admin", "operator")` returns a FastAPI dependency that checks `current_user.role` against allowed roles.
- **Per-endpoint**: Each router endpoint specifies its required role(s) via `Depends(require_role(...))`.
- **Fail-closed**: Missing or invalid role returns HTTP 403 Forbidden.

### Protected Endpoint Categories

| Category | Required Role |
|----------|---------------|
| Admin panel, feature flags, sandbox | `admin` |
| Create/update problems, offers, clients | `admin`, `operator` |
| AI agent invocation | `admin`, `operator` |
| Billing management | `admin` |
| Read dashboards, reports | `admin`, `operator`, `viewer` |
| Deletion requests, legal holds | `admin` |

---

## 3. Multi-Tenancy & Workspace Isolation

### Architecture

- Every data entity includes a `workspace_id` foreign key.
- JWT tokens embed `workspace_id` at login time.
- All database queries are scoped by `workspace_id` via query helpers.
- Cross-workspace data access is architecturally impossible through the API layer.

### Data Filtering

- Query helpers automatically inject `WHERE workspace_id = :current_workspace` on all list and detail endpoints.
- Workspace ID is extracted from the JWT, not from request parameters, preventing parameter tampering.

---

## 4. Encryption

### At Rest

- **Field-level encryption**: AES-256 via Fernet (from Python `cryptography` library).
- **Key derivation**: SHA-256 digest of the application secret, base64-encoded for Fernet compatibility.
- **Encrypted fields**: Sensitive PII fields (SSN, financial data, private notes) are encrypted before database storage.
- **Utility functions**: `encrypt_field()`, `decrypt_field()`, `encrypt_dict_fields()`, `decrypt_dict_fields()` for batch operations.

### In Transit

- **TLS 1.3**: All production traffic served over HTTPS via AWS ALB/CloudFront.
- **HSTS header**: `Strict-Transport-Security: max-age=31536000; includeSubDomains` enforced on all responses.
- **Internal traffic**: Database connections use SSL in production (PostgreSQL `sslmode=require`).

---

## 5. Rate Limiting

### Implementation

Sliding-window counter rate limiter implemented as middleware (`RateLimiterMiddleware`).

### Default Limits

| Scope | Limit | Window |
|-------|-------|--------|
| Default (per IP per endpoint) | 100 requests | 60 seconds |
| Auth endpoints (`/api/v1/auth/*`) | Configurable override | Configurable |
| AI agent endpoints | Configurable override | Configurable |
| Webhook endpoints | Excluded | - |

### Features

- Per-IP tracking via `X-Forwarded-For` header (proxy-aware).
- Per-endpoint granularity with path-prefix overrides.
- Automatic expired-entry cleanup every 120 seconds.
- `429 Too Many Requests` response with `Retry-After` header.

---

## 6. Audit Trail

### Automatic Mutation Logging

The `AuditMiddleware` intercepts all `POST`, `PUT`, `PATCH`, and `DELETE` requests and records:

| Field | Description |
|-------|-------------|
| `workspace_id` | Tenant context |
| `user_id` | Acting user |
| `action` | HTTP method + path (e.g., `POST /api/v1/offers`) |
| `resource_type` | Extracted from URL path (e.g., `offers`) |
| `resource_id` | UUID extracted from URL path |
| `details` | Status code, full path |
| `ip_address` | Client IP address |
| `timestamp` | Server timestamp (UTC) |

### Excluded Paths

- `/api/health` (health checks)
- `/api/v1/auth/login` and `/api/v1/auth/register` (pre-auth)
- `/api/v1/metrics` (Prometheus scraping)
- `/api/v1/webhooks/*` (external callbacks)

### Audit API

- `GET /api/v1/audit` — Query audit logs with filters (date range, user, resource type).
- Export-ready for compliance reporting.

---

## 7. GDPR / CCPA Compliance

### Right to Deletion

- `POST /api/v1/security/deletion-request` — Creates a deletion request with legal hold check.
- `POST /api/v1/security/deletion-request/{id}/execute` — Executes deletion after approval, cascading across all related tables.
- `GET /api/v1/security/deletion-requests` — Lists all pending/completed deletion requests.
- Legal hold check prevents deletion of data under active legal holds.

### Consent Ledger

- `POST /api/v1/compliance/consent` — Records explicit consent with type, scope, and timestamp.
- `POST /api/v1/compliance/consent/{id}/revoke` — Revokes consent with timestamp.
- `GET /api/v1/compliance/consent/client/{client_id}` — Full consent history per client.
- `GET /api/v1/compliance/consent/check/{client_id}/{type}` — Check active consent by type.
- `GET /api/v1/compliance/consent/deletion-candidates` — Identifies clients eligible for deletion.

### Data Minimization

- `data_minimization.py` module enforces field-level data minimization rules.
- PII fields are automatically redacted in API responses based on the requesting user's role.

---

## 8. AI Guardrails

### Guardrails Engine

The `guardrails_engine.py` and `guardrails_enforcement.py` services enforce ethical boundaries on all AI-generated content:

| Guardrail | Description |
|-----------|-------------|
| No licensed professional positioning | AI never positions the user as a lawyer, doctor, CPA, or licensed fiduciary |
| No surveillance framing | AI never suggests surveillance of household staff or family members |
| No discriminatory profiling | AI avoids profiling based on protected characteristics |
| Regulatory compliance | Output checks against geo-specific regulations |
| PII detection | `POST /api/v1/security/check-output` scans AI output for leaked PII |

### Risk Review Queue

- AI-flagged content enters the risk review queue (`/api/v1/qualify/risk-queue`).
- Human operators must approve, reject, or escalate flagged items.
- Full audit trail on all queue actions.

---

## 9. Document Watermarking

- PDF exports (`/api/v1/exports/*`) include invisible and visible watermarks.
- Watermarks contain: workspace name, export timestamp, exporting user ID.
- Prevents unauthorized redistribution of sensitive client deliverables.

---

## 10. Security Headers

All HTTP responses include the following headers via `SecurityHeadersMiddleware`:

| Header | Value |
|--------|-------|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `X-Request-ID` | Unique UUID per request (for tracing) |

---

## 11. Infrastructure Security

### Docker

- Production containers run as non-root users.
- Secrets injected via environment variables (never baked into images).
- Health checks on all services (PostgreSQL, Redis, Elasticsearch).

### Network

- VPC isolation in AWS.
- Security groups restrict database access to application layer only.
- No direct public access to PostgreSQL, Redis, or Elasticsearch.

### Secrets Management

- `.env` files for local development (git-ignored).
- AWS Secrets Manager or SSM Parameter Store for production.
- Placeholder pattern: `YOUR_*_HERE` in `.env.example`.

---

## 12. Incident Response

### Crisis Console

- `POST /api/v1/polish/crisis` — Create crisis incident.
- `POST /api/v1/polish/crisis/{id}/escalation` — Escalate with notification broadcast.
- `POST /api/v1/polish/crisis/{id}/lockdown` — Trigger workspace lockdown.
- `POST /api/v1/polish/crisis/{id}/resolve` — Resolve with timeline documentation.

### Monitoring

- **Sentry**: Real-time error tracking with context (user, workspace, request).
- **Structured logging**: JSON-formatted logs with request IDs for correlation.
- **Health endpoints**: `/api/v1/health/ready` (readiness), `/api/v1/health/live` (liveness).
- **Prometheus metrics**: `/api/v1/metrics` for scraping.
