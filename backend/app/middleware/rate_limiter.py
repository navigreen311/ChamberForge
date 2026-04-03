"""Rate-limiting middleware using in-memory token bucket per IP+endpoint."""
from __future__ import annotations

import asyncio
import time
from collections import defaultdict
from typing import Dict, Optional, Tuple

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import JSONResponse, Response


class RateLimiterMiddleware(BaseHTTPMiddleware):
    """Sliding-window counter rate limiter.

    Parameters
    ----------
    app : ASGIApp
    default_limit : int
        Max requests per window (default 100).
    window_seconds : int
        Window length in seconds (default 60).
    endpoint_overrides : dict
        Mapping of path prefixes to custom (limit, window) tuples.
    cleanup_interval : int
        Seconds between expired-entry cleanup sweeps (default 120).
    """

    def __init__(
        self,
        app,
        default_limit: int = 100,
        window_seconds: int = 60,
        endpoint_overrides: Optional[Dict[str, Tuple[int, int]]] = None,
        cleanup_interval: int = 120,
    ):
        super().__init__(app)
        self.default_limit = default_limit
        self.window_seconds = window_seconds
        self.endpoint_overrides = endpoint_overrides or {}
        self.cleanup_interval = cleanup_interval
        # key: (ip, path_prefix) -> list of request timestamps
        self._requests: Dict[str, list[float]] = defaultdict(list)
        self._last_cleanup = time.time()

    def _get_client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def _resolve_limit(self, path: str) -> Tuple[int, int]:
        """Return (limit, window) for the given path."""
        for prefix, (limit, window) in self.endpoint_overrides.items():
            if path.startswith(prefix):
                return limit, window
        return self.default_limit, self.window_seconds

    def _cleanup_expired(self, now: float) -> None:
        """Remove timestamps older than the largest possible window."""
        if now - self._last_cleanup < self.cleanup_interval:
            return
        max_window = max(
            [self.window_seconds]
            + [w for _, w in self.endpoint_overrides.values()]
        )
        expired_keys = []
        for key, timestamps in self._requests.items():
            self._requests[key] = [t for t in timestamps if now - t < max_window]
            if not self._requests[key]:
                expired_keys.append(key)
        for key in expired_keys:
            del self._requests[key]
        self._last_cleanup = now

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        now = time.time()
        self._cleanup_expired(now)

        client_ip = self._get_client_ip(request)
        path = request.url.path
        limit, window = self._resolve_limit(path)

        bucket_key = f"{client_ip}:{path}"
        timestamps = self._requests[bucket_key]

        # Prune timestamps outside window
        self._requests[bucket_key] = [t for t in timestamps if now - t < window]
        timestamps = self._requests[bucket_key]

        if len(timestamps) >= limit:
            oldest_in_window = min(timestamps)
            retry_after = int(window - (now - oldest_in_window)) + 1
            return JSONResponse(
                status_code=429,
                content={"detail": "Too Many Requests"},
                headers={"Retry-After": str(retry_after)},
            )

        self._requests[bucket_key].append(now)
        response = await call_next(request)
        return response
