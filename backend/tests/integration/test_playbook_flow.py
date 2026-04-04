"""Integration test: full playbook activation-to-offer flow.

Covers: list playbooks -> activate -> customize -> create offer -> verify offer data.
Also tests: list activations, cross-playbook compose.
"""
import uuid

import pytest

WORKSPACE_ID = str(uuid.uuid4())


class TestPlaybookActivationToOfferFlow:
    """End-to-end flow: list -> activate -> customize -> create offer."""

    def test_full_flow(self, client):
        # 1. List playbooks — should have 10 seeded templates
        resp = client.get("/api/v1/playbooks/")
        assert resp.status_code == 200
        data = resp.json()
        assert data["count"] == 10
        slugs = [p["slug"] for p in data["playbooks"]]
        assert "private-ops-office" in slugs

        # 2. Activate a playbook
        resp = client.post(
            "/api/v1/playbooks/private-ops-office/activate",
            json={"workspace_id": WORKSPACE_ID},
        )
        assert resp.status_code == 200
        activation = resp.json()["activation"]
        activation_id = activation["id"]
        assert activation["status"] == "active"
        assert activation["completed_sections"] == 0
        assert activation["total_sections"] == 8

        # 3. Customize the activation
        overrides = {
            "icp": {"wealth_tier": "UHNWI", "net_worth_range": "$50M+"},
            "pricing_model": {"type": "annual_retainer", "base_fee": 25000},
        }
        resp = client.put(
            f"/api/v1/playbooks/activations/{activation_id}/customize",
            json={"overrides": overrides},
        )
        assert resp.status_code == 200
        custom = resp.json()["activation"]["customizations"]
        assert custom["icp"]["wealth_tier"] == "UHNWI"
        assert custom["pricing_model"]["base_fee"] == 25000

        # 4. Create offer from activation
        resp = client.post(
            f"/api/v1/playbooks/activations/{activation_id}/create-offer",
            json={"workspace_id": WORKSPACE_ID},
        )
        assert resp.status_code == 200
        offer = resp.json()["offer"]
        assert offer["status"] == "draft"
        assert "Private Ops Office" in offer["name"] or "Offer" in offer["name"]
        assert offer["workspace_id"] == WORKSPACE_ID

        # 5. Verify the offer ID is a valid UUID
        offer_id = offer["id"]
        uuid.UUID(offer_id)  # raises if invalid

    def test_create_offer_nonexistent_activation(self, client):
        fake_id = str(uuid.uuid4())
        resp = client.post(
            f"/api/v1/playbooks/activations/{fake_id}/create-offer",
            json={"workspace_id": WORKSPACE_ID},
        )
        assert resp.status_code == 404

    def test_create_offer_wrong_workspace(self, client):
        # Activate with one workspace
        resp = client.post(
            "/api/v1/playbooks/private-ops-office/activate",
            json={"workspace_id": WORKSPACE_ID},
        )
        activation_id = resp.json()["activation"]["id"]

        # Try to create offer with different workspace
        wrong_ws = str(uuid.uuid4())
        resp = client.post(
            f"/api/v1/playbooks/activations/{activation_id}/create-offer",
            json={"workspace_id": wrong_ws},
        )
        assert resp.status_code == 404


class TestListActivations:
    """Test the GET /activations endpoint."""

    def test_list_activations_empty(self, client):
        ws = str(uuid.uuid4())
        resp = client.get(f"/api/v1/playbooks/activations?workspace_id={ws}")
        assert resp.status_code == 200
        assert resp.json()["count"] == 0

    def test_list_activations_with_data(self, client):
        ws = str(uuid.uuid4())

        # Activate two different playbooks
        client.post(
            "/api/v1/playbooks/private-ops-office/activate",
            json={"workspace_id": ws},
        )
        client.post(
            "/api/v1/playbooks/ecosystem-orchestrator/activate",
            json={"workspace_id": ws},
        )

        resp = client.get(f"/api/v1/playbooks/activations?workspace_id={ws}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["count"] == 2
        for act in data["activations"]:
            assert "activation_id" in act
            assert "playbook_name" in act
            assert "completion_pct" in act
            assert "next_step" in act

    def test_list_activations_with_progress(self, client):
        ws = str(uuid.uuid4())

        # Activate
        act_resp = client.post(
            "/api/v1/playbooks/private-ops-office/activate",
            json={"workspace_id": ws},
        )
        activation_id = act_resp.json()["activation"]["id"]

        # Complete a section
        client.put(
            f"/api/v1/playbooks/activations/{activation_id}/sections/ICP Definition",
            json={"status": "complete"},
        )

        resp = client.get(f"/api/v1/playbooks/activations?workspace_id={ws}")
        acts = resp.json()["activations"]
        assert len(acts) == 1
        assert acts[0]["completed_sections"] == 1
        assert acts[0]["completion_pct"] == 12.5


class TestCrossPlaybookCompose:
    """Test the POST /compose endpoint."""

    def test_compose_two_playbooks(self, client):
        ws = str(uuid.uuid4())
        resp = client.post(
            "/api/v1/playbooks/compose",
            json={
                "workspace_id": ws,
                "slugs": ["private-ops-office", "private-ops-office"],
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "name" in data
        assert "combined_icp" in data
        assert "merged_sops" in data
        assert "bundled_kpis" in data
        assert "bundle_pricing" in data
        assert data["bundle_pricing"]["discount_applied"] == 10.0
        assert data["source_slugs"] == ["private-ops-office", "private-ops-office"]

    def test_compose_nonexistent_slug(self, client):
        ws = str(uuid.uuid4())
        resp = client.post(
            "/api/v1/playbooks/compose",
            json={
                "workspace_id": ws,
                "slugs": ["private-ops-office", "nonexistent-slug"],
            },
        )
        assert resp.status_code == 404

    def test_compose_single_slug_rejected(self, client):
        ws = str(uuid.uuid4())
        resp = client.post(
            "/api/v1/playbooks/compose",
            json={
                "workspace_id": ws,
                "slugs": ["private-ops-office"],
            },
        )
        assert resp.status_code == 422  # Pydantic min_length=2

    def test_compose_too_many_slugs_rejected(self, client):
        ws = str(uuid.uuid4())
        resp = client.post(
            "/api/v1/playbooks/compose",
            json={
                "workspace_id": ws,
                "slugs": ["a", "b", "c", "d"],
            },
        )
        assert resp.status_code == 422  # Pydantic max_length=3


class TestOfferHasPlaybookData:
    """Verify the created offer actually contains playbook-sourced data."""

    def test_offer_contains_sop_and_kpi_data(self, client, db_session):
        """After full flow, verify the Offer row has playbook fields populated."""
        from app.models.offer import Offer

        ws = str(uuid.uuid4())

        # Activate
        act_resp = client.post(
            "/api/v1/playbooks/private-ops-office/activate",
            json={"workspace_id": ws},
        )
        activation_id = act_resp.json()["activation"]["id"]

        # Create offer
        offer_resp = client.post(
            f"/api/v1/playbooks/activations/{activation_id}/create-offer",
            json={"workspace_id": ws},
        )
        assert offer_resp.status_code == 200
        offer_id = offer_resp.json()["offer"]["id"]

        # Query the DB directly to verify populated fields
        offer = db_session.query(Offer).filter(Offer.id == offer_id).first()
        assert offer is not None
        assert offer.status == "draft"
        assert offer.name is not None
        assert "Offer" in offer.name

        # SOP bundle should have sop_skeleton from playbook
        assert offer.sop_bundle is not None
        assert "sop_skeleton" in offer.sop_bundle
        assert offer.sop_bundle["source_playbook"] == "private-ops-office"

        # Value stack should have KPIs
        assert offer.value_stack is not None
        assert len(offer.value_stack) > 0

        # Journey map should have ICP and pain triggers
        assert offer.journey_map is not None
        assert "icp" in offer.journey_map
        assert "pain_triggers" in offer.journey_map

        # Pricing model should be populated
        assert offer.pricing_model is not None
        assert len(offer.pricing_model) > 0
