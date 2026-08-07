# schemas/sprint.py
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

class SprintUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    goal: Optional[str] = None
    capacity: Optional[float] = None

class SprintResponse(BaseModel):
    id: int
    project_id: int
    name: str
    status: str
    start_date: datetime
    end_date: datetime
    goal: Optional[str]
    capacity: Optional[float]
    created_at: datetime
    
    class Config:
        from_attributes = True

class SprintDetailResponse(SprintResponse):
    tasks: List[dict]  # Include tasks in sprint
    velocity: float  # Calculated metric