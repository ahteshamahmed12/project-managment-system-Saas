# schemas/kanban.py
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID


# ---------------------------------------------------------------------------
# Boards
# ---------------------------------------------------------------------------
class BoardCreate(BaseModel):
    project_id: int
    sprint_id: Optional[int] = None
    name: str
    description: Optional[str] = None


class BoardUpdate(BaseModel):
    sprint_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None


class ColumnResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    board_id: int
    name: str
    status: str
    wip_limit: Optional[int]
    order: float
    created_at: datetime


class BoardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    sprint_id: Optional[int]
    name: str
    description: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]


class BoardDetailResponse(BoardResponse):
    columns: list["ColumnDetailResponse"]
    tasks: list["TaskResponse"]


# ---------------------------------------------------------------------------
# Columns
# ---------------------------------------------------------------------------
class ColumnCreate(BaseModel):
    name: str
    status: str = Field(description="One of: todo, in_progress, in_review, done, blocked")
    wip_limit: Optional[int] = Field(default=None, ge=0)
    order: Optional[float] = None


class ColumnUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    wip_limit: Optional[int] = Field(default=None, ge=0)
    order: Optional[float] = None


class ColumnDetailResponse(ColumnResponse):
    tasks: list["TaskResponse"]


# ---------------------------------------------------------------------------
# Tasks
# ---------------------------------------------------------------------------
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    column_id: Optional[int] = None
    task_id: Optional[int] = None
    priority: str = "medium"
    assignee_id: Optional[UUID] = None
    story_points: Optional[float] = None
    time_estimate: Optional[float] = None
    time_spent: Optional[float] = 0
    due_date: Optional[datetime] = None
    order: Optional[float] = None
    is_blocked: Optional[bool] = False
    blocked_reason: Optional[str] = None
    tags: Optional[list[str]] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    column_id: Optional[int] = None
    priority: Optional[str] = None
    assignee_id: Optional[UUID] = None
    story_points: Optional[float] = None
    time_estimate: Optional[float] = None
    time_spent: Optional[float] = None
    due_date: Optional[datetime] = None
    order: Optional[float] = None
    is_blocked: Optional[bool] = None
    blocked_reason: Optional[str] = None
    tags: Optional[list[str]] = None


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    board_id: int
    column_id: int
    task_id: Optional[int]
    title: str
    description: Optional[str]
    priority: str
    assignee_id: Optional[UUID]
    assignee_name: Optional[str] = None
    assignee_avatar: Optional[str] = None
    story_points: Optional[float]
    time_estimate: Optional[float]
    time_spent: Optional[float]
    due_date: Optional[datetime]
    order: float
    status: str
    is_blocked: bool
    blocked_reason: Optional[str]
    is_completed: bool
    tags: Optional[list[str]]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    comment_count: int = 0


# ---------------------------------------------------------------------------
# Movement / reorder / bulk
# ---------------------------------------------------------------------------
class TaskMoveRequest(BaseModel):
    column_id: int
    order: Optional[float] = None


class BulkMoveRequest(BaseModel):
    task_ids: list[int]
    column_id: int
    order: Optional[float] = None


class ReorderRequest(BaseModel):
    task_ids: list[int]


class BulkAssignRequest(BaseModel):
    task_ids: list[int]
    assignee_id: Optional[UUID] = None


class BulkPriorityRequest(BaseModel):
    task_ids: list[int]
    priority: str


class TaskBlockRequest(BaseModel):
    reason: Optional[str] = None


# ---------------------------------------------------------------------------
# Search / stats / workload
# ---------------------------------------------------------------------------
class TaskSearchResponse(BaseModel):
    items: list[TaskResponse]
    total: int
    page: int
    page_size: int


class BoardStatsResponse(BaseModel):
    board_id: int
    total: int
    by_status: dict[str, int]
    todo: int
    in_progress: int
    in_review: int
    done: int
    blocked: int
    completed: int
    completion_percentage: float
    total_story_points: float
    completed_story_points: float


class ColumnStatsResponse(BaseModel):
    column_id: int
    board_id: int
    name: str
    status: str
    wip_limit: Optional[int]
    total_tasks: int
    at_limit: bool
    over_limit: bool
    by_priority: dict[str, int]
    blocked_count: int
    avg_story_points: Optional[float]
    total_story_points: float
    total_time_estimate: float
    total_time_spent: float


class WorkloadResponse(BaseModel):
    board_id: int
    user_id: UUID
    total_tasks: int
    completed_tasks: int
    blocked_tasks: int
    in_progress_tasks: int
    total_story_points: float
    completed_story_points: float
    total_time_spent: float
    tasks: list[TaskResponse]


BoardDetailResponse.model_rebuild()
ColumnDetailResponse.model_rebuild()