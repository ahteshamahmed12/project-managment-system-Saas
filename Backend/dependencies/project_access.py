from typing import Awaitable, Callable

from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth.dependencies import get_current_user
from database import get_db
from models.project import Project
from models.user import User


async def verify_project_access(
    current_user: User,
    db: AsyncSession,
    project_id: int,
    permission_name: str = "project:read",
) -> Project:
    """RBAC guard + project existence check.

    The app currently has no membership table, so access is governed by the
    user's RBAC permissions. Extend with a membership lookup (e.g. a
    project_members table) here when one is introduced.
    """
    user_permissions = {
        permission.name
        for role in current_user.roles
        for permission in role.permissions
    }
    if permission_name not in user_permissions:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Missing required permission: {permission_name}",
        )

    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    return project


def require_project_access(permission_name: str = "project:read") -> Callable[..., Awaitable[Project]]:
    async def checker(
        project_id: int,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ) -> Project:
        return await verify_project_access(current_user, db, project_id, permission_name)

    return checker