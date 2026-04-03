"""MFA service — TOTP secret generation, verification, backup codes (SOC2 CC6)."""
import base64
import io
import secrets
from datetime import datetime, timezone

import pyotp
import qrcode
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.user_mfa import MFAConfig

APP_NAME = "ChamberForge"


class MFAService:
    """Stateless service for TOTP multi-factor authentication."""

    @staticmethod
    def generate_secret(user_id: str, db: Session) -> dict:
        """Generate a new TOTP secret, provisioning URI, and QR code for the user.

        If a config already exists (but not yet enabled), it is replaced.
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")

        secret = pyotp.random_base32()
        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(name=user.email, issuer_name=APP_NAME)

        # Generate QR code as base64 PNG
        img = qrcode.make(provisioning_uri)
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        qr_base64 = base64.b64encode(buf.getvalue()).decode("utf-8")

        # Upsert MFA config (not yet enabled)
        config = db.query(MFAConfig).filter(MFAConfig.user_id == user_id).first()
        if config:
            config.secret = secret
            config.is_enabled = False
            config.backup_codes = []
            config.verified_at = None
        else:
            config = MFAConfig(
                user_id=user_id,
                secret=secret,
                is_enabled=False,
                backup_codes=[],
            )
            db.add(config)
        db.commit()

        return {
            "secret": secret,
            "provisioning_uri": provisioning_uri,
            "qr_code_base64": qr_base64,
        }

    @staticmethod
    def verify_totp(user_id: str, code: str, db: Session) -> bool:
        """Verify a 6-digit TOTP code against the user's stored secret."""
        config = db.query(MFAConfig).filter(MFAConfig.user_id == user_id).first()
        if not config:
            return False
        totp = pyotp.TOTP(config.secret)
        return totp.verify(code, valid_window=1)

    @staticmethod
    def _generate_backup_codes(count: int = 8) -> list[str]:
        """Generate a list of single-use backup codes."""
        return [secrets.token_hex(4).upper() for _ in range(count)]

    @staticmethod
    def enable_mfa(db: Session, user_id: str, code: str) -> dict:
        """Verify the TOTP code and enable MFA, generating backup codes."""
        config = db.query(MFAConfig).filter(MFAConfig.user_id == user_id).first()
        if not config:
            raise ValueError("MFA not set up — call /setup first")

        totp = pyotp.TOTP(config.secret)
        if not totp.verify(code, valid_window=1):
            raise ValueError("Invalid TOTP code")

        backup_codes = MFAService._generate_backup_codes()
        config.is_enabled = True
        config.verified_at = datetime.now(timezone.utc)
        config.backup_codes = backup_codes
        db.commit()

        return {
            "enabled": True,
            "backup_codes": backup_codes,
        }

    @staticmethod
    def disable_mfa(db: Session, user_id: str, code: str) -> bool:
        """Verify the TOTP code and disable MFA."""
        config = db.query(MFAConfig).filter(MFAConfig.user_id == user_id).first()
        if not config or not config.is_enabled:
            raise ValueError("MFA is not enabled")

        totp = pyotp.TOTP(config.secret)
        if not totp.verify(code, valid_window=1):
            raise ValueError("Invalid TOTP code")

        config.is_enabled = False
        config.backup_codes = []
        config.verified_at = None
        db.commit()
        return True

    @staticmethod
    def verify_backup_code(db: Session, user_id: str, code: str) -> bool:
        """Verify and consume a single-use backup code."""
        config = db.query(MFAConfig).filter(MFAConfig.user_id == user_id).first()
        if not config or not config.is_enabled:
            return False

        normalised = code.strip().upper()
        codes: list[str] = list(config.backup_codes or [])
        if normalised not in codes:
            return False

        codes.remove(normalised)
        config.backup_codes = codes
        db.commit()
        return True

    @staticmethod
    def is_mfa_enabled(db: Session, user_id: str) -> bool:
        """Check whether MFA is enabled for the given user."""
        config = db.query(MFAConfig).filter(MFAConfig.user_id == user_id).first()
        return bool(config and config.is_enabled)
