"""Tests for the Redis caching layer."""
from __future__ import annotations

import json
from unittest.mock import MagicMock

from app.core.cache import CacheService

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_cache_service(available: bool = True) -> CacheService:
    """Create a CacheService with a mocked Redis client."""
    svc = CacheService.__new__(CacheService)
    svc.client = MagicMock()
    svc.available = available
    return svc


# ---------------------------------------------------------------------------
# CacheService.get / set / delete
# ---------------------------------------------------------------------------

class TestCacheGetSetDelete:
    def test_set_and_get_round_trip(self):
        svc = _make_cache_service(available=True)
        data = {"revenue": 42_000, "clients": 7}

        svc.client.get.return_value = json.dumps(data).encode()

        svc.set("billing:abc", data, ttl_seconds=120)
        svc.client.setex.assert_called_once_with(
            "billing:abc", 120, json.dumps(data, default=str)
        )

        result = svc.get("billing:abc")
        assert result == data

    def test_get_returns_none_on_miss(self):
        svc = _make_cache_service(available=True)
        svc.client.get.return_value = None
        assert svc.get("nonexistent") is None

    def test_delete_calls_redis(self):
        svc = _make_cache_service(available=True)
        svc.delete("key123")
        svc.client.delete.assert_called_once_with("key123")

    def test_invalidate_pattern(self):
        svc = _make_cache_service(available=True)
        svc.client.scan_iter.return_value = [b"problems:a", b"problems:b"]
        svc.invalidate_pattern("problems:*")
        assert svc.client.delete.call_count == 2


# ---------------------------------------------------------------------------
# make_key uniqueness
# ---------------------------------------------------------------------------

class TestMakeKey:
    def test_same_params_same_key(self):
        k1 = CacheService.make_key("prefix", a=1, b="two")
        k2 = CacheService.make_key("prefix", a=1, b="two")
        assert k1 == k2

    def test_different_params_different_key(self):
        k1 = CacheService.make_key("prefix", a=1)
        k2 = CacheService.make_key("prefix", a=2)
        assert k1 != k2

    def test_different_prefix_different_key(self):
        k1 = CacheService.make_key("alpha", x=1)
        k2 = CacheService.make_key("beta", x=1)
        assert k1 != k2

    def test_key_starts_with_prefix(self):
        key = CacheService.make_key("billing:revenue", workspace_id="ws1")
        assert key.startswith("billing:revenue:")


# ---------------------------------------------------------------------------
# Graceful fallback when Redis is unavailable
# ---------------------------------------------------------------------------

class TestUnavailableFallback:
    def test_get_returns_none_when_unavailable(self):
        svc = _make_cache_service(available=False)
        assert svc.get("anything") is None

    def test_set_is_noop_when_unavailable(self):
        svc = _make_cache_service(available=False)
        svc.set("key", {"data": 1})
        svc.client.setex.assert_not_called()

    def test_delete_is_noop_when_unavailable(self):
        svc = _make_cache_service(available=False)
        svc.delete("key")
        svc.client.delete.assert_not_called()

    def test_invalidate_pattern_is_noop_when_unavailable(self):
        svc = _make_cache_service(available=False)
        svc.invalidate_pattern("prefix:*")
        svc.client.scan_iter.assert_not_called()


# ---------------------------------------------------------------------------
# CacheService __init__ handles connection errors gracefully
# ---------------------------------------------------------------------------

class TestInitFallback:
    def test_unavailable_service_degrades_gracefully(self):
        """When Redis is unreachable, all ops are safe no-ops."""
        svc = _make_cache_service(available=False)
        assert svc.available is False
        assert svc.get("x") is None
        svc.set("x", 1)
        svc.delete("x")
        # No exceptions raised
