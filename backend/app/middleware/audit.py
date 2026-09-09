"""Audit middleware — automatically logs every data-mutation request."""
import logging
import re
import uuid

from starlette.background import BackgroundTask
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from app.db.session import SessionLocal
from app.services.backbone.audit_service import AuditService

logger = logging.getLogger("chamberforge.audit")

# Paths that should never be audited.
_SKIP_PREFIXES = (
    "/api/health",
    "/api/v1/auth/login",
    "/api/v1/auth/register",
    "/api/v1/metrics",
    "/api/v1/webhooks/",
    "/api/v1/webhooks",
)

# Methods that represent data mutations.
_MUTATION_METHODS = {"POST", "PUT", "PATCH", "DELETE"}

# Regex to pull a UUID segment out of a URL path.
_UUID_RE = re.compile(
    r"([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})"
)


def _extract_resource_type(path: str) -> str:
    """Derive the resource type from the URL path.

    For ``/api/v1/problems/some-uuid`` this returns ``"problems"``.
    Falls back to the last non-UUID segment.
    """
    segments = [s for s in path.strip("/").split("/") if s and not _UUID_RE.fullmatch(s)]
    # Walk backwards past generic prefixes (api, v1) to find the resource name.
    if len(segments) >= 3:
        return segments[2]  # api / v1 / <resource>
    if segments:
        return segments[-1]
    return "unknown"


def _extract_resource_id(path: str) -> uuid.UUID | None:
    """Return the first UUID found in the path, or None."""
    m = _UUID_RE.search(path)
    if m:
        return uuid.UUID(m.group(1))
    return None


def _should_skip(path: str) -> bool:
    for prefix in _SKIP_PREFIXES:
        if path == prefix or path.startswith(prefix):
            return True
    return False


def _write_audit_log(
    workspace_id: uuid.UUID | None,
    user_id: uuid.UUID | None,
    action: str,
    resource_type: str,
    resource_id: uuid.UUID | None,
    details: dict,
    ip_address: str | None,
) -> None:
    """Background task: open a fresh DB session, write the audit row, close."""
    if workspace_id is None:
        # Cannot record without a workspace; degrade gracefully.
        logger.debug("Skipping audit write — no workspace_id available for %s", action)
        return
    db = SessionLocal()
    try:
        AuditService.log_action(
            db=db,
            workspace_id=workspace_id,
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
            ip_address=ip_address,
        )
    except Exception:
        logger.exception("Failed to write audit log for %s", action)
        db.rollback()
    finally:
        db.close()


class AuditMiddleware(BaseHTTPMiddleware):
    """Intercept mutation requests and asynchronously persist an audit trail."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Only audit mutation methods.
        if request.method not in _MUTATION_METHODS:
            return await call_next(request)

        path = request.url.path

        # Skip paths that should not be audited.
        if _should_skip(path):
            return await call_next(request)

        # Process the actual request first.
        response: Response = await call_next(request)

        # Gather context set by auth dependencies / earlier middleware.
        user_id = getattr(request.state, "user_id", None)
        workspace_id = getattr(request.state, "workspace_id", None)

        action = f"{request.method} {path}"
        resource_type = _extract_resource_type(path)
        resource_id = _extract_resource_id(path)
        details = {"status_code": response.status_code, "path": path}
        ip_address = request.client.host if request.client else None

        # Schedule the DB write as a background task so the response is not delayed.
        task = BackgroundTask(
            _write_audit_log,
            workspace_id=workspace_id,
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
            ip_address=ip_address,
        )

        # Attach (or chain) the background task to the response.
        if response.background is None:
            response.background = task
        else:
            # Chain: run existing background first, then audit.
            existing = response.background
            response.background = BackgroundTask(
                _chained_tasks, existing, task
            )

        return response


async def _chained_tasks(first: BackgroundTask, second: BackgroundTask) -> None:
    """Run two background tasks sequentially."""
    await first()
    await second()
