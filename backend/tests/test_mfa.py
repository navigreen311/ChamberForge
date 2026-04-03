"""Tests for MFA (TOTP) authentication — SOC2 CC6 compliance."""
import uuid
from unittest.mock import patch

import pyotp
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import create_access_token, get_password_hash
from app.db.session import Base, get_db
from app.main import app
from app.models.user import User
from app.models.user_mfa import MFAConfig
from app.models.workspace import Workspace
from app.services.backbone.mfa_service import MFAService

# Re-use conftest's UUID patch (imported at module level via conftest.py)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture()
def mfa_db():
    """Isolated in-memory DB for MFA tests."""
    eng = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=eng)
    Session = sessionmaker(bind=eng)
    session = Session()
    yield session
    session.close()


@pytest.fixture()
def mfa_user(mfa_db):
    """Create a user for MFA tests."""
    ws = Workspace(
        id=str(uuid.uuid4()),
        name="MFA Test WS",
        slug="mfa-test-ws",
        plan="core",
        settings={},
    )
    mfa_db.add(ws)
    mfa_db.flush()

    user = User(
        id=str(uuid.uuid4()),
        email="mfa@test.com",
        name="MFA User",
        hashed_password=get_password_hash("Test1234!"),
        role="admin",
        workspace_id=ws.id,
    )
    mfa_db.add(user)
    ws.owner_id = user.id
    mfa_db.commit()
    mfa_db.refresh(user)
    return user


@pytest.fixture()
def mfa_client(mfa_db):
    """TestClient wired to the MFA test DB."""
    def override():
        yield mfa_db

    app.dependency_overrides[get_db] = override
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def _auth_header(user) -> dict:
    payload = {
        "sub": str(user.id),
        "workspace_id": str(user.workspace_id) if user.workspace_id else None,
        "role": user.role,
    }
    token = create_access_token(payload)
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------------------
# Unit tests — MFAService
# ---------------------------------------------------------------------------

class TestMFAServiceGenerateSecret:
    def test_generates_secret_and_qr(self, mfa_db, mfa_user):
        result = MFAService.generate_secret(user_id=str(mfa_user.id), db=mfa_db)
        assert "secret" in result
        assert "provisioning_uri" in result
        assert "qr_code_base64" in result
        assert len(result["secret"]) > 0
        assert "otpauth://" in result["provisioning_uri"]

    def test_replaces_existing_unenabled_config(self, mfa_db, mfa_user):
        r1 = MFAService.generate_secret(user_id=str(mfa_user.id), db=mfa_db)
        r2 = MFAService.generate_secret(user_id=str(mfa_user.id), db=mfa_db)
        # Secret should change on re-setup
        assert r1["secret"] != r2["secret"]
        # Only one config row should exist
        configs = mfa_db.query(MFAConfig).filter(MFAConfig.user_id == str(mfa_user.id)).all()
        assert len(configs) == 1


class TestMFAServiceVerifyTOTP:
    def test_valid_code_returns_true(self, mfa_db, mfa_user):
        result = MFAService.generate_secret(user_id=str(mfa_user.id), db=mfa_db)
        totp = pyotp.TOTP(result["secret"])
        code = totp.now()
        assert MFAService.verify_totp(user_id=str(mfa_user.id), code=code, db=mfa_db) is True

    def test_invalid_code_returns_false(self, mfa_db, mfa_user):
        MFAService.generate_secret(user_id=str(mfa_user.id), db=mfa_db)
        assert MFAService.verify_totp(user_id=str(mfa_user.id), code="000000", db=mfa_db) is False

    def test_no_config_returns_false(self, mfa_db, mfa_user):
        assert MFAService.verify_totp(user_id=str(mfa_user.id), code="123456", db=mfa_db) is False


class TestMFAServiceEnableDisable:
    def test_enable_mfa_with_valid_code(self, mfa_db, mfa_user):
        result = MFAService.generate_secret(user_id=str(mfa_user.id), db=mfa_db)
        totp = pyotp.TOTP(result["secret"])
        code = totp.now()
        enable_result = MFAService.enable_mfa(db=mfa_db, user_id=str(mfa_user.id), code=code)
        assert enable_result["enabled"] is True
        assert len(enable_result["backup_codes"]) == 8
        assert MFAService.is_mfa_enabled(db=mfa_db, user_id=str(mfa_user.id)) is True

    def test_enable_mfa_invalid_code_raises(self, mfa_db, mfa_user):
        MFAService.generate_secret(user_id=str(mfa_user.id), db=mfa_db)
        with pytest.raises(ValueError, match="Invalid TOTP"):
            MFAService.enable_mfa(db=mfa_db, user_id=str(mfa_user.id), code="000000")

    def test_disable_mfa_with_valid_code(self, mfa_db, mfa_user):
        result = MFAService.generate_secret(user_id=str(mfa_user.id), db=mfa_db)
        totp = pyotp.TOTP(result["secret"])
        MFAService.enable_mfa(db=mfa_db, user_id=str(mfa_user.id), code=totp.now())
        assert MFAService.is_mfa_enabled(db=mfa_db, user_id=str(mfa_user.id)) is True

        MFAService.disable_mfa(db=mfa_db, user_id=str(mfa_user.id), code=totp.now())
        assert MFAService.is_mfa_enabled(db=mfa_db, user_id=str(mfa_user.id)) is False

    def test_disable_mfa_invalid_code_raises(self, mfa_db, mfa_user):
        result = MFAService.generate_secret(user_id=str(mfa_user.id), db=mfa_db)
        totp = pyotp.TOTP(result["secret"])
        MFAService.enable_mfa(db=mfa_db, user_id=str(mfa_user.id), code=totp.now())
        with pytest.raises(ValueError, match="Invalid TOTP"):
            MFAService.disable_mfa(db=mfa_db, user_id=str(mfa_user.id), code="000000")


class TestMFAServiceBackupCodes:
    def test_backup_code_works_once(self, mfa_db, mfa_user):
        result = MFAService.generate_secret(user_id=str(mfa_user.id), db=mfa_db)
        totp = pyotp.TOTP(result["secret"])
        enable_result = MFAService.enable_mfa(db=mfa_db, user_id=str(mfa_user.id), code=totp.now())
        backup = enable_result["backup_codes"][0]

        # First use succeeds
        assert MFAService.verify_backup_code(db=mfa_db, user_id=str(mfa_user.id), code=backup) is True
        # Second use fails (consumed)
        assert MFAService.verify_backup_code(db=mfa_db, user_id=str(mfa_user.id), code=backup) is False

    def test_invalid_backup_code_fails(self, mfa_db, mfa_user):
        result = MFAService.generate_secret(user_id=str(mfa_user.id), db=mfa_db)
        totp = pyotp.TOTP(result["secret"])
        MFAService.enable_mfa(db=mfa_db, user_id=str(mfa_user.id), code=totp.now())
        assert MFAService.verify_backup_code(db=mfa_db, user_id=str(mfa_user.id), code="INVALID") is False


# ---------------------------------------------------------------------------
# API integration tests
# ---------------------------------------------------------------------------

class TestMFAAPISetup:
    def test_setup_returns_qr_and_secret(self, mfa_client, mfa_user):
        resp = mfa_client.post("/api/v1/mfa/setup", headers=_auth_header(mfa_user))
        assert resp.status_code == 200
        data = resp.json()
        assert "secret" in data
        assert "qr_code_base64" in data
        assert "provisioning_uri" in data

    def test_setup_requires_auth(self, mfa_client):
        resp = mfa_client.post("/api/v1/mfa/setup")
        assert resp.status_code == 403


class TestMFAAPIVerify:
    def test_verify_enables_mfa(self, mfa_client, mfa_user):
        headers = _auth_header(mfa_user)
        setup_resp = mfa_client.post("/api/v1/mfa/setup", headers=headers)
        secret = setup_resp.json()["secret"]
        totp = pyotp.TOTP(secret)

        resp = mfa_client.post(
            "/api/v1/mfa/verify",
            json={"code": totp.now()},
            headers=headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["enabled"] is True
        assert len(data["backup_codes"]) == 8


class TestMFAAPIDisable:
    def test_disable_mfa(self, mfa_client, mfa_user):
        headers = _auth_header(mfa_user)
        setup_resp = mfa_client.post("/api/v1/mfa/setup", headers=headers)
        secret = setup_resp.json()["secret"]
        totp = pyotp.TOTP(secret)

        # Enable
        mfa_client.post("/api/v1/mfa/verify", json={"code": totp.now()}, headers=headers)

        # Disable
        resp = mfa_client.post(
            "/api/v1/mfa/disable",
            json={"code": totp.now()},
            headers=headers,
        )
        assert resp.status_code == 200

        # Status should be disabled
        status_resp = mfa_client.get("/api/v1/mfa/status", headers=headers)
        assert status_resp.json()["mfa_enabled"] is False


class TestMFAAPIStatus:
    def test_status_false_by_default(self, mfa_client, mfa_user):
        resp = mfa_client.get("/api/v1/mfa/status", headers=_auth_header(mfa_user))
        assert resp.status_code == 200
        assert resp.json()["mfa_enabled"] is False


# ---------------------------------------------------------------------------
# Login with MFA flow
# ---------------------------------------------------------------------------

class TestLoginWithMFA:
    def test_login_returns_mfa_challenge_when_enabled(self, mfa_client, mfa_user, mfa_db):
        # Enable MFA directly via service
        result = MFAService.generate_secret(user_id=str(mfa_user.id), db=mfa_db)
        totp = pyotp.TOTP(result["secret"])
        MFAService.enable_mfa(db=mfa_db, user_id=str(mfa_user.id), code=totp.now())

        # Login should now require MFA
        login_resp = mfa_client.post(
            "/api/v1/auth/login",
            json={"email": "mfa@test.com", "password": "Test1234!"},
        )
        assert login_resp.status_code == 200
        data = login_resp.json()
        assert data["requires_mfa"] is True
        assert "mfa_token" in data

    def test_mfa_verify_completes_login(self, mfa_client, mfa_user, mfa_db):
        headers = _auth_header(mfa_user)

        # Enable MFA directly via service to avoid TOTP window conflicts
        result = MFAService.generate_secret(user_id=str(mfa_user.id), db=mfa_db)
        totp = pyotp.TOTP(result["secret"])
        MFAService.enable_mfa(db=mfa_db, user_id=str(mfa_user.id), code=totp.now())

        # Login -> MFA challenge
        login_resp = mfa_client.post(
            "/api/v1/auth/login",
            json={"email": "mfa@test.com", "password": "Test1234!"},
        )
        mfa_token = login_resp.json()["mfa_token"]

        # Complete with TOTP (patch to avoid time-window issues in fast tests)
        with patch.object(pyotp.TOTP, "verify", return_value=True):
            verify_resp = mfa_client.post(
                "/api/v1/auth/mfa-verify",
                json={"mfa_token": mfa_token, "totp_code": "123456"},
            )
        assert verify_resp.status_code == 200
        data = verify_resp.json()
        assert "access_token" in data
        assert "refresh_token" in data

    def test_mfa_verify_with_backup_code(self, mfa_client, mfa_user, mfa_db):
        headers = _auth_header(mfa_user)

        # Enable MFA directly via service
        result = MFAService.generate_secret(user_id=str(mfa_user.id), db=mfa_db)
        totp = pyotp.TOTP(result["secret"])
        enable_result = MFAService.enable_mfa(db=mfa_db, user_id=str(mfa_user.id), code=totp.now())
        backup_code = enable_result["backup_codes"][0]

        # Login -> MFA challenge
        login_resp = mfa_client.post(
            "/api/v1/auth/login",
            json={"email": "mfa@test.com", "password": "Test1234!"},
        )
        mfa_token = login_resp.json()["mfa_token"]

        # Complete with backup code
        verify_resp = mfa_client.post(
            "/api/v1/auth/mfa-verify",
            json={"mfa_token": mfa_token, "totp_code": backup_code},
        )
        assert verify_resp.status_code == 200
        assert "access_token" in verify_resp.json()

    def test_mfa_verify_invalid_code_fails(self, mfa_client, mfa_user, mfa_db):
        # Enable MFA directly via service
        result = MFAService.generate_secret(user_id=str(mfa_user.id), db=mfa_db)
        totp = pyotp.TOTP(result["secret"])
        MFAService.enable_mfa(db=mfa_db, user_id=str(mfa_user.id), code=totp.now())

        # Login -> MFA challenge
        login_resp = mfa_client.post(
            "/api/v1/auth/login",
            json={"email": "mfa@test.com", "password": "Test1234!"},
        )
        mfa_token = login_resp.json()["mfa_token"]

        # Wrong code
        verify_resp = mfa_client.post(
            "/api/v1/auth/mfa-verify",
            json={"mfa_token": mfa_token, "totp_code": "000000"},
        )
        assert verify_resp.status_code == 401
