"""DecisionRoom — Stakeholder mapping and multi-party approval tracking."""

from __future__ import annotations

from datetime import datetime
from uuid import uuid4


class ApprovalStatus:
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    DEFERRED = "deferred"
    ABSTAINED = "abstained"


class DecisionRoom:
    """Manages stakeholder maps and multi-party approval workflows for deals."""

    def __init__(self) -> None:
        self._deals: dict[str, dict] = {}

    def create_deal(self, deal_name: str, description: str = "", required_approvals: int = 0) -> dict:
        """Create a deal with a decision room."""
        deal_id = str(uuid4())
        deal = {
            "id": deal_id,
            "name": deal_name,
            "description": description,
            "stakeholders": [],
            "required_approvals": required_approvals,
            "status": "open",
            "created_at": datetime.utcnow().isoformat(),
            "decision_log": [],
        }
        self._deals[deal_id] = deal
        return deal

    def add_stakeholder(
        self,
        deal_id: str,
        name: str,
        role: str,
        influence: str = "medium",
        stance: str = "neutral",
        must_approve: bool = False,
    ) -> dict | None:
        """Add a stakeholder to the deal's decision room.

        Args:
            deal_id: Deal ID
            name: Stakeholder name
            role: Their role in the organization
            influence: 'high', 'medium', or 'low'
            stance: 'champion', 'supportive', 'neutral', 'skeptical', 'blocker'
            must_approve: Whether their approval is mandatory
        """
        deal = self._deals.get(deal_id)
        if not deal:
            return None

        stakeholder_id = str(uuid4())
        stakeholder = {
            "id": stakeholder_id,
            "name": name,
            "role": role,
            "influence": influence,
            "stance": stance,
            "must_approve": must_approve,
            "approval_status": ApprovalStatus.PENDING,
            "notes": [],
            "last_interaction": None,
        }
        deal["stakeholders"].append(stakeholder)
        return stakeholder

    def update_approval(
        self,
        deal_id: str,
        stakeholder_id: str,
        status: str,
        notes: str = "",
    ) -> dict | None:
        """Update a stakeholder's approval status."""
        deal = self._deals.get(deal_id)
        if not deal:
            return None

        for sh in deal["stakeholders"]:
            if sh["id"] == stakeholder_id:
                sh["approval_status"] = status
                sh["last_interaction"] = datetime.utcnow().isoformat()
                if notes:
                    sh["notes"].append({"text": notes, "timestamp": datetime.utcnow().isoformat()})

                deal["decision_log"].append({
                    "stakeholder": sh["name"],
                    "action": status,
                    "notes": notes,
                    "timestamp": datetime.utcnow().isoformat(),
                })

                self._check_deal_status(deal)
                return deal
        return None

    def _check_deal_status(self, deal: dict) -> None:
        """Check if the deal has reached a decision."""
        stakeholders = deal["stakeholders"]
        if not stakeholders:
            return

        # Check mandatory approvers
        must_approve = [s for s in stakeholders if s["must_approve"]]
        if must_approve:
            if any(s["approval_status"] == ApprovalStatus.REJECTED for s in must_approve):
                deal["status"] = "blocked"
                return
            if all(s["approval_status"] == ApprovalStatus.APPROVED for s in must_approve):
                # All mandatory approved — check required count
                approved_count = sum(
                    1 for s in stakeholders if s["approval_status"] == ApprovalStatus.APPROVED
                )
                required = deal["required_approvals"] or len(stakeholders)
                if approved_count >= required:
                    deal["status"] = "approved"
                    return

        # Check by count
        approved_count = sum(
            1 for s in stakeholders if s["approval_status"] == ApprovalStatus.APPROVED
        )
        rejected_count = sum(
            1 for s in stakeholders if s["approval_status"] == ApprovalStatus.REJECTED
        )
        required = deal["required_approvals"] or len(stakeholders)

        if approved_count >= required:
            deal["status"] = "approved"
        elif rejected_count > len(stakeholders) - required:
            deal["status"] = "rejected"

    def get_deal(self, deal_id: str) -> dict | None:
        return self._deals.get(deal_id)

    def get_stakeholder_map(self, deal_id: str) -> dict | None:
        """Get a structured view of the stakeholder map."""
        deal = self._deals.get(deal_id)
        if not deal:
            return None

        by_stance: dict[str, list] = {}
        for sh in deal["stakeholders"]:
            stance = sh["stance"]
            if stance not in by_stance:
                by_stance[stance] = []
            by_stance[stance].append(sh)

        approved = sum(1 for s in deal["stakeholders"] if s["approval_status"] == ApprovalStatus.APPROVED)
        total = len(deal["stakeholders"])

        return {
            "deal_id": deal_id,
            "deal_name": deal["name"],
            "deal_status": deal["status"],
            "total_stakeholders": total,
            "approval_progress": f"{approved}/{total}",
            "by_stance": by_stance,
            "blockers": [s for s in deal["stakeholders"] if s["stance"] == "blocker"],
            "champions": [s for s in deal["stakeholders"] if s["stance"] == "champion"],
            "decision_log": deal["decision_log"],
        }
