from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import get_db
from models.user import User
from models.role import Role
from dependencies.permission import require_permission


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.post("/{user_id}/roles/{role_id}")
async def assign_role(
    user_id: UUID,
    role_id: UUID,

    current_user: User = Depends(
        require_permission("user:update")
    ),

    db: AsyncSession = Depends(get_db),
):

    result = await db.execute(
        select(User)
        .options(
            selectinload(User.roles)
        )
        .where(User.id == user_id)
    )

    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    result = await db.execute(
        select(Role)
        .where(Role.id == role_id)
    )

    role = result.scalar_one_or_none()

    if role is None:
        raise HTTPException(
            status_code=404,
            detail="Role not found.",
        )

    if role not in user.roles:
        user.roles.append(role)

    await db.commit()

    return {
        "message": "Role assigned successfully."
    }