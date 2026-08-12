from collections.abc import Callable

from fastapi import Depends, HTTPException, status

from auth.dependencies import get_current_user
from models.user import User


def require_permission(permission_name: str) -> Callable:

    async def permission_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:

        for role in current_user.roles:

            for permission in role.permissions:

                if permission.name == permission_name:
                    return current_user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action.",
        )

    return permission_checker


def require_role(role_name: str) -> Callable:

    async def role_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:

        user_role_names = {
            role.name
            for role in current_user.roles
        }

        if role_name not in user_role_names:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have the required role.",
            )

        return current_user

    return role_checker