"""Integration tests for the Playbooks API — list, activate, customize, progress."""
import uuid

WORKSPACE_ID = str(uuid.uuid4())


class TestListPlaybooks:
    def test_list_all_playbooks(self, client):
        resp = client.get("/api/v1/playbooks/")
        assert resp.status_code == 200
        data = resp.json()
        assert "count" in data
        assert "playbooks" in data
        assert data["count"] == 10
        assert len(data["playbooks"]) == 10

    def test_list_playbooks_have_required_fields(self, client):
        resp = client.get("/api/v1/playbooks/")
        for pb in resp.json()["playbooks"]:
            assert "slug" in pb
            assert "name" in pb
            assert "target_buyer" in pb
            assert "core_pain" in pb


class TestGetPlaybook:
    def test_get_playbook_by_slug(self, client):
        resp = client.get("/api/v1/playbooks/private-ops-office")
        assert resp.status_code == 200
        data = resp.json()
        assert data["slug"] == "private-ops-office"
        assert data["name"] == "Private Ops Office"

    def test_get_nonexistent_playbook(self, client):
        resp = client.get("/api/v1/playbooks/nonexistent-slug")
        assert resp.status_code == 404
        assert "not found" in resp.json()["detail"].lower()


class TestActivatePlaybook:
    def test_activate_playbook(self, client):
        resp = client.post(
            "/api/v1/playbooks/private-ops-office/activate",
            json={"workspace_id": WORKSPACE_ID},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["message"] == "Playbook activated"
        assert "activation" in data
        activation = data["activation"]
        assert activation["status"] == "active"
        assert activation["completed_sections"] == 0
        assert activation["total_sections"] == 8

    def test_activate_nonexistent_playbook(self, client):
        resp = client.post(
            "/api/v1/playbooks/no-such-playbook/activate",
            json={"workspace_id": WORKSPACE_ID},
        )
        assert resp.status_code == 404

    def test_activate_missing_workspace(self, client):
        resp = client.post(
            "/api/v1/playbooks/private-ops-office/activate",
            json={},
        )
        assert resp.status_code == 422


class TestCustomizePlaybook:
    def test_customize_activated_playbook(self, client):
        # Activate first
        act_resp = client.post(
            "/api/v1/playbooks/private-ops-office/activate",
            json={"workspace_id": WORKSPACE_ID},
        )
        activation_id = act_resp.json()["activation"]["id"]

        resp = client.put(
            f"/api/v1/playbooks/activations/{activation_id}/customize",
            json={"overrides": {"branding_color": "#FF0000", "custom_sop": True}},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["message"] == "Customizations applied"
        custom = data["activation"]["customizations"]
        assert custom["branding_color"] == "#FF0000"
        assert custom["custom_sop"] is True

    def test_customize_nonexistent_activation(self, client):
        fake_id = str(uuid.uuid4())
        resp = client.put(
            f"/api/v1/playbooks/activations/{fake_id}/customize",
            json={"overrides": {"key": "value"}},
        )
        assert resp.status_code == 404


class TestPlaybookProgress:
    def test_get_progress(self, client):
        act_resp = client.post(
            "/api/v1/playbooks/private-ops-office/activate",
            json={"workspace_id": WORKSPACE_ID},
        )
        activation_id = act_resp.json()["activation"]["id"]

        resp = client.get(
            f"/api/v1/playbooks/activations/{activation_id}/progress"
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["completion_pct"] == 0.0
        assert len(data["sections"]) == 8
        assert data["next_step"] is not None

    def test_update_section_and_check_progress(self, client):
        act_resp = client.post(
            "/api/v1/playbooks/private-ops-office/activate",
            json={"workspace_id": WORKSPACE_ID},
        )
        activation_id = act_resp.json()["activation"]["id"]

        # Complete first section
        resp = client.put(
            f"/api/v1/playbooks/activations/{activation_id}/sections/ICP Definition",
            json={"status": "complete"},
        )
        assert resp.status_code == 200
        assert resp.json()["activation"]["completed_sections"] == 1

        # Check progress updated
        prog = client.get(
            f"/api/v1/playbooks/activations/{activation_id}/progress"
        )
        assert prog.json()["completion_pct"] == 12.5  # 1/8 = 12.5%

    def test_get_progress_nonexistent(self, client):
        fake_id = str(uuid.uuid4())
        resp = client.get(
            f"/api/v1/playbooks/activations/{fake_id}/progress"
        )
        assert resp.status_code == 404

    def test_update_invalid_section(self, client):
        act_resp = client.post(
            "/api/v1/playbooks/private-ops-office/activate",
            json={"workspace_id": WORKSPACE_ID},
        )
        activation_id = act_resp.json()["activation"]["id"]

        resp = client.put(
            f"/api/v1/playbooks/activations/{activation_id}/sections/Nonexistent Section",
            json={"status": "complete"},
        )
        assert resp.status_code == 404

    def test_update_invalid_status(self, client):
        act_resp = client.post(
            "/api/v1/playbooks/private-ops-office/activate",
            json={"workspace_id": WORKSPACE_ID},
        )
        activation_id = act_resp.json()["activation"]["id"]

        resp = client.put(
            f"/api/v1/playbooks/activations/{activation_id}/sections/ICP Definition",
            json={"status": "invalid_status"},
        )
        assert resp.status_code == 422
