from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class TaskStatusUpdateRequest(BaseModel):
    status: Optional[str] = None  # "todo" | "in_progress" | "in_review" | "done" | "blocked"
    reason: Optional[str] = None


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "todo"
    project_id: Optional[int] = None
    project_name: Optional[str] = None
    sprint_id: Optional[int] = None
    priority: Optional[str] = "Medium"
    story_points: Optional[float] = None
    due_date: Optional[datetime] = None
    assigned_to: Optional[UUID] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    project_id: Optional[int] = None
    sprint_id: Optional[int] = None
    priority: Optional[str] = None
    story_points: Optional[float] = None
    due_date: Optional[datetime] = None
    assigned_to: Optional[UUID] = None
    is_blocked: Optional[bool] = None
    blocked_reason: Optional[str] = None


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    sprint_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    status: str
    priority: Optional[str] = "Medium"
    story_points: Optional[float] = None
    assigned_to: Optional[UUID] = None
    due_date: Optional[datetime] = None
    is_blocked: bool = False
    blocked_reason: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None