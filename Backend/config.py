from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

    # PostgreSQL
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/project_management"

    # JWT
    secret_key: str = "27f545d6172708105343672522b9fa40a12897d4d72b0cc83ae41d6fab6d934a"
    refresh_secret_key: str = "373e59c6005d17f99d753e2168525552ecbd2eeeae20e0aba3616b51cda0e372"
    algorithm: str = "HS256"

    # Token Expiration
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7


settings = Settings()