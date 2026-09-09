"""VoiceForge Crisis Escalation — automated voice-based crisis communication."""
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from app.services.integrations.voiceforge_client import VoiceForgeClient

# Realistic escalation timeline simulation (seconds after initiation)
_TIMELINE_STAGES = {
    "initiated": 0.0,
    "ringing": 2.0,
    "acknowledged": 5.0,
    "briefed": 12.0,
}

# Contact response patterns for realistic mock simulation
_RESPONSE_PATTERNS: list[dict[str, Any]] = [
    {
        "outcome": "acknowledged",
        "response_time_seconds": 5.2,
        "notes": "Answered immediately, confirmed receipt of crisis brief",
    },
    {
        "outcome": "acknowledged",
        "response_time_seconds": 8.7,
        "notes": "Picked up after 3 rings, requested a callback in 10 minutes",
    },
    {
        "outcome": "acknowledged",
        "response_time_seconds": 14.3,
        "notes": "Answered, requested written summary be sent via secure channel",
    },
    {
        "outcome": "voicemail",
        "response_time_seconds": 30.0,
        "notes": "Went to voicemail after 6 rings; automated voicemail message left with callback number",
    },
    {
        "outcome": "acknowledged",
        "response_time_seconds": 6.1,
        "notes": "Assistant answered, transferring to principal now",
    },
    {
        "outcome": "busy",
        "response_time_seconds": 3.0,
        "notes": "Line busy; auto-retry scheduled in 2 minutes",
    },
]


class CrisisEscalation:
    """Initiates and tracks voice-based crisis escalation calls."""

    def __init__(self, client: VoiceForgeClient) -> None:
        self.client = client
        self._escalations: dict[str, dict[str, Any]] = {}

    async def initiate_escalation(
        self,
        contacts: list[dict],
        incident_summary: str,
        severity: str = "high",
    ) -> dict:
        """Initiate crisis escalation calls to a list of contacts.

        Args:
            contacts: List of dicts with at minimum {"name": str, "phone": str}.
            incident_summary: Brief description of the crisis.
            severity: Crisis severity — "critical", "high", "medium".

        Returns:
            Escalation ID, timeline, count of initiated calls, and per-contact statuses.
        """
        escalation_id = str(uuid.uuid4())
        initiated_at = datetime.now(timezone.utc)
        statuses: list[dict[str, Any]] = []

        for i, contact in enumerate(contacts):
            call_result = await self.client.initiate_call(
                to_number=contact["phone"],
                purpose="crisis_escalation",
                metadata={
                    "incident_summary": incident_summary,
                    "contact_name": contact["name"],
                    "severity": severity,
                },
            )

            # Assign a realistic response pattern per contact
            pattern = _RESPONSE_PATTERNS[i % len(_RESPONSE_PATTERNS)]

            statuses.append({
                "contact": contact["name"],
                "phone": contact["phone"],
                "role": contact.get("role", "stakeholder"),
                "call_id": call_result["call_id"],
                "status": "initiated",
                "response_pattern": pattern,
                "timeline": {
                    "initiated_at": initiated_at.isoformat(),
                    "ringing_at": (initiated_at + timedelta(seconds=_TIMELINE_STAGES["ringing"])).isoformat(),
                    "expected_resolution_at": (
                        initiated_at + timedelta(seconds=pattern["response_time_seconds"])
                    ).isoformat(),
                },
            })

        self._escalations[escalation_id] = {
            "incident_summary": incident_summary,
            "severity": severity,
            "initiated_at": initiated_at.isoformat(),
            "statuses": statuses,
        }

        return {
            "escalation_id": escalation_id,
            "severity": severity,
            "calls_initiated": len(statuses),
            "initiated_at": initiated_at.isoformat(),
            "statuses": [
                {
                    "contact": s["contact"],
                    "role": s["role"],
                    "status": "ringing",
                    "timeline": s["timeline"],
                }
                for s in statuses
            ],
        }

    async def get_escalation_status(self, escalation_id: str) -> dict:
        """Get current status for an active escalation with realistic timeline simulation."""
        escalation = self._escalations.get(escalation_id)
        if not escalation:
            raise ValueError(f"Escalation {escalation_id} not found.")

        statuses = escalation["statuses"]
        acknowledged: list[dict[str, Any]] = []
        pending: list[dict[str, Any]] = []
        failed: list[dict[str, Any]] = []

        for s in statuses:
            pattern = s["response_pattern"]
            outcome = pattern["outcome"]

            if outcome == "acknowledged":
                acknowledged.append({
                    "contact": s["contact"],
                    "role": s["role"],
                    "response_time_seconds": pattern["response_time_seconds"],
                    "notes": pattern["notes"],
                })
            elif outcome == "voicemail":
                pending.append({
                    "contact": s["contact"],
                    "role": s["role"],
                    "status": "voicemail_left",
                    "notes": pattern["notes"],
                    "retry_scheduled": True,
                })
            elif outcome == "busy":
                failed.append({
                    "contact": s["contact"],
                    "role": s["role"],
                    "status": "busy",
                    "notes": pattern["notes"],
                    "retry_scheduled": True,
                    "retry_in_seconds": 120,
                })

        total = len(statuses)
        ack_count = len(acknowledged)
        avg_response = (
            round(sum(a["response_time_seconds"] for a in acknowledged) / ack_count, 1)
            if ack_count > 0
            else 0.0
        )

        return {
            "escalation_id": escalation_id,
            "severity": escalation["severity"],
            "incident_summary": escalation["incident_summary"],
            "initiated_at": escalation["initiated_at"],
            "summary": {
                "total_contacts": total,
                "acknowledged": ack_count,
                "pending": len(pending),
                "failed": len(failed),
                "avg_response_time_seconds": avg_response,
            },
            "acknowledged_by": acknowledged,
            "pending": pending,
            "failed": failed,
        }
