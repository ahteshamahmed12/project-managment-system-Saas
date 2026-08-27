import json
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, desc, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from auth.dependencies import get_current_user
from database import get_db
from models.user import User
from models.notification import Notification
from schemas.notification import (
    NotificationOut,
    NotificationCreate,
)
from app.websocket.manager import manager

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


def _serialize(notification: Notification) -> dict:
    return {
        "id": str(notification.id),
        "user_id": str(notification.user_id),
        "title": notification.title,
        "message": notification.message,
        "type": notification.type,
        "read": notification.read,
        "created_at": notification.created_at.isoformat()
        if notification.created_at
        else None,
    }


async def _push_notification(notification: Notification) -> None:
    await manager.send_to_user(
        str(notification.user_id),
        {"type": "notification", "data": _serialize(notification)},
    )


@router.get("", response_model=list[NotificationOut])
async def list_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return the current user's notifications (newest first)."""
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(desc(Notification.created_at))
    )
    return result.scalars().all()


@router.post(
    "",
    response_model=NotificationOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_notification(
    payload: NotificationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a notification (e.g. triggered by the system or another user)."""
    notification = Notification(
        user_id=payload.user_id,
        title=payload.title,
        message=payload.message,
        type=payload.type,
    )
    db.add(notification)
    await db.commit()
    await db.refresh(notification)

    await _push_notification(notification)

    return notification


@router.patch("/{notification_id}/read", response_model=NotificationOut)
async def mark_as_read(
    notification_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    notification = await db.get(Notification, notification_id)
    if notification is None or notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )

    notification.read = True
    await db.commit()
    await db.refresh(notification)
    return notification


@router.post("/read-all")
async def mark_all_as_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(
        update(Notification)
        .where(Notification.user_id == current_user.id)
        .values(read=True)
    )
    await db.commit()
    return {"success": True}


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    notification = await db.get(Notification, notification_id)
    if notification is None or notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )

    await db.delete(notification)
    await db.commit()
    return {"success": True}


@router.delete("")
async def clear_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(
        delete(Notification).where(
            Notification.user_id == current_user.id
        )
    )
    await db.commit()
    return {"success": True}
