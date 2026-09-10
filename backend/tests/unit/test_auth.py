"""Unit tests for authentication: password hashing, JWT, register/login endpoints."""
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_access_token,
    get_password_hash,
    verify_password,
)

# ── Password hashing ────────────────────────────────────────────────

def test_password_hash_and_verify():
    hashed = get_password_hash("mysecretpassword")
    assert hashed != "mysecretpassword"
    assert verify_password("mysecretpassword", hashed)


def test_password_verify_wrong():
    hashed = get_password_hash("correct")
    assert not verify_password("wrong", hashed)


# ── Token creation / decoding ────────────────────────────────────────

def test_create_and_decode_access_token():
    payload = {"sub": "user-123", "role": "admin", "workspace_id": "ws-1"}
    token = create_access_token(payload)
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "user-123"
    assert decoded["role"] == "admin"
    assert decoded["type"] == "access"


def test_create_and_decode_refresh_token():
    payload = {"sub": "user-456", "role": "operator", "workspace_id": "ws-2"}
    token = create_refresh_token(payload)
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["type"] == "refresh"


def test_decode_invalid_token_returns_none():
    assert decode_access_token("not-a-real-jwt") is None


# ── Register endpoint ────────────────────────────────────────────────

def test_register_success(client):
    resp = client.post("/api/v1/auth/register", json={
        "email": "new@example.com",
        "password": "strongpass123",
        "name": "New User",
        "workspace_name": "My Workspace",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


def test_register_duplicate_email(client):
    payload = {
        "email": "dup@example.com",
        "password": "strongpass123",
        "name": "First User",
        "workspace_name": "WS One",
    }
    client.post("/api/v1/auth/register", json=payload)
    resp = client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 409


# ── Login endpoint ───────────────────────────────────────────────────

def test_login_success(client):
    client.post("/api/v1/auth/register", json={
        "email": "login@example.com",
        "password": "strongpass123",
        "name": "Login User",
        "workspace_name": "WS Login",
    })
    resp = client.post("/api/v1/auth/login", json={
        "email": "login@example.com",
        "password": "strongpass123",
    })
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_login_wrong_password(client):
    client.post("/api/v1/auth/register", json={
        "email": "wp@example.com",
        "password": "strongpass123",
        "name": "WP User",
        "workspace_name": "WS WP",
    })
    resp = client.post("/api/v1/auth/login", json={
        "email": "wp@example.com",
        "password": "wrongpassword",
    })
    assert resp.status_code == 401


def test_login_nonexistent_email(client):
    resp = client.post("/api/v1/auth/login", json={
        "email": "noone@example.com",
        "password": "whatever123",
    })
    assert resp.status_code == 401


# ── /me endpoint ─────────────────────────────────────────────────────

def test_me_authenticated(client):
    reg = client.post("/api/v1/auth/register", json={
        "email": "me@example.com",
        "password": "strongpass123",
        "name": "Me User",
        "workspace_name": "WS Me",
    })
    token = reg.json()["access_token"]
    resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == "me@example.com"
    assert resp.json()["role"] == "admin"


def test_me_unauthenticated(client):
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 403  # HTTPBearer returns 403 when header missing
