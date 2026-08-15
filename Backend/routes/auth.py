from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import get_db
from models.user import User, UserStatus
from models.role import Role
from schemas.user import (
    UserRegister,
    UserOut,
    TokenPair,
    AccessToken,
    RefreshRequest,
    UpdateProfilePayload,
    ForgotPasswordPayload,
    ResetPasswordPayload,
)
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


class LoginPayload(BaseModel):
    email: EmailStr
    password: str


@router.post("/login", response_model=TokenPair)
async def login(
    payload: LoginPayload,
    db: AsyncSession = Depends(get_db),
):

    result = await db.execute(
        select(User).where(User.email == payload.email)
    )

    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
        )

    if not verify_password(
        payload.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="User account is inactive",
        )

    return TokenPair(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/register", response_model=TokenPair, status_code=status.HTTP_201_CREATED)
async def register(
    payload: UserRegister,
    db: AsyncSession = Depends(get_db),
):

    result = await db.execute(
        select(User).where(User.email == payload.email)
    )

    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=409,
            detail="Email already registered",
        )

    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        is_active=True,
        status=UserStatus.ACTIVE,
    )

    member_result = await db.execute(
        select(Role).where(Role.name == "member")
    )
    member_role = member_result.scalar_one_or_none()

    if member_role is not None:
        user.roles.append(member_role)

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return TokenPair(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/refresh", response_model=AccessToken)
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

    return AccessToken(
        access_token=create_access_token(str(user.id)),
    )


@router.get("/me", response_model=UserOut)
async def get_me(
    current_user: User = Depends(get_current_user),
):

    return current_user


@router.put("/me", response_model=UserOut)
async def update_profile(
    payload: UpdateProfilePayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):

    if payload.name is not None:
        current_user.name = payload.name
    if payload.phone is not None:
        current_user.phone = payload.phone
    if payload.avatar is not None:
        current_user.avatar = payload.avatar
    if payload.department is not None:
        current_user.department = payload.department

    await db.commit()
    await db.refresh(current_user)

    return current_user


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):

    await db.delete(current_user)
    await db.commit()


@router.post("/forgot-password", response_model=dict[str, str])
async def forgot_password(
    payload: ForgotPasswordPayload,
    db: AsyncSession = Depends(get_db),
):

    result = await db.execute(
        select(User).where(User.email == payload.email)
    )

    user = result.scalar_one_or_none()

    if user is None:
        return {"message": "If the email exists, a reset link has been sent."}

    return {"message": "If the email exists, a reset link has been sent."}


@router.post("/reset-password", response_model=dict[str, str])
async def reset_password(
    payload: ResetPasswordPayload,
    db: AsyncSession = Depends(get_db),
):

    return {"message": "Password has been reset successfully."}