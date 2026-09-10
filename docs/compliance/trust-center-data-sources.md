# Trust Center — where each published claim comes from

**Document Owner**: Security Lead
**Last Reviewed**: 2026-09-10
**Applies to**: `GET /api/v1/trust-center/overview`, `GET /api/v1/trust-center/uptime`

---

## Why this document exists

The Trust Center is the page a prospect reads to decide whether to trust the
platform with a family's financial affairs. Until P-06, one of the figures on
it was generated:

```python
random.seed(f"{year}-{month}")          # "Deterministic per month"
uptime = round(99.9 + random.uniform(-0.15, 0.1), 3)
```

The seeding is the part that matters. A fluctuating random number invites
suspicion. A *seeded* one returned the same 99.87% for August on every
request — so it behaved exactly like a stored measurement and survived the
one check a sceptical reader would actually run: ask twice and compare.

That code is gone, and it cannot come back silently:
`tests/test_trust_center_no_fabrication.py` fails if any module under
`app/services` imports `random`, checked against the parsed syntax tree
rather than the file text.

This document records what replaced it, and who is accountable for each
remaining claim.

---

## The three provenance classes

Every field in the overview response now carries a `source`. There are three
values and they mean materially different things.

| Source | Meaning | Who is accountable |
|---|---|---|
| `measured` | Read from a monitoring system at request time | The platform |
| `platform_configuration` | True of the deployed system; checkable in the repository or the infrastructure | Engineering |
| `operator_declared` | A statement the operating firm makes about itself, which the platform **cannot verify** | The firm |

The distinction is the point. A reader — and a reviewer — must be able to
tell a measurement from a declaration, and before P-06 both were returned in
the same flat dictionary with the same apparent authority.

---

## Availability

**Source**: `app/services/backbone/uptime_source.py` → Datadog SLO history.

There are exactly two states and no third:

- **measured** — an SLI read from the configured SLO;
- **unknown** — nothing is configured, the monitor was unreachable, or the
  response was malformed.

There is no fallback, no estimate, and no last-known-good. Every failure path
resolves to unknown, so no caller can receive a number the adapter did not
read from the monitor.

### Configuration

| Variable | Purpose |
|---|---|
| `DATADOG_UPTIME_SLO_ID` | The SLO whose history is the uptime record |
| `DD_API_KEY` | Already in `core/config.py`, used by the metrics middleware |
| `DD_APP_KEY` | Required by the SLO API; `DD_API_KEY` alone cannot reach it |
| `DD_SITE` | Defaults to `datadoghq.com` |

All three secrets are required together. A **partial** configuration is
treated as unconfigured rather than half-queried — a partly configured
monitor fails in a way that looks like an outage, and would otherwise be
reported as one.

These are read from the environment rather than `core/config.py` because that
file is frozen for the parallel build and has no SLO settings. When P-00
amends the settings surface they move there; the seam is `_credentials()` and
nothing else changes.

### Status as of this document

**No SLO is configured.** `GET /trust-center/uptime` returns an empty list
and `get_uptime_report()` reports `available: false` with reason
`no_monitoring_configured`.

> This is the approved interim. The package card recorded that no uptime SLI
> is defined anywhere in the repository and required either a named Datadog
> monitor or approval of the render-nothing behaviour before starting.
> Render-nothing is what shipped: **"no data yet" is honest, and a plausible
> number is not.** Naming a monitor later is a configuration change, not a
> code change.

---

## Declared claims — the firm's word, not the platform's

These are published because removing a firm's compliance statements is not a
decision code should make quietly. But the platform cannot verify any of
them, and each is now marked `operator_declared`.

| Claim | Current value | Verified by |
|---|---|---|
| `compliance` | GDPR-ready, CCPA-ready | **Unverified in repo** |
| `certifications` | SOC2 roadmap | **Unverified in repo** |
| `dpa_available` | `true` | **Unverified in repo** |
| `pen_test_summary` | "Annual third-party penetration testing" | **Unverified in repo** — see below |
| `uptime_sla` | 99.9% | A commitment, not an observation |

### `pen_test_summary` — flagged for review

`docs/compliance/pen-test-report-template.md` is a **template**. There is no
completed penetration test report in the repository. The claim may well be
true of the firm; nothing in this codebase substantiates it.

**Action required from the document owner**: either attach the completed
report, or amend the claim. This is a business decision and P-06 did not make
it in either direction.

### `uptime_sla` vs measured uptime

99.9% is what the firm **undertakes to deliver**. The uptime history reports
what **was** delivered. These must never be conflated, which is why the SLA
is marked `operator_declared` while availability is `measured` — and why
`uptime_measured` in the response says plainly whether any measurement exists
at all.

---

## `incident_history`

Returns `[]`, and always has. **No incident record is connected to this
page.**

An empty list on a trust page reads as a clean record. It is not one — it
means unrecorded. The response therefore carries `incident_history_note`
saying so in words, because a caller rendering only the list would otherwise
publish an implied claim nobody made.

Wiring a real incident source is not in P-06's scope. Until it is, the note
is what stops the absence being read as evidence.

---

## The VoiceForge cross-cut

`app/services/integrations/voiceforge_intel_brief.py` is the one file P-06
takes from P-07's directory, because it carried the same defect.

With no API key, its mock path returned an `.mp3` URL, a duration padded with
`random.uniform(6.0, 10.0)` for an "intro jingle", a bitrate, a sample rate,
a file size derived from the invented duration, and a hardcoded
`generated_at` of `2026-04-03T12:00:00Z` — a complete description of a file
that was never rendered. The only signal was `.mock` in the hostname of a URL
nothing resolves.

It now returns `available: false` with a reason, no URL and no duration.

One value survives: `estimated_narration_seconds`, computed as word count
divided by the voice profile's words-per-minute. That is arithmetic over the
caller's own text — how long the brief *would* take to read aloud — not a
claim about an artefact, and it is named so it cannot be mistaken for the
length of a file.
