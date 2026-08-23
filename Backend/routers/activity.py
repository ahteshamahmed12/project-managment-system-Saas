from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from auth.dependencies import get_current_user
from database import get_db
from models.project import Project
from models.tasks import Task
from models.sprints import Sprint
from models.user import User

router = APIRouter(
    prefix="/activity",
    tags=["Activity Logs"],
)


@router.get("/recent")
async def get_recent_activity(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get recent activity/logs."""
    # Get recent task updates
    task_result = await db.execute(
        select(Task)
        .options(selectinload(Task.project), selectinload(Task.assignee))
        .order_by(desc(Task.created_at))
        .limit(limit // 2 or 10)
    )
    tasks = task_result.scalars().all()
    
    # Get recent sprint updates
    sprint_result = await db.execute(
        select(Sprint)
        .options(selectinload(Sprint.project))
        .order_by(desc(Sprint.created_at))
        .limit(limit // 2 or 10)
    )
    sprints = sprint_result.scalars().all()
    
    activity = []
    
    # Format task activities
    for task in tasks:
        activity.append({
            "id": f"task-{task.id}",
            "type": "task_update",
            "description": f"Task '{task.title}' status is {task.status}",
            "entity_type": "task",
            "entity_id": task.id,
            "created_at": task.updated_at.isoformat() if task.updated_at else (task.created_at.isoformat() if task.created_at else datetime.now(timezone.utc).isoformat()),
            "user": task.assignee.name if task.assignee else "Team Member",
        })
    
    # Format sprint activities
    for sprint in sprints:
        activity.append({
            "id": f"sprint-{sprint.id}",
            "type": "sprint_update",
            "description": f"Sprint '{sprint.name}' is {sprint.status.value if hasattr(sprint.status, 'value') else sprint.status}",
            "entity_type": "sprint",
            "entity_id": sprint.id,
            "created_at": sprint.updated_at.isoformat() if sprint.updated_at else (sprint.created_at.isoformat() if sprint.created_at else datetime.now(timezone.utc).isoformat()),
            "user": sprint.created_by or "Project Lead",
        })
    
    # Sort by created_at descending
    activity.sort(key=lambda x: x["created_at"], reverse=True)
    
    return activity[:limit]


@router.get("/project/{project_id}")
async def get_project_activity(
    project_id: int,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get activity for a specific project."""
    result = await db.execute(
        select(Task)
        .options(selectinload(Task.project), selectinload(Task.assignee))
        .where(Task.project_id == project_id)
        .order_by(desc(Task.created_at))
        .limit(limit)
    )
    tasks = result.scalars().all()
    
    activity = []
    for task in tasks:
        activity.append({
            "id": f"task-{task.id}",
            "type": "task_update",
            "description": f"Task '{task.title}' status is {task.status}",
            "entity_type": "task",
            "entity_id": task.id,
            "created_at": task.updated_at.isoformat() if task.updated_at else (task.created_at.isoformat() if task.created_at else datetime.now(timezone.utc).isoformat()),
            "user": task.assignee.name if task.assignee else "Team Member",
        })
    
    return activity