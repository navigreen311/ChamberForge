"""Alembic environment configuration for ChamberForge."""
import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool

from alembic import context

# this is the Alembic Config object
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Override sqlalchemy.url from environment variable if set
database_url = os.environ.get(
    "DATABASE_URL",
    config.get_main_option("sqlalchemy.url"),
)
if database_url:
    config.set_main_option("sqlalchemy.url", database_url)

# Import Base and all models so metadata is populated
from app.db.session import Base  # noqa: E402

# Import every model module to ensure they register with Base.metadata
from app.models.user import User  # noqa: F401, E402
from app.models.workspace import Workspace  # noqa: F401, E402
from app.models.problem import Problem  # noqa: F401, E402
from app.models.evidence import Evidence  # noqa: F401, E402
from app.models.offer import Offer  # noqa: F401, E402
from app.models.client import Client  # noqa: F401, E402
from app.models.household_graph import HouseholdGraph  # noqa: F401, E402
from app.models.playbook import Playbook  # noqa: F401, E402
from app.models.playbook_activation import PlaybookActivation  # noqa: F401, E402
from app.models.audit_log import AuditLog  # noqa: F401, E402
from app.models.ai_usage import AIUsageLog  # noqa: F401, E402
from app.models.automation_rule import AutomationRule  # noqa: F401, E402
from app.models.billing import Subscription, Invoice, Referral  # noqa: F401, E402
from app.models.consent import ConsentRecord  # noqa: F401, E402
from app.models.crisis_incident import CrisisIncident  # noqa: F401, E402
from app.models.deletion_request import DeletionRequest  # noqa: F401, E402
from app.models.document import Document  # noqa: F401, E402
from app.models.feature_flag import FeatureFlag  # noqa: F401, E402
from app.models.legal_hold import LegalHold  # noqa: F401, E402
from app.models.message import SecureMessage  # noqa: F401, E402
from app.models.notification import Notification  # noqa: F401, E402
from app.models.prompt_version import PromptVersion  # noqa: F401, E402
from app.models.risk_review import RiskReview  # noqa: F401, E402
from app.models.template_version import TemplateVersion  # noqa: F401, E402
from app.models.email_log import EmailLog  # noqa: F401, E402
from app.models.onboarding import OnboardingProgress  # noqa: F401, E402
from app.models.client_portal import ClientPortalAccess  # noqa: F401, E402
from app.models.drip_status import DripStatus  # noqa: F401, E402
from app.models.retention_policy import RetentionPolicy  # noqa: F401, E402

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL and not an Engine,
    though an Engine is acceptable here as well. By skipping the Engine
    creation we don't even need a DBAPI to be available.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine and associate a
    connection with the context.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
