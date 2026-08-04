from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.user import User
from schemas.user import UserCreate, UserOut, Token, RefreshRequest
from auth.hashing import hash_password, verify_password
from auth.jwt_handler import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
)
from auth.dependencies import get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def signup(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
):

    result = await db.execute(
        select(User).where(User.email == user_data.email)
    )

    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
    )

    db.add(user)

    await db.commit()

    await db.refresh(user)

    return user


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):

    result = await db.execute(
        select(User).where(User.email == form_data.username)
    )

    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
        )

    if not verify_password(
        form_data.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
        )

    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
    }

    return Token(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    payload: RefreshRequest,
    db: AsyncSession = Depends(get_db),
):

    data = decode_refresh_token(payload.refresh_token)

    if data is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token",
        )

    result = await db.execute(
        select(User).where(
            User.id == UUID(data["sub"])
        )
    )

    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
    }

    return Token(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
    )


@router.get("/me", response_model=UserOut)
async def get_me(
    current_user: User = Depends(get_current_user),
):

    return current_user