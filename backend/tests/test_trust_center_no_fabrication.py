"""The platform does not generate its own compliance evidence.

P-06 (T-021, T-022).

`TrustCenter.get_uptime_history` produced availability figures with a seeded
PRNG and published them on the page a prospect reads to decide whether to
trust the platform with a family's financial affairs.

The seeding is the part worth dwelling on. `random.seed(f"{year}-{month}")`
returned the *same* 99.87% for August on every request, so the figure
survived the exact check a sceptical reader would run - ask twice, compare.
An unstable number invites doubt; a stable invented one earns confidence it
has not got.

These tests assert the two properties that keep that from coming back:

  1. no module under `app/services` imports `random` - checked against the
     parsed source, so a comment quoting the old code does not satisfy it and
     a new import cannot slip in behind one;
  2. with no monitoring configured, every surface says so explicitly rather
     than returning a figure.
"""
from __future__ import annotations

import ast
import pathlib

import pytest

from app.services.backbone.trust_center import (
    SOURCE_DECLARED,
    SOURCE_MEASURED,
    TrustCenter,
)
from app.services.backbone.uptime_source import (
    REASON_NOT_CONFIGURED,
    REASON_UNREACHABLE,
    UptimeReport,
    UptimeSource,
)

SERVICES = pathlib.Path(__file__).resolve().parents[1] / "app" / "services"


def _imports_random(path: pathlib.Path) -> bool:
    """True when *path* actually imports random, per its parsed syntax tree.

    Deliberately not a text search: both files under repair quote the
    offending lines in their docstrings, and a grep-based assertion would
    either fail on the explanation or pass on a comment.
    """
    tree = ast.parse(path.read_text(encoding="utf-8"))
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            if any(alias.name.split(".")[0] == "random" for alias in node.names):
                return True
        elif isinstance(node, ast.ImportFrom):
            if (node.module or "").split(".")[0] == "random":
                return True
    return False


# -- 1. No service can generate a figure ------------------------------------


@pytest.mark.parametrize(
    "relative",
    [
        "backbone/trust_center.py",
        "integrations/voiceforge_intel_brief.py",
    ],
)
def test_the_two_repaired_files_no_longer_import_random(relative):
    assert not _imports_random(SERVICES / relative)


def test_no_service_anywhere_imports_random():
    """A guard, not a cleanup.

    Both known offenders sat in different packages and were found separately.
    This fails on the third one at the point it is written, rather than at
    the point a customer asks where a number came from.

    If a service ever needs randomness for a legitimate reason - retry
    jitter, sampling - add it here with the reason, and make sure it cannot
    reach a customer-facing figure.
    """
    offenders = [
        str(p.relative_to(SERVICES))
        for p in SERVICES.rglob("*.py")
        if _imports_random(p)
    ]
    assert offenders == [], f"services importing random: {offenders}"


# -- 2. Unconfigured means unknown, not a number ----------------------------


@pytest.fixture(autouse=True)
def _no_monitoring(monkeypatch):
    for var in ("DATADOG_UPTIME_SLO_ID", "DD_API_KEY", "DD_APP_KEY"):
        monkeypatch.delenv(var, raising=False)


def test_uptime_is_not_configured_by_default():
    assert UptimeSource.is_configured() is False


def test_an_unconfigured_monitor_reports_unknown_not_zero():
    report = UptimeSource.monthly_history(12)

    assert report.available is False
    assert report.reason == REASON_NOT_CONFIGURED
    assert report.months == []
    assert report.source is None


def test_a_partial_configuration_counts_as_unconfigured(monkeypatch):
    """Half a configuration would fail like an outage and be reported as one."""
    monkeypatch.setenv("DATADOG_UPTIME_SLO_ID", "slo-123")
    monkeypatch.setenv("DD_API_KEY", "key")
    # DD_APP_KEY deliberately absent - the SLO API cannot be reached without it.

    report = UptimeSource.monthly_history(3)

    assert report.reason == REASON_NOT_CONFIGURED


def test_the_history_list_is_empty_rather_than_invented():
    assert TrustCenter.get_uptime_history(12) == []


def test_the_report_form_carries_the_reason():
    """The list form cannot distinguish "no incidents" from "no data".

    Both render as an empty list, and on a trust page those two must not
    look the same. This is why `get_uptime_report` exists alongside it.
    """
    report = TrustCenter.get_uptime_report(12)

    assert isinstance(report, UptimeReport)
    assert report.available is False
    assert report.reason == REASON_NOT_CONFIGURED


def test_an_unreachable_monitor_does_not_fall_back_to_a_figure(monkeypatch):
    """A monitoring outage must not become a published number."""
    monkeypatch.setenv("DATADOG_UPTIME_SLO_ID", "slo-123")
    monkeypatch.setenv("DD_API_KEY", "key")
    monkeypatch.setenv("DD_APP_KEY", "app")

    class Boom:
        def __enter__(self):
            return self

        def __exit__(self, *a):
            return False

        def get(self, *a, **kw):
            raise RuntimeError("datadog is unreachable")

    monkeypatch.setattr(
        "app.services.backbone.uptime_source.httpx.Client", lambda **kw: Boom()
    )

    report = UptimeSource.monthly_history(3)

    assert report.available is False
    assert report.reason == REASON_UNREACHABLE
    assert report.months == []


def test_a_measurement_is_reported_when_one_exists(monkeypatch):
    """The honest path still has to work, or "unknown" is just a new bug."""
    monkeypatch.setenv("DATADOG_UPTIME_SLO_ID", "slo-123")
    monkeypatch.setenv("DD_API_KEY", "key")
    monkeypatch.setenv("DD_APP_KEY", "app")

    class Response:
        @staticmethod
        def raise_for_status():
            return None

        @staticmethod
        def json():
            return {"data": {"overall": {"sli_value": 99.982, "errors": []}}}

    class Client:
        def __enter__(self):
            return self

        def __exit__(self, *a):
            return False

        def get(self, *a, **kw):
            return Response()

    monkeypatch.setattr(
        "app.services.backbone.uptime_source.httpx.Client", lambda **kw: Client()
    )

    report = UptimeSource.monthly_history(2)

    assert report.available is True
    assert [m.uptime_pct for m in report.months] == [99.982, 99.982]
    assert report.source == "datadog:slo/slo-123"


def test_a_malformed_reading_is_dropped_not_defaulted(monkeypatch):
    """Substituting a value for a missing measurement is the original defect."""
    monkeypatch.setenv("DATADOG_UPTIME_SLO_ID", "slo-123")
    monkeypatch.setenv("DD_API_KEY", "key")
    monkeypatch.setenv("DD_APP_KEY", "app")

    class Response:
        @staticmethod
        def raise_for_status():
            return None

        @staticmethod
        def json():
            return {"data": {"overall": {}}}

    class Client:
        def __enter__(self):
            return self

        def __exit__(self, *a):
            return False

        def get(self, *a, **kw):
            return Response()

    monkeypatch.setattr(
        "app.services.backbone.uptime_source.httpx.Client", lambda **kw: Client()
    )

    report = UptimeSource.monthly_history(3)

    assert report.available is False
    assert report.months == []


# -- 3. Declarations are labelled as declarations ---------------------------


def test_every_claim_carries_a_source():
    overview = TrustCenter.get_security_overview()
    sources = overview["sources"]

    for claim in (
        "encryption",
        "compliance",
        "certifications",
        "uptime_sla",
        "incident_history",
        "subprocessors",
        "dpa_available",
        "pen_test_summary",
    ):
        assert claim in sources, f"{claim} is published with no stated provenance"


def test_unverifiable_claims_are_marked_as_the_firms_own():
    """The platform cannot confirm a penetration test happened.

    Publishing the claim is the firm's decision. Publishing it with the same
    authority as a measurement is not.
    """
    sources = TrustCenter.get_security_overview()["sources"]

    assert sources["pen_test_summary"] == SOURCE_DECLARED
    assert sources["dpa_available"] == SOURCE_DECLARED
    assert sources["certifications"] == SOURCE_DECLARED


def test_the_sla_is_not_presented_as_a_measurement():
    """99.9% is what the firm undertakes, not what it achieved."""
    overview = TrustCenter.get_security_overview()

    assert overview["sources"]["uptime_sla"] == SOURCE_DECLARED
    assert overview["uptime_measured"] is False
    assert SOURCE_MEASURED not in overview["sources"].values()


def test_an_empty_incident_list_does_not_read_as_a_clean_record():
    overview = TrustCenter.get_security_overview()

    assert overview["incident_history"] == []
    assert "unrecorded" in overview["incident_history_note"]


# -- 4. The VoiceForge cross-cut --------------------------------------------


@pytest.mark.asyncio
async def test_no_audio_means_no_described_audio():
    """The same defect in a different package.

    The mock path returned an mp3 URL, a duration padded with
    `random.uniform(6.0, 10.0)`, a bitrate, a sample rate, a file size and a
    hardcoded `generated_at` - a complete description of a file that was
    never rendered.
    """
    from app.services.integrations.voiceforge_intel_brief import IntelBriefAudio

    class MockClient:
        async def _request(self, *a, **kw):
            return {"mock": True}

    result = await IntelBriefAudio(MockClient()).convert_to_audio(
        "One sentence. And another one here."
    )

    assert result["available"] is False
    assert result["reason"] == "voiceforge_not_configured"
    assert result["audio_url"] is None
    assert result["duration_seconds"] is None
    for invented in ("bitrate_kbps", "sample_rate_hz", "estimated_file_size_kb", "generated_at"):
        assert invented not in result["metadata"]


@pytest.mark.asyncio
async def test_the_narration_estimate_is_derived_and_labelled():
    """Kept because it is arithmetic over the caller's own text.

    Word count divided by a words-per-minute rate is a calculation, not a
    claim about an artefact - and it is named `estimated_narration_seconds`
    so it can never be read as the length of a file.
    """
    from app.services.integrations.voiceforge_intel_brief import IntelBriefAudio

    class MockClient:
        async def _request(self, *a, **kw):
            return {"mock": True}

    audio = IntelBriefAudio(MockClient())
    text = "Word " * 145

    first = await audio.convert_to_audio(text)
    second = await audio.convert_to_audio(text)

    assert first["estimated_narration_seconds"] == second["estimated_narration_seconds"]
    assert "duration_seconds" not in str(first["estimated_narration_seconds"])
