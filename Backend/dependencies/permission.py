from fastapi import HTTPException , status , Depends
from typing import List
from  ..auth import get_current_user

def require_role(required_roles: List[str]):
    async def role_checker(current_user = Depends(get_current_user)):
        user_roles = [role.name for role in current_user.roles]
        if not any(role in user_roles for role in required_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have the required role to access this resource."
            )
        return current_user
    return role_checker
    