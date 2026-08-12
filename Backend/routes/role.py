from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import get_db
from models.role import Role, Permission
from models.user import User
from schemas.role import RoleCreate, RoleOut
from dependencies.permission import require_permission


router = APIRouter(
    prefix="/roles",
    tags=["RBAC - Roles"],
)


@router.get(
    "/",
    response_model=list[RoleOut],
)
async def get_roles(
    current_user: User = Depends(
        require_permission("role:read")
    ),
    db: AsyncSession = Depends(get_db),
):

    result = await db.execute(
        select(Role)
        .options(
            selectinload(Role.permissions)
        )
        .order_by(Role.name)
    )

    return result.scalars().unique().all()

@router.post("/{role_id}/permissions/{permission_id}")
async def assign_permission_to_role(
    role_id: UUID,
    permission_id: UUID,

    current_user: User = Depends(
        require_permission("role:update")
    ),

    db: AsyncSession = Depends(get_db),
):

    result = await db.execute(
        select(Role)
        .options(
            selectinload(Role.permissions)
        )
        .where(Role.id == role_id)
    )

    role = result.scalar_one_or_none()

    if role is None:
        raise HTTPException(
            status_code=404,
            detail="Role not found.",
        )

    result = await db.execute(
        select(Permission)
        .where(Permission.id == permission_id)
    )

    permission = result.scalar_one_or_none()

    if permission is None:
        raise HTTPException(
            status_code=404,
            detail="Permission not found.",
        )

    if permission not in role.permissions:
        role.permissions.append(permission)

    await db.commit()

    return {
        "message": "Permission assigned successfully."
    }

@router.post(
    "/",
    response_model=RoleOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_role(
    data: RoleCreate,
    current_user: User = Depends(
        require_permission("role:create")
    ),
    db: AsyncSession = Depends(get_db),
):

    result = await db.execute(
        select(Role)
        .where(Role.name == data.name)
    )

    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Role already exists.",
        )

    role = Role(
        name=data.name,
        description=data.description,
        is_system_role=False,
    )

    db.add(role)

    await db.commit()

    await db.refresh(role)

    return role