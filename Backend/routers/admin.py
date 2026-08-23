from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from auth.dependencies import get_current_user
from database import get_db
from models.user import User
from models.role import Role
from models.permission import Permission
from models.project import Project
from models.tasks import Task
from models.sprints import Sprint
from models.kanban import KanbanTask
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
    user_count = (await db.execute(select(func.count(User.id)))).scalar_one() or 0
    
    # Count projects
    project_count = (await db.execute(select(func.count(Project.id)))).scalar_one() or 0
    
    # Count tasks (legacy tasks + kanban tasks)
    task_count = (await db.execute(select(func.count(Task.id)))).scalar_one() or 0
    kanban_task_count = (await db.execute(select(func.count(KanbanTask.id)))).scalar_one() or 0
    total_tasks = task_count + kanban_task_count

    # Count completed tasks
    completed_task_count = (await db.execute(
        select(func.count(Task.id)).where(Task.status.in_(["done", "Completed", "completed"]))
    )).scalar_one() or 0
    completed_kanban_count = (await db.execute(
        select(func.count(KanbanTask.id)).where(KanbanTask.is_completed == True)
    )).scalar_one() or 0
    total_completed = completed_task_count + completed_kanban_count
    
    # Count sprints
    sprint_count = (await db.execute(select(func.count(Sprint.id)))).scalar_one() or 0
    
    return {
        "users": user_count,
        "projects": project_count,
        "tasks": total_tasks,
        "completed": total_completed,
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
    try:
        user_uuid = UUID(user_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid user ID")

    result = await db.execute(
        select(User)
        .options(selectinload(User.roles).selectinload(Role.permissions))
        .where(User.id == user_uuid)
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
    try:
        user_uuid = UUID(user_id)
        role_uuid = UUID(role_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid ID format")

    result = await db.execute(
        select(User).options(selectinload(User.roles)).where(User.id == user_uuid)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    result = await db.execute(select(Role).where(Role.id == role_uuid))
    role = result.scalar_one_or_none()
    
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    if role not in user.roles:
        user.roles.append(role)
    
    await db.commit()
    await db.refresh(user)
    
    return {"message": f"Role {role.name} assigned to user {user.name}"}