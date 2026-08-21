from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from auth.dependencies import get_current_user
from database import get_db
from models.user import User
from models.role import Role
from models.permission import Permission
from schemas.user import UserOut
from schemas.role import RoleOut

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@router.get("/stats")
async def get_admin_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get admin dashboard statistics."""
    # Count users
    user_count = (await db.execute(select(func.count(User.id)))).scalar_one()
    
    # Count projects
    project_count = (await db.execute(select(func.count(func.count(Project.id))))).scalar_one() if False else 0
    
    # Count tasks
    task_count = (await db.execute(select(func.count(Task.id)))).scalar_one()
    
    # Count sprints
    sprint_count = (await db.execute(select(func.count(Sprint.id)))).scalar_one()
    
    return {
        "users": user_count,
        "projects": project_count,
        "tasks": task_count,
        "sprints": sprint_count,
    }


@router.get("/users")
async def list_all_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all users (admin only)."""
    result = await db.execute(
        select(User)
        .options(selectinload(User.roles).selectinload(Role.permissions))
        .order_by(User.name)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().unique().all()


@router.get("/users/{user_id}")
async def get_user_detail(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get user detail by admin."""
    result = await db.execute(
        select(User)
        .options(selectinload(User.roles).selectinload(Role.permissions))
        .where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user


@router.post("/users/{user_id}/roles/{role_id}")
async def admin_assign_role(
    user_id: str,
    role_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Admin assign role to user."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    result = await db.execute(select(Role).where(Role.id == role_id))
    role = result.scalar_one_or_none()
    
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    if role not in user.roles:
        user.roles.append(role)
    
    await db.commit()
    await db.refresh(user)
    
    return {"message": f"Role {role.name} assigned to user {user.name}"}