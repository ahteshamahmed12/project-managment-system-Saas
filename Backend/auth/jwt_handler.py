from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt

from config import settings


def _create_token(subject: str, expires_delta: timedelta, token_type: str) -> str:
    expire = datetime.now(timezone.utc) + expires_delta
    payload = {"sub": subject, "exp": expire, "type": token_type}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def create_access_token(user_id: str) -> str:
    return _create_token(
        user_id, timedelta(minutes=settings.access_token_expire_minutes), "access"
    )


def create_refresh_token(user_id: str) -> str:
    return _create_token(
        user_id, timedelta(days=settings.refresh_token_expire_days), "refresh"
    )


def create_password_reset_token(user_id: str) -> str:
    return _create_token(
        user_id, timedelta(minutes=settings.reset_token_expire_minutes), "password_reset"
    )


def _decode(token: str) -> dict[str, Any] | None:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError:
        return None


def decode_access_token(token: str) -> dict[str, Any] | None:
    payload = _decode(token)
    if payload is None or payload.get("type") != "access":
        return None
    return payload


def decode_refresh_token(token: str) -> dict[str, Any] | None:
    payload = _decode(token)
    if payload is None or payload.get("type") != "refresh":
        return None
    return payload


def decode_password_reset_token(token: str) -> dict[str, Any] | None:
    payload = _decode(token)
    if payload is None or payload.get("type") != "password_reset":
        return None
    return payload