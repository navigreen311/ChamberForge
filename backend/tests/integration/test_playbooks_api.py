"""Integration tests for the Playbooks API — list, activate, customize, progress."""
import uuid


class TestListPlaybooks:
    def test_list_all_playbooks(self, authed_client):
        resp = authed_client.get("/api/v1/playbooks/")
        assert resp.status_code == 200
        data = resp.json()
        assert "count" in data
        assert "playbooks" in data
        assert data["count"] == 10
        assert len(data["playbooks"]) == 10

    def test_list_playbooks_have_required_fields(self, authed_client):
        resp = authed_client.get("/api/v1/playbooks/")
        for pb in resp.json()["playbooks"]:
            assert "slug" in pb
            assert "name" in pb
            assert "target_buyer" in pb
            assert "core_pain" in pb


class TestGetPlaybook:
    def test_get_playbook_by_slug(self, authed_client):
        resp = authed_client.get("/api/v1/playbooks/private-ops-office")
        assert resp.status_code == 200
        data = resp.json()
        assert data["slug"] == "private-ops-office"
        assert data["name"] == "Private Ops Office"

    def test_get_nonexistent_playbook(self, authed_client):
        resp = authed_client.get("/api/v1/playbooks/nonexistent-slug")
        assert resp.status_code == 404
        assert "not found" in resp.json()["detail"].lower()


class TestActivatePlaybook:
    def test_activate_playbook(self, authed_client):
        resp = authed_client.post(
            "/api/v1/playbooks/private-ops-office/activate", json={}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["message"] == "Playbook activated"
        assert "activation" in data
        activation = data["activation"]
        assert activation["status"] == "active"
        assert activation["completed_sections"] == 0
        assert activation["total_sections"] == 8

    def test_activate_nonexistent_playbook(self, authed_client):
        resp = authed_client.post(
            "/api/v1/playbooks/no-such-playbook/activate", json={}
        )
        assert resp.status_code == 404

    def test_activate_requires_a_session(self, client):
        """Was `test_activate_missing_workspace`, asserting 422 on a body with
        no `workspace_id`. P-17 removed that field - the workspace comes from
        the session - so the omission it tested is no longer expressible. The
        boundary it stood for is the session check.
        """
        resp = client.post(
            "/api/v1/playbooks/private-ops-office/activate", json={}
        )
        assert resp.status_code in (401, 403)


class TestCustomizePlaybook:
    def test_customize_activated_playbook(self, authed_client):
        # Activate first
        act_resp = authed_client.post(
            "/api/v1/playbooks/private-ops-office/activate", json={}
        )
        activation_id = act_resp.json()["activation"]["id"]

        resp = authed_client.put(
            f"/api/v1/playbooks/activations/{activation_id}/customize",
            json={"overrides": {"branding_color": "#FF0000", "custom_sop": True}},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["message"] == "Customizations applied"
        custom = data["activation"]["customizations"]
        assert custom["branding_color"] == "#FF0000"
        assert custom["custom_sop"] is True

    def test_customize_nonexistent_activation(self, authed_client):
        fake_id = str(uuid.uuid4())
        resp = authed_client.put(
            f"/api/v1/playbooks/activations/{fake_id}/customize",
            json={"overrides": {"key": "value"}},
        )
        assert resp.status_code == 404


class TestPlaybookProgress:
    def test_get_progress(self, authed_client):
        act_resp = authed_client.post(
            "/api/v1/playbooks/private-ops-office/activate", json={}
        )
        activation_id = act_resp.json()["activation"]["id"]

        resp = authed_client.get(
            f"/api/v1/playbooks/activations/{activation_id}/progress"
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["completion_pct"] == 0.0
        assert len(data["sections"]) == 8
        assert data["next_step"] is not None

    def test_update_section_and_check_progress(self, authed_client):
        act_resp = authed_client.post(
            "/api/v1/playbooks/private-ops-office/activate", json={}
        )
        activation_id = act_resp.json()["activation"]["id"]

        # Complete first section
        resp = authed_client.put(
            f"/api/v1/playbooks/activations/{activation_id}/sections/ICP Definition",
            json={"status": "complete"},
        )
        assert resp.status_code == 200
        assert resp.json()["activation"]["completed_sections"] == 1

        # Check progress updated
        prog = authed_client.get(
            f"/api/v1/playbooks/activations/{activation_id}/progress"
        )
        assert prog.json()["completion_pct"] == 12.5  # 1/8 = 12.5%

    def test_get_progress_nonexistent(self, authed_client):
        fake_id = str(uuid.uuid4())
        resp = authed_client.get(
            f"/api/v1/playbooks/activations/{fake_id}/progress"
        )
        assert resp.status_code == 404

    def test_update_invalid_section(self, authed_client):
        act_resp = authed_client.post(
            "/api/v1/playbooks/private-ops-office/activate", json={}
        )
        activation_id = act_resp.json()["activation"]["id"]

        resp = authed_client.put(
            f"/api/v1/playbooks/activations/{activation_id}/sections/Nonexistent Section",
            json={"status": "complete"},
        )
        assert resp.status_code == 404

    def test_update_invalid_status(self, authed_client):
        act_resp = authed_client.post(
            "/api/v1/playbooks/private-ops-office/activate", json={}
        )
        activation_id = act_resp.json()["activation"]["id"]

        resp = authed_client.put(
            f"/api/v1/playbooks/activations/{activation_id}/sections/ICP Definition",
            json={"status": "invalid_status"},
        )
        assert resp.status_code == 422
