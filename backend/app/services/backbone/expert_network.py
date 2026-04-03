"""ExpertNetwork — Directory CRUD and credential verification status tracking."""

from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import uuid4


class VerificationStatus:
    UNVERIFIED = "unverified"
    PENDING = "pending"
    VERIFIED = "verified"
    EXPIRED = "expired"
    REJECTED = "rejected"


class ExpertNetwork:
    """Manages an expert directory with CRUD operations and credential verification."""

    def __init__(self) -> None:
        self._experts: dict[str, dict] = {}

    def add_expert(
        self,
        name: str,
        title: str,
        specializations: list[str],
        credentials: list[dict] | None = None,
        contact_email: str = "",
        bio: str = "",
        hourly_rate: float = 0.0,
    ) -> dict:
        """Add an expert to the directory.

        Args:
            name: Expert name
            title: Professional title
            specializations: Areas of expertise
            credentials: List of dicts with name, issuer, year, verification_status
            contact_email: Contact email
            bio: Short biography
            hourly_rate: Hourly consulting rate
        """
        expert_id = str(uuid4())

        processed_creds = []
        for cred in (credentials or []):
            processed_creds.append({
                "id": str(uuid4()),
                "name": cred.get("name", ""),
                "issuer": cred.get("issuer", ""),
                "year": cred.get("year", ""),
                "verification_status": cred.get("verification_status", VerificationStatus.UNVERIFIED),
                "verified_at": None,
            })

        expert = {
            "id": expert_id,
            "name": name,
            "title": title,
            "specializations": specializations,
            "credentials": processed_creds,
            "contact_email": contact_email,
            "bio": bio,
            "hourly_rate": hourly_rate,
            "status": "active",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }
        self._experts[expert_id] = expert
        return expert

    def get_expert(self, expert_id: str) -> dict | None:
        """Get an expert by ID."""
        return self._experts.get(expert_id)

    def list_experts(
        self,
        specialization: str | None = None,
        verified_only: bool = False,
    ) -> list[dict]:
        """List experts with optional filters.

        Args:
            specialization: Filter by specialization keyword
            verified_only: Only show experts with at least one verified credential
        """
        experts = list(self._experts.values())

        if specialization:
            spec_lower = specialization.lower()
            experts = [
                e for e in experts
                if any(spec_lower in s.lower() for s in e["specializations"])
            ]

        if verified_only:
            experts = [
                e for e in experts
                if any(c["verification_status"] == VerificationStatus.VERIFIED for c in e["credentials"])
            ]

        return sorted(experts, key=lambda e: e["name"])

    def update_expert(self, expert_id: str, **kwargs: Any) -> dict | None:
        """Update expert fields."""
        expert = self._experts.get(expert_id)
        if not expert:
            return None

        allowed_fields = {"name", "title", "specializations", "contact_email", "bio", "hourly_rate", "status"}
        for key, value in kwargs.items():
            if key in allowed_fields:
                expert[key] = value
        expert["updated_at"] = datetime.utcnow().isoformat()
        return expert

    def remove_expert(self, expert_id: str) -> bool:
        """Remove an expert from the directory."""
        if expert_id in self._experts:
            del self._experts[expert_id]
            return True
        return False

    def update_credential_status(
        self,
        expert_id: str,
        credential_id: str,
        status: str,
    ) -> dict | None:
        """Update the verification status of a credential.

        Args:
            expert_id: Expert ID
            credential_id: Credential ID
            status: New verification status
        """
        expert = self._experts.get(expert_id)
        if not expert:
            return None

        for cred in expert["credentials"]:
            if cred["id"] == credential_id:
                cred["verification_status"] = status
                if status == VerificationStatus.VERIFIED:
                    cred["verified_at"] = datetime.utcnow().isoformat()
                expert["updated_at"] = datetime.utcnow().isoformat()
                return cred
        return None

    def add_credential(
        self,
        expert_id: str,
        name: str,
        issuer: str,
        year: str = "",
    ) -> dict | None:
        """Add a new credential to an expert."""
        expert = self._experts.get(expert_id)
        if not expert:
            return None

        cred = {
            "id": str(uuid4()),
            "name": name,
            "issuer": issuer,
            "year": year,
            "verification_status": VerificationStatus.UNVERIFIED,
            "verified_at": None,
        }
        expert["credentials"].append(cred)
        expert["updated_at"] = datetime.utcnow().isoformat()
        return cred

    def search_experts(self, query: str) -> list[dict]:
        """Search experts by name, title, or specialization."""
        q = query.lower()
        return [
            e for e in self._experts.values()
            if q in e["name"].lower()
            or q in e["title"].lower()
            or any(q in s.lower() for s in e["specializations"])
            or q in e.get("bio", "").lower()
        ]

    def get_verification_summary(self) -> dict:
        """Get a summary of credential verification statuses across all experts."""
        total_creds = 0
        by_status: dict[str, int] = {}
        experts_with_verified = 0

        for expert in self._experts.values():
            has_verified = False
            for cred in expert["credentials"]:
                total_creds += 1
                status = cred["verification_status"]
                by_status[status] = by_status.get(status, 0) + 1
                if status == VerificationStatus.VERIFIED:
                    has_verified = True
            if has_verified:
                experts_with_verified += 1

        return {
            "total_experts": len(self._experts),
            "experts_with_verified_credentials": experts_with_verified,
            "total_credentials": total_creds,
            "by_status": by_status,
        }
