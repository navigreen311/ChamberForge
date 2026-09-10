"""The configured limit is the actual limit, across instances and deploys.

P-10 (T-029). The sliding window lived in two per-process `defaultdict`s, so
the limit applied *per instance*: four workers behind a load balancer meant
four independent windows and an effective limit four times the configured
one. A deploy reset every counter, which made waiting for one the cheapest
way past the limiter.

Two groups of tests here, and they are not equally strong.

The **Redis** group exercises the real Lua script against a real server and
skips when none is reachable. `ci.yml` runs only three named files in the
`integration-real` job and is P-00-frozen, so this group **skips in CI** - it
was run against a live Redis during development, and the fallback group below
is what protects the merge gate.

The **fallback** group always runs. It covers the behaviour that matters most
in production for the wrong reasons: what happens when Redis is gone.
"""
from __future__ import annotations

import time
import uuid

import pytest

from app.middleware.rate_limiter import KEY_PREFIX, RateLimiterMiddleware


def _redis_or_skip():
    """A live client, or skip. Never invents one."""
    import redis

    from app.core.config import settings

    url = getattr(settings, "REDIS_URL", "") or "redis://localhost:6379"
    try:
        client = redis.Redis.from_url(
            url, socket_connect_timeout=0.5, socket_timeout=0.5, decode_responses=True
        )
        client.ping()
    except Exception as exc:
        pytest.skip(f"no Redis reachable at {url}: {exc}")
    return client


def _limiter(**kwargs) -> RateLimiterMiddleware:
    """A limiter with a no-op app. Only the window is under test."""

    async def app(scope, receive, send):  # pragma: no cover - never called
        return None

    return RateLimiterMiddleware(app, **kwargs)


@pytest.fixture
def unique_key():
    """A key nobody else owns.

    The development Redis is shared with other services, so tests namespace
    themselves and clean up only what they created.
    """
    key = f"test-{uuid.uuid4()}"
    yield key
    # Connect directly rather than via _redis_or_skip: pytest.skip raises a
    # BaseException, so calling it in teardown marks the teardown skipped and
    # reports more skips than there are tests.
    try:
        import redis

        from app.core.config import settings

        client = redis.Redis.from_url(
            getattr(settings, "REDIS_URL", "") or "redis://localhost:6379",
            socket_connect_timeout=0.5,
            socket_timeout=0.5,
            decode_responses=True,
        )
        for scope in ("ip", "ws"):
            client.delete(f"{KEY_PREFIX}:{scope}:{key}")
    except Exception:
        pass


# ---------------------------------------------------------------------------
# The shared window (real Redis)
# ---------------------------------------------------------------------------


def test_two_instances_share_one_window(unique_key):
    """The defect this package exists to fix.

    Against the per-process dict both limiters would have counted to 5
    independently and admitted 10 requests under a limit of 5.
    """
    _redis_or_skip()
    instance_a = _limiter()
    instance_b = _limiter()

    now = time.time()
    admitted = 0
    for i in range(10):
        limiter = instance_a if i % 2 == 0 else instance_b
        exceeded, _, _ = limiter._hit("ip", limiter._requests, unique_key, now, 5, 60)
        if not exceeded:
            admitted += 1

    assert admitted == 5, "five admitted in total, not five per instance"


def test_the_window_survives_an_instance_restart(unique_key):
    """A deploy used to reset every counter."""
    _redis_or_skip()
    now = time.time()

    first = _limiter()
    for _ in range(3):
        first._hit("ip", first._requests, unique_key, now, 3, 60)

    # A fresh process: new object, new in-memory dicts, same Redis.
    restarted = _limiter()
    exceeded, _, _ = restarted._hit(
        "ip", restarted._requests, unique_key, now, 3, 60
    )

    assert exceeded is True


def test_the_count_includes_the_requesting_call(unique_key):
    """Check and record are one atomic operation.

    A read-then-write from N instances is the race that makes distributed
    limiting pointless: each reads limit-1, each proceeds, the window
    overshoots by N.
    """
    _redis_or_skip()
    limiter = _limiter()
    now = time.time()

    _, remaining_first, _ = limiter._hit("ip", limiter._requests, unique_key, now, 3, 60)
    _, remaining_second, _ = limiter._hit("ip", limiter._requests, unique_key, now, 3, 60)

    assert remaining_first == 2
    assert remaining_second == 1


def test_two_requests_in_the_same_millisecond_both_count(unique_key):
    """Sorted-set members must be unique per request.

    Keyed by timestamp, two requests in the same millisecond would collide on
    one member and the second would overwrite rather than count - quietly
    raising the real limit under exactly the burst the limiter is for.
    """
    _redis_or_skip()
    limiter = _limiter()
    now = time.time()

    for _ in range(4):
        limiter._hit("ip", limiter._requests, unique_key, now, 4, 60)
    exceeded, _, _ = limiter._hit("ip", limiter._requests, unique_key, now, 4, 60)

    assert exceeded is True, "identical timestamps must not collapse into one hit"


def test_a_window_that_has_passed_admits_again(unique_key):
    _redis_or_skip()
    limiter = _limiter()
    now = time.time()

    for _ in range(2):
        limiter._hit("ip", limiter._requests, unique_key, now, 2, 60)
    assert limiter._hit("ip", limiter._requests, unique_key, now, 2, 60)[0] is True

    # Same key, a minute later.
    later = now + 61
    assert limiter._hit("ip", limiter._requests, unique_key, later, 2, 60)[0] is False


def test_ip_and_workspace_windows_are_separate(unique_key):
    """They have different limits and must not share a counter."""
    _redis_or_skip()
    limiter = _limiter()
    now = time.time()

    for _ in range(2):
        limiter._hit("ip", limiter._requests, unique_key, now, 2, 60)

    exceeded, _, _ = limiter._hit(
        "ws", limiter._workspace_requests, unique_key, now, 2, 60
    )
    assert exceeded is False, "the workspace window must start empty"


# ---------------------------------------------------------------------------
# Degradation - always runs
# ---------------------------------------------------------------------------


def test_a_redis_failure_admits_the_request(monkeypatch):
    """Fail open, deliberately.

    `/api/v1/auth` is rate limited. A fail-closed limiter during a Redis
    outage locks every user out of the platform - including the people
    trying to fix it.
    """
    limiter = _limiter()

    def boom(*a, **kw):
        raise RuntimeError("redis is gone")

    limiter._redis_ready = True
    limiter._redis = object()
    limiter._script = boom

    exceeded, _, _ = limiter._hit("ip", limiter._requests, "any-key", time.time(), 5, 60)

    assert exceeded is False


def test_a_redis_failure_falls_back_to_the_local_window(monkeypatch):
    """Fail-open does not mean unlimited.

    The in-process window still applies, so a single instance cannot be used
    without limit while Redis is down - it is just a weaker, per-instance
    limit rather than no limit at all.
    """
    limiter = _limiter()
    limiter._redis_ready = True
    limiter._redis = None  # forces the memory path without touching Redis

    now = time.time()
    for _ in range(3):
        limiter._hit("ip", limiter._requests, "local-key", now, 3, 60)
    exceeded, _, _ = limiter._hit("ip", limiter._requests, "local-key", now, 3, 60)

    assert exceeded is True


def test_a_degradation_is_reported(monkeypatch):
    """A limiter silently running per-process looks identical from outside."""
    limiter = _limiter()
    reported: list[str] = []
    monkeypatch.setattr(
        limiter, "_report_degraded", lambda reason: reported.append(reason)
    )

    limiter._redis_ready = True
    limiter._redis = object()

    def boom(*a, **kw):
        raise RuntimeError("redis is gone")

    limiter._script = boom
    limiter._hit("ip", limiter._requests, "any-key", time.time(), 5, 60)

    assert reported and "redis is gone" in reported[0]


def test_redis_is_retried_on_the_next_request(monkeypatch):
    """A transient blip must not pin the process to memory forever."""
    limiter = _limiter()
    limiter._redis_ready = True
    limiter._redis = object()

    def boom(*a, **kw):
        raise RuntimeError("transient")

    limiter._script = boom
    monkeypatch.setattr(limiter, "_report_degraded", lambda reason: None)
    limiter._hit("ip", limiter._requests, "any-key", time.time(), 5, 60)

    assert limiter._redis_ready is False, "the next request re-attempts Redis"


def test_no_redis_url_uses_the_local_window(monkeypatch):
    monkeypatch.setattr("app.middleware.rate_limiter.settings.REDIS_URL", "")
    limiter = _limiter()

    assert limiter._get_redis() is None

    now = time.time()
    for _ in range(2):
        limiter._hit("ip", limiter._requests, "k", now, 2, 60)
    assert limiter._hit("ip", limiter._requests, "k", now, 2, 60)[0] is True


# ---------------------------------------------------------------------------
# Overrides still apply
# ---------------------------------------------------------------------------


def test_endpoint_overrides_are_honoured():
    limiter = _limiter(
        default_limit=100,
        window_seconds=60,
        endpoint_overrides={
            "/api/v1/auth": (5, 60),
            "/api/v1/offers/generate": (10, 60),
        },
    )

    assert limiter._resolve_limit("/api/v1/auth/login") == (5, 60)
    assert limiter._resolve_limit("/api/v1/offers/generate") == (10, 60)
    assert limiter._resolve_limit("/api/v1/clients") == (100, 60)


def test_the_auth_override_is_the_tightest_and_still_applies(unique_key):
    """The AI and auth overrides are the reason the limiter exists.

    They must survive the move to Redis - a distributed limiter that lost
    its per-endpoint limits would be a regression dressed as a fix.
    """
    _redis_or_skip()
    limiter = _limiter(endpoint_overrides={"/api/v1/auth": (3, 60)})
    limit, window = limiter._resolve_limit("/api/v1/auth/login")
    now = time.time()

    admitted = 0
    for _ in range(5):
        exceeded, _, _ = limiter._hit(
            "ip", limiter._requests, unique_key, now, limit, window
        )
        if not exceeded:
            admitted += 1

    assert admitted == 3


# ---------------------------------------------------------------------------
# The frozen constructor
# ---------------------------------------------------------------------------


def test_the_constructor_signature_is_unchanged():
    """P-00 froze this, and `main.py:61-75` calls it positionally by keyword.

    Redis is configured from settings rather than by adding an argument. If
    this test fails, `main.py` needs an edit - which is an escalation, not a
    fix.
    """
    import inspect

    params = list(inspect.signature(RateLimiterMiddleware.__init__).parameters)

    assert params == [
        "self",
        "app",
        "default_limit",
        "window_seconds",
        "workspace_limit",
        "endpoint_overrides",
        "cleanup_interval",
        "jwt_secret",
        "jwt_algorithm",
    ]


def test_the_stores_conftest_clears_still_exist():
    """`tests/conftest.py` clears these directly and is P-00-frozen.

    Moving the state behind a backend object without leaving these in place
    would make the suite's rate-limit reset silently do nothing, and throttle
    every test that shares a client.
    """
    limiter = _limiter()

    assert hasattr(limiter, "_requests")
    assert hasattr(limiter, "_workspace_requests")
    limiter._requests.clear()
    limiter._workspace_requests.clear()
