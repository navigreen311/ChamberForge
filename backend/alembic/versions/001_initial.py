"""Initial schema — all 26+ ChamberForge tables.

Revision ID: 001_initial
Revises: None
Create Date: 2026-04-03

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Independent tables (no foreign keys to other app tables) ──

    op.create_table(
        "workspaces",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(255), unique=True, nullable=False),
        sa.Column("plan", sa.String(50), nullable=False, server_default="core"),
        sa.Column("owner_id", sa.String(36), nullable=True),
        sa.Column("settings", sa.JSON, nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_workspaces_slug", "workspaces", ["slug"], unique=True)

    op.create_table(
        "playbooks",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("slug", sa.String, unique=True, nullable=False),
        sa.Column("name", sa.String, nullable=False),
        sa.Column("target_buyer", sa.String, nullable=False),
        sa.Column("price_range_min", sa.Float, nullable=False),
        sa.Column("price_range_max", sa.Float, nullable=False),
        sa.Column("core_pain", sa.String, nullable=False),
        sa.Column("icp", sa.JSON, nullable=False, server_default="{}"),
        sa.Column("pain_triggers", sa.JSON, nullable=False, server_default="[]"),
        sa.Column("pricing_model", sa.JSON, nullable=False, server_default="{}"),
        sa.Column("sop_skeleton", sa.JSON, nullable=False, server_default="[]"),
        sa.Column("trust_concerns", sa.JSON, nullable=False, server_default="[]"),
        sa.Column("objection_handling", sa.JSON, nullable=False, server_default="[]"),
        sa.Column("kpi_stack", sa.JSON, nullable=False, server_default="[]"),
        sa.Column("voiceforge_assets", sa.JSON, nullable=False, server_default="[]"),
        sa.Column("visionaudio_assets", sa.JSON, nullable=False, server_default="[]"),
    )
    op.create_index("ix_playbooks_slug", "playbooks", ["slug"], unique=True)

    op.create_table(
        "feature_flags",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(255), unique=True, nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("enabled", sa.Boolean, nullable=False, server_default=sa.text("false")),
        sa.Column("plan_requirements", sa.JSON, server_default="[]"),
        sa.Column("rollout_percentage", sa.Float, server_default="0.0"),
        sa.Column("conditions", sa.JSON, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_feature_flags_name", "feature_flags", ["name"], unique=True)

    # ── Tables with FK to workspaces ──

    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("email", sa.String(320), unique=True, nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(1024), nullable=False),
        sa.Column("role", sa.String(50), nullable=False, server_default="operator"),
        sa.Column("workspace_id", sa.String(36), sa.ForeignKey("workspaces.id"), nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "problems",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("wealth_tier", sa.String(50), nullable=True),
        sa.Column("buyer_type", sa.String(50), nullable=True),
        sa.Column("life_stage", sa.String(50), nullable=True),
        sa.Column("trigger_event", sa.String(50), nullable=True),
        sa.Column("pain_category", sa.String(50), nullable=True),
        sa.Column("wtp_profile", sa.String(50), nullable=True),
        sa.Column("trust_channel", sa.String(50), nullable=True),
        sa.Column("compliance_risk", sa.String(50), nullable=True),
        sa.Column("delivery_model", sa.String(50), nullable=True),
        sa.Column("proof_metric", sa.String(50), nullable=True),
        sa.Column("lifecycle_stage", sa.String(50), nullable=True),
        sa.Column("urgency_score", sa.Integer, nullable=True),
        sa.Column("wtp_confidence", sa.Float, nullable=True),
        sa.Column("source", sa.String(255), nullable=True),
        sa.Column("geo", sa.String(100), nullable=True),
        sa.Column("status", sa.String(50), nullable=False, server_default="active"),
        sa.Column("created_by", sa.String(36), nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_problems_workspace_id", "problems", ["workspace_id"])

    op.create_table(
        "evidence",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("problem_id", sa.String(36), nullable=True),
        sa.Column("workspace_id", sa.String(36), nullable=False),
        sa.Column("source_url", sa.String, nullable=False),
        sa.Column("source_type", sa.String, nullable=False),
        sa.Column("publication_date", sa.Date, nullable=False),
        sa.Column("credibility_score", sa.Float, nullable=False, server_default="5.0"),
        sa.Column("extracted_claims", sa.JSON, server_default="[]"),
        sa.Column("contradiction_flags", sa.JSON, server_default="[]"),
        sa.Column("recency_decay_score", sa.Float, server_default="0.0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_evidence_problem_id", "evidence", ["problem_id"])
    op.create_index("ix_evidence_workspace_id", "evidence", ["workspace_id"])
    op.create_index("ix_evidence_source_url", "evidence", ["source_url"])
    op.create_index("ix_evidence_workspace_credibility", "evidence", ["workspace_id", "credibility_score"])

    op.create_table(
        "offers",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), nullable=False),
        sa.Column("problem_id", sa.String(36), nullable=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("value_stack", sa.JSON, nullable=True, server_default="[]"),
        sa.Column("delivery_model", sa.String(50), nullable=False, server_default="'done_for_you'"),
        sa.Column("guarantee_framework", sa.JSON, nullable=True, server_default="{}"),
        sa.Column("pricing_model", sa.JSON, nullable=True, server_default="{}"),
        sa.Column("sop_bundle", sa.JSON, nullable=True, server_default="{}"),
        sa.Column("status", sa.String(20), nullable=False, server_default="draft"),
        sa.Column("created_by", sa.String(36), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_offers_workspace_id", "offers", ["workspace_id"])
    op.create_index("ix_offers_status", "offers", ["status"])

    op.create_table(
        "clients",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("company", sa.String(255), nullable=True),
        sa.Column("wealth_tier", sa.String(30), nullable=False, server_default="'hnw'"),
        sa.Column("status", sa.String(20), nullable=False, server_default="'prospect'"),
        sa.Column("health_score", sa.Float, nullable=True, server_default="100.0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_clients_workspace_id", "clients", ["workspace_id"])
    op.create_index("ix_clients_status", "clients", ["status"])

    # ── Tables with FK to clients ──

    op.create_table(
        "household_graphs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "client_id",
            sa.String(36),
            sa.ForeignKey("clients.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
        ),
        sa.Column("members", sa.JSON, nullable=False, server_default="[]"),
        sa.Column("properties", sa.JSON, nullable=False, server_default="[]"),
        sa.Column("staff", sa.JSON, nullable=False, server_default="[]"),
        sa.Column("vendors", sa.JSON, nullable=False, server_default="[]"),
        sa.Column("entities", sa.JSON, nullable=False, server_default="[]"),
        sa.Column("risk_exposures", sa.JSON, nullable=False, server_default="[]"),
        sa.Column("jurisdictions", sa.JSON, nullable=False, server_default="[]"),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_household_graphs_client_id", "household_graphs", ["client_id"], unique=True)

    # ── Tables with FK to playbooks ──

    op.create_table(
        "playbook_activations",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), nullable=False),
        sa.Column(
            "playbook_id",
            sa.String(36),
            sa.ForeignKey("playbooks.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("customizations", sa.JSON, nullable=False, server_default="{}"),
        sa.Column("progress", sa.JSON, nullable=False, server_default="{}"),
        sa.Column("status", sa.String, nullable=False, server_default="'active'"),
        sa.Column("activated_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column("completed_sections", sa.Integer, nullable=False, server_default="0"),
        sa.Column("total_sections", sa.Integer, nullable=False, server_default="8"),
    )
    op.create_index("ix_playbook_activations_workspace_id", "playbook_activations", ["workspace_id"])

    # ── Standalone operational tables ──

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), nullable=False),
        sa.Column("user_id", sa.String(36), nullable=True),
        sa.Column("action", sa.String, nullable=False),
        sa.Column("resource_type", sa.String, nullable=False),
        sa.Column("resource_id", sa.String(36), nullable=True),
        sa.Column("details", sa.JSON, server_default="{}"),
        sa.Column("ip_address", sa.String, nullable=True),
        sa.Column("timestamp", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "ai_usage_logs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), nullable=False),
        sa.Column("agent_name", sa.String(255), nullable=False),
        sa.Column("tokens_in", sa.Integer, nullable=False, server_default="0"),
        sa.Column("tokens_out", sa.Integer, nullable=False, server_default="0"),
        sa.Column("latency_ms", sa.Integer, nullable=False, server_default="0"),
        sa.Column("cost_usd", sa.Float, nullable=False, server_default="0.0"),
        sa.Column("model", sa.String(100), nullable=False, server_default="'claude-sonnet-4-6'"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_ai_usage_logs_workspace_id", "ai_usage_logs", ["workspace_id"])
    op.create_index("ix_ai_usage_logs_agent_name", "ai_usage_logs", ["agent_name"])

    op.create_table(
        "automation_rules",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("trigger_type", sa.String(100), nullable=False),
        sa.Column("trigger_conditions", sa.JSON, nullable=False),
        sa.Column("action_type", sa.String(100), nullable=False),
        sa.Column("action_config", sa.JSON, nullable=False),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.text("true")),
        sa.Column("execution_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("last_executed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_automation_rules_workspace_id", "automation_rules", ["workspace_id"])

    op.create_table(
        "subscriptions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), nullable=False),
        sa.Column("client_id", sa.String(36), nullable=False),
        sa.Column("stripe_subscription_id", sa.String, unique=True, nullable=True),
        sa.Column("stripe_customer_id", sa.String, nullable=True),
        sa.Column("plan_name", sa.String, nullable=False),
        sa.Column("amount", sa.Float, nullable=False),
        sa.Column("currency", sa.String, server_default="'usd'"),
        sa.Column("status", sa.String, server_default="'active'"),
        sa.Column("current_period_start", sa.DateTime, nullable=True),
        sa.Column("current_period_end", sa.DateTime, nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_subscriptions_workspace_id", "subscriptions", ["workspace_id"])
    op.create_index("ix_subscriptions_client_id", "subscriptions", ["client_id"])

    op.create_table(
        "invoices",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), nullable=False),
        sa.Column("client_id", sa.String(36), nullable=False),
        sa.Column("stripe_invoice_id", sa.String, nullable=True),
        sa.Column("amount", sa.Float, nullable=False),
        sa.Column("status", sa.String, server_default="'draft'"),
        sa.Column("due_date", sa.Date, nullable=True),
        sa.Column("paid_at", sa.DateTime, nullable=True),
        sa.Column("line_items", sa.JSON, server_default="[]"),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_invoices_workspace_id", "invoices", ["workspace_id"])
    op.create_index("ix_invoices_client_id", "invoices", ["client_id"])

    op.create_table(
        "referrals",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), nullable=False),
        sa.Column("referrer_id", sa.String(36), nullable=False),
        sa.Column("referred_client_id", sa.String(36), nullable=False),
        sa.Column("deal_value", sa.Float, nullable=False),
        sa.Column("commission_pct", sa.Float, server_default="10.0"),
        sa.Column("commission_amount", sa.Float, nullable=False),
        sa.Column("status", sa.String, server_default="'pending'"),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_referrals_workspace_id", "referrals", ["workspace_id"])

    op.create_table(
        "consent_records",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), nullable=False),
        sa.Column("client_id", sa.String(36), nullable=False),
        sa.Column("consent_type", sa.String(50), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="'active'"),
        sa.Column("granted_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column("revoked_at", sa.DateTime, nullable=True),
        sa.Column("nda_document_url", sa.String(500), nullable=True),
        sa.Column("notes", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_consent_records_workspace_id", "consent_records", ["workspace_id"])
    op.create_index("ix_consent_records_client_id", "consent_records", ["client_id"])

    op.create_table(
        "crisis_incidents",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), nullable=False),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("severity", sa.String(20), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="'active'"),
        sa.Column("timeline", sa.JSON, nullable=False, server_default="[]"),
        sa.Column("escalation_tree", sa.JSON, nullable=False, server_default="[]"),
        sa.Column("lockdown_actions", sa.JSON, nullable=False, server_default="[]"),
        sa.Column("reported_by", sa.String(36), nullable=True),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_crisis_incidents_workspace_id", "crisis_incidents", ["workspace_id"])

    op.create_table(
        "deletion_requests",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), nullable=False),
        sa.Column("client_id", sa.String(36), nullable=False),
        sa.Column("requested_by", sa.String(36), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="'pending'"),
        sa.Column("tables_cleaned", sa.JSON, server_default="[]"),
        sa.Column("records_deleted", sa.Integer, server_default="0"),
        sa.Column("requested_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_deletion_requests_workspace_id", "deletion_requests", ["workspace_id"])
    op.create_index("ix_deletion_requests_client_id", "deletion_requests", ["client_id"])

    op.create_table(
        "documents",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), nullable=False),
        sa.Column("file_name", sa.String(512), nullable=False),
        sa.Column("file_type", sa.String(128), nullable=False),
        sa.Column("s3_key", sa.String(1024), nullable=False, unique=True),
        sa.Column("size_bytes", sa.Integer, nullable=False),
        sa.Column("uploaded_by", sa.String(36), nullable=True),
        sa.Column("watermark_id", sa.String(256), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_documents_workspace_id", "documents", ["workspace_id"])

    op.create_table(
        "email_logs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), nullable=False),
        sa.Column("to_email", sa.String(320), nullable=False),
        sa.Column("template", sa.String(100), nullable=True),
        sa.Column("subject", sa.String(500), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="'sent'"),
        sa.Column("metadata", sa.JSON, nullable=False, server_default="{}"),
        sa.Column("sent_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column("delivered_at", sa.DateTime, nullable=True),
    )
    op.create_index("ix_email_logs_workspace_id", "email_logs", ["workspace_id"])
    op.create_index("ix_email_logs_to_email", "email_logs", ["to_email"])

    op.create_table(
        "legal_holds",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), nullable=False),
        sa.Column("resource_type", sa.String(100), nullable=False),
        sa.Column("resource_id", sa.String(36), nullable=False),
        sa.Column("reason", sa.Text, nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="'active'"),
        sa.Column("created_by", sa.String(36), nullable=False),
        sa.Column("released_by", sa.String(36), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("released_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_legal_holds_workspace_id", "legal_holds", ["workspace_id"])
    op.create_index("ix_legal_holds_resource_id", "legal_holds", ["resource_id"])

    op.create_table(
        "secure_messages",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), nullable=False),
        sa.Column("sender_id", sa.String(36), nullable=False),
        sa.Column("recipient_id", sa.String(36), nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("is_encrypted", sa.Boolean, nullable=False, server_default=sa.text("true")),
        sa.Column("read_at", sa.DateTime, nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_secure_messages_workspace_id", "secure_messages", ["workspace_id"])
    op.create_index("ix_secure_messages_sender_id", "secure_messages", ["sender_id"])
    op.create_index("ix_secure_messages_recipient_id", "secure_messages", ["recipient_id"])

    op.create_table(
        "notifications",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), nullable=False),
        sa.Column("workspace_id", sa.String(36), nullable=False),
        sa.Column("type", sa.String(20), nullable=False, server_default="'info'"),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("body", sa.Text, nullable=False),
        sa.Column("action_url", sa.String(2048), nullable=True),
        sa.Column("is_read", sa.Boolean, nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"])
    op.create_index("ix_notifications_workspace_id", "notifications", ["workspace_id"])

    op.create_table(
        "prompt_versions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("agent_name", sa.String(255), nullable=False),
        sa.Column("version", sa.Integer, nullable=False),
        sa.Column("prompt_template", sa.Text, nullable=False),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.text("true")),
        sa.Column("test_results", sa.JSON, server_default="{}"),
        sa.Column("created_by", sa.String(36), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_prompt_versions_agent_name", "prompt_versions", ["agent_name"])

    op.create_table(
        "risk_reviews",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), nullable=False),
        sa.Column("item_type", sa.String(50), nullable=False),
        sa.Column("item_id", sa.String(36), nullable=False),
        sa.Column("risk_level", sa.String(20), nullable=False),
        sa.Column("reason", sa.Text, nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="'pending'"),
        sa.Column("reviewer_id", sa.String(36), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("notes", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_risk_reviews_workspace_id", "risk_reviews", ["workspace_id"])
    op.create_index("ix_risk_reviews_status", "risk_reviews", ["status"])

    op.create_table(
        "template_versions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), nullable=False),
        sa.Column("template_type", sa.String(50), nullable=False),
        sa.Column("template_id", sa.String(36), nullable=False),
        sa.Column("version_number", sa.Integer, nullable=False, server_default="1"),
        sa.Column("content", sa.JSON, nullable=False),
        sa.Column("changes_summary", sa.Text, nullable=True),
        sa.Column("created_by", sa.String(36), nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_template_versions_workspace_id", "template_versions", ["workspace_id"])
    op.create_index("ix_template_versions_template_id", "template_versions", ["template_id"])


def downgrade() -> None:
    # Drop in reverse dependency order
    op.drop_table("template_versions")
    op.drop_table("risk_reviews")
    op.drop_table("prompt_versions")
    op.drop_table("notifications")
    op.drop_table("secure_messages")
    op.drop_table("legal_holds")
    op.drop_table("email_logs")
    op.drop_table("documents")
    op.drop_table("deletion_requests")
    op.drop_table("crisis_incidents")
    op.drop_table("consent_records")
    op.drop_table("referrals")
    op.drop_table("invoices")
    op.drop_table("subscriptions")
    op.drop_table("automation_rules")
    op.drop_table("ai_usage_logs")
    op.drop_table("audit_logs")
    op.drop_table("playbook_activations")
    op.drop_table("household_graphs")
    op.drop_table("clients")
    op.drop_table("offers")
    op.drop_table("evidence")
    op.drop_table("problems")
    op.drop_table("users")
    op.drop_table("feature_flags")
    op.drop_table("playbooks")
    op.drop_table("workspaces")
