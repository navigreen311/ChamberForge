"""Rate limiting with a sliding window shared across instances.

P-10 (T-029). The window lived in two per-process `defaultdict`s:

    self._requests: Dict[str, list[float]] = defaultdict(list)

so the configured limit was the limit **per instance**. Four workers behind a
load balancer meant four independent windows and an effective limit of four
times the number in the config, with the excess arriving unevenly depending
on which worker a request landed on. A deploy reset every counter, so the
cheapest way past the limiter was to wait for one.

The window now lives in Redis, keyed per bucket, and every instance reads and
writes the same one.

**The check and the record are one atomic operation.** A read-then-write from
N instances is exactly the race that makes distributed limiting pointless:
each reads `count = limit - 1`, each decides it may proceed, and the window
overshoots by N. The Lua script below does both inside Redis, so the count a
caller sees already includes its own request.

**It fails open, deliberately.** If Redis cannot be reached, the limiter falls
back to the in-process window rather than refusing traffic. That is more
permissive than intended - each instance starts a fresh local window - and
that is the correct direction to fail: `/api/v1/auth` is rate limited, so a
fail-closed limiter during a Redis outage locks every user out of the
platform, including the people trying to fix it. A degradation is reported on
every fallback so the weaker limit does not go unnoticed.

**The constructor signature is frozen** (`main.py:61-75`, P-00-owned). Redis
is configured from `settings.REDIS_URL`, which P-00 already added, rather
than by adding an argument.
"""
from __future__ import annotations

import logging
import time
import uuid
from typing import Dict, Optional, Tuple

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.core.config import settings

logger = logging.getLogger("chamberforge.ratelimit")

#: Namespace for every key this middleware owns, so a shared Redis stays legible.
KEY_PREFIX = "chamberforge:ratelimit"

#: Check and record in one round trip, atomically.
#:
#: Returns {exceeded, remaining, reset_seconds}. The member is a uuid rather
#: than the timestamp: two requests in the same millisecond would otherwise
#: collide on the same sorted-set member and the second would overwrite the
#: first instead of counting, which quietly raises the real limit under
#: exactly the load the limiter exists for.
_SLIDING_WINDOW_LUA = """
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local member = ARGV[4]

redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
local count = redis.call('ZCARD', key)

local function reset_for()
  local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
  if oldest[2] then
    return math.ceil(window - (now - tonumber(oldest[2])) + 1)
  end
  return window
end

if count >= limit then
  return {1, 0, reset_for()}
end

redis.call('ZADD', key, now, member)
redis.call('PEXPIRE', key, math.ceil((window + 1) * 1000))
return {0, limit - count - 1, reset_for()}
"""


class _WindowStore(dict):
    """The in-process window, whose `clear()` also flushes the shared one.

    This exists for one reason, and it is worth stating plainly because the
    behaviour is otherwise surprising.

    `tests/conftest.py` resets rate limiting between tests by reaching into
    the middleware and calling `handler._requests.clear()`. That file is
    P-00-frozen. Once the window moved to Redis, clearing the local dict
    stopped clearing anything that mattered - Redis kept the counts, so one
    test's requests exhausted the next test's limit, and the suite failed in
    a way that looked like a limiter bug rather than shared state.

    Making `clear()` flush this limiter's own Redis keys puts the fix behind
    the call the frozen fixture already makes. Production never calls it:
    `_cleanup_expired` rebinds and deletes individual keys, and nothing else
    clears the store.
    """

    def __init__(self, owner: "RateLimiterMiddleware", scope: str):
        super().__init__()
        self._owner = owner
        self._scope = scope

    def clear(self) -> None:
        super().clear()
        client = self._owner._redis
        if client is None:
            return
        try:
            pattern = f"{KEY_PREFIX}:{self._scope}:*"
            for key in client.scan_iter(match=pattern, count=500):
                client.delete(key)
        except Exception:  # pragma: no cover - a reset must never fail a test
            pass


class RateLimiterMiddleware(BaseHTTPMiddleware):
    """Sliding-window rate limiter, shared across instances via Redis.

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
        Seconds between expired-entry cleanup sweeps of the in-process
        fallback store (default 120). Redis expires its own keys.
    jwt_secret : str
        Secret used to decode JWT tokens for workspace extraction.
    jwt_algorithm : str
        Algorithm used for JWT decoding.

    The signature is frozen by P-00 and matches `main.py:61-75` exactly.
    Redis configuration is read from `settings.REDIS_URL`.
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

        # The in-process fallback, and the only store when Redis is absent.
        #
        # These two attribute names are load-bearing beyond this module:
        # `tests/conftest.py` clears them directly to stop the suite being
        # throttled, and that file is P-00-frozen. Moving the state behind a
        # backend object without leaving these in place would make the reset
        # silently do nothing and throttle every test that shares a client.
        self._requests: Dict[str, list[float]] = _WindowStore(self, "ip")
        self._workspace_requests: Dict[str, list[float]] = _WindowStore(self, "ws")
        self._last_cleanup = time.time()

        self._redis = None
        self._redis_ready = False
        self._degraded_logged = False

    # ------------------------------------------------------------------
    # Redis
    # ------------------------------------------------------------------
    def _get_redis(self):
        """The shared client, or None when Redis is not usable.

        Constructed lazily: building it in `__init__` would make importing
        the app depend on Redis being reachable, and this middleware is
        constructed at import time in `main.py`.
        """
        if self._redis_ready:
            return self._redis
        self._redis_ready = True
        url = getattr(settings, "REDIS_URL", "")
        if not url:
            logger.info("no REDIS_URL configured; rate limiting is per-process")
            return None
        try:
            import redis

            client = redis.Redis.from_url(
                url,
                socket_timeout=0.25,
                socket_connect_timeout=0.25,
                decode_responses=True,
            )
            # A short timeout on purpose. The limiter runs on every request,
            # so a slow Redis must degrade quickly rather than add latency to
            # the whole platform while it decides.
            client.ping()
            self._redis = client
            self._script = client.register_script(_SLIDING_WINDOW_LUA)
            logger.info("rate limiting is distributed via Redis")
        except Exception as exc:
            logger.warning("Redis unavailable for rate limiting: %s", exc)
            self._redis = None
        return self._redis

    def _report_degraded(self, reason: str) -> None:
        """Announce that the shared limit is not in force.

        Worth reporting every time rather than once: a limiter silently
        running per-process is the state this package exists to end, and it
        looks identical from the outside to one that is working.
        """
        if not self._degraded_logged:
            logger.error("rate limiting degraded to per-process: %s", reason)
            self._degraded_logged = True
        try:
            from app.middleware.datadog_metrics import DatadogMetricsMiddleware

            statsd = DatadogMetricsMiddleware._statsd()
            if statsd:
                statsd.increment("chamberforge.ratelimit.degraded")
        except Exception:  # pragma: no cover - metrics must never break a request
            pass

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
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
        """Sweep the in-process fallback. Redis expires its own keys."""
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

    # ------------------------------------------------------------------
    # The window
    # ------------------------------------------------------------------
    def _hit_memory(
        self,
        store: Dict[str, list[float]],
        key: str,
        now: float,
        limit: int,
        window: int,
    ) -> Tuple[bool, int, int]:
        """Check and record against the in-process window."""
        store[key] = [t for t in store.get(key, []) if now - t < window]
        timestamps = store[key]
        reset = int(window - (now - min(timestamps)) + 1) if timestamps else window
        if len(timestamps) >= limit:
            return True, 0, reset
        timestamps.append(now)
        return False, max(0, limit - len(timestamps)), reset

    def _hit(
        self,
        scope: str,
        store: Dict[str, list[float]],
        key: str,
        now: float,
        limit: int,
        window: int,
    ) -> Tuple[bool, int, int]:
        """Check and record one request. Returns (exceeded, remaining, reset).

        Tries the shared window first and falls back to the in-process one on
        any Redis failure, which is the fail-open path: the local window is
        empty on this instance, so the caller is admitted rather than refused
        because infrastructure is down.
        """
        client = self._get_redis()
        if client is not None:
            try:
                exceeded, remaining, reset = self._script(
                    keys=[f"{KEY_PREFIX}:{scope}:{key}"],
                    args=[now, window, limit, str(uuid.uuid4())],
                )
                return bool(exceeded), int(remaining), int(reset)
            except Exception as exc:
                # Do not refuse the request. Re-check on the next one rather
                # than pinning to memory for the process lifetime, so the
                # shared window resumes as soon as Redis returns.
                self._redis_ready = False
                self._redis = None
                self._report_degraded(str(exc))

        return self._hit_memory(store, key, now, limit, window)

    # ------------------------------------------------------------------
    # Dispatch
    # ------------------------------------------------------------------
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
        exceeded, remaining, reset = self._hit(
            "ip", self._requests, bucket_key, now, limit, window
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
            ws_exceeded, ws_remaining, ws_reset = self._hit(
                "ws",
                self._workspace_requests,
                f"ws:{workspace_id}",
                now,
                self.workspace_limit,
                self.window_seconds,
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

        response = await call_next(request)

        # Add rate limit headers to successful responses
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(reset)
        return response
