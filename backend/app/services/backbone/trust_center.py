"""Trust Center - security posture and availability, with their provenance attached.

P-06 (T-021, T-022). This module published two different kinds of statement
through one undifferentiated dict, and one of them was generated:

    random.seed(f"{year}-{month}")          # "Deterministic per month"
    uptime = round(99.9 + random.uniform(-0.15, 0.1), 3)

That is a fabricated availability record on the page a prospect reads to
decide whether to trust the platform with a family's financial affairs. The
seeding made it worse rather than better: the same month returned the same
figure on every request, so it behaved like a stored measurement and survived
exactly the check a sceptical reader would perform.

Availability now comes from `uptime_source`, which reports either a measured
figure or an explicit unknown. Nothing in this module can produce a number.

The rest of the page is a different problem with the same shape. Claims like
"annual third-party penetration testing" and "GDPR-ready" are not
measurements the platform can take - they are statements the operating firm
makes about itself, and the platform cannot verify a single one. They were
returned in the same flat dict as everything else, which presented them with
the same authority as data.

They are still published, because removing a firm's compliance statements is
not a decision code should make quietly. But each now carries `source`, so a
reader and a reviewer can both tell a measurement from a declaration. Anything
marked `operator_declared` is the firm's word, held in configuration, and
`docs/compliance/trust-center-data-sources.md` records who is accountable for
each line.
"""
from __future__ import annotations

from app.services.backbone.uptime_source import UptimeReport, UptimeSource

#: Statements the operating firm makes about itself. The platform cannot
#: verify any of these; publishing them is a business decision, and marking
#: them as declarations is what keeps that decision visible.
SOURCE_DECLARED = "operator_declared"

#: Read from a monitoring system at request time.
SOURCE_MEASURED = "measured"

#: True of the deployed system and checkable in the repository or the
#: infrastructure, rather than asserted on the firm's behalf.
SOURCE_PLATFORM = "platform_configuration"


class TrustCenter:
    """Public-facing security and compliance information."""

    @staticmethod
    def get_security_overview() -> dict:
        """The security posture, with the provenance of each claim attached.

        The shape is unchanged for existing callers - every previous key is
        still present at the top level - with a `sources` map added beside
        it. `primitives.py` serves this verbatim and belongs to P-02, so the
        route was not touched.
        """
        overview = {
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

        overview["sources"] = {
            # Configured in infrastructure and checkable there.
            "encryption": SOURCE_PLATFORM,
            "subprocessors": SOURCE_PLATFORM,
            # Statements about the firm's own programme and paperwork. The
            # platform has no way to confirm that a penetration test happened
            # or that a DPA exists.
            "compliance": SOURCE_DECLARED,
            "certifications": SOURCE_DECLARED,
            "dpa_available": SOURCE_DECLARED,
            "pen_test_summary": SOURCE_DECLARED,
            # A commitment, not an observation. It is what the firm undertakes
            # to deliver; `get_uptime_history` reports what was delivered, and
            # the two must never be conflated.
            "uptime_sla": SOURCE_DECLARED,
            # Empty because no incident record is wired up yet - not because
            # there have been no incidents. Said plainly rather than left to
            # read as a clean record.
            "incident_history": SOURCE_DECLARED,
        }
        overview["incident_history_note"] = (
            "No incident record is connected to this page. An empty list "
            "means unrecorded, not incident-free."
        )
        overview["uptime_measured"] = UptimeSource.is_configured()

        return overview

    @staticmethod
    def get_uptime_history(months: int = 12) -> list[dict]:
        """Measured monthly uptime. Empty when nothing has been measured.

        The return type is a list because `primitives.py` serves it directly
        and that file belongs to P-02. An empty list from this method means
        "no measurements", and `get_uptime_report()` carries the reason -
        which is what a caller should render, and what P-24's screen will use.
        """
        return [m.as_dict() for m in UptimeSource.monthly_history(months).months]

    @staticmethod
    def get_uptime_report(months: int = 12) -> UptimeReport:
        """Uptime with its availability state and reason intact.

        Prefer this over `get_uptime_history`. The list form cannot express
        the difference between "measured, and there were no incidents" and
        "measured nothing at all", and on a trust page those two must not
        render the same way.
        """
        return UptimeSource.monthly_history(months)
