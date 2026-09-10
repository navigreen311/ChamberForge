"""Operator-scope middleware - resolve identity and bind the operator scope.

P-02 (D2). This used to *annotate* and never act: it read the JWT, set
`request.state.workspace_id` when one was present, and called the next
handler either way - including when the token was expired or forged.

What it does now:

1. **Binds the operator scope** (`app.db.scope`) for the request, so queries
   have one place to filter from, reset in a `finally` because a context
   leaking into the next request on the same worker is exactly the
   cross-operator bug this exists to prevent.

2. **Refuses credentials that do not decode.** An expired, tampered or
   wrongly-signed token is an unambiguous failure and is rejected here,
   rather than passed to a route that may not check.

What it deliberately does NOT do: refuse a request that presents **no**
credentials. That is the per-route dependency's job.

The reason is sequencing, not principle. 187 routes still carry no auth
dependency; refusing them from middleware would have failed 106 tests in one
commit, all in files owned by P-13 through P-18 - the same cross-package edit
the parallel build exists to prevent. The gate is
`Depends(get_workspace_id)`, the router packages are attaching it, and
`tests/security/test_auth_coverage.py` counts the remainder down to zero.
P-26 makes that guard a hard gate, which is the point at which no route can
be reached anonymously.

D2 defers multi-tenancy. The seam for a second dimension is in
`app.db.scope`, not here.
"""
import logging

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.core.security import decode_access_token
from app.db.scope import OperatorScope, reset_scope, set_scope

logger = logging.getLogger("chamberforge.tenant")

# Paths that legitimately run without an identity.
#
# Keep this list boring. Everything on it is either pre-authentication by
# definition, an unauthenticated probe that discloses nothing, or a surface
# with its own authentication scheme (a Stripe signature, a portal magic
# link). Adding to it is a security decision, and the reason belongs beside
# the entry.
_PUBLIC_PREFIXES = (
    "/api/v1/auth/login",       # pre-authentication by definition
    "/api/v1/auth/register",    # pre-authentication by definition
    "/api/v1/auth/refresh",     # presents a refresh token, not a session
    "/api/v1/health",           # liveness/readiness, discloses nothing
    "/api/v1/metrics",          # scraped by the metrics collector
    "/api/v1/webhooks/",        # authenticated by provider signature (P-29)
    "/api/docs",
    "/api/redoc",
    "/openapi.json",
)

# Client-facing portal routes authenticate by single-use magic-link token
# rather than by session. P-30 owns them and asserts the token rules; they
# are not "open", so they do not belong in the list above.
_TOKEN_AUTH_PREFIXES = ("/api/v1/portal/",)


def _is_public(path: str) -> bool:
    return path.startswith(_PUBLIC_PREFIXES) or path.startswith(_TOKEN_AUTH_PREFIXES)


class TenantMiddleware(BaseHTTPMiddleware):
    """Resolve the operator for every request, and bind their scope."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        path = request.url.path

        if _is_public(path):
            return await call_next(request)

        auth_header = request.headers.get("authorization", "")

        if not auth_header.startswith("Bearer "):
            # No credentials presented. This middleware does NOT refuse here,
            # deliberately - see the module docstring. The per-route
            # dependency is the gate; 187 routes do not yet carry one, and
            # refusing them from here would fail 106 tests across six other
            # packages' files in a single commit.
            return await call_next(request)

        payload = decode_access_token(auth_header[7:])

        if payload is None:
            # Credentials WERE presented and did not decode - expired,
            # tampered, or signed with the wrong key. That is unambiguous, so
            # it is refused here rather than passed down to a route that may
            # not check.
            logger.info(
                "rejected_undecodable_token",
                extra={"method": request.method, "path": path},
            )
            return JSONResponse(
                status_code=401,
                content={
                    "error_code": "invalid_token",
                    "message": "Authentication credentials are not valid.",
                },
            )

        workspace_id = payload.get("workspace_id")
        user_id = payload.get("sub")

        if not workspace_id:
            # A token that authenticates a user but resolves to no workspace
            # cannot be scoped, so it cannot be served safely.
            logger.warning(
                "token_without_workspace",
                extra={"user_id": user_id, "path": path},
            )
            return JSONResponse(
                status_code=403,
                content={
                    "error_code": "no_workspace",
                    "message": "This account is not assigned to a workspace.",
                },
            )

        request.state.workspace_id = workspace_id
        request.state.user_id = user_id

        token = set_scope(OperatorScope(workspace_id=workspace_id, user_id=user_id))
        try:
            return await call_next(request)
        finally:
            # Always, including on an exception: a scope surviving into the
            # next request on this worker is the bug this guards against.
            reset_scope(token)
