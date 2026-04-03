"""ClientOnboarding — 90-day onboarding plans and welcome protocols."""

from __future__ import annotations

from datetime import datetime, timedelta
from uuid import uuid4


class ClientOnboarding:
    """Manages client onboarding with 90-day plans and welcome protocols."""

    def __init__(self) -> None:
        self._plans: dict[str, dict] = {}

    def create_90_day_plan(
        self,
        client_name: str,
        service_type: str,
        start_date: str | None = None,
        custom_milestones: list[dict] | None = None,
    ) -> dict:
        """Create a 90-day onboarding plan for a new client.

        Args:
            client_name: Client name
            service_type: Type of service being onboarded
            start_date: Start date (ISO format). Defaults to today.
            custom_milestones: Optional custom milestones to add

        Returns:
            Plan dict with phases, milestones, and checklist
        """
        plan_id = str(uuid4())
        start = datetime.fromisoformat(start_date) if start_date else datetime.utcnow()

        phases = [
            {
                "phase": "Foundation",
                "days": "1-30",
                "start": start.isoformat(),
                "end": (start + timedelta(days=30)).isoformat(),
                "objectives": [
                    "Complete kickoff call and expectations alignment",
                    "Gather all required data and access credentials",
                    "Deliver initial audit/assessment",
                    "Set up communication cadence",
                    "Assign dedicated team members",
                ],
                "milestones": [
                    {"day": 1, "task": "Welcome call + gift delivery", "status": "pending"},
                    {"day": 3, "task": "Send onboarding questionnaire", "status": "pending"},
                    {"day": 7, "task": "Kickoff strategy session", "status": "pending"},
                    {"day": 14, "task": "Deliver initial audit results", "status": "pending"},
                    {"day": 21, "task": "First progress check-in", "status": "pending"},
                    {"day": 30, "task": "Phase 1 review + Phase 2 planning", "status": "pending"},
                ],
            },
            {
                "phase": "Acceleration",
                "days": "31-60",
                "start": (start + timedelta(days=31)).isoformat(),
                "end": (start + timedelta(days=60)).isoformat(),
                "objectives": [
                    "Implement primary strategies",
                    "Deliver first measurable results",
                    "Optimize based on initial data",
                    "Expand stakeholder engagement",
                ],
                "milestones": [
                    {"day": 35, "task": "Strategy implementation kickoff", "status": "pending"},
                    {"day": 42, "task": "Mid-phase progress review", "status": "pending"},
                    {"day": 50, "task": "First results presentation", "status": "pending"},
                    {"day": 60, "task": "Phase 2 review + optimization plan", "status": "pending"},
                ],
            },
            {
                "phase": "Optimization",
                "days": "61-90",
                "start": (start + timedelta(days=61)).isoformat(),
                "end": (start + timedelta(days=90)).isoformat(),
                "objectives": [
                    "Refine strategies based on results",
                    "Deliver comprehensive results report",
                    "Plan ongoing engagement model",
                    "Collect feedback and testimonial",
                    "Transition to steady-state operations",
                ],
                "milestones": [
                    {"day": 65, "task": "Optimization sprint begins", "status": "pending"},
                    {"day": 75, "task": "Comprehensive results review", "status": "pending"},
                    {"day": 85, "task": "Transition planning session", "status": "pending"},
                    {"day": 90, "task": "90-day retrospective + renewal discussion", "status": "pending"},
                ],
            },
        ]

        # Add custom milestones
        if custom_milestones:
            for cm in custom_milestones:
                day = cm.get("day", 45)
                for phase in phases:
                    phase_start = int(phase["days"].split("-")[0])
                    phase_end = int(phase["days"].split("-")[1])
                    if phase_start <= day <= phase_end:
                        phase["milestones"].append({
                            "day": day,
                            "task": cm.get("task", "Custom milestone"),
                            "status": "pending",
                        })
                        phase["milestones"].sort(key=lambda m: m["day"])
                        break

        plan = {
            "id": plan_id,
            "client_name": client_name,
            "service_type": service_type,
            "start_date": start.isoformat(),
            "end_date": (start + timedelta(days=90)).isoformat(),
            "phases": phases,
            "status": "active",
            "completion_pct": 0.0,
        }
        self._plans[plan_id] = plan
        return plan

    def generate_welcome_protocol(self, client_name: str, service_type: str, vip: bool = False) -> dict:
        """Generate a welcome protocol for a new client.

        Args:
            client_name: Client name
            service_type: Service they purchased
            vip: Whether this is a VIP/premium client

        Returns:
            Welcome protocol with communications, gifts, and touchpoints
        """
        base_protocol = {
            "client_name": client_name,
            "service_type": service_type,
            "vip": vip,
            "immediate_actions": [
                {
                    "action": "Send welcome email",
                    "timing": "Within 1 hour of signing",
                    "template": f"Welcome to {service_type}, {client_name}! We're thrilled to partner with you.",
                    "owner": "Account Manager",
                },
                {
                    "action": "Internal team notification",
                    "timing": "Within 1 hour",
                    "template": f"New client alert: {client_name} signed for {service_type}",
                    "owner": "Operations",
                },
                {
                    "action": "Schedule kickoff call",
                    "timing": "Within 24 hours",
                    "template": "Calendar invite for 60-min kickoff within first week",
                    "owner": "Account Manager",
                },
            ],
            "welcome_package": {
                "digital": [
                    "Branded welcome guide (PDF)",
                    "Access credentials and setup instructions",
                    "Team contact sheet with response SLAs",
                    "FAQ document",
                ],
                "physical": [
                    "Handwritten welcome note from leadership",
                    "Branded notebook and pen set",
                ],
            },
            "first_week_touchpoints": [
                {"day": 1, "type": "email", "content": "Welcome + next steps"},
                {"day": 2, "type": "call", "content": "Quick check — any questions?"},
                {"day": 3, "type": "email", "content": "Resource guide delivery"},
                {"day": 5, "type": "meeting", "content": "Kickoff strategy session"},
                {"day": 7, "type": "email", "content": "Week 1 recap + week 2 preview"},
            ],
        }

        if vip:
            base_protocol["welcome_package"]["physical"].extend([
                "Premium gift box (curated luxury items)",
                "Exclusive event invitation",
            ])
            base_protocol["immediate_actions"].append({
                "action": "CEO personal welcome call",
                "timing": "Within 24 hours",
                "template": f"Personal call from CEO welcoming {client_name}",
                "owner": "CEO",
            })
            base_protocol["vip_extras"] = [
                "Dedicated Slack/Teams channel",
                "Direct mobile access to senior team",
                "Quarterly in-person strategy sessions",
                "Priority response SLA (2-hour max)",
            ]

        return base_protocol

    def update_milestone(self, plan_id: str, day: int, status: str) -> dict | None:
        """Update a milestone status within a plan."""
        plan = self._plans.get(plan_id)
        if not plan:
            return None

        for phase in plan["phases"]:
            for milestone in phase["milestones"]:
                if milestone["day"] == day:
                    milestone["status"] = status
                    self._recalc_completion(plan)
                    return plan
        return None

    def _recalc_completion(self, plan: dict) -> None:
        """Recalculate plan completion percentage."""
        total = 0
        completed = 0
        for phase in plan["phases"]:
            for m in phase["milestones"]:
                total += 1
                if m["status"] == "completed":
                    completed += 1
        plan["completion_pct"] = round((completed / total * 100) if total else 0, 1)

    def get_plan(self, plan_id: str) -> dict | None:
        return self._plans.get(plan_id)
