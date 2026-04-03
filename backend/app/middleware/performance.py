"""Performance middleware — tracks latency and sets Server-Timing header."""
import time
from collections import deque
from threading import Lock

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

# Shared metrics store (in-memory, process-local)
_latencies: deque = deque(maxlen=10_000)
_lock = Lock()
_request_count: int = 0
_error_count: int = 0


def get_performance_metrics() -> dict:
    """Return aggregated performance metrics."""
    with _lock:
        latencies = list(_latencies)
    if latencies:
        latencies_sorted = sorted(latencies)
        avg = sum(latencies_sorted) / len(latencies_sorted)
        p50 = latencies_sorted[len(latencies_sorted) // 2]
        p95 = latencies_sorted[int(len(latencies_sorted) * 0.95)]
        p99 = latencies_sorted[int(len(latencies_sorted) * 0.99)]
    else:
        avg = p50 = p95 = p99 = 0.0

    return {
        "requests_total": _request_count,
        "avg_latency_ms": round(avg, 2),
        "p50_latency_ms": round(p50, 2),
        "p95_latency_ms": round(p95, 2),
        "p99_latency_ms": round(p99, 2),
        "error_count": _error_count,
    }


class PerformanceMiddleware(BaseHTTPMiddleware):
    """Measure request latency and expose via Server-Timing header."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        global _request_count, _error_count

        start = time.perf_counter()
        response: Response = await call_next(request)
        latency_ms = round((time.perf_counter() - start) * 1000, 2)

        with _lock:
            _request_count += 1
            _latencies.append(latency_ms)
            if response.status_code >= 500:
                _error_count += 1

        response.headers["Server-Timing"] = f"total;dur={latency_ms}"
        return response
