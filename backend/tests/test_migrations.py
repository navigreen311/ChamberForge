"""Tests for Alembic migrations — verify upgrade/downgrade with SQLite."""
import os

import pytest
from alembic.config import Config
from sqlalchemy import create_engine, inspect

from alembic import command

# All tables expected after running all migrations through head.
EXPECTED_TABLES = {
    # 001_initial (26 tables)
    "workspaces",
    "playbooks",
    "feature_flags",
    "users",
    "problems",
    "evidence",
    "offers",
    "clients",
    "household_graphs",
    "playbook_activations",
    "audit_logs",
    "ai_usage_logs",
    "automation_rules",
    "subscriptions",
    "invoices",
    "referrals",
    "consent_records",
    "crisis_incidents",
    "deletion_requests",
    "documents",
    "email_logs",
    "legal_holds",
    "secure_messages",
    "notifications",
    "prompt_versions",
    "risk_reviews",
    "template_versions",
    # 002_add_round2_models (4 tables)
    "onboarding_progress",
    "client_portal_access",
    "drip_statuses",
    "retention_policies",
}

# Alembic also creates this tracking table.
ALEMBIC_TABLE = "alembic_version"


def _make_alembic_config(db_url: str) -> Config:
    """Build an Alembic Config pointing at our migrations with the given DB URL."""
    backend_dir = os.path.join(os.path.dirname(__file__), os.pardir)
    cfg = Config(os.path.join(backend_dir, "alembic.ini"))
    cfg.set_main_option("sqlalchemy.url", db_url)
    cfg.set_main_option("script_location", os.path.join(backend_dir, "alembic"))
    return cfg


@pytest.fixture()
def sqlite_url(tmp_path):
    """Return a file-backed SQLite URL for migration testing."""
    db_path = tmp_path / "test_migrations.db"
    return f"sqlite:///{db_path}"


@pytest.fixture()
def alembic_cfg(sqlite_url):
    return _make_alembic_config(sqlite_url)


# ── Tests ────────────────────────────────────────────────────────────────────


def test_upgrade_head(alembic_cfg, sqlite_url):
    """Running 'alembic upgrade head' should succeed without errors."""
    command.upgrade(alembic_cfg, "head")

    engine = create_engine(sqlite_url)
    inspector = inspect(engine)
    tables = set(inspector.get_table_names())

    # All expected tables must be present.
    missing = EXPECTED_TABLES - tables
    assert not missing, f"Missing tables after upgrade head: {missing}"


def test_downgrade_base(alembic_cfg, sqlite_url):
    """Running 'alembic downgrade base' after upgrade should drop all app tables."""
    command.upgrade(alembic_cfg, "head")
    command.downgrade(alembic_cfg, "base")

    engine = create_engine(sqlite_url)
    inspector = inspect(engine)
    tables = set(inspector.get_table_names()) - {ALEMBIC_TABLE}

    assert len(tables) == 0, f"Tables remaining after downgrade base: {tables}"


def test_table_count(alembic_cfg, sqlite_url):
    """After upgrade head, total app tables should be >= 29."""
    command.upgrade(alembic_cfg, "head")

    engine = create_engine(sqlite_url)
    inspector = inspect(engine)
    app_tables = set(inspector.get_table_names()) - {ALEMBIC_TABLE}

    assert len(app_tables) >= 29, (
        f"Expected at least 29 tables, found {len(app_tables)}: {sorted(app_tables)}"
    )


def test_upgrade_downgrade_upgrade_idempotent(alembic_cfg, sqlite_url):
    """Upgrade -> downgrade -> upgrade should work cleanly (no leftover state)."""
    command.upgrade(alembic_cfg, "head")
    command.downgrade(alembic_cfg, "base")
    command.upgrade(alembic_cfg, "head")

    engine = create_engine(sqlite_url)
    inspector = inspect(engine)
    tables = set(inspector.get_table_names())

    missing = EXPECTED_TABLES - tables
    assert not missing, f"Missing tables after re-upgrade: {missing}"


def test_all_model_tables_created(alembic_cfg, sqlite_url):
    """Every table listed in EXPECTED_TABLES must exist after migration."""
    command.upgrade(alembic_cfg, "head")

    engine = create_engine(sqlite_url)
    inspector = inspect(engine)
    tables = set(inspector.get_table_names())

    for table_name in sorted(EXPECTED_TABLES):
        assert table_name in tables, f"Table '{table_name}' not found after upgrade head"
