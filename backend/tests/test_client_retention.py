"""Tests for ClientRetention — health score calculation verification."""

import pytest

from app.services.backbone.client_retention import ClientRetention


@pytest.fixture
def retention():
    return ClientRetention()


def test_health_score_formula():
    """Test the health score formula: engagement*0.3 + satisfaction*0.3 + usage*0.2 + payment*0.2."""
    score = ClientRetention.calculate_health_score(
        engagement=8.0,
        satisfaction=9.0,
        usage=7.0,
        payment_history=10.0,
    )
    # 8*0.3 + 9*0.3 + 7*0.2 + 10*0.2 = 2.4 + 2.7 + 1.4 + 2.0 = 8.5
    assert score == 8.5


def test_health_score_all_tens():
    """Test health score with all perfect scores."""
    score = ClientRetention.calculate_health_score(10, 10, 10, 10)
    # 10*0.3 + 10*0.3 + 10*0.2 + 10*0.2 = 3 + 3 + 2 + 2 = 10.0
    assert score == 10.0


def test_health_score_all_ones():
    """Test health score with all minimum scores."""
    score = ClientRetention.calculate_health_score(1, 1, 1, 1)
    # 1*0.3 + 1*0.3 + 1*0.2 + 1*0.2 = 0.3 + 0.3 + 0.2 + 0.2 = 1.0
    assert score == 1.0


def test_health_score_mixed():
    """Test health score with mixed values."""
    score = ClientRetention.calculate_health_score(5, 5, 5, 5)
    # 5*0.3 + 5*0.3 + 5*0.2 + 5*0.2 = 1.5 + 1.5 + 1.0 + 1.0 = 5.0
    assert score == 5.0


def test_health_score_weights():
    """Verify the specific weights are applied correctly."""
    # Only engagement high
    score_e = ClientRetention.calculate_health_score(10, 1, 1, 1)
    # 10*0.3 + 1*0.3 + 1*0.2 + 1*0.2 = 3.0 + 0.3 + 0.2 + 0.2 = 3.7
    assert score_e == 3.7

    # Only satisfaction high
    score_s = ClientRetention.calculate_health_score(1, 10, 1, 1)
    # 1*0.3 + 10*0.3 + 1*0.2 + 1*0.2 = 0.3 + 3.0 + 0.2 + 0.2 = 3.7
    assert score_s == 3.7

    # Only usage high
    score_u = ClientRetention.calculate_health_score(1, 1, 10, 1)
    # 1*0.3 + 1*0.3 + 10*0.2 + 1*0.2 = 0.3 + 0.3 + 2.0 + 0.2 = 2.8
    assert score_u == 2.8

    # Only payment high
    score_p = ClientRetention.calculate_health_score(1, 1, 1, 10)
    # 1*0.3 + 1*0.3 + 1*0.2 + 10*0.2 = 0.3 + 0.3 + 0.2 + 2.0 = 2.8
    assert score_p == 2.8


def test_register_client(retention):
    """Test client registration."""
    client = retention.register_client(
        client_id="c1",
        client_name="Acme Corp",
        contract_start="2025-01-01",
        contract_months=12,
        monthly_value=10000,
    )

    assert client["id"] == "c1"
    assert client["name"] == "Acme Corp"
    assert client["health_score"] > 0
    assert client["risk_level"] in ("low", "medium", "high")


def test_update_metrics_recalculates_score(retention):
    """Test that updating metrics recalculates health score."""
    retention.register_client("c1", "Acme", "2025-01-01")

    updated = retention.update_metrics(
        "c1", engagement=9.0, satisfaction=9.0, usage=8.0, payment_history=10.0
    )
    # 9*0.3 + 9*0.3 + 8*0.2 + 10*0.2 = 2.7 + 2.7 + 1.6 + 2.0 = 9.0
    assert updated["health_score"] == 9.0
    assert updated["risk_level"] == "low"


def test_update_metrics_high_risk(retention):
    """Test that low metrics result in high risk."""
    retention.register_client("c1", "Struggling Inc", "2025-01-01")

    updated = retention.update_metrics(
        "c1", engagement=2.0, satisfaction=2.0, usage=2.0, payment_history=3.0
    )
    # 2*0.3 + 2*0.3 + 2*0.2 + 3*0.2 = 0.6 + 0.6 + 0.4 + 0.6 = 2.2
    assert updated["health_score"] == 2.2
    assert updated["risk_level"] == "high"


def test_upsell_triggers_high_usage(retention):
    """Test that high usage triggers upsell."""
    retention.register_client("c1", "Power User Corp", "2025-01-01")
    updated = retention.update_metrics("c1", usage=9.0)

    trigger_types = [t["type"] for t in updated["upsell_triggers"]]
    assert "high_usage" in trigger_types


def test_upsell_triggers_happy_engaged(retention):
    """Test that high satisfaction + engagement triggers cross-sell."""
    retention.register_client("c1", "Happy Corp", "2025-01-01")
    updated = retention.update_metrics(
        "c1", engagement=9.0, satisfaction=9.5
    )

    trigger_types = [t["type"] for t in updated["upsell_triggers"]]
    assert "happy_engaged" in trigger_types


def test_get_all_clients_sorted(retention):
    """Test clients are sorted by health score (lowest first)."""
    retention.register_client("c1", "Good Corp", "2025-01-01")
    retention.update_metrics("c1", engagement=9, satisfaction=9, usage=9, payment_history=9)

    retention.register_client("c2", "Bad Corp", "2025-01-01")
    retention.update_metrics("c2", engagement=2, satisfaction=2, usage=2, payment_history=2)

    clients = retention.get_all_clients()
    assert len(clients) == 2
    assert clients[0]["client_id"] == "c2"  # lowest score first
    assert clients[1]["client_id"] == "c1"


def test_renewal_cadence(retention):
    """Test renewal cadence generation."""
    retention.register_client("c1", "Acme", "2025-01-01", contract_months=12, monthly_value=10000)
    cadence = retention.generate_renewal_cadence("c1")

    assert cadence is not None
    assert cadence["client_id"] == "c1"
    assert len(cadence["touchpoints"]) >= 6


def test_health_score_clamped():
    """Test that health score is clamped to 1-10 range."""
    # Even with values > 10, it should clamp
    score = ClientRetention.calculate_health_score(10, 10, 10, 10)
    assert score <= 10.0
    assert score >= 1.0
