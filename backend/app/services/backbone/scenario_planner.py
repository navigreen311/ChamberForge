"""ScenarioPlanner — What-if scenario modeling for pricing and scaling decisions."""
from __future__ import annotations

import math
from typing import Any


class ScenarioPlanner:
    """Runs revenue/cost/profit scenarios with adjustable parameters."""

    @staticmethod
    def run_scenario(
        base_price: float,
        base_clients: int,
        adjustments: dict[str, float] | None = None,
    ) -> dict[str, Any]:
        """Run what-if scenarios with adjustments.

        Adjustments dict can contain:
            margin: float (e.g. 0.7 for 70% margin)
            staffing_cost: float (annual cost per staff member)
            scale_factor: float (multiplier for client count)
            white_label_discount: float (0-1, discount for white-label pricing)

        Returns multiple named scenarios with revenue/cost/profit breakdowns.
        """
        adj = adjustments or {}
        margin = adj.get("margin", 0.7)
        staffing_cost = adj.get("staffing_cost", 80000.0)
        scale_factor = adj.get("scale_factor", 1.0)
        wl_discount = adj.get("white_label_discount", 0.0)

        scenarios: list[dict[str, Any]] = []

        configs = [
            ("Current State", 1.0, 1.0, 0.0),
            ("10% Growth", 1.0, 1.1, 0.0),
            ("25% Growth", 1.0, 1.25, 0.0),
            ("Premium Price Increase", 1.15, 1.0, 0.0),
            ("Scale + White Label", 1.0, scale_factor if scale_factor > 1.0 else 1.5, wl_discount if wl_discount > 0 else 0.15),
        ]

        for name, price_mult, client_mult, wl_disc in configs:
            effective_price = base_price * price_mult * (1 - wl_disc)
            effective_clients = math.ceil(base_clients * client_mult)
            revenue = effective_price * effective_clients * 12  # Annual

            # Staff needed: 1 per 8 clients, minimum 1
            staff_needed = max(1, math.ceil(effective_clients / 8))
            staff_costs = staff_needed * staffing_cost

            # Total costs = staff + overhead (20% of staff costs)
            costs = staff_costs * 1.2
            # Apply margin expectation to cost floor
            cost_floor = revenue * (1 - margin)
            costs = max(costs, cost_floor)

            profit = revenue - costs
            margin_pct = (profit / revenue * 100) if revenue > 0 else 0

            scenarios.append({
                "name": name,
                "revenue": round(revenue, 2),
                "costs": round(costs, 2),
                "profit": round(profit, 2),
                "margin_pct": round(margin_pct, 2),
                "staff_needed": staff_needed,
            })

        # Chart data: simplified for frontend consumption
        chart_data = [
            {
                "name": s["name"],
                "revenue": s["revenue"],
                "costs": s["costs"],
                "profit": s["profit"],
            }
            for s in scenarios
        ]

        return {
            "scenarios": scenarios,
            "comparison_chart_data": chart_data,
        }
