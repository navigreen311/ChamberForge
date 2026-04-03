# Prompt 02: Authentication, RBAC & Multi-Tenancy
Branch: ai-feature/auth-rbac

## Mission
Build the complete auth system with JWT tokens, role-based access control, multi-tenant workspace isolation, and NextAuth.js frontend integration.

## What to Build

### Backend (backend/app/)
1. **api/v1/auth.py** — POST /api/v1/auth/register, POST /api/v1/auth/login, POST /api/v1/auth/refresh, GET /api/v1/auth/me, POST /api/v1/auth/logout
2. **api/v1/users.py** — CRUD for users within a workspace (admin only)
3. **api/v1/workspaces.py** — Create workspace, get workspace, update settings, invite member
4. **core/dependencies.py** — get_current_user, get_current_workspace, require_role(role) dependency injectors
5. **core/security.py** — Update with: password hashing, JWT create/decode, token blacklist via Redis
6. **middleware/tenant.py** — Middleware that extracts workspace from JWT and sets it on request state

### Frontend (frontend/src/)
1. **lib/auth.ts** — NextAuth.js configuration with credentials provider pointing to FastAPI
2. **app/login/page.tsx** — Login page with email/password form
3. **app/register/page.tsx** — Registration page creating user + workspace
4. **components/layout/AuthGuard.tsx** — Wrapper that redirects to /login if no session
5. **components/layout/Sidebar.tsx** — Navigation sidebar showing role-appropriate menu items
6. **hooks/useAuth.ts** — Hook for current user, workspace, role checks

### RBAC Rules
- admin: full access to workspace
- operator: CRUD on problems, offers, clients, evidence; no workspace settings
- viewer: read-only across all resources

## Tests
- backend/tests/unit/test_auth.py — register, login, token refresh, invalid credentials
- backend/tests/integration/test_rbac.py — role-based endpoint access (admin vs operator vs viewer)

## Commit
feat: add JWT auth, RBAC, multi-tenant workspace isolation, and NextAuth.js integration
