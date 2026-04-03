"""Service Quality QA — SLA adherence, onboarding scoring, retention risk detection."""
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session


class ServiceQualityQA:
    """
    Quality assurance engine for premium service delivery.
    Monitors SLA compliance, onboarding completeness, and churn signals.
    """

    # Default SLA metrics when no custom SLA is defined
    DEFAULT_SLA_METRICS = [
        {"metric": "response_time_hours", "target": 4},
        {"metric": "resolution_time_hours", "target": 24},
        {"metric": "client_satisfaction_pct", "target": 95},
        {"metric": "report_delivery_on_time_pct", "target": 98},
        {"metric": "meeting_prep_completion_pct", "target": 100},
    ]

    # Standard onboarding checklist for HNW clients
    ONBOARDING_CHECKLIST = [
        "identity_verification",
        "risk_profile_assessment",
        "investment_policy_signed",
        "consent_data_processing",
        "consent_nda",
        "initial_portfolio_review",
        "relationship_manager_assigned",
        "welcome_package_sent",
        "first_meeting_scheduled",
        "reporting_preferences_set",
    ]

    # Retention risk signal weights
    RISK_SIGNALS = {
        "no_login_30d": {"weight": 0.25, "label": "No login in 30+ days"},
        "missed_meetings": {"weight": 0.20, "label": "Missed 2+ scheduled meetings"},
        "declining_aum": {"weight": 0.30, "label": "AUM declined >10% in 90 days"},
        "support_complaints": {"weight": 0.15, "label": "3+ support complaints in 60 days"},
        "consent_revoked": {"weight": 0.10, "label": "Marketing consent revoked"},
    }

    @classmethod
    def check_sla_adherence(cls, db: Session, workspace_id: UUID, offer_id: UUID) -> dict:
        """
        Check SLA adherence for a specific offer/engagement.

        In production this queries actual metrics tables. Here we demonstrate
        the calculation engine with realistic simulated actuals.
        """
        # In a real system, these actuals come from metrics aggregation tables
        # keyed by (workspace_id, offer_id). We simulate realistic values.
        simulated_actuals = {
            "response_time_hours": 3.2,
            "resolution_time_hours": 18.5,
            "client_satisfaction_pct": 97,
            "report_delivery_on_time_pct": 96,
            "meeting_prep_completion_pct": 100,
        }

        sla_items = []
        met_count = 0
        for metric_def in cls.DEFAULT_SLA_METRICS:
            metric_name = metric_def["metric"]
            target = metric_def["target"]
            actual = simulated_actuals.get(metric_name, 0)

            # For time metrics, lower is better; for percentage metrics, higher is better
            if "time" in metric_name:
                met = actual <= target
            else:
                met = actual >= target

            if met:
                met_count += 1

            sla_items.append(
                {
                    "metric": metric_name,
                    "target": target,
                    "actual": actual,
                    "met": met,
                }
            )

        total = len(sla_items)
        adherence_pct = round((met_count / total) * 100, 1) if total > 0 else 0.0

        return {
            "workspace_id": str(workspace_id),
            "offer_id": str(offer_id),
            "sla_items": sla_items,
            "overall_adherence_pct": adherence_pct,
            "checked_at": datetime.now(timezone.utc).isoformat(),
        }

    @classmethod
    def score_onboarding_quality(cls, db: Session, client_id: UUID) -> dict:
        """
        Score onboarding completeness for a client.

        In production, checklist state is persisted per-client. Here we
        demonstrate the scoring engine with realistic completion data.
        """
        # Simulated completion state — in prod, queried from onboarding_steps table
        completed_items = {
            "identity_verification",
            "risk_profile_assessment",
            "investment_policy_signed",
            "consent_data_processing",
            "consent_nda",
            "initial_portfolio_review",
            "relationship_manager_assigned",
            "welcome_package_sent",
        }

        checklist = []
        for item in cls.ONBOARDING_CHECKLIST:
            checklist.append({"item": item, "completed": item in completed_items})

        completed_count = sum(1 for c in checklist if c["completed"])
        score = round((completed_count / len(checklist)) * 100)

        # Simulated days-to-complete (None if not finished)
        days_to_complete = 12 if completed_count == len(checklist) else None

        return {
            "client_id": str(client_id),
            "score": score,
            "checklist": checklist,
            "days_to_complete": days_to_complete,
        }

    @classmethod
    def detect_retention_risks(cls, db: Session, workspace_id: UUID) -> list[dict]:
        """
        Detect clients at risk of churn within a workspace.

        In production, signals are computed from activity logs, AUM history,
        and support ticket data. Here we demonstrate the risk-scoring engine.
        """
        # Simulated client risk signals — in prod, aggregated from multiple tables
        simulated_clients = [
            {
                "client_id": "c1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
                "signals": ["no_login_30d", "declining_aum"],
            },
            {
                "client_id": "d2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d",
                "signals": ["missed_meetings", "support_complaints", "consent_revoked"],
            },
            {
                "client_id": "e3c4d5e6-f7a8-4b9c-0d1e-2f3a4b5c6d7e",
                "signals": ["no_login_30d"],
            },
        ]

        results = []
        for client in simulated_clients:
            signal_details = []
            total_weight = 0.0
            for sig_key in client["signals"]:
                sig = cls.RISK_SIGNALS.get(sig_key)
                if sig:
                    signal_details.append(sig["label"])
                    total_weight += sig["weight"]

            # Map weight to risk level
            if total_weight >= 0.5:
                risk_level = "high"
                action = "Schedule immediate relationship review meeting"
            elif total_weight >= 0.25:
                risk_level = "medium"
                action = "Send personalized check-in within 48 hours"
            else:
                risk_level = "low"
                action = "Continue standard engagement cadence"

            results.append(
                {
                    "client_id": client["client_id"],
                    "risk_level": risk_level,
                    "risk_score": round(total_weight, 2),
                    "signals": signal_details,
                    "recommended_action": action,
                }
            )

        # Sort by risk score descending
        results.sort(key=lambda r: r["risk_score"], reverse=True)
        return results
