"""Benchmark Exchange — anonymized cross-workspace performance benchmarks."""
from uuid import UUID

from sqlalchemy.orm import Session


class BenchmarkExchange:
    """
    Aggregates anonymized performance benchmarks across workspaces.
    Never exposes per-client or per-workspace data — only statistical aggregates.
    """

    # In-memory metric store (in production, backed by a dedicated metrics table)
    _contributed_metrics: list[dict] = []

    # Seed data organized by pain category for demonstration
    SEED_BENCHMARKS: dict[str, list[dict]] = {
        "wealth_management": [
            {"retainer": 25000, "margin_pct": 42, "conversion_rate": 0.18},
            {"retainer": 35000, "margin_pct": 38, "conversion_rate": 0.22},
            {"retainer": 30000, "margin_pct": 45, "conversion_rate": 0.15},
            {"retainer": 28000, "margin_pct": 40, "conversion_rate": 0.20},
            {"retainer": 32000, "margin_pct": 44, "conversion_rate": 0.17},
        ],
        "family_office": [
            {"retainer": 50000, "margin_pct": 55, "conversion_rate": 0.12},
            {"retainer": 65000, "margin_pct": 50, "conversion_rate": 0.10},
            {"retainer": 55000, "margin_pct": 52, "conversion_rate": 0.14},
            {"retainer": 60000, "margin_pct": 48, "conversion_rate": 0.11},
        ],
        "concierge": [
            {"retainer": 15000, "margin_pct": 60, "conversion_rate": 0.25},
            {"retainer": 18000, "margin_pct": 55, "conversion_rate": 0.28},
            {"retainer": 12000, "margin_pct": 65, "conversion_rate": 0.22},
        ],
        "legal_advisory": [
            {"retainer": 40000, "margin_pct": 35, "conversion_rate": 0.08},
            {"retainer": 45000, "margin_pct": 32, "conversion_rate": 0.10},
            {"retainer": 38000, "margin_pct": 37, "conversion_rate": 0.09},
        ],
        "tax_planning": [
            {"retainer": 20000, "margin_pct": 50, "conversion_rate": 0.15},
            {"retainer": 22000, "margin_pct": 48, "conversion_rate": 0.18},
            {"retainer": 19000, "margin_pct": 52, "conversion_rate": 0.14},
        ],
    }

    @classmethod
    def _get_pool(cls, pain_category: str) -> list[dict]:
        """Get the data pool for a pain category, including contributed metrics."""
        seed = cls.SEED_BENCHMARKS.get(pain_category, [])
        contributed = [
            m["data"]
            for m in cls._contributed_metrics
            if m.get("pain_category") == pain_category
        ]
        return seed + contributed

    @classmethod
    def get_anonymized_benchmarks(cls, db: Session, pain_category: str) -> dict:
        """
        Return anonymized aggregate benchmarks for a pain category.
        Never exposes per-client or per-workspace data.
        """
        pool = cls._get_pool(pain_category)

        if not pool:
            return {
                "pain_category": pain_category,
                "avg_retainer": 0,
                "median_retainer": 0,
                "avg_margin_pct": 0,
                "avg_conversion_rate": 0,
                "sample_size": 0,
                "message": f"No benchmark data available for '{pain_category}'",
            }

        retainers = sorted([d["retainer"] for d in pool])
        margins = [d["margin_pct"] for d in pool]
        conversions = [d["conversion_rate"] for d in pool]
        n = len(pool)

        # Median calculation
        mid = n // 2
        median = retainers[mid] if n % 2 else (retainers[mid - 1] + retainers[mid]) / 2

        return {
            "pain_category": pain_category,
            "avg_retainer": round(sum(retainers) / n, 2),
            "median_retainer": round(median, 2),
            "avg_margin_pct": round(sum(margins) / n, 2),
            "avg_conversion_rate": round(sum(conversions) / n, 4),
            "sample_size": n,
        }

    @classmethod
    def contribute_metrics(cls, db: Session, workspace_id: UUID, metrics: dict) -> bool:
        """
        Contribute anonymized metrics from a workspace to the benchmark pool.
        Validates required fields before accepting.
        """
        required_fields = {"pain_category", "retainer", "margin_pct", "conversion_rate"}
        if not required_fields.issubset(metrics.keys()):
            missing = required_fields - set(metrics.keys())
            raise ValueError(f"Missing required metric fields: {', '.join(missing)}")

        cls._contributed_metrics.append(
            {
                "workspace_id": str(workspace_id),
                "pain_category": metrics["pain_category"],
                "data": {
                    "retainer": metrics["retainer"],
                    "margin_pct": metrics["margin_pct"],
                    "conversion_rate": metrics["conversion_rate"],
                },
            }
        )
        return True
