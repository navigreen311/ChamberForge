"""Email templates for ChamberForge transactional emails.

Each template is a dict with subject_template and html_template.
Variable placeholders use {variable_name} syntax — rendered via
safe string replacement (not str.format) to avoid CSS brace conflicts.
"""
import re

# ---------------------------------------------------------------------------
# Shared base layout — uses __CONTENT__ sentinel to avoid brace issues
# ---------------------------------------------------------------------------
_BASE_HTML = """<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
  body { margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#0f0f12; color:#e4e4e7; }
  .container { max-width:600px; margin:0 auto; padding:32px 24px; }
  .header { text-align:center; padding-bottom:24px; border-bottom:1px solid #27272a; margin-bottom:24px; }
  .header h1 { margin:0; font-size:22px; color:#a78bfa; letter-spacing:-0.5px; }
  .content { line-height:1.7; font-size:15px; }
  .content h2 { color:#f4f4f5; font-size:18px; }
  .btn { display:inline-block; padding:12px 28px; background:#7c3aed; color:#fff; text-decoration:none; border-radius:8px; font-weight:600; margin:16px 0; }
  .footer { margin-top:32px; padding-top:24px; border-top:1px solid #27272a; font-size:12px; color:#71717a; text-align:center; }
</style>
</head>
<body>
<div class="container">
  <div class="header"><h1>ChamberForge</h1></div>
  <div class="content">__CONTENT__</div>
  <div class="footer">
    &copy; 2026 ChamberForge &mdash; Premium-Service Operating System<br>
    <a href="{unsubscribe_url}" style="color:#71717a;">Unsubscribe</a>
  </div>
</div>
</body>
</html>"""


def _wrap(content: str) -> str:
    """Wrap template content inside the base layout."""
    return _BASE_HTML.replace("__CONTENT__", content)


# ---------------------------------------------------------------------------
# Template registry
# ---------------------------------------------------------------------------

TEMPLATES: dict[str, dict[str, str]] = {
    "welcome": {
        "subject_template": "Welcome to ChamberForge",
        "html_template": _wrap(
            "<h2>Welcome, {name}!</h2>"
            "<p>You've joined <strong>{workspace_name}</strong> on ChamberForge — "
            "the operating system built for premium service businesses.</p>"
            "<p>Your workspace is ready. Start by exploring the dashboard:</p>"
            '<a class="btn" href="{dashboard_url}">Open Dashboard</a>'
        ),
    },
    "onboarding_step_1": {
        "subject_template": "Getting Started: Your First Problem Discovery",
        "html_template": _wrap(
            "<h2>Step 1 — Problem Discovery</h2>"
            "<p>Hi {name},</p>"
            "<p>Great businesses solve real problems. In this step you'll map out the "
            "core problems your clients face and validate them with data.</p>"
            '<a class="btn" href="{action_url}">Start Problem Discovery</a>'
        ),
    },
    "onboarding_step_2": {
        "subject_template": "Build Your First Offer",
        "html_template": _wrap(
            "<h2>Step 2 — Build Your Offer</h2>"
            "<p>Hi {name},</p>"
            "<p>Now that you've identified the problem, it's time to craft a premium "
            "offer that delivers transformative results.</p>"
            '<a class="btn" href="{action_url}">Create Offer</a>'
        ),
    },
    "onboarding_step_3": {
        "subject_template": "Activate a Playbook",
        "html_template": _wrap(
            "<h2>Step 3 — Activate a Playbook</h2>"
            "<p>Hi {name},</p>"
            "<p>Playbooks turn your expertise into repeatable, scalable systems. "
            "Pick one and customize it for your practice.</p>"
            '<a class="btn" href="{action_url}">Browse Playbooks</a>'
        ),
    },
    "deliverable_ready": {
        "subject_template": "Your {deliverable_type} is Ready",
        "html_template": _wrap(
            "<h2>Your {deliverable_type} is Ready</h2>"
            "<p>Hi {name},</p>"
            "<p>The <strong>{deliverable_type}</strong> you requested for "
            "<em>{client_name}</em> has been generated and is ready for review.</p>"
            '<a class="btn" href="{download_url}">Download Now</a>'
        ),
    },
    "alert_critical": {
        "subject_template": "\u26a0\ufe0f Critical Alert: {alert_title}",
        "html_template": _wrap(
            '<h2 style="color:#ef4444;">\u26a0\ufe0f {alert_title}</h2>'
            "<p>{alert_message}</p>"
            "<p>This requires immediate attention.</p>"
            '<a class="btn" style="background:#ef4444;" href="{action_url}">Take Action</a>'
        ),
    },
    "alert_warning": {
        "subject_template": "Attention Required: {alert_title}",
        "html_template": _wrap(
            '<h2 style="color:#f59e0b;">Attention: {alert_title}</h2>'
            "<p>{alert_message}</p>"
            '<a class="btn" style="background:#f59e0b;color:#000;" href="{action_url}">Review</a>'
        ),
    },
    "invoice": {
        "subject_template": "Invoice #{invoice_number} \u2014 {amount}",
        "html_template": _wrap(
            "<h2>Invoice #{invoice_number}</h2>"
            "<p>Hi {name},</p>"
            "<p>A new invoice has been generated:</p>"
            "<table style='width:100%;border-collapse:collapse;margin:16px 0;'>"
            "<tr><td style='padding:8px;border-bottom:1px solid #27272a;color:#a1a1aa;'>Invoice #</td>"
            "<td style='padding:8px;border-bottom:1px solid #27272a;'>{invoice_number}</td></tr>"
            "<tr><td style='padding:8px;border-bottom:1px solid #27272a;color:#a1a1aa;'>Amount</td>"
            "<td style='padding:8px;border-bottom:1px solid #27272a;font-weight:600;'>{amount}</td></tr>"
            "<tr><td style='padding:8px;border-bottom:1px solid #27272a;color:#a1a1aa;'>Due Date</td>"
            "<td style='padding:8px;border-bottom:1px solid #27272a;'>{due_date}</td></tr>"
            "</table>"
            '<a class="btn" href="{payment_url}">Pay Now</a>'
        ),
    },
    "renewal_reminder": {
        "subject_template": "Upcoming Renewal: {offer_name}",
        "html_template": _wrap(
            "<h2>Renewal Reminder</h2>"
            "<p>Hi {name},</p>"
            "<p>Your subscription to <strong>{offer_name}</strong> renews on "
            "<strong>{renewal_date}</strong>.</p>"
            "<p>No action is needed if you'd like to continue. To make changes:</p>"
            '<a class="btn" href="{manage_url}">Manage Subscription</a>'
        ),
    },
    "weekly_digest": {
        "subject_template": "Your Weekly ChamberForge Digest",
        "html_template": _wrap(
            "<h2>Weekly Digest</h2>"
            "<p>Hi {name},</p>"
            "<p>Here's what happened in <strong>{workspace_name}</strong> this week:</p>"
            "<ul>"
            "<li><strong>{new_clients}</strong> new clients</li>"
            "<li><strong>{deliverables_completed}</strong> deliverables completed</li>"
            "<li><strong>{revenue}</strong> revenue generated</li>"
            "</ul>"
            '<a class="btn" href="{dashboard_url}">View Full Dashboard</a>'
        ),
    },
}


def get_template(name: str) -> dict[str, str] | None:
    """Return a template by name, or None if not found."""
    return TEMPLATES.get(name)


def list_templates() -> list[dict[str, str]]:
    """Return metadata for all available templates."""
    return [
        {"name": name, "subject_template": t["subject_template"]}
        for name, t in TEMPLATES.items()
    ]


def _safe_render(template_str: str, variables: dict) -> str:
    """Replace {key} placeholders without touching CSS/HTML braces.

    Raises KeyError if a placeholder in the template has no matching variable.
    """
    def _replacer(match: re.Match) -> str:
        key = match.group(1)
        if key not in variables:
            raise KeyError(key)
        return str(variables[key])

    return re.sub(r"\{([a-zA-Z_][a-zA-Z0-9_]*)\}", _replacer, template_str)


def render_template(name: str, variables: dict) -> dict[str, str]:
    """Render a template with the given variables.

    Returns dict with 'subject' and 'html_body' keys.
    Raises KeyError if template not found.
    Raises KeyError if a required variable is missing.
    """
    tmpl = TEMPLATES.get(name)
    if tmpl is None:
        raise KeyError(f"Template '{name}' not found")
    return {
        "subject": _safe_render(tmpl["subject_template"], variables),
        "html_body": _safe_render(tmpl["html_template"], variables),
    }
