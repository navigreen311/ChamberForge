"""Application configuration loaded from environment variables."""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_ENV: str = "development"
    APP_VERSION: str = "1.0.0"
    APP_PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:3000"

    # Database
    DATABASE_URL: str = "postgresql://localhost:5432/chamberforge"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # Auth
    JWT_SECRET: str = "changeme"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Sentry
    SENTRY_DSN: str = ""

    # Datadog
    DD_API_KEY: str = ""
    DD_AGENT_HOST: str = "localhost"
    DD_ENV: str = "development"

    # Anthropic
    ANTHROPIC_API_KEY: str = ""
    AI_MODEL: str = "claude-sonnet-4-6"

    # AWS
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_S3_BUCKET: str = ""
    AWS_REGION: str = "us-east-1"

    # Elasticsearch
    ELASTICSEARCH_URL: str = "http://localhost:9200"

    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # Resend
    RESEND_API_KEY: str = ""

    # Rate Limiting
    RATE_LIMIT_DEFAULT: int = 100  # per minute per IP
    RATE_LIMIT_WORKSPACE: int = 1000  # per minute per workspace
    RATE_LIMIT_AI: int = 20  # per minute for AI endpoints
    RATE_LIMIT_EXPORT: int = 10  # per minute for export endpoints
    RATE_LIMIT_AUTH: int = 30  # per minute for auth endpoints

    # Pusher
    PUSHER_APP_ID: str = ""
    PUSHER_KEY: str = ""
    PUSHER_SECRET: str = ""
    PUSHER_CLUSTER: str = ""

    # VoiceForge
    VOICEFORGE_API_URL: str = ""
    VOICEFORGE_API_KEY: str = ""

    # VisionAudioForge
    VISIONAUDIOFORGE_API_URL: str = ""
    VISIONAUDIOFORGE_API_KEY: str = ""

    # ------------------------------------------------------------------
    # P-00: the complete settings surface for the parallel build.
    # Every value below is landed up front with a safe default so that no
    # later package needs to edit this file. Packages read settings.X;
    # they do not add to it. See PARALLEL_BUILD.md.
    # ------------------------------------------------------------------

    # NextAuth (D1 - Prisma + NextAuth are the adopted auth path)
    NEXTAUTH_SECRET: str = ""
    NEXTAUTH_URL: str = "http://localhost:3000"
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # AI runtime governance (P-04)
    AI_TEMPERATURE: float = 0.0  # explicit, so golden tests have a stable baseline
    AI_MONTHLY_BUDGET_USD: float = 250.0  # per workspace; enforced, not advisory
    AI_BUDGET_ENFORCED: bool = True  # False only for local experimentation

    # Partner integration resilience (P-07)
    INTEGRATION_MAX_RETRIES: int = 3
    INTEGRATION_BACKOFF_SECONDS: float = 0.5
    INTEGRATION_CIRCUIT_THRESHOLD: int = 5  # consecutive failures before opening

    # Rate limiting backend (P-10). "memory" is per-process and only correct
    # for a single instance; "redis" is required for any real deployment.
    RATE_LIMIT_BACKEND: str = "redis"

    # Client delivery portal (P-30)
    PORTAL_MAGIC_LINK_TTL_MINUTES: int = 30
    PORTAL_MAGIC_LINK_RATE_LIMIT: int = 5  # per client per hour

    # Audit integrity (P-03)
    AUDIT_CHAIN_ENABLED: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
