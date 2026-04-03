# Prompt 30: Security Hardening & Privacy by Design
Branch: ai-feature/security-hardening

## Mission
Implement all security principles from the blueprint: data minimization, need-to-know access, audit trails, encryption, document watermarking enforcement, consent ledger enforcement, right to deletion, no-surveillance guardrails, human review gates, legal holds.

## What to Build

### Backend
1. **middleware/security_headers.py** — Security headers: Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, Referrer-Policy, Permissions-Policy
2. **middleware/rate_limiter.py** — Rate limiting per workspace per endpoint: configurable limits, Redis-backed, 429 response with Retry-After
3. **middleware/audit_middleware.py** — Auto-audit: log every data access, export, modification with timestamp, actor, workspace, resource
4. **core/encryption.py** — AES-256 field-level encryption for sensitive fields (client PII, household graph data). Transparent encrypt/decrypt in model layer.
5. **core/data_minimization.py** — Response filtering: strip fields the requesting user's role shouldn't see. Enforce at serialization layer.
6. **services/backbone/deletion_service.py** — Right-to-deletion workflow: request → verify identity → cascade delete across all tables → purge from S3 → remove from Elasticsearch → log deletion → confirm. GDPR/CCPA compliant.
7. **services/backbone/legal_hold.py** — Legal hold enforcement: freeze records, override deletion schedules, audit trail, release workflow
8. **services/backbone/guardrails_enforcement.py** — Runtime guardrails:
   - Block AI outputs positioning users as licensed professionals
   - Block monitoring/surveillance outputs without consent
   - Route medical/legal/tax/security outputs to Risk Review Queue
   - Add jurisdiction compliance flags to cross-border recommendations
   - Review guarantee language via AI Explainability Layer
9. **api/v1/security.py** — Deletion request, legal hold, security audit endpoints
10. **core/cors.py** — Strict CORS configuration: whitelist specific origins only
11. **tests/security/** — Security-specific tests:
    - test_sql_injection.py — parameterized query verification
    - test_xss.py — output encoding verification
    - test_auth_bypass.py — endpoint access without token, expired token, wrong role
    - test_rate_limiting.py — verify 429 after limit exceeded
    - test_data_minimization.py — verify role-based field stripping
    - test_deletion.py — verify cascade deletion completeness
    - test_encryption.py — verify field encryption at rest

### Frontend
1. **middleware.ts** — Next.js middleware: verify auth token, redirect unauthenticated, CSP headers
2. **lib/sanitize.ts** — Input sanitization utilities for all user inputs

## Tests
- All tests in backend/tests/security/
- test security headers presence
- test rate limiting behavior
- test field-level encryption roundtrip
- test deletion cascade completeness
- test guardrails blocking

## Commit
feat: add security hardening — encryption, rate limiting, audit trails, GDPR deletion, guardrails enforcement, security headers
