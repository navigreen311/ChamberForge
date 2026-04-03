"""Tests for RevenueProjector — mathematical correctness verification."""

import math
import pytest

from app.services.backbone.revenue_projector import RevenueProjector


def test_basic_projection():
    """Test basic revenue projection with known inputs."""
    result = RevenueProjector.project_revenue(
        monthly_price=20000,
        clients_month_1=2,
        growth_rate=0.15,
        churn_rate=0.05,
        months=12,
    )

    assert "monthly_projections" in result
    assert "break_even_month" in result
    assert "year_1_arr" in result

    projections = result["monthly_projections"]
    assert len(projections) == 12

    # Month 1: 2 clients
    assert projections[0]["month"] == 1
    assert projections[0]["clients"] == 2
    assert projections[0]["mrr"] == 40000.0
    assert projections[0]["arr"] == 480000.0


def test_month_2_calculation():
    """Test month 2 growth/churn math."""
    result = RevenueProjector.project_revenue(
        monthly_price=20000,
        clients_month_1=2,
        growth_rate=0.15,
        churn_rate=0.05,
        months=12,
    )

    # Month 2: 2 + (2*0.15) - (2*0.05) = 2 + 0.3 - 0.1 = 2.2 -> floor = 2
    assert result["monthly_projections"][1]["clients"] == 2
    assert result["monthly_projections"][1]["mrr"] == 40000.0


def test_cumulative_revenue():
    """Test cumulative revenue is running sum of MRR."""
    result = RevenueProjector.project_revenue(
        monthly_price=10000,
        clients_month_1=5,
        growth_rate=0.10,
        churn_rate=0.03,
        months=6,
    )

    projections = result["monthly_projections"]
    running_total = 0.0
    for p in projections:
        running_total += p["mrr"]
        assert abs(p["cumulative"] - round(running_total, 2)) < 0.01


def test_arr_equals_mrr_times_12():
    """Test ARR = MRR * 12 for each month."""
    result = RevenueProjector.project_revenue(
        monthly_price=20000,
        clients_month_1=2,
        growth_rate=0.15,
        churn_rate=0.05,
        months=12,
    )

    for p in result["monthly_projections"]:
        assert abs(p["arr"] - p["mrr"] * 12) < 0.01


def test_year_1_arr():
    """Test year_1_arr matches last month's ARR."""
    result = RevenueProjector.project_revenue(
        monthly_price=20000,
        clients_month_1=2,
        growth_rate=0.15,
        churn_rate=0.05,
        months=12,
    )

    last_month = result["monthly_projections"][-1]
    assert result["year_1_arr"] == last_month["arr"]


def test_zero_growth():
    """Test with zero growth — clients should decrease due to churn."""
    result = RevenueProjector.project_revenue(
        monthly_price=10000,
        clients_month_1=10,
        growth_rate=0.0,
        churn_rate=0.10,
        months=6,
    )

    projections = result["monthly_projections"]
    # Clients should decrease each month
    for i in range(1, len(projections)):
        assert projections[i]["clients"] <= projections[i - 1]["clients"]


def test_zero_churn():
    """Test with zero churn — clients should only grow."""
    result = RevenueProjector.project_revenue(
        monthly_price=10000,
        clients_month_1=5,
        growth_rate=0.20,
        churn_rate=0.0,
        months=6,
    )

    projections = result["monthly_projections"]
    for i in range(1, len(projections)):
        assert projections[i]["clients"] >= projections[i - 1]["clients"]


def test_single_month():
    """Test projection for a single month."""
    result = RevenueProjector.project_revenue(
        monthly_price=5000,
        clients_month_1=3,
        growth_rate=0.10,
        churn_rate=0.05,
        months=1,
    )

    assert len(result["monthly_projections"]) == 1
    assert result["monthly_projections"][0]["clients"] == 3
    assert result["monthly_projections"][0]["mrr"] == 15000.0


def test_clients_grow_over_12_months():
    """Verify client count grows with net positive growth."""
    result = RevenueProjector.project_revenue(
        monthly_price=20000,
        clients_month_1=2,
        growth_rate=0.15,
        churn_rate=0.05,
        months=12,
    )

    first_clients = result["monthly_projections"][0]["clients"]
    last_clients = result["monthly_projections"][-1]["clients"]
    # With 15% growth and 5% churn (net 10%), clients should grow
    assert last_clients > first_clients


def test_high_churn_reduces_revenue():
    """Test that churn > growth leads to declining revenue."""
    result = RevenueProjector.project_revenue(
        monthly_price=10000,
        clients_month_1=10,
        growth_rate=0.05,
        churn_rate=0.20,
        months=12,
    )

    first_mrr = result["monthly_projections"][0]["mrr"]
    last_mrr = result["monthly_projections"][-1]["mrr"]
    assert last_mrr < first_mrr
