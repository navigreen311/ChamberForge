"""P-01: the support tables four later packages depend on.

Revision ID: 004_p01_support_tables
Revises: 003_p01_schema_reconciliation
Create Date: 2026-09-10

P-01 owns the whole revision chain so that no other package ever writes a
migration - two concurrent revisions produce two heads with the same parent
and Alembic refuses to run. These four tables are therefore landed up front,
before the packages that fill them:

    workspace_budgets    P-04  per-workspace AI spend ceiling. The refusal at
                               the ceiling is the kill switch the platform
                               claims and does not have.
    sandbox_environments P-02  the sandbox is a class-level dict today, so it
                               is lost on restart and has no boundary.
    ontology_extensions  P-09  currently a module-level dict shared by every
                               caller - a leak as well as a durability bug.
    scoring_results      P-09  red_team_auditor, client_health, decision_room
                               and guardrails_engine compute and discard, so
                               "why was this approved in March" is
                               unanswerable.

All four are FastAPI-owned under D4: none is a domain model, none appears in
the Prisma schema.
"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "004_p01_support_tables"
down_revision: Union[str, None] = "003_p01_schema_reconciliation"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "workspace_budgets",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), nullable=False),
        sa.Column("monthly_budget_usd", sa.Float, nullable=False, server_default="250.0"),
        sa.Column("period_start", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("spent_usd", sa.Float, nullable=False, server_default="0.0"),
        # False lets an operator deliberately run without a ceiling. It is not
        # the default, and P-04 asserts the enforced path.
        sa.Column("enforced", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column("approval_threshold_usd", sa.Float, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_workspace_budgets_workspace_id", "workspace_budgets", ["workspace_id"], unique=True)

    op.create_table(
        "sandbox_environments",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("status", sa.String(30), nullable=False, server_default="active"),
        # The boundary. A row with is_sandbox true must never be visible to a
        # production query, and P-02 asserts that in both directions.
        sa.Column("is_sandbox", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column("synthetic_data", sa.JSON, nullable=False, server_default="{}"),
        sa.Column("seeded_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_sandbox_environments_workspace_id", "sandbox_environments", ["workspace_id"])

    op.create_table(
        "ontology_extensions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), nullable=False),
        sa.Column("field_name", sa.String(255), nullable=False),
        sa.Column("value", sa.String(500), nullable=False),
        sa.Column("created_by", sa.String(36), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        # Declared inline rather than via create_unique_constraint: SQLite has
        # no ALTER TABLE ADD CONSTRAINT, and the migration tests run on SQLite.
        sa.UniqueConstraint(
            "workspace_id", "field_name", "value", name="uq_ontology_extensions_ws_field_value"
        ),
    )
    op.create_index(
        "ix_ontology_extensions_ws_field",
        "ontology_extensions",
        ["workspace_id", "field_name"],
    )

    op.create_table(
        "scoring_results",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), nullable=False),
        # red_team | client_health | decision_room | guardrails
        sa.Column("scorer", sa.String(50), nullable=False),
        sa.Column("subject_type", sa.String(50), nullable=False),
        sa.Column("subject_id", sa.String(36), nullable=False),
        sa.Column("score", sa.Float, nullable=True),
        sa.Column("verdict", sa.String(50), nullable=True),
        # Inputs are kept alongside the score so a past decision can be
        # explained, not just recited.
        sa.Column("inputs", sa.JSON, nullable=False, server_default="{}"),
        sa.Column("detail", sa.JSON, nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_scoring_results_subject", "scoring_results", ["subject_type", "subject_id"])
    op.create_index("ix_scoring_results_ws_scorer", "scoring_results", ["workspace_id", "scorer"])


def downgrade() -> None:
    op.drop_index("ix_scoring_results_ws_scorer", table_name="scoring_results")
    op.drop_index("ix_scoring_results_subject", table_name="scoring_results")
    op.drop_table("scoring_results")

    op.drop_index("ix_ontology_extensions_ws_field", table_name="ontology_extensions")
    op.drop_table("ontology_extensions")

    op.drop_index("ix_sandbox_environments_workspace_id", table_name="sandbox_environments")
    op.drop_table("sandbox_environments")

    op.drop_index("ix_workspace_budgets_workspace_id", table_name="workspace_budgets")
    op.drop_table("workspace_budgets")
