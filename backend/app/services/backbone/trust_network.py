"""TrustNetwork — Gatekeeper persona management and referral path mapping."""

from __future__ import annotations

from enum import Enum
from typing import Any
from uuid import uuid4


class GatekeeperType(str, Enum):
    EXECUTIVE_ASSISTANT = "executive_assistant"
    CFO = "cfo"
    LEGAL = "legal"
    PROCUREMENT = "procurement"
    OPERATIONS = "operations"
    CHAMPION = "champion"
    INFLUENCER = "influencer"
    END_USER = "end_user"


class ReferralStatus(str, Enum):
    IDENTIFIED = "identified"
    APPROACHED = "approached"
    ENGAGED = "engaged"
    ACTIVE = "active"
    DORMANT = "dormant"


class TrustNetwork:
    """Manages gatekeeper personas and referral path mapping for deals."""

    def __init__(self) -> None:
        self._gatekeepers: dict[str, dict] = {}
        self._referral_paths: dict[str, dict] = {}

    def add_gatekeeper(
        self,
        deal_id: str,
        name: str,
        gatekeeper_type: GatekeeperType,
        influence_level: int,
        concerns: list[str] | None = None,
        approach_strategy: str = "",
    ) -> dict:
        """Register a gatekeeper for a deal."""
        gk_id = str(uuid4())
        gatekeeper = {
            "id": gk_id,
            "deal_id": deal_id,
            "name": name,
            "type": gatekeeper_type.value,
            "influence_level": min(max(influence_level, 1), 10),
            "concerns": concerns or [],
            "approach_strategy": approach_strategy,
            "status": "identified",
            "notes": [],
        }
        self._gatekeepers[gk_id] = gatekeeper
        return gatekeeper

    def get_gatekeepers(self, deal_id: str) -> list[dict]:
        """Get all gatekeepers for a deal, sorted by influence."""
        return sorted(
            [g for g in self._gatekeepers.values() if g["deal_id"] == deal_id],
            key=lambda g: g["influence_level"],
            reverse=True,
        )

    def update_gatekeeper_status(self, gk_id: str, status: str, note: str = "") -> dict | None:
        """Update gatekeeper engagement status."""
        gk = self._gatekeepers.get(gk_id)
        if not gk:
            return None
        gk["status"] = status
        if note:
            gk["notes"].append(note)
        return gk

    def add_referral_path(
        self,
        source_contact: str,
        target_contact: str,
        channel: str,
        trust_score: int,
        status: ReferralStatus = ReferralStatus.IDENTIFIED,
    ) -> dict:
        """Map a referral path between contacts."""
        path_id = str(uuid4())
        path = {
            "id": path_id,
            "source_contact": source_contact,
            "target_contact": target_contact,
            "channel": channel,
            "trust_score": min(max(trust_score, 1), 10),
            "status": status.value,
            "interactions": [],
        }
        self._referral_paths[path_id] = path
        return path

    def get_referral_paths(self, contact: str | None = None) -> list[dict]:
        """Get referral paths, optionally filtered by source or target contact."""
        if contact is None:
            return list(self._referral_paths.values())
        return [
            p
            for p in self._referral_paths.values()
            if p["source_contact"] == contact or p["target_contact"] == contact
        ]

    def log_interaction(self, path_id: str, interaction_type: str, notes: str) -> dict | None:
        """Log an interaction on a referral path."""
        path = self._referral_paths.get(path_id)
        if not path:
            return None
        path["interactions"].append({
            "type": interaction_type,
            "notes": notes,
        })
        return path

    def get_trust_map_summary(self, deal_id: str) -> dict:
        """Get a summary of the trust network for a deal."""
        gatekeepers = self.get_gatekeepers(deal_id)
        paths = list(self._referral_paths.values())
        avg_trust = (
            sum(p["trust_score"] for p in paths) / len(paths) if paths else 0
        )
        return {
            "deal_id": deal_id,
            "total_gatekeepers": len(gatekeepers),
            "high_influence_count": sum(1 for g in gatekeepers if g["influence_level"] >= 7),
            "total_referral_paths": len(paths),
            "average_trust_score": round(avg_trust, 1),
            "gatekeepers": gatekeepers,
            "referral_paths": paths,
        }
