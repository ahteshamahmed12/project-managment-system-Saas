from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from auth.dependencies import get_current_user
from database import get_db
from dependencies.project_access import require_project_access, verify_project_access
from models.kanban import KanbanBoard, KanbanColumn, KanbanTask
from models.project import Project
from models.user import User
from schemas.kanban import (
    BoardCreate,
    BoardDetailResponse,
    BoardResponse,
    BoardStatsResponse,
    BoardUpdate,
    BulkAssignRequest,
    BulkMoveRequest,
    BulkPriorityRequest,
    ColumnCreate,
    ColumnDetailResponse,
    ColumnResponse,
    ColumnStatsResponse,
    ColumnUpdate,
    ReorderRequest,
    TaskBlockRequest,
    TaskCreate,
    TaskMoveRequest,
    TaskResponse,
    TaskSearchResponse,
    TaskUpdate,
    WorkloadResponse,
)
from services.kanban_service import KanbanBoardService

router = APIRouter(
    prefix="/v1/kanban",
    tags=["kanban"],
)


# ---------------------------------------------------------------------------
# Helpers (load resources + enforce project membership)
# ---------------------------------------------------------------------------
async def _get_board_or_404(db: AsyncSession, board_id: int) -> KanbanBoard:
    result = await db.execute(select(KanbanBoard).where(KanbanBoard.id == board_id))
    board = result.scalar_one_or_none()
    if board is None:
        raise HTTPException(status_code=404, detail="Board not found")
    return board


async def _get_column_or_404(db: AsyncSession, column_id: int) -> KanbanColumn:
    result = await db.execute(
        select(KanbanColumn).where(KanbanColumn.id == column_id)
    )
    column = result.scalar_one_or_none()
    if column is None:
        raise HTTPException(status_code=404, detail="Column not found")
    return column


async def _get_task_or_404(db: AsyncSession, task_id: int) -> KanbanTask:
    result = await db.execute(
        select(KanbanTask)
        .options(selectinload(KanbanTask.board))
        .where(KanbanTask.id == task_id)
    )
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(status_code=404, detail="Kanban task not found")
    return task


async def _require_board_access(
    current_user: User,
    db: AsyncSession,
    board_id: int,
) -> Project:
    board = await _get_board_or_404(db, board_id)
    return await verify_project_access(current_user, db, board.project_id)


async def _require_column_access(
    current_user: User,
    db: AsyncSession,
    column_id: int,
) -> Project:
    column = await _get_column_or_404(db, column_id)
    board = await _get_board_or_404(db, column.board_id)
    return await verify_project_access(current_user, db, board.project_id)


async def _require_task_access(
    current_user: User,
    db: AsyncSession,
    task_id: int,
) -> Project:
    task = await _get_task_or_404(db, task_id)
    return await verify_project_access(current_user, db, task.board.project_id)


async def _require_tasks_access(
    current_user: User,
    db: AsyncSession,
    task_ids: list[int],
) -> Project:
    if not task_ids:
        raise HTTPException(status_code=400, detail="task_ids must not be empty")
    first = await _get_task_or_404(db, task_ids[0])
    return await verify_project_access(current_user, db, first.board.project_id)


def _service(db: AsyncSession) -> KanbanBoardService:
    return KanbanBoardService(db)


# ---------------------------------------------------------------------------
# Boards
# ---------------------------------------------------------------------------
@router.post("/boards", response_model=BoardDetailResponse)
async def create_board(
    payload: BoardCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await verify_project_access(current_user, db, payload.project_id, "project:update")
    return await _service(db).create_board(
        project_id=payload.project_id,
        sprint_id=payload.sprint_id,
        name=payload.name,
        description=payload.description,
    )


@router.get("/boards/{board_id}", response_model=BoardDetailResponse)
async def get_board(
    board_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_board_access(current_user, db, board_id)
    return await _service(db).get_board(board_id)


@router.get("/projects/{project_id}/boards", response_model=list[BoardResponse])
async def get_project_boards(
    project_id: int,
    project: Project = Depends(require_project_access("project:read")),
    db: AsyncSession = Depends(get_db),
):
    return await _service(db).list_project_boards(project_id)


@router.put("/boards/{board_id}", response_model=BoardDetailResponse)
async def update_board(
    board_id: int,
    payload: BoardUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_board_access(current_user, db, board_id)
    data = payload.model_dump(exclude_unset=True)
    return await _service(db).update_board(board_id, data)


@router.delete("/boards/{board_id}")
async def delete_board(
    board_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_board_access(current_user, db, board_id)
    await _service(db).delete_board(board_id)
    return {"message": "Board deleted successfully"}


# ---------------------------------------------------------------------------
# Columns
# ---------------------------------------------------------------------------
@router.post("/boards/{board_id}/columns", response_model=ColumnResponse)
async def create_column(
    board_id: int,
    payload: ColumnCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_board_access(current_user, db, board_id)
    return await _service(db).create_column(board_id, payload.model_dump())


@router.put("/columns/{column_id}", response_model=ColumnResponse)
async def update_column(
    column_id: int,
    payload: ColumnUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_column_access(current_user, db, column_id)
    return await _service(db).update_column(column_id, payload.model_dump(exclude_unset=True))


@router.delete("/columns/{column_id}")
async def delete_column(
    column_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_column_access(current_user, db, column_id)
    await _service(db).delete_column(column_id)
    return {"message": "Column deleted successfully"}


@router.post("/columns/{column_id}/reorder", response_model=list[TaskResponse])
async def reorder_column_tasks(
    column_id: int,
    payload: ReorderRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_column_access(current_user, db, column_id)
    return await _service(db).reorder_tasks_in_column(column_id, payload.task_ids)


# ---------------------------------------------------------------------------
# Tasks
# ---------------------------------------------------------------------------
@router.post("/boards/{board_id}/tasks", response_model=TaskResponse)
async def create_task(
    board_id: int,
    payload: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_board_access(current_user, db, board_id)
    return await _service(db).create_task(board_id, payload.model_dump())


@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_task_access(current_user, db, task_id)
    return await _service(db).get_task(task_id)


@router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    payload: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_task_access(current_user, db, task_id)
    return await _service(db).update_task(task_id, payload.model_dump(exclude_unset=True))


@router.delete("/tasks/{task_id}")
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_task_access(current_user, db, task_id)
    await _service(db).delete_task(task_id)
    return {"message": "Task deleted successfully"}


# ---------------------------------------------------------------------------
# Movement (bulk routes declared before dynamic ones to avoid path conflicts)
# ---------------------------------------------------------------------------
@router.post("/tasks/move-bulk", response_model=list[TaskResponse])
async def move_tasks_bulk(
    payload: BulkMoveRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_tasks_access(current_user, db, payload.task_ids)
    return await _service(db).move_tasks_bulk(
        payload.task_ids, payload.column_id, payload.order
    )


@router.post("/tasks/assign-bulk", response_model=list[TaskResponse])
async def assign_tasks_bulk(
    payload: BulkAssignRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_tasks_access(current_user, db, payload.task_ids)
    return await _service(db).assign_tasks_bulk(payload.task_ids, payload.assignee_id)


@router.post("/tasks/priority-bulk", response_model=list[TaskResponse])
async def update_priority_bulk(
    payload: BulkPriorityRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_tasks_access(current_user, db, payload.task_ids)
    return await _service(db).update_priority_bulk(payload.task_ids, payload.priority)


@router.post("/tasks/{task_id}/move", response_model=TaskResponse)
async def move_task(
    task_id: int,
    payload: TaskMoveRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_task_access(current_user, db, task_id)
    return await _service(db).move_task(task_id, payload.column_id, payload.order)


# ---------------------------------------------------------------------------
# Status operations
# ---------------------------------------------------------------------------
@router.post("/tasks/{task_id}/complete", response_model=TaskResponse)
async def complete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_task_access(current_user, db, task_id)
    return await _service(db).complete_task(task_id)


@router.post("/tasks/{task_id}/reopen", response_model=TaskResponse)
async def reopen_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_task_access(current_user, db, task_id)
    return await _service(db).reopen_task(task_id)


@router.post("/tasks/{task_id}/block", response_model=TaskResponse)
async def block_task(
    task_id: int,
    payload: TaskBlockRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_task_access(current_user, db, task_id)
    return await _service(db).block_task(task_id, payload.reason)


@router.post("/tasks/{task_id}/unblock", response_model=TaskResponse)
async def unblock_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_task_access(current_user, db, task_id)
    return await _service(db).unblock_task(task_id)


# ---------------------------------------------------------------------------
# Search / stats / workload
# ---------------------------------------------------------------------------
@router.get("/boards/{board_id}/tasks/search", response_model=TaskSearchResponse)
async def search_tasks(
    board_id: int,
    q: str | None = Query(default=None, description="Search term for title/description"),
    priority: str | None = Query(default=None),
    status: str | None = Query(default=None),
    assignee_id: UUID | None = Query(default=None),
    is_blocked: bool | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_board_access(current_user, db, board_id)
    return await _service(db).search_tasks(
        board_id=board_id,
        search=q,
        priority=priority,
        status=status,
        assignee_id=assignee_id,
        is_blocked=is_blocked,
        page=page,
        page_size=page_size,
    )


@router.get("/boards/{board_id}/stats", response_model=BoardStatsResponse)
async def get_board_stats(
    board_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_board_access(current_user, db, board_id)
    return await _service(db).get_board_stats(board_id)


@router.get("/columns/{column_id}/stats", response_model=ColumnStatsResponse)
async def get_column_stats(
    column_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_column_access(current_user, db, column_id)
    return await _service(db).get_column_stats(column_id)


@router.get("/boards/{board_id}/workload/{user_id}", response_model=WorkloadResponse)
async def get_user_workload(
    board_id: int,
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_board_access(current_user, db, board_id)
    return await _service(db).get_user_workload(board_id, user_id)