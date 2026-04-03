"""Rate-limiting middleware using in-memory sliding window per IP+workspace."""
from __future__ import annotations

import time
from collections import defaultdict
from typing import Dict, Optional, Tuple

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import JSONResponse, Response


class RateLimiterMiddleware(BaseHTTPMiddleware):
    """Sliding-window counter rate limiter with per-workspace support.

    Parameters
    ----------
    app : ASGIApp
    default_limit : int
        Max requests per window per IP (default 100).
    window_seconds : int
        Window length in seconds (default 60).
    workspace_limit : int
        Max requests per window per workspace (default 1000).
    endpoint_overrides : dict
        Mapping of path prefixes to custom (limit, window) tuples.
    cleanup_interval : int
        Seconds between expired-entry cleanup sweeps (default 120).
    jwt_secret : str
        Secret used to decode JWT tokens for workspace extraction.
    jwt_algorithm : str
        Algorithm used for JWT decoding.
    """

    def __init__(
        self,
        app,
        default_limit: int = 100,
        window_seconds: int = 60,
        workspace_limit: int = 1000,
        endpoint_overrides: Optional[Dict[str, Tuple[int, int]]] = None,
        cleanup_interval: int = 120,
        jwt_secret: str = "",
        jwt_algorithm: str = "HS256",
    ):
        super().__init__(app)
        self.default_limit = default_limit
        self.window_seconds = window_seconds
        self.workspace_limit = workspace_limit
        self.endpoint_overrides = endpoint_overrides or {}
        self.cleanup_interval = cleanup_interval
        self.jwt_secret = jwt_secret
        self.jwt_algorithm = jwt_algorithm
        # key -> list of request timestamps
        self._requests: Dict[str, list[float]] = defaultdict(list)
        # workspace key -> list of request timestamps
        self._workspace_requests: Dict[str, list[float]] = defaultdict(list)
        self._last_cleanup = time.time()

    def _get_client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def _extract_workspace_id(self, request: Request) -> Optional[str]:
        """Extract workspace_id from JWT bearer token if present."""
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer ") or not self.jwt_secret:
            return None
        token = auth_header[7:]
        try:
            import jwt

            payload = jwt.decode(
                token, self.jwt_secret, algorithms=[self.jwt_algorithm]
            )
            return payload.get("workspace_id")
        except Exception:
            return None

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
        for store in (self._requests, self._workspace_requests):
            expired_keys = []
            for key, timestamps in store.items():
                store[key] = [t for t in timestamps if now - t < max_window]
                if not store[key]:
                    expired_keys.append(key)
            for key in expired_keys:
                del store[key]
        self._last_cleanup = now

    def _prune_and_check(
        self, store: Dict[str, list[float]], key: str, now: float, limit: int, window: int
    ) -> Tuple[bool, int, int]:
        """Prune timestamps and check if limit exceeded.

        Returns (exceeded, remaining, reset_seconds).
        """
        store[key] = [t for t in store[key] if now - t < window]
        timestamps = store[key]
        remaining = max(0, limit - len(timestamps))
        reset = int(window - (now - min(timestamps)) + 1) if timestamps else window
        if len(timestamps) >= limit:
            return True, 0, reset
        return False, remaining - 1, reset  # -1 because current request will be added

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        now = time.time()
        self._cleanup_expired(now)

        client_ip = self._get_client_ip(request)
        path = request.url.path
        limit, window = self._resolve_limit(path)
        workspace_id = self._extract_workspace_id(request)

        # Build rate limit key: ip:workspace_id for authenticated, ip for anonymous
        if workspace_id:
            bucket_key = f"{client_ip}:{workspace_id}"
        else:
            bucket_key = client_ip

        # Check per-IP/workspace rate limit
        exceeded, remaining, reset = self._prune_and_check(
            self._requests, bucket_key, now, limit, window
        )
        if exceeded:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too Many Requests"},
                headers={
                    "Retry-After": str(reset),
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(reset),
                },
            )

        # Check workspace-level aggregate limit (all IPs in workspace)
        if workspace_id:
            ws_key = f"ws:{workspace_id}"
            ws_exceeded, ws_remaining, ws_reset = self._prune_and_check(
                self._workspace_requests, ws_key, now, self.workspace_limit, self.window_seconds
            )
            if ws_exceeded:
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Workspace rate limit exceeded"},
                    headers={
                        "Retry-After": str(ws_reset),
                        "X-RateLimit-Limit": str(self.workspace_limit),
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": str(ws_reset),
                    },
                )
            self._workspace_requests[ws_key].append(now)

        self._requests[bucket_key].append(now)
        response = await call_next(request)

        # Add rate limit headers to successful responses
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(reset)
        return response
