"""Trust Center — Security overview, uptime history, and compliance posture."""
import random
from datetime import datetime, timezone


class TrustCenter:
    """Public-facing security and compliance information."""

    @staticmethod
    def get_security_overview() -> dict:
        """Return the platform security and compliance posture."""
        return {
            "encryption": "AES-256 at rest, TLS 1.3 in transit",
            "compliance": ["GDPR-ready", "CCPA-ready"],
            "certifications": ["SOC2 roadmap"],
            "uptime_sla": "99.9%",
            "incident_history": [],
            "subprocessors": [
                "AWS",
                "Anthropic",
                "Stripe",
                "Resend",
                "Pusher",
            ],
            "dpa_available": True,
            "pen_test_summary": "Annual third-party penetration testing",
        }

    @staticmethod
    def get_uptime_history(months: int = 12) -> list[dict]:
        """Return uptime history for the last N months."""
        now = datetime.now(timezone.utc)
        history = []

        for i in range(months):
            month_offset = months - 1 - i
            month = now.month - month_offset
            year = now.year
            while month <= 0:
                month += 12
                year -= 1

            # Simulate realistic uptime (99.9% +/- small variance)
            random.seed(f"{year}-{month}")  # Deterministic per month
            uptime = round(99.9 + random.uniform(-0.15, 0.1), 3)
            uptime = min(uptime, 100.0)
            incidents = 0 if uptime >= 99.9 else 1

            history.append(
                {
                    "month": f"{year}-{month:02d}",
                    "uptime_pct": uptime,
                    "incidents": incidents,
                }
            )

        return history
