# Prompt 19: Email Service (Resend Integration)
Branch: ai-feature/email-service

## Mission
Build the transactional email system using Resend for client delivery notifications, alerts, onboarding sequences, and system communications.

## What to Build

### Backend
1. **services/backbone/email_service.py** — EmailService:
   - send_transactional(to, template, variables) — send single email using template
   - send_batch(recipients, template, variables) — batch send
   - send_client_delivery(client_id, deliverable_type, download_url) — notify client of deliverable
   - send_onboarding_sequence(user_id, step) — drip onboarding emails
   - send_alert(user_id, alert_type, details) — system alerts (crisis, churn risk, etc.)
   - send_invoice(client_id, invoice_data) — payment notification
2. **services/backbone/email_templates.py** — Template definitions:
   - welcome, onboarding_step_1 through 5, deliverable_ready, alert_critical, alert_warning, invoice, renewal_reminder, referral_request, weekly_digest
3. **api/v1/email.py** — POST /send (admin), GET /templates, GET /history
4. **models/email_log.py** — EmailLog: id, workspace_id, to_email, template, status (sent/delivered/bounced/failed), sent_at, delivered_at, metadata

### Frontend
1. **app/admin/email/page.tsx** — Email dashboard: send history, delivery rates, template preview
2. **components/modules/EmailTemplatePreview.tsx** — Template preview with variable substitution

## Tests
- test email sending with mocked Resend API
- test template variable substitution
- test batch sending
- test email log recording

## Commit
feat: add email service — Resend integration, templates, transactional emails, onboarding sequences
