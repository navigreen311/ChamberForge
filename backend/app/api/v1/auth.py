"""Authentication endpoints — register, login, refresh, me, logout."""
import re
import uuid
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.exceptions import AuthenticationError, ConflictError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_access_token,
    get_password_hash,
    verify_password,
)
from app.db.session import get_db
from app.models.user import User
from app.models.workspace import Workspace
from app.schemas.auth import (
    LoginRequest,
    MFARequiredResponse,
    MFAVerifyRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.services.backbone.mfa_service import MFAService

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


def _slugify(name: str) -> str:
    """Turn a workspace name into a URL-safe slug."""
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return slug or "workspace"


def _build_token_payload(user: User) -> dict:
    return {
        "sub": str(user.id),
        "workspace_id": str(user.workspace_id) if user.workspace_id else None,
        "role": user.role,
    }


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    """Create a new workspace and its owner (admin) user."""
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise ConflictError("Email already registered", resource="User")

    # Create workspace
    base_slug = _slugify(body.workspace_name)
    slug = base_slug
    counter = 1
    while db.query(Workspace).filter(Workspace.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    workspace = Workspace(
        id=str(uuid.uuid4()),
        name=body.workspace_name,
        slug=slug,
        plan="core",
        settings={},
    )
    db.add(workspace)
    db.flush()

    # Create user as workspace owner / admin
    user = User(
        id=str(uuid.uuid4()),
        email=body.email,
        name=body.name,
        hashed_password=get_password_hash(body.password),
        role="admin",
        workspace_id=workspace.id,
    )
    db.add(user)

    # Link owner back
    workspace.owner_id = user.id
    db.commit()
    db.refresh(user)

    # Enqueue onboarding drip sequence
    from app.jobs.tasks.drip_tasks import enqueue_onboarding
    enqueue_onboarding.delay(str(user.id))

    payload = _build_token_payload(user)
    return TokenResponse(
        access_token=create_access_token(payload),
        refresh_token=create_refresh_token(payload),
    )


@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate via email + password and return tokens (or MFA challenge)."""
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise AuthenticationError("Invalid email or password")
    if not user.is_active:
        raise AuthenticationError("Account deactivated")

    # If MFA is enabled, return a short-lived MFA token instead of full tokens
    if MFAService.is_mfa_enabled(db=db, user_id=str(user.id)):
        mfa_payload = {
            "sub": str(user.id),
            "purpose": "mfa_challenge",
        }
        mfa_token = create_access_token(mfa_payload, expires_delta=timedelta(minutes=5))
        return MFARequiredResponse(requires_mfa=True, mfa_token=mfa_token)

    payload = _build_token_payload(user)
    return TokenResponse(
        access_token=create_access_token(payload),
        refresh_token=create_refresh_token(payload),
    )


@router.post("/mfa-verify", response_model=TokenResponse)
def mfa_verify(body: MFAVerifyRequest, db: Session = Depends(get_db)):
    """Complete login by verifying TOTP code after MFA challenge."""
    payload = decode_access_token(body.mfa_token)
    if payload is None or payload.get("purpose") != "mfa_challenge":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired MFA token",
        )

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    # Try TOTP code first, then backup code
    if not MFAService.verify_totp(user_id=str(user.id), code=body.totp_code, db=db):
        if not MFAService.verify_backup_code(db=db, user_id=str(user.id), code=body.totp_code):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid TOTP or backup code",
            )

    token_payload = _build_token_payload(user)
    return TokenResponse(
        access_token=create_access_token(token_payload),
        refresh_token=create_refresh_token(token_payload),
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh(body: RefreshRequest, db: Session = Depends(get_db)):
    """Exchange a valid refresh token for a new access token."""
    payload = decode_access_token(body.refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise AuthenticationError("Invalid refresh token")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise AuthenticationError("User not found or inactive")

    new_payload = _build_token_payload(user)
    return TokenResponse(
        access_token=create_access_token(new_payload),
        refresh_token=create_refresh_token(new_payload),
    )


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user."""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        name=current_user.name,
        role=current_user.role,
        workspace_id=str(current_user.workspace_id) if current_user.workspace_id else None,
        is_active=current_user.is_active,
    )


@router.post("/logout")
def logout():
    """Logout endpoint. Token invalidation is handled client-side."""
    return {"message": "Successfully logged out"}
