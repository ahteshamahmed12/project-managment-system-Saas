# schemas/sprints.py
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List

class SprintCreate(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: datetime
    end_date: datetime
    goal: Optional[str] = None
    capacity: Optional[float] = None
    status: Optional[str] = None
    project_id: Optional[int] = None
    project: Optional[str] = None  # Project name (resolved/created on the backend)

class SprintUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    goal: Optional[str] = None
    capacity: Optional[float] = None
    status: Optional[str] = None
    project_id: Optional[int] = None
    project: Optional[str] = None  # Project name (resolved/created on the backend)

class SprintResponse(BaseModel):
    id: int
    project_id: int
    project: str
    name: str
    description: Optional[str]
    status: str
    start_date: datetime
    end_date: datetime
    goal: Optional[str]
    capacity: Optional[float]
    created_by: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class SprintDetailResponse(SprintResponse):
    tasks: List[dict]  # Include tasks in sprint
    velocity: float  # Calculated metric