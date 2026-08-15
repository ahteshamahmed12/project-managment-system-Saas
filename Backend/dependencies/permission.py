from typing import Callable

from fastapi import Depends, HTTPException, status

from auth.dependencies import get_current_user
from models.user import User


def require_permission(permission_name: str) -> Callable:
    async def permission_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:
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

        return current_user

    return permission_checker