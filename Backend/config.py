import os

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Known-public dev secrets. Kept as named constants so the guard below can
# detect them rather than silently trusting a committed value.
_DEV_SECRET_KEY = "27f545d6172708105343672522b9fa40a12897d4d72b0cc83ae41d6fab6d934a"
_DEV_REFRESH_SECRET_KEY = (
    "373e59c6005d17f99d753e2168525552ecbd2eeeae20e0aba3616b51cda0e372"
)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

    # PostgreSQL
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/project_management"

    # JWT. These dev defaults are committed to the repo, so they are public and
    # must never be used in a deployed environment. `_reject_dev_secrets` below
    # fails startup if they leak into a serverless deploy.
    secret_key: str = _DEV_SECRET_KEY
    refresh_secret_key: str = _DEV_REFRESH_SECRET_KEY
    algorithm: str = "HS256"

    # Token Expiration
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    reset_token_expire_minutes: int = 15

    # Frontend (used to build password reset links)
    frontend_url: str = "http://localhost:5173"

    # CORS. Comma-separated list of allowed origins.
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Allows Vercel preview deployments (e.g. my-app-git-branch-team.vercel.app)
    # without listing every generated URL. Set to "" to disable.
    cors_origin_regex: str | None = r"https://.*\.vercel\.app"

    # Serverless-safety toggles. Defaults suit local dev; `serverless` is
    # auto-detected from the VERCEL env var below, and it flips the other two off.
    serverless: bool = Field(default_factory=lambda: os.getenv("VERCEL") == "1")
    run_create_all_on_startup: bool | None = None
    sql_echo: bool | None = None

    # SMTP (leave host empty to log reset links to the console instead)
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    email_from: str = "no-reply@promage.local"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> object:
        """Accept either a JSON list or a plain comma-separated env var string."""
        if isinstance(value, str):
            stripped = value.strip()
            if stripped.startswith("["):
                return value
            return [origin.strip() for origin in stripped.split(",") if origin.strip()]
        return value

    @field_validator("cors_origin_regex", mode="before")
    @classmethod
    def _empty_regex_to_none(cls, value: object) -> object:
        if isinstance(value, str) and not value.strip():
            return None
        return value

    @model_validator(mode="after")
    def _apply_serverless_defaults(self) -> "Settings":
        # Only fill in the values the user did not set explicitly.
        if self.run_create_all_on_startup is None:
            self.run_create_all_on_startup = not self.serverless
        if self.sql_echo is None:
            self.sql_echo = not self.serverless
        return self

    @model_validator(mode="after")
    def _reject_dev_secrets(self) -> "Settings":
        """Refuse to boot a deployed app with the committed dev signing keys.

        Anyone with the repo could otherwise mint valid access tokens.
        """
        if not self.serverless:
            return self

        leaked = [
            name
            for name, value, dev_value in (
                ("SECRET_KEY", self.secret_key, _DEV_SECRET_KEY),
                (
                    "REFRESH_SECRET_KEY",
                    self.refresh_secret_key,
                    _DEV_REFRESH_SECRET_KEY,
                ),
            )
            if value == dev_value
        ]
        if leaked:
            raise ValueError(
                "Refusing to start: "
                + ", ".join(leaked)
                + " still use the committed development value. Set them to fresh "
                "random secrets in your Vercel project environment variables "
                "(generate with: python -c \"import secrets; "
                'print(secrets.token_hex(32))").'
            )
        return self


settings = Settings()