"""Datadog APM initialization and custom metrics helpers."""

import os


def init_datadog():
    """Initialize Datadog tracing and auto-instrumentation.

    Requires DD_API_KEY to be set in the environment.  When the key is
    absent the function silently returns so local dev is unaffected.
    """
    dd_api_key = os.environ.get("DD_API_KEY")
    if not dd_api_key:
        return

    try:
        from ddtrace import patch_all, tracer  # type: ignore[import-untyped]

        tracer.configure(
            hostname=os.environ.get("DD_AGENT_HOST", "localhost"),
            port=int(os.environ.get("DD_TRACE_AGENT_PORT", 8126)),
        )
        patch_all(
            fastapi=True,
            sqlalchemy=True,
            redis=True,
            elasticsearch=True,
            requests=True,
            httpx=True,
        )
    except ImportError:
        pass


def create_custom_metric(
    name: str, value: float, tags: list[str] | None = None
) -> None:
    """Emit a Datadog gauge metric prefixed with ``chamberforge.``."""
    try:
        from datadog import statsd  # type: ignore[import-untyped]

        statsd.gauge(f"chamberforge.{name}", value, tags=tags or [])
    except ImportError:
        pass
