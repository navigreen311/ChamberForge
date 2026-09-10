"""Retry, backoff and circuit breaking for partner calls.

P-07 (T-032). Both partner clients did this:

    response = await self._client.request(method, path, json=data)
    response.raise_for_status()
    return response.json()

One attempt, no backoff, and `raise_for_status()` propagating a raw
`httpx.HTTPStatusError` up through a service into a route handler - so a
partner's transient 503 became a 500 on ChamberForge, and a partner having a
bad ten minutes looked like ChamberForge having a bad ten minutes.

Three things live here.

**Retry with exponential backoff and jitter.** Jitter matters more than it
looks: without it, every request that failed during a partner's outage
retries in lockstep the moment it ends, and the recovering partner is hit by
a synchronised wave from every worker at once.

**A circuit breaker per partner.** Once a partner is clearly down, continuing
to send it traffic wastes a caller's request budget waiting for timeouts that
are going to fail. The breaker fails fast instead, and lets exactly one
request through after a cooldown to test recovery.

**A retry policy that will not repeat a side effect.** This is the part worth
reading twice. `POST /calls/initiate` places a **telephone call to a
client**. A naive retry on a read timeout - where the request very likely
arrived and only the response was lost - calls that person twice. So retries
are restricted to idempotent methods, and a POST is retried only when its
caller states that repeating it is safe. Availability is not worth phoning a
family office twice at nine in the evening.
"""
from __future__ import annotations

import asyncio
import logging
import secrets
import time
from dataclasses import dataclass, field
from typing import Any, Awaitable, Callable, Optional

import httpx

logger = logging.getLogger("chamberforge.integrations")

# Jitter comes from `secrets`, not `random`, and not for cryptographic
# reasons - nothing here needs unpredictability. P-06 made "no module under
# app/services imports random" an absolute, test-enforced invariant after
# finding two services generating customer-facing figures with a PRNG.
# Retry jitter is a legitimate use and could have been allowlisted, but an
# invariant with one exception is an invariant people start arguing with.
# This costs nothing and keeps the rule flat.
_JITTER = secrets.SystemRandom()

#: HTTP methods safe to repeat by definition.
IDEMPOTENT_METHODS = frozenset({"GET", "HEAD", "OPTIONS", "PUT", "DELETE"})

#: Status codes worth another attempt. 429 is included because the partner is
#: telling us to slow down, not that the request was wrong.
RETRYABLE_STATUS = frozenset({408, 425, 429, 500, 502, 503, 504})

DEFAULT_ATTEMPTS = 3
DEFAULT_BASE_DELAY = 0.25
DEFAULT_MAX_DELAY = 4.0

#: Consecutive failures before a partner is considered down.
DEFAULT_FAILURE_THRESHOLD = 5
#: How long to fail fast before letting a single probe through.
DEFAULT_RESET_SECONDS = 30.0


class PartnerError(Exception):
    """Base for every failure that is the partner's, not ours."""

    def __init__(self, partner: str, detail: str) -> None:
        self.partner = partner
        self.detail = detail
        super().__init__(f"{partner}: {detail}")


class PartnerUnavailable(PartnerError):
    """The partner could not be reached, or refused, after every attempt."""


class PartnerCircuitOpen(PartnerUnavailable):
    """Failing fast: this partner is known to be down right now."""


class PartnerContractError(PartnerError):
    """The partner answered, but not in the shape we require.

    Distinct from `PartnerUnavailable` on purpose. Unavailable is worth
    retrying and will pass; a contract change will not, and needs a person.
    """


@dataclass
class CircuitBreaker:
    """One partner's health, as observed from this process.

    Deliberately in-process. A shared breaker would need Redis and a round
    trip on the path this exists to make cheap, and the failure it prevents -
    hammering a partner that is down - is mitigated by every worker reaching
    the same conclusion within a few requests anyway.
    """

    name: str
    failure_threshold: int = DEFAULT_FAILURE_THRESHOLD
    reset_seconds: float = DEFAULT_RESET_SECONDS
    _failures: int = field(default=0, init=False)
    _opened_at: Optional[float] = field(default=None, init=False)

    @property
    def state(self) -> str:
        if self._opened_at is None:
            return "closed"
        if time.monotonic() - self._opened_at >= self.reset_seconds:
            return "half_open"
        return "open"

    def before_request(self) -> None:
        """Raise if this partner should not be called right now."""
        if self.state == "open":
            raise PartnerCircuitOpen(
                self.name,
                f"circuit open after {self._failures} consecutive failures; "
                f"retrying in {self.reset_seconds:.0f}s",
            )

    def record_success(self) -> None:
        self._failures = 0
        self._opened_at = None

    def record_failure(self) -> None:
        self._failures += 1
        if self._failures >= self.failure_threshold and self._opened_at is None:
            logger.warning(
                "circuit opened for %s after %d consecutive failures",
                self.name,
                self._failures,
            )
            self._opened_at = time.monotonic()

    def reset(self) -> None:
        self._failures = 0
        self._opened_at = None


_BREAKERS: dict[str, CircuitBreaker] = {}


def breaker_for(name: str) -> CircuitBreaker:
    """The shared breaker for *name*, created on first use."""
    if name not in _BREAKERS:
        _BREAKERS[name] = CircuitBreaker(name=name)
    return _BREAKERS[name]


def reset_all_breakers() -> None:
    """Clear every breaker. For tests, and for a deliberate operator reset."""
    for breaker in _BREAKERS.values():
        breaker.reset()


def _retry_delay(attempt: int, base: float, cap: float) -> float:
    """Exponential backoff with full jitter.

    Full jitter rather than a fixed exponential: it spreads a retrying fleet
    across the window instead of synchronising it into a thundering herd the
    instant a partner recovers.
    """
    ceiling = min(cap, base * (2**attempt))
    return _JITTER.uniform(0, ceiling)


def _is_retryable(exc: BaseException) -> bool:
    if isinstance(exc, (httpx.TimeoutException, httpx.NetworkError)):
        return True
    if isinstance(exc, httpx.HTTPStatusError):
        return exc.response.status_code in RETRYABLE_STATUS
    return False


def _retry_after(exc: BaseException) -> Optional[float]:
    """Honour a partner's own Retry-After when it sends one."""
    if not isinstance(exc, httpx.HTTPStatusError):
        return None
    raw = exc.response.headers.get("Retry-After")
    if not raw:
        return None
    try:
        return max(0.0, float(raw))
    except ValueError:
        return None


async def call_with_resilience(
    partner: str,
    method: str,
    operation: Callable[[], Awaitable[Any]],
    *,
    attempts: int = DEFAULT_ATTEMPTS,
    base_delay: float = DEFAULT_BASE_DELAY,
    max_delay: float = DEFAULT_MAX_DELAY,
    idempotent: Optional[bool] = None,
) -> Any:
    """Run *operation*, retrying and circuit-breaking on the partner's behalf.

    *idempotent* overrides the method-based default. Pass `True` for a POST
    that is safe to repeat - a pure query expressed as a POST, say. Leave it
    alone for anything with a side effect: `POST /calls/initiate` places a
    telephone call, and a retried timeout on that endpoint rings a client
    twice.

    Raises `PartnerUnavailable` (or `PartnerCircuitOpen`) rather than letting
    an `httpx` exception escape into a route handler.
    """
    breaker = breaker_for(partner)
    breaker.before_request()

    may_retry = (
        method.upper() in IDEMPOTENT_METHODS if idempotent is None else idempotent
    )
    total = attempts if may_retry else 1
    last: Optional[BaseException] = None

    for attempt in range(total):
        try:
            result = await operation()
        except Exception as exc:  # noqa: BLE001 - re-raised as a typed error below
            last = exc
            if not _is_retryable(exc):
                breaker.record_failure()
                raise PartnerUnavailable(partner, str(exc)) from exc
            if attempt == total - 1:
                break
            delay = _retry_after(exc)
            if delay is None:
                delay = _retry_delay(attempt, base_delay, max_delay)
            logger.info(
                "%s %s %s failed (%s); retrying in %.2fs (attempt %d/%d)",
                partner,
                method,
                type(exc).__name__,
                exc,
                delay,
                attempt + 1,
                total,
            )
            await asyncio.sleep(delay)
        else:
            breaker.record_success()
            return result

    breaker.record_failure()
    detail = str(last) if last else "unknown failure"
    if not may_retry:
        detail = f"{detail} (not retried: {method.upper()} may have side effects)"
    raise PartnerUnavailable(partner, detail)
