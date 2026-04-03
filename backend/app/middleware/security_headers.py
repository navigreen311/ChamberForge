"""Middleware that adds security headers to all HTTP responses."""
import uuid

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from app.core.config import settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Inject security headers into every response."""

    @staticmethod
    def _build_csp() -> str:
        """Build Content-Security-Policy based on environment."""
        csp = "default-src 'self'; script-src 'self'"
        if settings.APP_ENV == "development":
            csp += " 'unsafe-inline' 'unsafe-eval'"
        else:
            csp += " 'unsafe-inline'"  # needed for Next.js inline styles
        csp += "; style-src 'self' 'unsafe-inline'"
        return csp

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        response = await call_next(request)

        headers = {
            "Content-Security-Policy": self._build_csp(),
            "X-Frame-Options": "DENY",
            "X-Content-Type-Options": "nosniff",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
        }

        for header, value in headers.items():
            response.headers[header] = value

        response.headers["X-Request-ID"] = str(uuid.uuid4())
        return response
