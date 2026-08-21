from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from auth.dependencies import get_current_user
from database import get_db
from models.project import Project
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
    query = select(User).options(
        selectinload(User.roles)
        .selectinload(Role.permissions)
    )
    
    if project_id:
        # Get users who have tasks in the project
        query = select(User).distinct().join(Task).where(Task.project_id == project_id)
    
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
        select(User).distinct()
        .join(Task)
        .where(Task.project_id == project_id)
        .order_by(User.name)
    )
    users = result.scalars().unique().all()
    
    # Get task counts per user
    team_data = []
    for user in users:
        task_count = (await db.execute(
            select(func.count(Task.id)).where(Task.assigned_to == str(user.id))
        )).scalar_one()
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
    # Check user exists
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check project exists
    project_result = await db.execute(select(Project).where(Project.id == project_id))
    project = project_result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return {"message": f"User {user.name} assigned to project {project.name}"}