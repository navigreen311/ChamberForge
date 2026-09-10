"""Tests for demo scenario data integrity and sandbox integration."""
import uuid

import pytest

from app.data.demo_scenarios import (
    ALL_SCENARIOS,
    SCENARIO_1,
    SCENARIO_2,
    SCENARIO_3,
    get_all_clients,
    get_all_evidence,
    get_all_household_graphs,
    get_all_notifications,
    get_all_offers,
    get_all_playbook_activations,
    get_all_problems,
    get_scenario_by_name,
)
from app.services.backbone.sandbox import SandboxService

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

REQUIRED_SCENARIO_KEYS = {
    "id",
    "name",
    "client",
    "problem",
    "offer",
    "household_graph",
    "evidence",
    "kpis",
    "notifications",
    "playbook_activations",
    "health_score",
}

REQUIRED_CLIENT_KEYS = {"id", "name", "email", "tier", "net_worth", "status", "created_at"}
REQUIRED_PROBLEM_KEYS = {"id", "client_id", "title", "description", "status", "created_at"}
REQUIRED_OFFER_KEYS = {"id", "client_id", "problem_id", "title", "price_monthly", "status", "created_at"}
REQUIRED_HOUSEHOLD_KEYS = {"id", "client_id", "family_members", "properties", "staff", "vendors"}
REQUIRED_EVIDENCE_KEYS = {"id", "client_id", "title", "source", "type", "summary"}


def _is_valid_uuid(val: str) -> bool:
    try:
        uuid.UUID(val)
        return True
    except (ValueError, TypeError):
        return False


# ---------------------------------------------------------------------------
# Scenario structure tests
# ---------------------------------------------------------------------------


class TestScenarioStructure:
    """Verify each scenario has all required fields."""

    @pytest.mark.parametrize("scenario", ALL_SCENARIOS, ids=lambda s: s["name"])
    def test_scenario_has_all_required_keys(self, scenario):
        missing = REQUIRED_SCENARIO_KEYS - set(scenario.keys())
        assert not missing, f"Scenario '{scenario['name']}' missing keys: {missing}"

    @pytest.mark.parametrize("scenario", ALL_SCENARIOS, ids=lambda s: s["name"])
    def test_scenario_id_is_valid_uuid(self, scenario):
        assert _is_valid_uuid(scenario["id"])

    @pytest.mark.parametrize("scenario", ALL_SCENARIOS, ids=lambda s: s["name"])
    def test_client_has_required_keys(self, scenario):
        missing = REQUIRED_CLIENT_KEYS - set(scenario["client"].keys())
        assert not missing, f"Client in '{scenario['name']}' missing keys: {missing}"

    @pytest.mark.parametrize("scenario", ALL_SCENARIOS, ids=lambda s: s["name"])
    def test_problem_has_required_keys(self, scenario):
        missing = REQUIRED_PROBLEM_KEYS - set(scenario["problem"].keys())
        assert not missing, f"Problem in '{scenario['name']}' missing keys: {missing}"

    @pytest.mark.parametrize("scenario", ALL_SCENARIOS, ids=lambda s: s["name"])
    def test_offer_has_required_keys(self, scenario):
        missing = REQUIRED_OFFER_KEYS - set(scenario["offer"].keys())
        assert not missing, f"Offer in '{scenario['name']}' missing keys: {missing}"

    @pytest.mark.parametrize("scenario", ALL_SCENARIOS, ids=lambda s: s["name"])
    def test_household_has_required_keys(self, scenario):
        missing = REQUIRED_HOUSEHOLD_KEYS - set(scenario["household_graph"].keys())
        assert not missing, f"Household in '{scenario['name']}' missing keys: {missing}"

    @pytest.mark.parametrize("scenario", ALL_SCENARIOS, ids=lambda s: s["name"])
    def test_evidence_entries_have_required_keys(self, scenario):
        for ev in scenario["evidence"]:
            missing = REQUIRED_EVIDENCE_KEYS - set(ev.keys())
            assert not missing, f"Evidence '{ev.get('title', '?')}' missing keys: {missing}"


# ---------------------------------------------------------------------------
# Referential integrity tests
# ---------------------------------------------------------------------------


class TestReferentialIntegrity:
    """Verify cross-references between records are consistent."""

    @pytest.mark.parametrize("scenario", ALL_SCENARIOS, ids=lambda s: s["name"])
    def test_problem_references_client(self, scenario):
        assert scenario["problem"]["client_id"] == scenario["client"]["id"]

    @pytest.mark.parametrize("scenario", ALL_SCENARIOS, ids=lambda s: s["name"])
    def test_offer_references_client(self, scenario):
        assert scenario["offer"]["client_id"] == scenario["client"]["id"]

    @pytest.mark.parametrize("scenario", ALL_SCENARIOS, ids=lambda s: s["name"])
    def test_offer_references_problem(self, scenario):
        assert scenario["offer"]["problem_id"] == scenario["problem"]["id"]

    @pytest.mark.parametrize("scenario", ALL_SCENARIOS, ids=lambda s: s["name"])
    def test_household_references_client(self, scenario):
        assert scenario["household_graph"]["client_id"] == scenario["client"]["id"]

    @pytest.mark.parametrize("scenario", ALL_SCENARIOS, ids=lambda s: s["name"])
    def test_evidence_references_client(self, scenario):
        for ev in scenario["evidence"]:
            assert ev["client_id"] == scenario["client"]["id"]

    @pytest.mark.parametrize("scenario", ALL_SCENARIOS, ids=lambda s: s["name"])
    def test_playbook_activations_reference_client(self, scenario):
        for pa in scenario["playbook_activations"]:
            assert pa["client_id"] == scenario["client"]["id"]

    @pytest.mark.parametrize("scenario", ALL_SCENARIOS, ids=lambda s: s["name"])
    def test_all_ids_are_valid_uuids(self, scenario):
        assert _is_valid_uuid(scenario["client"]["id"])
        assert _is_valid_uuid(scenario["problem"]["id"])
        assert _is_valid_uuid(scenario["offer"]["id"])
        assert _is_valid_uuid(scenario["household_graph"]["id"])
        for ev in scenario["evidence"]:
            assert _is_valid_uuid(ev["id"])
        for pa in scenario["playbook_activations"]:
            assert _is_valid_uuid(pa["id"])


# ---------------------------------------------------------------------------
# Scenario-specific data tests
# ---------------------------------------------------------------------------


class TestScenario1PrivateOps:
    """Verify Scenario 1: Private Ops Office for Tech Founder."""

    def test_client_details(self):
        c = SCENARIO_1["client"]
        assert c["name"] == "Sarah Chen"
        assert c["net_worth"] == 45_000_000
        assert c["tier"] == "UHNW"

    def test_offer_pricing(self):
        o = SCENARIO_1["offer"]
        assert o["price_monthly"] == 22_000
        assert o["title"] == "Private Ops Office"

    def test_household_counts(self):
        hg = SCENARIO_1["household_graph"]
        assert len(hg["family_members"]) == 4
        assert len(hg["properties"]) == 3
        assert len(hg["staff"]) == 8
        assert len(hg["vendors"]) == 12

    def test_evidence_count(self):
        assert len(SCENARIO_1["evidence"]) == 3

    def test_health_score(self):
        hs = SCENARIO_1["health_score"]
        assert hs["score"] == 87
        assert hs["risk_level"] == "low"

    def test_kpis_present(self):
        assert len(SCENARIO_1["kpis"]) >= 3
        names = {k["name"] for k in SCENARIO_1["kpis"]}
        assert "Calendar Conflicts" in names
        assert "Vendor Response Time" in names
        assert "Emergency Protocol Activation" in names


class TestScenario2CyberCommand:
    """Verify Scenario 2: Family Cyber Command for Family Office."""

    def test_client_details(self):
        c = SCENARIO_2["client"]
        assert c["name"] == "The Wellington Family Trust"
        assert c["net_worth"] == 180_000_000

    def test_offer_pricing(self):
        o = SCENARIO_2["offer"]
        assert o["price_monthly"] == 18_000
        assert o["title"] == "Family Cyber Command"

    def test_household_counts(self):
        hg = SCENARIO_2["household_graph"]
        assert len(hg["family_members"]) == 6
        assert len(hg["properties"]) == 2
        assert len(hg["staff"]) == 4
        assert len(hg["vendors"]) == 8
        assert len(hg["entities"]) == 3

    def test_crisis_incident_exists(self):
        assert "crisis_incident" in SCENARIO_2
        ci = SCENARIO_2["crisis_incident"]
        assert ci["severity"] == "critical"
        assert ci["financial_impact_prevented"] == 2_300_000
        assert len(ci["timeline"]) >= 6

    def test_health_score_churn_risk(self):
        hs = SCENARIO_2["health_score"]
        assert hs["score"] == 72
        assert hs["risk_level"] == "medium"
        assert hs.get("churn_risk") == "elevated"


class TestScenario3EcosystemOrchestrator:
    """Verify Scenario 3: Ecosystem Orchestrator for UHNW Dynasty."""

    def test_client_details(self):
        c = SCENARIO_3["client"]
        assert c["name"] == "The Harrington Family"
        assert c["net_worth"] == 500_000_000

    def test_offer_pricing(self):
        o = SCENARIO_3["offer"]
        assert o["price_monthly"] == 35_000
        assert "Ecosystem Orchestrator" in o["title"]

    def test_household_counts(self):
        hg = SCENARIO_3["household_graph"]
        assert len(hg["family_members"]) == 12
        assert len(hg["properties"]) == 7
        assert len(hg["staff"]) == 15
        assert len(hg["vendors"]) == 23
        assert len(hg["entities"]) == 8

    def test_multi_generation_family(self):
        members = SCENARIO_3["household_graph"]["family_members"]
        generations = {m.get("generation") for m in members}
        assert generations == {1, 2, 3}

    def test_two_playbook_activations(self):
        assert len(SCENARIO_3["playbook_activations"]) == 2
        names = {pa["playbook_name"] for pa in SCENARIO_3["playbook_activations"]}
        assert "Ecosystem Orchestrator" in names
        assert "Footprint Reduction" in names

    def test_health_score(self):
        hs = SCENARIO_3["health_score"]
        assert hs["score"] == 94
        assert hs["risk_level"] == "low"


# ---------------------------------------------------------------------------
# Aggregation helper tests
# ---------------------------------------------------------------------------


class TestAggregationHelpers:
    """Verify the helper functions that extract data across scenarios."""

    def test_get_all_clients(self):
        clients = get_all_clients()
        assert len(clients) == 3

    def test_get_all_problems(self):
        problems = get_all_problems()
        assert len(problems) == 3

    def test_get_all_offers(self):
        offers = get_all_offers()
        assert len(offers) == 3

    def test_get_all_household_graphs(self):
        graphs = get_all_household_graphs()
        assert len(graphs) == 3

    def test_get_all_evidence(self):
        evidence = get_all_evidence()
        assert len(evidence) == 7  # 3 + 2 + 2

    def test_get_all_notifications(self):
        notifications = get_all_notifications()
        assert len(notifications) == 8  # 2 + 3 + 3

    def test_get_all_playbook_activations(self):
        activations = get_all_playbook_activations()
        assert len(activations) == 4  # 1 + 1 + 2

    def test_get_scenario_by_name_exact(self):
        s = get_scenario_by_name("Private Ops Office")
        assert s is not None
        assert s["id"] == SCENARIO_1["id"]

    def test_get_scenario_by_name_partial(self):
        s = get_scenario_by_name("cyber command")
        assert s is not None
        assert s["id"] == SCENARIO_2["id"]

    def test_get_scenario_by_name_not_found(self):
        assert get_scenario_by_name("nonexistent") is None


# ---------------------------------------------------------------------------
# Sandbox service integration tests
# ---------------------------------------------------------------------------


class TestSandboxServiceIntegration:
    """Verify the SandboxService properly loads demo scenarios."""

    def setup_method(self):
        SandboxService._reset()

    def test_create_sandbox_loads_data(self):
        sandbox = SandboxService.create_sandbox(None, "ws-1", "Demo")
        assert sandbox["synthetic_data_loaded"] is True
        assert sandbox["status"] == "active"

        full = SandboxService.get_sandbox(None, sandbox["sandbox_id"])
        data = full["synthetic_data"]
        assert len(data["scenarios"]) == 3
        assert len(data["clients"]) == 3
        assert len(data["problems"]) == 3
        assert len(data["offers"]) == 3
        assert len(data["household_graphs"]) == 3
        assert len(data["evidence"]) == 7
        assert len(data["notifications"]) == 8
        assert len(data["playbook_activations"]) == 4
        assert len(data["health_scores"]) == 3
        assert len(data["crisis_incidents"]) == 1
        assert len(data["users"]) == 2
        assert len(data["workspaces"]) == 1

    def test_load_synthetic_data_returns_counts(self):
        sandbox = SandboxService.create_sandbox(None, "ws-1", "Demo")
        result = SandboxService.load_synthetic_data(None, sandbox["sandbox_id"])
        assert result["data_loaded"] is True
        counts = result["record_counts"]
        assert counts["scenarios"] == 3
        assert counts["clients"] == 3
        assert counts["evidence"] == 7
        assert counts["crisis_incidents"] == 1

    def test_load_synthetic_data_missing_sandbox(self):
        with pytest.raises(ValueError, match="not found"):
            SandboxService.load_synthetic_data(None, "fake-id")

    def test_reset_sandbox(self):
        sandbox = SandboxService.create_sandbox(None, "ws-1", "Demo")
        sid = sandbox["sandbox_id"]
        result = SandboxService.reset_sandbox(None, sid)
        assert result["reset"] is True
        assert result["synthetic_data_loaded"] is True

        full = SandboxService.get_sandbox(None, sid)
        assert len(full["synthetic_data"]["scenarios"]) == 3

    def test_reset_missing_sandbox(self):
        with pytest.raises(ValueError, match="not found"):
            SandboxService.reset_sandbox(None, "fake-id")

    def test_list_sandboxes(self):
        SandboxService.create_sandbox(None, "ws-1", "Demo 1")
        SandboxService.create_sandbox(None, "ws-1", "Demo 2")
        SandboxService.create_sandbox(None, "ws-other", "Other")

        result = SandboxService.list_sandboxes(None, "ws-1")
        assert len(result) == 2
        # Should not include synthetic_data in list response
        for s in result:
            assert "synthetic_data" not in s


# ---------------------------------------------------------------------------
# Data uniqueness tests
# ---------------------------------------------------------------------------


class TestDataUniqueness:
    """Verify no ID collisions across scenarios."""

    def test_all_client_ids_unique(self):
        ids = [c["id"] for c in get_all_clients()]
        assert len(ids) == len(set(ids))

    def test_all_problem_ids_unique(self):
        ids = [p["id"] for p in get_all_problems()]
        assert len(ids) == len(set(ids))

    def test_all_offer_ids_unique(self):
        ids = [o["id"] for o in get_all_offers()]
        assert len(ids) == len(set(ids))

    def test_all_evidence_ids_unique(self):
        ids = [e["id"] for e in get_all_evidence()]
        assert len(ids) == len(set(ids))

    def test_all_scenario_ids_unique(self):
        ids = [s["id"] for s in ALL_SCENARIOS]
        assert len(ids) == len(set(ids))

    def test_deterministic_ids_across_calls(self):
        """IDs should be stable (deterministic) so resets produce same data."""
        clients_a = get_all_clients()
        clients_b = get_all_clients()
        for a, b in zip(clients_a, clients_b):
            assert a["id"] == b["id"]
