"""MFA endpoints — setup, verify, disable, status (SOC2 CC6)."""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.services.backbone.mfa_service import MFAService

router = APIRouter(prefix="/api/v1/mfa", tags=["mfa"])


# -- Schemas ------------------------------------------------------------------

class MFASetupResponse(BaseModel):
    secret: str
    provisioning_uri: str
    qr_code_base64: str


class MFACodeRequest(BaseModel):
    code: str = Field(min_length=6, max_length=8, description="6-digit TOTP code")


class MFAEnableResponse(BaseModel):
    enabled: bool
    backup_codes: list[str]


class MFAStatusResponse(BaseModel):
    mfa_enabled: bool


# -- Endpoints ----------------------------------------------------------------

@router.post("/setup", response_model=MFASetupResponse)
def mfa_setup(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate a new TOTP secret and QR code for the current user."""
    result = MFAService.generate_secret(user_id=str(current_user.id), db=db)
    return MFASetupResponse(**result)


@router.post("/verify", response_model=MFAEnableResponse)
def mfa_verify(
    body: MFACodeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Verify TOTP code and enable MFA for the current user."""
    try:
        result = MFAService.enable_mfa(db=db, user_id=str(current_user.id), code=body.code)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return MFAEnableResponse(**result)


@router.post("/disable")
def mfa_disable(
    body: MFACodeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Disable MFA for the current user (requires valid TOTP code)."""
    try:
        MFAService.disable_mfa(db=db, user_id=str(current_user.id), code=body.code)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return {"detail": "MFA disabled"}


@router.get("/status", response_model=MFAStatusResponse)
def mfa_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Check whether MFA is enabled for the current user."""
    enabled = MFAService.is_mfa_enabled(db=db, user_id=str(current_user.id))
    return MFAStatusResponse(mfa_enabled=enabled)
