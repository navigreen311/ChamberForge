"""Add Round 2-3 tables: onboarding, client portal, drip status, retention policies.

Revision ID: 002_add_round2_models
Revises: 001_initial
Create Date: 2026-04-03

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "002_add_round2_models"
down_revision: Union[str, None] = "001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── onboarding_progress ──
    op.create_table(
        "onboarding_progress",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), unique=True, nullable=False),
        sa.Column("current_step", sa.Integer, nullable=False, server_default="1"),
        sa.Column("completed_steps", sa.JSON, nullable=False, server_default="[]"),
        sa.Column("skipped_steps", sa.JSON, nullable=False, server_default="[]"),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_onboarding_progress_user_id", "onboarding_progress", ["user_id"], unique=True)

    # ── client_portal_access ──
    op.create_table(
        "client_portal_access",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("client_id", sa.String(36), nullable=False),
        sa.Column("portal_token", sa.String(128), unique=True, nullable=False),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.text("true")),
        sa.Column("last_accessed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("settings", sa.JSON, nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_client_portal_access_client_id", "client_portal_access", ["client_id"])
    op.create_index("ix_client_portal_access_portal_token", "client_portal_access", ["portal_token"], unique=True)

    # ── drip_statuses ──
    op.create_table(
        "drip_statuses",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), nullable=False),
        sa.Column("sequence_name", sa.String(100), nullable=False),
        sa.Column("current_step", sa.Integer, nullable=False, server_default="0"),
        sa.Column("last_sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("next_send_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed", sa.Boolean, nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_drip_statuses_user_id", "drip_statuses", ["user_id"])
    op.create_index("ix_drip_statuses_sequence_name", "drip_statuses", ["sequence_name"])

    # ── retention_policies ──
    op.create_table(
        "retention_policies",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), nullable=False),
        sa.Column("document_class", sa.String(50), nullable=False),
        sa.Column("retention_days", sa.Integer, nullable=False),
        sa.Column("auto_delete", sa.Boolean, nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("workspace_id", "document_class", name="uq_retention_workspace_class"),
    )
    op.create_index("ix_retention_policies_workspace_id", "retention_policies", ["workspace_id"])
    op.create_index(
        "ix_retention_policies_workspace_auto",
        "retention_policies",
        ["workspace_id", "auto_delete"],
    )


def downgrade() -> None:
    op.drop_table("retention_policies")
    op.drop_table("drip_statuses")
    op.drop_table("client_portal_access")
    op.drop_table("onboarding_progress")
