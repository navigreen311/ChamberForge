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

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
