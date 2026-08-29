from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.project import Project
from models.sprints import Sprint, SprintStatus
from models.tasks import Task
from schemas.sprints import SprintCreate, SprintDetailResponse, SprintUpdate, SprintResponse
from database import get_db
from dependencies.permission import require_permission

router = APIRouter(prefix="/sprints", tags=["sprints"])

# Status values accepted from clients (lowercase per SprintStatus)
VALID_STATUS_VALUES = {status.value for status in SprintStatus}


def to_naive_utc(dt: datetime | None) -> datetime | None:
    """Strip tzinfo so values fit the naive DateTime columns."""
    if dt is None:
        return None
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


def sprint_to_dict(sprint: Sprint) -> dict:
    """Serialize a Sprint (with loaded project/tasks) into a plain dict."""
    return {
        "id": sprint.id,
        "project_id": sprint.project_id,
        "project": sprint.project.name if sprint.project else "Unknown",
        "name": sprint.name,
        "description": sprint.description,
        "status": sprint.status.value if isinstance(sprint.status, SprintStatus) else sprint.status,
        "start_date": sprint.start_date,
        "end_date": sprint.end_date,
        "goal": sprint.goal,
        "capacity": sprint.capacity,
        "created_by": sprint.created_by,
        "created_at": sprint.created_at,
        "updated_at": sprint.updated_at,
    }


def task_to_dict(task: Task) -> dict:
    return {
        "id": task.id,
        "project_id": task.project_id,
        "sprint_id": task.sprint_id,
        "title": task.title,
        "description": task.description,
        "status": task.status,
        "priority": task.priority,
        "story_points": task.story_points,
        "assigned_to": str(task.assigned_to) if task.assigned_to else None,
    }


async def resolve_project(
    db: AsyncSession,
    project_id: int | None = None,
    project_name: str | None = None,
) -> Project:
    """Resolve a project by id or name, auto-creating it when only a name is given."""
    if project_name:
        result = await db.execute(
            select(Project).where(func.lower(Project.name) == project_name.lower())
        )
        project = result.scalar_one_or_none()
        if project is None:
            project = Project(name=project_name)
            db.add(project)
            await db.flush()
        return project

    if project_id is not None:
        result = await db.execute(select(Project).where(Project.id == project_id))
        project = result.scalar_one_or_none()
        if project is None:
            raise HTTPException(status_code=404, detail="Project not found")
        return project

    raise HTTPException(status_code=400, detail="Project name or project_id is required")


async def get_sprint_or_404(db: AsyncSession, sprint_id: int) -> Sprint:
    result = await db.execute(
        select(Sprint)
        .options(selectinload(Sprint.project), selectinload(Sprint.tasks))
        .where(Sprint.id == sprint_id)
    )
    sprint = result.scalar_one_or_none()
    if sprint is None:
        raise HTTPException(status_code=404, detail="Sprint not found")
    return sprint


# ---------------------------------------------------------
# List all sprints (used by the frontend table)
# ---------------------------------------------------------
@router.get("/", response_model=list[SprintResponse])
async def list_sprints(
    current_user=Depends(require_permission("sprint:read")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Sprint)
        .options(selectinload(Sprint.project))
        .order_by(Sprint.created_at.desc())
    )
    return [sprint_to_dict(sprint) for sprint in result.scalars().all()]


# ---------------------------------------------------------
# Get all sprints for a project
# ---------------------------------------------------------
@router.get("/projects/{project_id}/sprints", response_model=list[SprintResponse])
async def get_project_sprints(
    project_id: int,
    current_user=Depends(require_permission("sprint:read")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Sprint)
        .options(selectinload(Sprint.project))
        .where(Sprint.project_id == project_id)
        .order_by(Sprint.created_at.desc())
    )
    return [sprint_to_dict(sprint) for sprint in result.scalars().all()]


# ---------------------------------------------------------
# Create Sprint
# ---------------------------------------------------------
@router.post("/", response_model=SprintResponse)
async def create_sprint(
    sprint: SprintCreate,
    current_user=Depends(require_permission("sprint:create")),
    db: AsyncSession = Depends(get_db),
):
    if sprint.start_date >= sprint.end_date:
        raise HTTPException(status_code=400, detail="End date must be after start date")

    project = await resolve_project(db, sprint.project_id, sprint.project)

    if sprint.status is not None and sprint.status not in VALID_STATUS_VALUES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {sorted(VALID_STATUS_VALUES)}",
        )

    new_sprint = Sprint(
        project_id=project.id,
        name=sprint.name,
        description=sprint.description,
        start_date=to_naive_utc(sprint.start_date),
        end_date=to_naive_utc(sprint.end_date),
        goal=sprint.goal,
        capacity=sprint.capacity,
        status=(
            SprintStatus(sprint.status)
            if sprint.status is not None
            else SprintStatus.PLANNING
        ),
        created_by=current_user.name if current_user else None,
    )
    db.add(new_sprint)
    await db.commit()
    await db.refresh(new_sprint)
    return sprint_to_dict(new_sprint)


@router.post("/projects/{project_id}/sprints", response_model=SprintResponse)
async def create_sprint_for_project(
    project_id: int,
    sprint: SprintCreate,
    current_user=Depends(require_permission("sprint:create")),
    db: AsyncSession = Depends(get_db),
):
    if sprint.start_date >= sprint.end_date:
        raise HTTPException(status_code=400, detail="End date must be after start date")

    await resolve_project(db, project_id=project_id)

    if sprint.status is not None and sprint.status not in VALID_STATUS_VALUES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {sorted(VALID_STATUS_VALUES)}",
        )

    new_sprint = Sprint(
        project_id=project_id,
        name=sprint.name,
        description=sprint.description,
        start_date=to_naive_utc(sprint.start_date),
        end_date=to_naive_utc(sprint.end_date),
        goal=sprint.goal,
        capacity=sprint.capacity,
        status=(
            SprintStatus(sprint.status)
            if sprint.status is not None
            else SprintStatus.PLANNING
        ),
        created_by=current_user.name if current_user else None,
    )
    db.add(new_sprint)
    await db.commit()
    await db.refresh(new_sprint)
    return sprint_to_dict(new_sprint)


# ---------------------------------------------------------
# Update Sprint
# ---------------------------------------------------------
@router.put("/{sprint_id}", response_model=SprintResponse)
async def update_sprint(
    sprint_id: int,
    sprint_update: SprintUpdate,
    current_user=Depends(require_permission("sprint:update")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Sprint)
        .options(selectinload(Sprint.project), selectinload(Sprint.tasks))
        .where(Sprint.id == sprint_id)
    )
    sprint = result.scalar_one_or_none()
    if sprint is None:
        raise HTTPException(status_code=404, detail="Sprint not found")

    if sprint_update.name is not None:
        sprint.name = sprint_update.name
    if sprint_update.description is not None:
        sprint.description = sprint_update.description
    if sprint_update.goal is not None:
        sprint.goal = sprint_update.goal
    if sprint_update.capacity is not None:
        sprint.capacity = sprint_update.capacity
    if sprint_update.start_date is not None:
        sprint.start_date = to_naive_utc(sprint_update.start_date)
    if sprint_update.end_date is not None:
        sprint.end_date = to_naive_utc(sprint_update.end_date)

    if sprint_update.status is not None:
        if sprint_update.status not in VALID_STATUS_VALUES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {sorted(VALID_STATUS_VALUES)}",
            )
        sprint.status = SprintStatus(sprint_update.status)

    if sprint_update.project is not None or sprint_update.project_id is not None:
        project = await resolve_project(
            db, sprint_update.project_id, sprint_update.project
        )
        sprint.project_id = project.id

    if sprint.start_date >= sprint.end_date:
        raise HTTPException(status_code=400, detail="End date must be after start date")

    await db.commit()
    await db.refresh(sprint)
    return sprint_to_dict(sprint)


# ---------------------------------------------------------
# Delete Sprint
# ---------------------------------------------------------
@router.delete("/{sprint_id}")
async def delete_sprint(
    sprint_id: int,
    current_user=Depends(require_permission("sprint:delete")),
    db: AsyncSession = Depends(get_db),
):
    sprint = await get_sprint_or_404(db, sprint_id)
    # Nullify sprint_id for tasks linked to this sprint
    await db.execute(update(Task).where(Task.sprint_id == sprint_id).values(sprint_id=None))
    await db.delete(sprint)
    await db.commit()
    return {"message": "Sprint deleted successfully"}


# ---------------------------------------------------------
# Get single sprint with tasks
# ---------------------------------------------------------
@router.get("/{sprint_id}", response_model=SprintDetailResponse)
async def get_sprint_detail(
    sprint_id: int,
    current_user=Depends(require_permission("sprint:read")),
    db: AsyncSession = Depends(get_db),
):
    sprint = await get_sprint_or_404(db, sprint_id)

    completed_tasks = [task for task in sprint.tasks if task.status == "done"]
    velocity = sum([task.story_points or 1 for task in completed_tasks])

    return {
        **sprint_to_dict(sprint),
        "tasks": [task_to_dict(task) for task in sprint.tasks],
        "velocity": velocity,
    }


# ---------------------------------------------------------
# Start Sprint (change status to active)
# ---------------------------------------------------------
@router.patch("/{sprint_id}/start", response_model=SprintResponse)
async def start_sprint(
    sprint_id: int,
    current_user=Depends(require_permission("sprint:update")),
    db: AsyncSession = Depends(get_db),
):
    sprint = await get_sprint_or_404(db, sprint_id)

    sprint.status = SprintStatus.ACTIVE
    sprint.start_date = datetime.now(timezone.utc).replace(tzinfo=None)
    await db.commit()
    await db.refresh(sprint)
    return sprint_to_dict(sprint)


# ---------------------------------------------------------
# Complete Sprint
# ---------------------------------------------------------
@router.patch("/{sprint_id}/complete", response_model=SprintResponse)
async def complete_sprint(
    sprint_id: int,
    current_user=Depends(require_permission("sprint:update")),
    db: AsyncSession = Depends(get_db),
):
    sprint = await get_sprint_or_404(db, sprint_id)

    sprint.status = SprintStatus.COMPLETED
    await db.commit()
    await db.refresh(sprint)
    return sprint_to_dict(sprint)


# ---------------------------------------------------------
# Move task to sprint
# ---------------------------------------------------------
@router.patch("/tasks/{task_id}/move-to-sprint/{sprint_id}")
async def move_task_to_sprint(
    task_id: int,
    sprint_id: int,
    current_user=Depends(require_permission("task:update")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()

    result = await db.execute(select(Sprint).where(Sprint.id == sprint_id))
    sprint = result.scalar_one_or_none()

    if not task or not sprint:
        raise HTTPException(status_code=404, detail="Task or Sprint not found")

    task.sprint_id = sprint_id
    await db.commit()
    await db.refresh(task)
    return task_to_dict(task)


# ---------------------------------------------------------
# Get burndown data (for burndown chart)
# ---------------------------------------------------------
@router.get("/{sprint_id}/burndown")
async def get_burndown(
    sprint_id: int,
    current_user=Depends(require_permission("sprint:read")),
    db: AsyncSession = Depends(get_db),
):
    sprint = await get_sprint_or_404(db, sprint_id)

    total_points = sum([task.story_points or 1 for task in sprint.tasks])
    completed_points = sum(
        [task.story_points or 1 for task in sprint.tasks if task.status == "done"]
    )
    remaining_points = total_points - completed_points

    return {
        "sprint_id": sprint_id,
        "total_points": total_points,
        "completed_points": completed_points,
        "remaining_points": remaining_points,
        "completion_percentage": (
            (completed_points / total_points * 100) if total_points > 0 else 0
        ),
    }