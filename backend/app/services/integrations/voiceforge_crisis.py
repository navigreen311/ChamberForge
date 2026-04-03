"""VoiceForge Crisis Escalation — automated voice-based crisis communication."""
import uuid
from typing import Any

from app.services.integrations.voiceforge_client import VoiceForgeClient


class CrisisEscalation:
    """Initiates and tracks voice-based crisis escalation calls."""

    def __init__(self, client: VoiceForgeClient) -> None:
        self.client = client
        self._escalations: dict[str, dict[str, Any]] = {}

    async def initiate_escalation(
        self,
        contacts: list[dict],
        incident_summary: str,
    ) -> dict:
        """Initiate crisis escalation calls to a list of contacts.

        Args:
            contacts: List of dicts with at minimum {"name": str, "phone": str}.
            incident_summary: Brief description of the crisis.

        Returns:
            Escalation ID, count of initiated calls, and per-contact statuses.
        """
        escalation_id = str(uuid.uuid4())
        statuses: list[dict[str, str]] = []

        for contact in contacts:
            call_result = await self.client.initiate_call(
                to_number=contact["phone"],
                purpose="crisis_escalation",
                metadata={"incident_summary": incident_summary, "contact_name": contact["name"]},
            )
            statuses.append({
                "contact": contact["name"],
                "phone": contact["phone"],
                "status": "ringing",
                "call_id": call_result["call_id"],
            })

        self._escalations[escalation_id] = {
            "incident_summary": incident_summary,
            "statuses": statuses,
        }

        return {
            "escalation_id": escalation_id,
            "calls_initiated": len(statuses),
            "statuses": [{"contact": s["contact"], "status": s["status"]} for s in statuses],
        }

    async def get_escalation_status(self, escalation_id: str) -> dict:
        """Get current status for an active escalation."""
        escalation = self._escalations.get(escalation_id)
        if not escalation:
            raise ValueError(f"Escalation {escalation_id} not found.")

        # In production, we'd poll VoiceForge for live call statuses.
        # Mock: first contact acknowledged, rest pending.
        statuses = escalation["statuses"]
        acknowledged = [s["contact"] for s in statuses[:1]]
        pending = [s["contact"] for s in statuses[1:]]

        return {
            "escalation_id": escalation_id,
            "acknowledged_by": acknowledged,
            "pending": pending,
            "failed": [],
        }
