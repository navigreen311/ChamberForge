"""Tenant isolation middleware — sets workspace_id on request.state for every authenticated request."""
import logging

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from app.core.security import decode_access_token

logger = logging.getLogger("chamberforge.tenant")

# Paths that do not require tenant context.
_PUBLIC_PREFIXES = (
    "/api/health",
    "/api/docs",
    "/api/redoc",
    "/api/v1/auth/login",
    "/api/v1/auth/register",
    "/api/v1/auth/refresh",
    "/openapi.json",
)


class TenantMiddleware(BaseHTTPMiddleware):
    """Extract workspace_id from the JWT on every authenticated request.

    Sets ``request.state.workspace_id`` and ``request.state.user_id`` so
    downstream middleware (e.g. AuditMiddleware) and dependencies can use them.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        path = request.url.path

        # Skip public / unauthenticated paths.
        if any(path.startswith(prefix) for prefix in _PUBLIC_PREFIXES):
            return await call_next(request)

        # Try to extract JWT from the Authorization header.
        auth_header = request.headers.get("authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
            payload = decode_access_token(token)
            if payload:
                workspace_id = payload.get("workspace_id")
                user_id = payload.get("sub")

                request.state.workspace_id = workspace_id
                request.state.user_id = user_id

                logger.info(
                    "tenant_context",
                    extra={
                        "workspace_id": workspace_id,
                        "user_id": user_id,
                        "method": request.method,
                        "path": path,
                    },
                )

        return await call_next(request)
