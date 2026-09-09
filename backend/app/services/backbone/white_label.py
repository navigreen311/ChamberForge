"""WhiteLabelService — manage enterprise white-label branding configuration."""
from __future__ import annotations

import re
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import Session

from app.models.white_label import WhiteLabelConfig

# Valid hex color pattern
_HEX_COLOR = re.compile(r"^#[0-9a-fA-F]{6}$")

# Basic domain validation
_DOMAIN_PATTERN = re.compile(
    r"^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$"
)


class WhiteLabelService:
    """Service for white-label branding configuration per workspace."""

    @staticmethod
    def get_config(db: Session, workspace_id: uuid.UUID) -> WhiteLabelConfig | None:
        """Retrieve the white-label config for a workspace."""
        return (
            db.query(WhiteLabelConfig)
            .filter(WhiteLabelConfig.workspace_id == str(workspace_id))
            .first()
        )

    @staticmethod
    def update_config(
        db: Session,
        workspace_id: uuid.UUID,
        data: dict[str, Any],
    ) -> WhiteLabelConfig:
        """Create or update the white-label config for a workspace.

        Accepts a dict of field names to values. Unknown fields are ignored.
        Validates hex colors and domain format.
        """
        ALLOWED_FIELDS = {
            "brand_name",
            "logo_url",
            "primary_color",
            "secondary_color",
            "favicon_url",
            "custom_domain",
            "email_from_name",
            "email_from_address",
            "portal_footer_text",
            "is_active",
        }

        # Validate colors
        for color_field in ("primary_color", "secondary_color"):
            if color_field in data and data[color_field] is not None:
                if not _HEX_COLOR.match(data[color_field]):
                    raise ValueError(f"Invalid hex color for {color_field}: {data[color_field]}")

        # Validate domain if provided
        if "custom_domain" in data and data["custom_domain"]:
            if not _DOMAIN_PATTERN.match(data["custom_domain"]):
                raise ValueError(f"Invalid domain format: {data['custom_domain']}")

        config = (
            db.query(WhiteLabelConfig)
            .filter(WhiteLabelConfig.workspace_id == str(workspace_id))
            .first()
        )

        if config is None:
            config = WhiteLabelConfig(workspace_id=str(workspace_id))
            db.add(config)

        for key, value in data.items():
            if key in ALLOWED_FIELDS:
                setattr(config, key, value)

        config.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(config)
        return config

    @staticmethod
    def get_portal_branding(db: Session, workspace_id: uuid.UUID) -> dict[str, Any]:
        """Return public-facing branding dict for portal rendering."""
        config = (
            db.query(WhiteLabelConfig)
            .filter(
                WhiteLabelConfig.workspace_id == str(workspace_id),
                WhiteLabelConfig.is_active.is_(True),
            )
            .first()
        )

        if config is None:
            return {
                "brand_name": "ChamberForge",
                "logo_url": None,
                "primary_color": "#fbbf24",
                "secondary_color": "#102a43",
                "footer_text": None,
            }

        return {
            "brand_name": config.brand_name,
            "logo_url": config.logo_url,
            "primary_color": config.primary_color,
            "secondary_color": config.secondary_color,
            "footer_text": config.portal_footer_text,
        }

    @staticmethod
    def validate_custom_domain(domain: str) -> dict[str, Any]:
        """Validate a custom domain and return required DNS records.

        Returns a dict with 'valid' bool and 'dns_records_needed' list.
        """
        if not domain or not _DOMAIN_PATTERN.match(domain):
            return {
                "valid": False,
                "dns_records_needed": [],
                "error": "Invalid domain format",
            }

        return {
            "valid": True,
            "dns_records_needed": [
                {
                    "type": "CNAME",
                    "name": domain,
                    "value": "portal.chamberforge.com",
                    "ttl": 3600,
                },
                {
                    "type": "TXT",
                    "name": f"_chamberforge.{domain}",
                    "value": "chamberforge-verify=pending",
                    "ttl": 3600,
                },
            ],
        }
