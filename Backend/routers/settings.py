from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from auth.dependencies import get_current_user
from database import get_db
from models.user import User
from schemas.user import UserOut

router = APIRouter(
    prefix="/settings",
    tags=["Settings"],
)


@router.get("/", response_model=UserOut)
async def get_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get user settings/profile."""
    return current_user


@router.put("/", response_model=UserOut)
async def update_settings(
    payload: UserOut,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update user settings/profile."""
    # Handle the case where payload is a UserOut model vs dict
    update_data = payload.model_dump(exclude_unset=True, exclude={"id", "email", "roles", "created_at"})
    
    for field, value in update_data.items():
        if hasattr(current_user, field) and value is not None:
            setattr(current_user, field, value)
    
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.get("/notification-preferences")
async def get_notification_preferences(
    current_user: User = Depends(get_current_user),
):
    """Get notification preferences for the user."""
    return {
        "email_notifications": True,
        "push_notifications": True,
        "task_comments": True,
        "task_status_changes": True,
    }


@router.put("/notification-preferences")
async def update_notification_preferences(
    preferences: dict,
    current_user: User = Depends(get_current_user),
):
    """Update notification preferences for the user."""
    return {"message": "Notification preferences updated", "preferences": preferences}