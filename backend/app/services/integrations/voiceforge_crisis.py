"""VoiceForge Crisis Escalation - initiating and tracking emergency calls.

P-07. The most dangerous fabrication in the repository, because of what
it was used to decide.

`get_escalation_status` reported which emergency contacts had
**acknowledged** a crisis brief. It determined that from
`_RESPONSE_PATTERNS[i % len(_RESPONSE_PATTERNS)]` - a static table of six
hand-written outcomes, assigned by the contact's position in the list:

    "Answered immediately, confirmed receipt of crisis brief"
    "Picked up after 3 rings, requested a callback in 10 minutes"
    "Went to voicemail after 6 rings"

It never asked the partner what happened. `initiate_call`'s result was
used for its `call_id` and nothing else, so **the acknowledgement status
was invented even with a real API key configured and real calls placed**.

During an actual incident, an operations console would have shown
"Acknowledged: 3 of 4, average response 5.2s" with quoted confirmations,
from a table indexed by list position. A firm could have stood down
believing a principal had been reached.

The table is deleted. This module now reports only what it knows: which
calls were placed, which could not be, and that the outcome of a placed
call is **not yet known**. Acknowledgement requires real call telemetry
from VoiceForge; until that is wired up, `acknowledged` is never claimed.
Under-reporting during a crisis prompts a human to check. Over-reporting
stops them.
"""
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from app.services.integrations.voiceforge_client import VoiceForgeClient

#: Outcome of a placed call, before any telemetry has come back.
OUTCOME_UNKNOWN = "unknown"
#: The call could not be placed at all.
OUTCOME_NOT_PLACED = "not_placed"

_TIMELINE_STAGES = {
    "initiated": 0.0,
    "ringing": 2.0,
    "acknowledged": 5.0,
    "briefed": 12.0,
}

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

            # What actually happened to this call, and nothing more. A
            # degraded client result means no call was placed - which
            # must be visible during an incident, not smoothed over.
            placed = not call_result.get("degraded")
            statuses.append({
                "contact": contact["name"],
                "phone": contact["phone"],
                "role": contact.get("role", "stakeholder"),
                "call_id": call_result.get("call_id"),
                "status": "initiated" if placed else "not_placed",
                "outcome": OUTCOME_UNKNOWN if placed else OUTCOME_NOT_PLACED,
                "failure_detail": (
                    None if placed
                    else call_result.get("degraded_detail", "The call could not be placed.")
                ),
                "timeline": {
                    "initiated_at": initiated_at.isoformat(),
                    # When ringing is expected to begin. There is no
                    # "expected_resolution_at": that was computed from an
                    # invented response time and read as a prediction.
                    "ringing_at": (
                        initiated_at + timedelta(seconds=_TIMELINE_STAGES["ringing"])
                    ).isoformat() if placed else None,
                },
            })

        self._escalations[escalation_id] = {
            "incident_summary": incident_summary,
            "severity": severity,
            "initiated_at": initiated_at.isoformat(),
            "statuses": statuses,
        }

        placed = [s for s in statuses if s["status"] == "initiated"]
        return {
            "escalation_id": escalation_id,
            "severity": severity,
            # The count of calls actually placed. This used to be
            # len(statuses) - every contact, whether or not the call
            # succeeded - reported as `calls_initiated`.
            "calls_initiated": len(placed),
            "calls_not_placed": len(statuses) - len(placed),
            "initiated_at": initiated_at.isoformat(),
            "statuses": [
                {
                    "contact": s["contact"],
                    "role": s["role"],
                    # Not hardcoded to "ringing" any more: a call that
                    # was never placed is not ringing.
                    "status": s["status"],
                    "outcome": s["outcome"],
                    # The operator's handle for chasing this call up, which
                    # matters more than usual when outcomes are unknown.
                    "call_id": s["call_id"],
                    "failure_detail": s["failure_detail"],
                    "timeline": s["timeline"],
                }
                for s in statuses
            ],
        }

    async def get_escalation_status(self, escalation_id: str) -> dict:
        """Current state of an escalation - what is known, and what is not.

        This used to classify each contact as acknowledged, voicemail or
        busy by reading a static table, and report an average response
        time computed from invented seconds. None of it came from the
        partner.

        Acknowledgement needs real call telemetry, which VoiceForge does
        not yet expose to us. Until it does, this reports placement -
        which is genuinely known - and says plainly that outcomes are
        not. A crisis console that under-reports sends someone to check;
        one that over-reports sends them home.
        """
        escalation = self._escalations.get(escalation_id)
        if not escalation:
            raise ValueError(f"Escalation {escalation_id} not found.")

        statuses = escalation["statuses"]
        placed = [s for s in statuses if s["status"] == "initiated"]
        not_placed = [s for s in statuses if s["status"] != "initiated"]

        return {
            "escalation_id": escalation_id,
            "severity": escalation["severity"],
            "incident_summary": escalation["incident_summary"],
            "initiated_at": escalation["initiated_at"],
            "outcomes_known": False,
            "outcomes_note": (
                "Call outcomes are not available. This shows which calls were "
                "placed, not which were answered or acknowledged - confirm "
                "receipt directly."
            ),
            "summary": {
                "total_contacts": len(statuses),
                "calls_placed": len(placed),
                "calls_not_placed": len(not_placed),
                # Deliberately absent: acknowledged, pending, failed and
                # avg_response_time_seconds. Each was derived from the
                # invented outcome table, and a zero or empty value here
                # would read as "nobody acknowledged" rather than "we do
                # not know".
            },
            "contacts": [
                {
                    "contact": s["contact"],
                    "role": s["role"],
                    "status": s["status"],
                    "outcome": s["outcome"],
                    "failure_detail": s["failure_detail"],
                }
                for s in statuses
            ],
        }
