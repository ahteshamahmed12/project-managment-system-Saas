
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TaskStatusUpdateRequest(BaseModel):
    status: str  # "todo" | "in_progress" | "in_review" | "done" | "blocked"

class TaskResponse(BaseModel):
    id: int
    title: str
    status: str
    assignee_id: Optional[int]
    priority: str
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True