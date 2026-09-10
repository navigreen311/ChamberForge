"""Where uptime figures come from - and what to say when they come from nowhere.

P-06 (T-021). `TrustCenter.get_uptime_history` generated its numbers with a
seeded PRNG:

    random.seed(f"{year}-{month}")          # "Deterministic per month"
    uptime = round(99.9 + random.uniform(-0.15, 0.1), 3)

The seeding is what makes this serious rather than merely wrong. A random
number fluctuates and invites suspicion; a *seeded* one returns the same
99.87% for August every time it is asked. A customer who checks twice, or two
customers comparing notes, get a consistent answer - so the figure behaves
exactly like a measurement, and the platform published it on a page about its
own trustworthiness.

This module replaces that with two states and no third option:

  - **measured** - a real SLI, read from the configured monitor;
  - **unknown** - nothing is configured or the monitor could not be reached.

There is deliberately no fallback, no estimate and no last-known-good. "No
data yet" is an honest answer on a compliance page. A plausible number is
not, and the difference matters most precisely when nobody can check.

CONFIGURATION. The adapter reads its own environment because `core/config.py`
is frozen for the parallel build and has no SLO settings yet:

    DATADOG_UPTIME_SLO_ID   the SLO whose history is the uptime record
    DD_API_KEY              already in config.py, used by the metrics middleware
    DD_APP_KEY              required by the SLO API, which DD_API_KEY alone cannot reach
    DD_SITE                 defaults to datadoghq.com

When P-00 amends the settings surface these move there; the seam is
`_credentials()` and nothing else changes.
"""
from __future__ import annotations

import logging
import os
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx

logger = logging.getLogger("chamberforge.uptime")

#: How long to wait on the monitoring provider. A trust page that hangs is a
#: trust page nobody reads; an unknown answer is available immediately.
REQUEST_TIMEOUT_SECONDS = 5.0

REASON_NOT_CONFIGURED = "no_monitoring_configured"
REASON_UNREACHABLE = "monitoring_unreachable"


@dataclass(frozen=True)
class MonthlyUptime:
    """One month of measured availability."""

    month: str
    uptime_pct: float
    incidents: int

    def as_dict(self) -> dict:
        return {
            "month": self.month,
            "uptime_pct": self.uptime_pct,
            "incidents": self.incidents,
        }


@dataclass(frozen=True)
class UptimeReport:
    """Measured history, or an explicit statement that there is none.

    `available` is the field callers must branch on. It exists so that "we do
    not know" has a representation of its own, rather than being encoded as
    an empty list that renders identically to a perfect month.
    """

    available: bool
    months: list[MonthlyUptime] = field(default_factory=list)
    reason: Optional[str] = None
    source: Optional[str] = None

    def as_dict(self) -> dict:
        return {
            "available": self.available,
            "source": self.source,
            "reason": self.reason,
            "months": [m.as_dict() for m in self.months],
        }

    @classmethod
    def unknown(cls, reason: str) -> "UptimeReport":
        return cls(available=False, months=[], reason=reason, source=None)


def _credentials() -> Optional[tuple[str, str, str, str]]:
    """(slo_id, api_key, app_key, site), or None when not fully configured.

    All three secrets are required together. A partially configured monitor
    is treated as unconfigured rather than half-queried, because the failure
    of a partial configuration looks like an outage and would otherwise be
    reported as one.
    """
    slo_id = os.getenv("DATADOG_UPTIME_SLO_ID", "").strip()
    api_key = os.getenv("DD_API_KEY", "").strip()
    app_key = os.getenv("DD_APP_KEY", "").strip()
    site = os.getenv("DD_SITE", "datadoghq.com").strip() or "datadoghq.com"
    if not (slo_id and api_key and app_key):
        return None
    return slo_id, api_key, app_key, site


def _month_bounds(now: datetime, months_back: int) -> tuple[datetime, datetime]:
    """UTC start and end of the month *months_back* months before *now*."""
    year, month = now.year, now.month - months_back
    while month <= 0:
        month += 12
        year -= 1
    start = datetime(year, month, 1, tzinfo=timezone.utc)
    if month == 12:
        end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        end = datetime(year, month + 1, 1, tzinfo=timezone.utc)
    return start, min(end, now + timedelta(seconds=1))


class UptimeSource:
    """Reads availability from the configured monitor, or reports that it cannot."""

    @staticmethod
    def is_configured() -> bool:
        return _credentials() is not None

    @staticmethod
    def monthly_history(months: int = 12, *, now: Optional[datetime] = None) -> UptimeReport:
        """Measured uptime for the last *months* months.

        Never raises and never estimates. Every failure path - unconfigured,
        unreachable, malformed response - resolves to an unknown report, so
        no caller can receive a number this function did not read from the
        monitor.
        """
        credentials = _credentials()
        if credentials is None:
            return UptimeReport.unknown(REASON_NOT_CONFIGURED)

        slo_id, api_key, app_key, site = credentials
        now = now or datetime.now(timezone.utc)
        headers = {"DD-API-KEY": api_key, "DD-APPLICATION-KEY": app_key}
        readings: list[MonthlyUptime] = []

        try:
            with httpx.Client(timeout=REQUEST_TIMEOUT_SECONDS) as http:
                for offset in range(months - 1, -1, -1):
                    start, end = _month_bounds(now, offset)
                    response = http.get(
                        f"https://api.{site}/api/v1/slo/{slo_id}/history",
                        params={
                            "from_ts": int(start.timestamp()),
                            "to_ts": int(end.timestamp()),
                        },
                        headers=headers,
                    )
                    response.raise_for_status()
                    reading = _parse_history(response.json(), start)
                    if reading is not None:
                        readings.append(reading)
        except Exception as exc:
            # A monitoring outage must not become a published figure. Say
            # nothing rather than fall back to anything.
            logger.warning("uptime monitor unreachable: %s", exc)
            return UptimeReport.unknown(REASON_UNREACHABLE)

        if not readings:
            return UptimeReport.unknown(REASON_UNREACHABLE)

        return UptimeReport(
            available=True,
            months=readings,
            reason=None,
            source=f"datadog:slo/{slo_id}",
        )


def _parse_history(payload: dict, start: datetime) -> Optional[MonthlyUptime]:
    """One month's reading from an SLO history response, or None.

    Returns None rather than a default when the shape is not what we expect.
    A missing measurement has to stay missing; substituting a value here
    would reintroduce the defect this module exists to remove.
    """
    data = (payload or {}).get("data") or {}
    overall = data.get("overall") or {}
    sli = overall.get("sli_value")
    if sli is None:
        return None
    try:
        uptime = round(float(sli), 3)
    except (TypeError, ValueError):
        return None

    errors = overall.get("errors") or []
    incidents = len(errors) if isinstance(errors, list) else 0

    return MonthlyUptime(
        month=f"{start.year}-{start.month:02d}",
        uptime_pct=uptime,
        incidents=incidents,
    )
