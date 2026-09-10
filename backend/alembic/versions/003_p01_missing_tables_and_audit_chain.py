"""P-01: the four tables that were never created, plus the audit hash chain.

Revision ID: 003_p01_schema_reconciliation
Revises: 002_add_round2_models
Create Date: 2026-09-10

The audit found four models whose tables no migration ever created, so every
database built by `alembic upgrade head` was missing MFA, wealth-event
monitoring, community intel and white-label - and every endpoint touching
them failed at runtime. `scripts/check_migration_drift.py` now guards against
a recurrence.

This revision also adds the hash-chain columns and the append-only trigger on
audit_logs. P-03 fills in the chain construction in the application; the
trigger is what makes "append-only" true rather than asserted, because it
holds even against a client with direct database access.
"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "003_p01_schema_reconciliation"
down_revision: Union[str, None] = "002_add_round2_models"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# The trigger rejects UPDATE and DELETE outright. Kept as a constant so the
# downgrade drops exactly what the upgrade created.
_AUDIT_GUARD_FN = """
CREATE OR REPLACE FUNCTION chamberforge_audit_append_only()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'audit_logs is append-only: % is not permitted', TG_OP;
END;
$$ LANGUAGE plpgsql;
"""

_AUDIT_GUARD_TRIGGER = """
CREATE TRIGGER audit_logs_append_only
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION chamberforge_audit_append_only();
"""


def upgrade() -> None:
    # ── The four tables that were never created ──────────────────────────

    op.create_table(
        "mfa_configs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("secret", sa.String(512), nullable=False),
        sa.Column("is_enabled", sa.Boolean, nullable=False, server_default=sa.false()),
        sa.Column("backup_codes", sa.JSON, nullable=False, server_default="[]"),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_mfa_configs_user_id", "mfa_configs", ["user_id"], unique=True)

    op.create_table(
        "wealth_events",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), nullable=False),
        sa.Column("event_type", sa.String(50), nullable=False),
        sa.Column("person_name", sa.String(255), nullable=False),
        sa.Column("company", sa.String(255), nullable=True),
        sa.Column("estimated_impact", sa.String(255), nullable=True),
        sa.Column("source_url", sa.Text, nullable=True),
        sa.Column("relevance_score", sa.Float, nullable=True, server_default="0.5"),
        sa.Column("buying_window_status", sa.String(30), nullable=True),
        sa.Column("detected_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column("expires_at", sa.DateTime, nullable=True),
        sa.Column("linked_problem_id", sa.String(36), nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_wealth_events_workspace_id", "wealth_events", ["workspace_id"])
    op.create_index("ix_wealth_events_linked_problem_id", "wealth_events", ["linked_problem_id"])

    op.create_table(
        "community_insights",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("contributor_workspace_id", sa.String(36), nullable=False),
        sa.Column("insight_type", sa.String(50), nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("category", sa.String(100), nullable=True),
        sa.Column("is_anonymized", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column("upvotes", sa.Integer, nullable=False, server_default="0"),
        sa.Column("downvotes", sa.Integer, nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_community_insights_contributor", "community_insights", ["contributor_workspace_id"])
    op.create_index("ix_community_insights_category", "community_insights", ["category"])

    op.create_table(
        "white_label_configs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), nullable=False),
        sa.Column("brand_name", sa.String(255), nullable=False, server_default="ChamberForge"),
        sa.Column("logo_url", sa.String(1024), nullable=True),
        sa.Column("primary_color", sa.String(7), nullable=False, server_default="#fbbf24"),
        sa.Column("secondary_color", sa.String(7), nullable=False, server_default="#102a43"),
        sa.Column("favicon_url", sa.String(1024), nullable=True),
        sa.Column("custom_domain", sa.String(255), nullable=True),
        sa.Column("email_from_name", sa.String(255), nullable=True),
        sa.Column("email_from_address", sa.String(255), nullable=True),
        sa.Column("portal_footer_text", sa.String(500), nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_white_label_configs_workspace_id", "white_label_configs", ["workspace_id"], unique=True)

    # ── Audit integrity (P-03 fills in the application side) ─────────────

    op.add_column("audit_logs", sa.Column("prev_hash", sa.String(64), nullable=True))
    op.add_column("audit_logs", sa.Column("entry_hash", sa.String(64), nullable=True))
    op.create_index("ix_audit_logs_entry_hash", "audit_logs", ["entry_hash"])

    # Postgres only. SQLite has no plpgsql, and the test suite runs against
    # SQLite locally, so skip rather than fail there - CI runs Postgres and
    # test_audit_integrity asserts the trigger actually bites.
    if op.get_bind().dialect.name == "postgresql":
        op.execute(_AUDIT_GUARD_FN)
        op.execute(_AUDIT_GUARD_TRIGGER)


def downgrade() -> None:
    if op.get_bind().dialect.name == "postgresql":
        op.execute("DROP TRIGGER IF EXISTS audit_logs_append_only ON audit_logs;")
        op.execute("DROP FUNCTION IF EXISTS chamberforge_audit_append_only();")

    op.drop_index("ix_audit_logs_entry_hash", table_name="audit_logs")
    op.drop_column("audit_logs", "entry_hash")
    op.drop_column("audit_logs", "prev_hash")

    op.drop_index("ix_white_label_configs_workspace_id", table_name="white_label_configs")
    op.drop_table("white_label_configs")

    op.drop_index("ix_community_insights_category", table_name="community_insights")
    op.drop_index("ix_community_insights_contributor", table_name="community_insights")
    op.drop_table("community_insights")

    op.drop_index("ix_wealth_events_linked_problem_id", table_name="wealth_events")
    op.drop_index("ix_wealth_events_workspace_id", table_name="wealth_events")
    op.drop_table("wealth_events")

    op.drop_index("ix_mfa_configs_user_id", table_name="mfa_configs")
    op.drop_table("mfa_configs")
