"""RevenueProjector — SaaS/subscription revenue modeling with growth and churn."""

from __future__ import annotations

import math


class RevenueProjector:
    """Projects recurring revenue with growth and churn dynamics."""

    @staticmethod
    def project_revenue(
        monthly_price: float,
        clients_month_1: int,
        growth_rate: float,
        churn_rate: float,
        months: int = 12,
    ) -> dict:
        """Project revenue over time with compounding growth and churn.

        Args:
            monthly_price: Monthly price per client
            clients_month_1: Number of clients in month 1
            growth_rate: Monthly growth rate as decimal (0.15 = 15%)
            churn_rate: Monthly churn rate as decimal (0.05 = 5%)
            months: Number of months to project (default 12)

        Returns:
            dict with monthly_projections, break_even_month, year_1_arr
        """
        monthly_projections: list[dict] = []
        cumulative_revenue = 0.0
        clients = float(clients_month_1)
        break_even_month: int | None = None

        for month in range(1, months + 1):
            if month == 1:
                clients = float(clients_month_1)
            else:
                new_clients = clients * growth_rate
                churned_clients = clients * churn_rate
                clients = clients + new_clients - churned_clients

            # Ensure non-negative
            clients = max(clients, 0.0)

            mrr = math.floor(clients) * monthly_price
            arr = mrr * 12
            cumulative_revenue += mrr

            monthly_projections.append({
                "month": month,
                "clients": math.floor(clients),
                "mrr": round(mrr, 2),
                "arr": round(arr, 2),
                "cumulative": round(cumulative_revenue, 2),
            })

            # Break-even: first month where cumulative >= initial investment estimate
            # Using simple heuristic: cumulative > 0 always true, so track when ARR exceeds threshold
            if break_even_month is None and mrr > monthly_price * clients_month_1 * 2:
                break_even_month = month

        # Year 1 ARR is the ARR at month 12 (or last month)
        year_1_arr = monthly_projections[-1]["arr"] if monthly_projections else 0.0

        return {
            "monthly_projections": monthly_projections,
            "break_even_month": break_even_month,
            "year_1_arr": round(year_1_arr, 2),
        }
