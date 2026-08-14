from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from models.sprints import SprintStatus


class SprintCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    description: str | None = None
    start_date: datetime
    end_date: datetime
    goal: str | None = None
    capacity: float | None = Field(default=None, ge=0)


class SprintUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=150)
    description: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    status: SprintStatus | None = None
    goal: str | None = None
    capacity: float | None = Field(default=None, ge=0)


class SprintResponse(BaseModel):
    id: int
    project_id: int
    name: str
    description: str | None
    status: SprintStatus
    start_date: datetime
    end_date: datetime
    goal: str | None
    capacity: float | None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class SprintDetailResponse(SprintResponse):
    tasks: list[dict]
    velocity: float
