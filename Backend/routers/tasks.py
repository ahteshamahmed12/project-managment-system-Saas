from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth.dependencies import get_current_user
from database import get_db
from dependencies.project_access import verify_project_access
from models.project import Project
from models.tasks import Task
from models.user import User
from schemas.task import TaskCreate, TaskResponse, TaskStatusUpdateRequest, TaskUpdate
from services.kanban_service import KanbanBoardService

router = APIRouter(
    prefix="/v1/tasks",
    tags=["tasks"],
)


async def _get_task_or_404(db: AsyncSession, task_id: int) -> Task:
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


async def _require_task_access(
    current_user: User,
    db: AsyncSession,
    task_id: int,
    permission: str = "task:read",
) -> Project:
    task = await _get_task_or_404(db, task_id)
    return await verify_project_access(current_user, db, task.project_id, permission)


def _service(db: AsyncSession) -> KanbanBoardService:
    return KanbanBoardService(db)


@router.get("/", response_model=list[TaskResponse])
async def list_tasks(
    project_id: Optional[int] = Query(None, description="Optional project filter"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Task)
    if project_id is not None:
        await verify_project_access(current_user, db, project_id, "project:read")
        query = query.where(Task.project_id == project_id)

    result = await db.execute(query.order_by(Task.created_at.desc()))
    return result.scalars().all()


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    payload: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    target_project_id = payload.project_id
    if target_project_id is None and payload.project_name:
        p_res = await db.execute(
            select(Project).where(Project.name == payload.project_name)
        )
        existing_proj = p_res.scalar_one_or_none()
        if existing_proj is None:
            existing_proj = Project(
                name=payload.project_name,
                created_by=current_user.name,
            )
            db.add(existing_proj)
            await db.flush()
        target_project_id = existing_proj.id

    if target_project_id is None:
        # Fallback to first existing project or create a default one
        p_res = await db.execute(select(Project).limit(1))
        first_proj = p_res.scalar_one_or_none()
        if first_proj is None:
            first_proj = Project(
                name="Main Project",
                created_by=current_user.name,
            )
            db.add(first_proj)
            await db.flush()
        target_project_id = first_proj.id

    valid_statuses = ["todo", "in_progress", "in_review", "done", "blocked", "Todo", "In Progress", "Review", "Completed"]
    normalized_status = payload.status
    if normalized_status.lower() in ["todo", "in_progress", "in_review", "done", "blocked"]:
        normalized_status = normalized_status.lower()

    task = Task(
        title=payload.title,
        description=payload.description,
        status=normalized_status,
        project_id=target_project_id,
        sprint_id=payload.sprint_id,
        priority=payload.priority or "Medium",
        due_date=payload.due_date,
        assigned_to=payload.assigned_to,
        story_points=payload.story_points,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    payload: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    task = await _get_task_or_404(db, task_id)
    update_data = payload.model_dump(exclude_unset=True)

    for field, val in update_data.items():
        setattr(task, field, val)

    task.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(task)
    return task


@router.post("/{task_id}/complete", response_model=TaskResponse)
async def complete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    task = await _get_task_or_404(db, task_id)
    task.status = "done"
    task.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(task)
    return task


@router.post("/{task_id}/reopen", response_model=TaskResponse)
async def reopen_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    task = await _get_task_or_404(db, task_id)
    task.status = "todo"
    task.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(task)
    return task


@router.post("/{task_id}/block", response_model=TaskResponse)
async def block_task(
    task_id: int,
    payload: Optional[TaskStatusUpdateRequest] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    task = await _get_task_or_404(db, task_id)
    task.is_blocked = True
    if payload and payload.reason:
        task.blocked_reason = payload.reason
    task.status = "blocked"
    task.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(task)
    return task


@router.post("/{task_id}/unblock", response_model=TaskResponse)
async def unblock_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    task = await _get_task_or_404(db, task_id)
    task.is_blocked = False
    task.blocked_reason = None
    task.status = "todo"
    task.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(task)
    return task


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    task = await _get_task_or_404(db, task_id)
    return task


@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    task = await _get_task_or_404(db, task_id)
    await db.delete(task)
    await db.commit()
    return {"message": "Task deleted successfully"}