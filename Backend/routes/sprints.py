from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from auth.dependencies import get_current_user
from database import get_db
from dependencies.permission import require_permission
from models.sprints import Sprint, SprintStatus
from models.tasks import Task
from models.user import User
from schemas.sprints import SprintCreate, SprintDetailResponse, SprintResponse, SprintUpdate

router = APIRouter(prefix="/sprints", tags=["Sprints"])


@router.post("/projects/{project_id}/sprints", response_model=SprintResponse, status_code=status.HTTP_201_CREATED)
async def create_sprint(project_id: int, payload: SprintCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_permission("sprint:create"))) -> Sprint:
    if payload.start_date >= payload.end_date:
        raise HTTPException(status_code=400, detail="End date must be after start date")
    sprint = Sprint(project_id=project_id, **payload.model_dump())
    db.add(sprint)
    await db.commit()
    await db.refresh(sprint)
    return sprint


@router.get("/projects/{project_id}/sprints", response_model=list[SprintResponse])
async def get_project_sprints(project_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)) -> list[Sprint]:
    result = await db.execute(select(Sprint).where(Sprint.project_id == project_id).order_by(Sprint.start_date))
    return list(result.scalars().all())


@router.get("/sprints/{sprint_id}", response_model=SprintDetailResponse)
async def get_sprint_detail(sprint_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)) -> dict:
    result = await db.execute(select(Sprint).options(selectinload(Sprint.tasks)).where(Sprint.id == sprint_id))
    sprint = result.scalar_one_or_none()
    if sprint is None:
        raise HTTPException(status_code=404, detail="Sprint not found")
    completed = [task for task in sprint.tasks if task.status.lower() == "done"]
    velocity = sum(task.story_point or 1 for task in completed)
    return {"id": sprint.id, "project_id": sprint.project_id, "name": sprint.name, "description": sprint.description, "status": sprint.status,
            "start_date": sprint.start_date, "end_date": sprint.end_date, "goal": sprint.goal, "capacity": sprint.capacity,
            "created_at": sprint.created_at, "updated_at": sprint.updated_at, "tasks": [{"id": t.id, "title": t.title, "status": t.status, "story_point": t.story_point} for t in sprint.tasks], "velocity": velocity}


@router.patch("/sprints/{sprint_id}", response_model=SprintResponse)
async def update_sprint(sprint_id: int, payload: SprintUpdate, db: AsyncSession = Depends(get_db), _: User = Depends(require_permission("sprint:update"))) -> Sprint:
    result = await db.execute(select(Sprint).where(Sprint.id == sprint_id))
    sprint = result.scalar_one_or_none()
    if sprint is None:
        raise HTTPException(status_code=404, detail="Sprint not found")
    updates = payload.model_dump(exclude_unset=True)
    start = updates.get("start_date", sprint.start_date)
    end = updates.get("end_date", sprint.end_date)
    if start >= end:
        raise HTTPException(status_code=400, detail="End date must be after start date")
    for key, value in updates.items():
        setattr(sprint, key, value)
    await db.commit()
    await db.refresh(sprint)
    return sprint


@router.delete("/sprints/{sprint_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sprint(sprint_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(require_permission("sprint:delete"))) -> None:
    result = await db.execute(select(Sprint).where(Sprint.id == sprint_id))
    sprint = result.scalar_one_or_none()
    if sprint is None:
        raise HTTPException(status_code=404, detail="Sprint not found")
    await db.delete(sprint)
    await db.commit()


@router.patch("/sprints/{sprint_id}/start", response_model=SprintResponse)
async def start_sprint(sprint_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(require_permission("sprint:update"))) -> Sprint:
    result = await db.execute(select(Sprint).where(Sprint.id == sprint_id))
    sprint = result.scalar_one_or_none()
    if sprint is None:
        raise HTTPException(status_code=404, detail="Sprint not found")
    sprint.status = SprintStatus.ACTIVE
    sprint.start_date = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(sprint)
    return sprint


@router.patch("/sprints/{sprint_id}/complete", response_model=SprintResponse)
async def complete_sprint(sprint_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(require_permission("sprint:update"))) -> Sprint:
    result = await db.execute(select(Sprint).where(Sprint.id == sprint_id))
    sprint = result.scalar_one_or_none()
    if sprint is None:
        raise HTTPException(status_code=404, detail="Sprint not found")
    sprint.status = SprintStatus.COMPLETED
    await db.commit()
    await db.refresh(sprint)
    return sprint


@router.patch("/tasks/{task_id}/move-to-sprint/{sprint_id}")
async def move_task_to_sprint(task_id: int, sprint_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(require_permission("sprint:update"))) -> dict:
    task_result = await db.execute(select(Task).where(Task.id == task_id))
    task = task_result.scalar_one_or_none()
    sprint_result = await db.execute(select(Sprint).where(Sprint.id == sprint_id))
    sprint = sprint_result.scalar_one_or_none()
    if task is None or sprint is None:
        raise HTTPException(status_code=404, detail="Task or Sprint not found")
    task.sprint_id = sprint.id
    await db.commit()
    return {"message": "Task moved to sprint successfully", "task_id": task.id, "sprint_id": sprint.id}


@router.get("/sprints/{sprint_id}/burndown")
async def get_burndown(sprint_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)) -> dict:
    result = await db.execute(select(Sprint).options(selectinload(Sprint.tasks)).where(Sprint.id == sprint_id))
    sprint = result.scalar_one_or_none()
    if sprint is None:
        raise HTTPException(status_code=404, detail="Sprint not found")
    total = sum(task.story_point or 1 for task in sprint.tasks)
    completed = sum(task.story_point or 1 for task in sprint.tasks if task.status.lower() == "done")
    return {"sprint_id": sprint_id, "total_points": total, "completed_points": completed, "remaining_points": total - completed,
            "completion_percentage": (completed / total * 100) if total else 0}
