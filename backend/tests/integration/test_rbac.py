"""Integration tests for RBAC — verify role-based access control on endpoints."""
import pytest
from tests.conftest import make_auth_header


def test_admin_can_list_users(client, admin_user):
    headers = make_auth_header(admin_user)
    resp = client.get("/api/v1/users/", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert any(u["email"] == "admin@test.com" for u in data)


def test_operator_forbidden_on_list_users(client, operator_user):
    headers = make_auth_header(operator_user)
    resp = client.get("/api/v1/users/", headers=headers)
    assert resp.status_code == 403


def test_viewer_forbidden_on_list_users(client, viewer_user):
    headers = make_auth_header(viewer_user)
    resp = client.get("/api/v1/users/", headers=headers)
    assert resp.status_code == 403


def test_admin_can_update_user(client, admin_user, operator_user):
    headers = make_auth_header(admin_user)
    resp = client.put(
        f"/api/v1/users/{operator_user.id}",
        json={"name": "Updated Operator"},
        headers=headers,
    )
    assert resp.status_code == 200
    assert resp.json()["name"] == "Updated Operator"


def test_operator_forbidden_on_update_user(client, operator_user, viewer_user):
    headers = make_auth_header(operator_user)
    resp = client.put(
        f"/api/v1/users/{viewer_user.id}",
        json={"name": "Nope"},
        headers=headers,
    )
    assert resp.status_code == 403


def test_admin_can_delete_user(client, admin_user, viewer_user):
    headers = make_auth_header(admin_user)
    resp = client.delete(f"/api/v1/users/{viewer_user.id}", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["detail"] == "User deactivated"


def test_viewer_forbidden_on_delete_user(client, viewer_user, operator_user):
    headers = make_auth_header(viewer_user)
    resp = client.delete(f"/api/v1/users/{operator_user.id}", headers=headers)
    assert resp.status_code == 403


def test_operator_can_get_workspace(client, operator_user):
    headers = make_auth_header(operator_user)
    resp = client.get("/api/v1/workspaces/current", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["slug"] == "test-workspace"


def test_operator_forbidden_on_update_workspace(client, operator_user):
    headers = make_auth_header(operator_user)
    resp = client.put(
        "/api/v1/workspaces/current",
        json={"name": "New Name"},
        headers=headers,
    )
    assert resp.status_code == 403


def test_admin_can_update_workspace(client, admin_user):
    headers = make_auth_header(admin_user)
    resp = client.put(
        "/api/v1/workspaces/current",
        json={"name": "Updated WS", "settings": {"theme": "dark"}},
        headers=headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Updated WS"
    assert data["settings"]["theme"] == "dark"
