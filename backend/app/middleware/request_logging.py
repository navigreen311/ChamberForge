"""Request logging middleware — logs every request with structured context."""
import logging
import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("chamberforge.requests")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Attach request_id to each request and log method, path, status, latency."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        start = time.perf_counter()
        response: Response = await call_next(request)
        latency_ms = round((time.perf_counter() - start) * 1000, 2)

        user_id = getattr(request.state, "user_id", None)
        workspace_id = getattr(request.state, "workspace_id", None)

        extra = {"request_id": request_id}
        if user_id:
            extra["user_id"] = str(user_id)
        if workspace_id:
            extra["workspace_id"] = str(workspace_id)

        logger.info(
            "method=%s path=%s status=%d latency_ms=%.2f",
            request.method,
            request.url.path,
            response.status_code,
            latency_ms,
            extra=extra,
        )

        response.headers["X-Request-ID"] = request_id
        return response
