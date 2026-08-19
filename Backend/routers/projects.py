from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from auth.dependencies import get_current_user
from database import get_db
from dependencies.permission import require_permission
from models.kanban import KanbanBoard, KanbanColumn, KanbanTask
from models.project import Project
from models.sprints import Sprint
from models.tasks import Task
from models.user import User
from schemas.project import ProjectCreate, ProjectOut, ProjectUpdate

router = APIRouter(
    prefix="/projects",
    tags=["Projects"],
)


async def get_project_or_404(db: AsyncSession, project_id: int) -> Project:
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.get("/", response_model=list[ProjectOut])
async def list_projects(
    current_user: User = Depends(require_permission("project:read")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Project).order_by(Project.created_at.desc()))
    return result.scalars().all()


@router.get("/{project_id}", response_model=ProjectOut)
async def get_project(
    project_id: int,
    current_user: User = Depends(require_permission("project:read")),
    db: AsyncSession = Depends(get_db),
):
    return await get_project_or_404(db, project_id)


@router.post("/", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
async def create_project(
    payload: ProjectCreate,
    current_user: User = Depends(require_permission("project:create")),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(
        select(Project).where(Project.name == payload.name)
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=400,
            detail="A project with this name already exists",
        )

    project = Project(
        name=payload.name,
        description=payload.description,
        project_image=payload.project_image,
        status=payload.status,
        priority=payload.priority,
        start_date=payload.start_date,
        end_date=payload.end_date,
        created_by=current_user.name,
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


@router.put("/{project_id}", response_model=ProjectOut)
async def update_project(
    project_id: int,
    payload: ProjectUpdate,
    current_user: User = Depends(require_permission("project:update")),
    db: AsyncSession = Depends(get_db),
):
    project = await get_project_or_404(db, project_id)
    data = payload.model_dump(exclude_unset=True)

    if "name" in data and data["name"] != project.name:
        existing = await db.execute(
            select(Project).where(Project.name == data["name"])
        )
        if existing.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=400,
                detail="A project with this name already exists",
            )

    for field, value in data.items():
        setattr(project, field, value)

    await db.commit()
    await db.refresh(project)
    return project


@router.delete("/{project_id}")
async def delete_project(
    project_id: int,
    current_user: User = Depends(require_permission("project:delete")),
    db: AsyncSession = Depends(get_db),
):
    project = await get_project_or_404(db, project_id)

    board_ids = (
        await db.execute(
            select(KanbanBoard.id).where(KanbanBoard.project_id == project_id)
        )
    ).scalars().all()

    # Delete kanban tasks/columns first (bulk deletes bypass ORM cascade),
    # then boards, then legacy tasks (which reference project + sprint),
    # then sprints, then the project itself.
    if board_ids:
        await db.execute(
            delete(KanbanTask).where(KanbanTask.board_id.in_(board_ids))
        )
        await db.execute(
            delete(KanbanColumn).where(KanbanColumn.board_id.in_(board_ids))
        )
    await db.execute(delete(KanbanBoard).where(KanbanBoard.project_id == project_id))
    await db.execute(delete(Task).where(Task.project_id == project_id))
    await db.execute(delete(Sprint).where(Sprint.project_id == project_id))

    await db.delete(project)
    await db.commit()
    return {"message": "Project deleted successfully"}