"""OutcomeIntelligence — KPI tracking and quarterly scorecard generation."""

from __future__ import annotations

from datetime import datetime
from uuid import uuid4


class OutcomeIntelligence:
    """Tracks KPIs, generates quarterly scorecards, and surfaces insights."""

    def __init__(self) -> None:
        self._kpis: dict[str, dict] = {}
        self._measurements: dict[str, list[dict]] = {}  # kpi_id -> measurements

    def define_kpi(
        self,
        name: str,
        category: str,
        target_value: float,
        unit: str = "",
        frequency: str = "monthly",
    ) -> dict:
        """Define a KPI to track.

        Args:
            name: KPI name (e.g., 'Monthly Recurring Revenue')
            category: Category (e.g., 'revenue', 'retention', 'engagement')
            target_value: Target value for the KPI
            unit: Unit of measurement (e.g., '$', '%', 'count')
            frequency: Measurement frequency ('weekly', 'monthly', 'quarterly')
        """
        kpi_id = str(uuid4())
        kpi = {
            "id": kpi_id,
            "name": name,
            "category": category,
            "target_value": target_value,
            "unit": unit,
            "frequency": frequency,
            "created_at": datetime.utcnow().isoformat(),
        }
        self._kpis[kpi_id] = kpi
        self._measurements[kpi_id] = []
        return kpi

    def record_measurement(
        self,
        kpi_id: str,
        value: float,
        period: str = "",
        notes: str = "",
    ) -> dict | None:
        """Record a measurement for a KPI.

        Args:
            kpi_id: ID of the KPI
            value: Measured value
            period: Period label (e.g., '2025-Q1', '2025-03')
            notes: Optional notes
        """
        if kpi_id not in self._kpis:
            return None

        measurement = {
            "kpi_id": kpi_id,
            "value": value,
            "period": period or datetime.utcnow().strftime("%Y-%m"),
            "notes": notes,
            "recorded_at": datetime.utcnow().isoformat(),
        }
        self._measurements[kpi_id].append(measurement)
        return measurement

    def get_kpi_status(self, kpi_id: str) -> dict | None:
        """Get current status of a KPI including progress toward target."""
        kpi = self._kpis.get(kpi_id)
        if not kpi:
            return None

        measurements = self._measurements.get(kpi_id, [])
        current_value = measurements[-1]["value"] if measurements else 0.0
        target = kpi["target_value"]
        progress = (current_value / target * 100) if target != 0 else 0.0

        # Trend: compare last two measurements
        trend = "stable"
        if len(measurements) >= 2:
            prev = measurements[-2]["value"]
            if current_value > prev:
                trend = "improving"
            elif current_value < prev:
                trend = "declining"

        return {
            "kpi": kpi,
            "current_value": current_value,
            "target_value": target,
            "progress_pct": round(progress, 1),
            "trend": trend,
            "measurement_count": len(measurements),
            "on_track": progress >= 80,
        }

    def generate_quarterly_scorecard(self, quarter: str = "") -> dict:
        """Generate a quarterly scorecard across all KPIs.

        Args:
            quarter: Quarter label (e.g., '2025-Q1'). If empty, uses all data.

        Returns:
            Scorecard with category breakdowns, overall score, and recommendations
        """
        categories: dict[str, list[dict]] = {}

        for kpi_id, kpi in self._kpis.items():
            measurements = self._measurements.get(kpi_id, [])
            if quarter:
                measurements = [m for m in measurements if quarter in m["period"]]

            current_value = measurements[-1]["value"] if measurements else 0.0
            target = kpi["target_value"]
            achievement = (current_value / target * 100) if target != 0 else 0.0

            cat = kpi["category"]
            if cat not in categories:
                categories[cat] = []

            categories[cat].append({
                "kpi_name": kpi["name"],
                "target": target,
                "actual": current_value,
                "achievement_pct": round(achievement, 1),
                "unit": kpi["unit"],
                "status": "green" if achievement >= 90 else ("yellow" if achievement >= 70 else "red"),
            })

        # Calculate category scores
        category_scores = {}
        for cat, kpis in categories.items():
            avg_achievement = sum(k["achievement_pct"] for k in kpis) / len(kpis) if kpis else 0
            category_scores[cat] = {
                "average_achievement": round(avg_achievement, 1),
                "kpi_count": len(kpis),
                "kpis": kpis,
            }

        # Overall score
        all_achievements = [
            k["achievement_pct"] for kpis in categories.values() for k in kpis
        ]
        overall_score = sum(all_achievements) / len(all_achievements) if all_achievements else 0

        # Recommendations
        recommendations = []
        for cat, data in category_scores.items():
            if data["average_achievement"] < 70:
                recommendations.append(
                    f"Critical: {cat} category at {data['average_achievement']}% — needs immediate intervention"
                )
            elif data["average_achievement"] < 90:
                recommendations.append(
                    f"Watch: {cat} category at {data['average_achievement']}% — review strategy"
                )

        return {
            "quarter": quarter or "all-time",
            "overall_score": round(overall_score, 1),
            "overall_status": "green" if overall_score >= 90 else ("yellow" if overall_score >= 70 else "red"),
            "category_scores": category_scores,
            "recommendations": recommendations,
            "total_kpis": len(self._kpis),
        }
