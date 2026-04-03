"""Middleware that emits custom Datadog metrics per request."""

from __future__ import annotations

import time
from collections import defaultdict
from typing import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class DatadogMetricsMiddleware(BaseHTTPMiddleware):
    """Emit per-request metrics to Datadog StatsD.

    Tracked metrics
    ---------------
    * ``chamberforge.request_count`` — incremented per request (tags: endpoint, method, status)
    * ``chamberforge.request_duration`` — request wall-clock time in ms
    * ``chamberforge.active_users`` — unique user count in a sliding 5-min window
    * ``chamberforge.cache_hits`` / ``chamberforge.cache_misses``
    * ``chamberforge.ai_cost`` — aggregated on AI-agent responses
    """

    def __init__(self, app: Callable, **kwargs) -> None:  # type: ignore[override]
        super().__init__(app)
        # Sliding window: user_id -> last-seen timestamp
        self._active_users: dict[str, float] = defaultdict(float)

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _statsd():  # noqa: ANN205
        """Return the Datadog statsd client, or *None* when unavailable."""
        try:
            from datadog import statsd  # type: ignore[import-untyped]

            return statsd
        except ImportError:
            return None

    def _prune_active_users(self, now: float) -> int:
        """Remove entries older than 5 minutes and return active count."""
        cutoff = now - 300
        expired = [uid for uid, ts in self._active_users.items() if ts < cutoff]
        for uid in expired:
            del self._active_users[uid]
        return len(self._active_users)

    # ------------------------------------------------------------------
    # Middleware entry point
    # ------------------------------------------------------------------

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        statsd = self._statsd()
        start = time.perf_counter()

        response: Response = await call_next(request)

        elapsed_ms = (time.perf_counter() - start) * 1000

        if statsd is None:
            return response

        endpoint = request.url.path
        method = request.method
        status = str(response.status_code)
        tags = [f"endpoint:{endpoint}", f"method:{method}", f"status:{status}"]

        # Core request metrics
        statsd.increment("chamberforge.request_count", tags=tags)
        statsd.histogram("chamberforge.request_duration", elapsed_ms, tags=tags)

        # Active users (derived from JWT sub claim set by auth middleware)
        user_id: str | None = getattr(request.state, "user_id", None)
        if user_id:
            now = time.time()
            self._active_users[user_id] = now
            active_count = self._prune_active_users(now)
            statsd.gauge("chamberforge.active_users", active_count)

        # Cache hit/miss headers (set by Redis cache layer)
        cache_header = response.headers.get("X-Cache")
        if cache_header == "HIT":
            statsd.increment("chamberforge.cache_hits", tags=tags)
        elif cache_header == "MISS":
            statsd.increment("chamberforge.cache_misses", tags=tags)

        # AI cost tracking (set by AI-agent service layer via response header)
        ai_cost = response.headers.get("X-AI-Cost")
        if ai_cost:
            try:
                statsd.increment(
                    "chamberforge.ai_cost",
                    float(ai_cost),
                    tags=[f"endpoint:{endpoint}"],
                )
            except (ValueError, TypeError):
                pass

        return response
