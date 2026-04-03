"""MoatTracker — Competitive intelligence and pricing compression detection."""
from __future__ import annotations

from typing import Any


class MoatTracker:
    """Scans competitive landscape and detects pricing compression."""

    @staticmethod
    def scan_competitors(pain_category: str) -> list[dict[str, Any]]:
        """Scan competitors for a given pain/service category.

        In production this would query market intelligence APIs.
        Returns structured competitor profiles with threat assessments.
        """
        # Category-specific competitor templates
        competitor_db: dict[str, list[dict[str, Any]]] = {
            "wealth-management": [
                {"name": "Legacy Advisors", "positioning": "Multi-generational wealth stewardship", "pricing_estimate": 15000, "threat_level": "high"},
                {"name": "Fortis Capital", "positioning": "Institutional-grade for individuals", "pricing_estimate": 12000, "threat_level": "medium"},
                {"name": "Pinnacle Private", "positioning": "Tech-forward HNW platform", "pricing_estimate": 10000, "threat_level": "medium"},
            ],
            "family-office": [
                {"name": "Dynasty Partners", "positioning": "Single-family office outsourcing", "pricing_estimate": 50000, "threat_level": "high"},
                {"name": "Hearth & Holdings", "positioning": "Next-gen family governance", "pricing_estimate": 35000, "threat_level": "medium"},
            ],
            "tax-strategy": [
                {"name": "Shield Tax Group", "positioning": "Aggressive cross-border optimization", "pricing_estimate": 20000, "threat_level": "high"},
                {"name": "Clarity Advisors", "positioning": "Compliance-first tax planning", "pricing_estimate": 8000, "threat_level": "low"},
            ],
        }

        key = pain_category.lower().replace(" ", "-")
        if key in competitor_db:
            return competitor_db[key]

        # Generic fallback
        return [
            {
                "name": f"Generic Competitor ({pain_category})",
                "positioning": "Broad market approach",
                "pricing_estimate": 10000,
                "threat_level": "medium",
            }
        ]

    @staticmethod
    def detect_pricing_compression(
        current_price: float,
        market_benchmarks: list[float],
    ) -> dict[str, Any]:
        """Detect if your pricing is being compressed relative to market.

        Returns compression status, market average, position, and recommendation.
        """
        if not market_benchmarks:
            return {
                "compressed": False,
                "market_avg": 0,
                "your_position": "unknown",
                "recommendation": "Insufficient market data — gather benchmarks",
            }

        market_avg = sum(market_benchmarks) / len(market_benchmarks)
        ratio = current_price / market_avg if market_avg > 0 else 1.0

        if ratio > 1.3:
            position = "premium"
            compressed = False
            recommendation = (
                "You are priced well above market. Ensure value delivery "
                "justifies premium or risk client attrition."
            )
        elif ratio > 1.0:
            position = "above_average"
            compressed = False
            recommendation = (
                "Healthy premium positioning. Monitor for new entrants "
                "that could undercut."
            )
        elif ratio > 0.85:
            position = "at_market"
            compressed = True
            recommendation = (
                "Pricing is near market average — differentiation risk. "
                "Consider packaging value-adds to justify a premium."
            )
        else:
            position = "below_market"
            compressed = True
            recommendation = (
                "Pricing is significantly below market average. "
                "Evaluate whether you are leaving money on the table "
                "or competing on volume."
            )

        return {
            "compressed": compressed,
            "market_avg": round(market_avg, 2),
            "your_position": position,
            "recommendation": recommendation,
        }
