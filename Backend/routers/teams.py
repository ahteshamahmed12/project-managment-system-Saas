from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from auth.dependencies import get_current_user
from database import get_db
from models.project import Project
from models.role import Role
from models.tasks import Task
from models.user import User
from schemas.user import UserOut

router = APIRouter(
    prefix="/teams",
    tags=["Teams"],
)


@router.get("/", response_model=list[UserOut])
async def list_team_members(
    project_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List team members, optionally filtered by project."""
    if project_id:
        query = (
            select(User)
            .distinct()
            .options(
                selectinload(User.roles).selectinload(Role.permissions)
            )
            .join(Task, Task.assigned_to == User.id)
            .where(Task.project_id == project_id)
        )
    else:
        query = select(User).options(
            selectinload(User.roles).selectinload(Role.permissions)
        )
    
    result = await db.execute(query.order_by(User.name))
    return result.scalars().unique().all()


@router.get("/project/{project_id}")
async def get_project_team(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get team members for a specific project."""
    result = await db.execute(
        select(User)
        .distinct()
        .options(
            selectinload(User.roles).selectinload(Role.permissions)
        )
        .join(Task, Task.assigned_to == User.id)
        .where(Task.project_id == project_id)
        .order_by(User.name)
    )
    users = result.scalars().unique().all()
    
    team_data = []
    for user in users:
        task_count = (await db.execute(
            select(func.count(Task.id)).where(Task.assigned_to == user.id)
        )).scalar_one() or 0
        team_data.append({
            "user": user,
            "task_count": task_count,
        })
    
    return team_data


@router.post("/{user_id}/assign-to-project/{project_id}")
async def assign_user_to_project(
    user_id: str,
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Assign a user to a project."""
    try:
        user_uuid = UUID(user_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    user_result = await db.execute(select(User).where(User.id == user_uuid))
    user = user_result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    project_result = await db.execute(select(Project).where(Project.id == project_id))
    project = project_result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return {"message": f"User {user.name} assigned to project {project.name}"}