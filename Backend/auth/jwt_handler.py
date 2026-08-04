from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt

from config import settings


def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None,
) -> str:
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + (
        expires_delta
        or timedelta(minutes=settings.access_token_expire_minutes)
    )

    to_encode.update(
        {
            "exp": expire,
            "type": "access",
        }
    )

    return jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=settings.algorithm,
    )


def create_refresh_token(
    data: dict,
    expires_delta: Optional[timedelta] = None,
) -> str:

    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + (
        expires_delta
        or timedelta(days=settings.refresh_token_expire_days)
    )

    to_encode.update(
        {
            "exp": expire,
            "type": "refresh",
        }
    )

    return jwt.encode(
        to_encode,
        settings.refresh_secret_key,
        algorithm=settings.algorithm,
    )


def decode_access_token(token: str) -> Optional[dict]:

    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm],
        )

        if payload.get("type") != "access":
            return None

        return payload

    except JWTError:
        return None


def decode_refresh_token(token: str) -> Optional[dict]:

    try:
        payload = jwt.decode(
            token,
            settings.refresh_secret_key,
            algorithms=[settings.algorithm],
        )

        if payload.get("type") != "refresh":
            return None

        return payload

    except JWTError:
        return None