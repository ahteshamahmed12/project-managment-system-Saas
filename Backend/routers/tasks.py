from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth.dependencies import get_current_user
from database import get_db
from dependencies.project_access import require_project_access, verify_project_access
from models.project import Project
from models.tasks import Task
from models.user import User
from schemas.task import TaskStatusUpdateRequest, TaskResponse
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
) -> Project:
    task = await _get_task_or_404(db, task_id)
    return await verify_project_access(current_user, db, task.project_id)


def _service(db: AsyncSession) -> KanbanBoardService:
    return KanbanBoardService(db)


@router.get("/", response_model=list[TaskResponse])
async def list_tasks(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await verify_project_access(current_user, db, project_id)
    result = await db.execute(select(Task).where(Task.project_id == project_id).order_by(Task.created_at.desc()))
    return result.scalars().all()


@router.post("/", response_model=TaskResponse)
async def create_task(
    project_id: int,
    title: str,
    description: Optional[str] = None,
    status: str = "todo",
    priority: Optional[str] = None,
    due_date: Optional[datetime] = None,
    assigned_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await verify_project_access(current_user, db, project_id, "project:update")
    if status not in ["todo", "in_progress", "in_review", "done", "blocked"]:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: todo, in_progress, in_review, done, blocked",
        )

    task = Task(
        title=title,
        description=description,
        status=status,
        project_id=project_id,
        priority=priority or "medium",
        due_date=due_date,
        assigned_to=assigned_id,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    payload: TaskStatusUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_task_access(current_user, db, task_id)
    task = await _get_task_or_404(db, task_id)

    if payload.status is not None:
        if payload.status not in ["todo", "in_progress", "in_review", "done", "blocked"]:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: todo, in_progress, in_review, done, blocked",
            )
        task.status = payload.status

    await db.commit()
    await db.refresh(task)
    return task


@router.post("/{task_id}/complete", response_model=TaskResponse)
async def complete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_task_access(current_user, db, task_id)
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
    await _require_task_access(current_user, db, task_id)
    task = await _get_task_or_404(db, task_id)
    task.status = "todo"
    task.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(task)
    return task


@router.post("/{task_id}/block", response_model=TaskResponse)
async def block_task(
    task_id: int,
    payload: TaskStatusUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_task_access(current_user, db, task_id)
    task = await _get_task_or_404(db, task_id)

    if payload.status is not None:
        if payload.status not in ["todo", "in_progress", "in_review", "done", "blocked"]:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: todo, in_progress, in_review, done, blocked",
            )
        task.status = payload.status

    task.is_blocked = True
    await db.commit()
    await db.refresh(task)
    return task


@router.post("/{task_id}/unblock", response_model=TaskResponse)
async def unblock_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_task_access(current_user, db, task_id)
    task = await _get_task_or_404(db, task_id)
    task.is_blocked = False
    task.status = "todo"
    await db.commit()
    await db.refresh(task)
    return task


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_task_access(current_user, db, task_id)
    task = await _get_task_or_404(db, task_id)
    return task


@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_task_access(current_user, db, task_id)
    task = await _get_task_or_404(db, task_id)
    await db.delete(task)
    await db.commit()
    return {"message": "Task deleted successfully"}