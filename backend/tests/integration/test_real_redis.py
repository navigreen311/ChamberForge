"""Integration tests verifying real Redis operations (not mocks).

Run with: pytest tests/integration/test_real_redis.py -c conftest_docker.py
"""
import time

import pytest
import redis

pytestmark = pytest.mark.skipif(
    True,
    reason="Requires real Redis (run with: pytest -c conftest_docker.py)",
)

REDIS_URL = "redis://localhost:6380"


@pytest.fixture(scope="module")
def redis_client():
    """Connect to the real test Redis instance."""
    client = redis.from_url(REDIS_URL)
    client.ping()  # fail fast if Redis is down
    yield client
    client.flushdb()
    client.close()


class TestCacheRoundtrip:
    """Verify basic cache set/get operations."""

    def test_set_and_get_string(self, redis_client):
        """String values round-trip correctly."""
        redis_client.set("test:str", "hello")
        assert redis_client.get("test:str") == b"hello"

    def test_set_and_get_json(self, redis_client):
        """JSON-serialized values round-trip correctly."""
        import json

        data = {"user": "alice", "score": 42, "tags": ["vip", "active"]}
        redis_client.set("test:json", json.dumps(data))
        result = json.loads(redis_client.get("test:json"))
        assert result == data

    def test_get_nonexistent_key_returns_none(self, redis_client):
        """Getting a missing key returns None."""
        assert redis_client.get("test:nonexistent:key") is None


class TestRateLimiterCounting:
    """Verify rate limiter increment behavior."""

    def test_incr_creates_counter(self, redis_client):
        """INCR on a new key initializes it to 1."""
        key = "ratelimit:test:incr"
        redis_client.delete(key)
        result = redis_client.incr(key)
        assert result == 1

    def test_incr_increments_existing(self, redis_client):
        """INCR on an existing key increments by 1."""
        key = "ratelimit:test:existing"
        redis_client.delete(key)
        redis_client.set(key, 5)
        result = redis_client.incr(key)
        assert result == 6

    def test_sliding_window_pattern(self, redis_client):
        """Simulate sliding window rate limiting with sorted sets."""
        key = "ratelimit:sw:test"
        redis_client.delete(key)
        window_seconds = 60
        now = time.time()

        # Simulate 5 requests
        for i in range(5):
            redis_client.zadd(key, {f"req-{i}": now + i * 0.01})

        # Count requests in window
        count = redis_client.zrangebyscore(key, now - window_seconds, now + 1)
        assert len(count) == 5


class TestCacheTTL:
    """Verify TTL-based cache expiry."""

    def test_key_expires_after_ttl(self, redis_client):
        """A key with short TTL becomes inaccessible after expiry."""
        redis_client.setex("test:ttl", 1, "ephemeral")
        assert redis_client.get("test:ttl") == b"ephemeral"
        time.sleep(1.5)
        assert redis_client.get("test:ttl") is None

    def test_ttl_reports_remaining_seconds(self, redis_client):
        """TTL command reports remaining lifetime in seconds."""
        redis_client.setex("test:ttl:check", 10, "value")
        ttl = redis_client.ttl("test:ttl:check")
        assert 8 <= ttl <= 10

    def test_persist_removes_ttl(self, redis_client):
        """PERSIST command removes TTL, making key permanent."""
        redis_client.setex("test:persist", 10, "value")
        redis_client.persist("test:persist")
        ttl = redis_client.ttl("test:persist")
        assert ttl == -1  # no expiry


class TestPatternInvalidation:
    """Verify pattern-based key deletion (SCAN + DELETE)."""

    def test_invalidate_by_pattern(self, redis_client):
        """Delete all keys matching a glob pattern."""
        # Set up keys with a common prefix
        for i in range(5):
            redis_client.set(f"cache:problems:{i}", f"value-{i}")
        redis_client.set("cache:other:keep", "retained")

        # Invalidate all cache:problems:* keys
        for key in redis_client.scan_iter(match="cache:problems:*"):
            redis_client.delete(key)

        # Verify problems keys are gone
        for i in range(5):
            assert redis_client.get(f"cache:problems:{i}") is None

        # Verify unrelated key is retained
        assert redis_client.get("cache:other:keep") == b"retained"

    def test_invalidate_empty_pattern_is_noop(self, redis_client):
        """Scanning a pattern with no matches doesn't error."""
        deleted = 0
        for key in redis_client.scan_iter(match="nonexistent:pattern:*"):
            redis_client.delete(key)
            deleted += 1
        assert deleted == 0
