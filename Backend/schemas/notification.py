from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class NotificationOut(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    message: str
    type: str
    read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NotificationCreate(BaseModel):
    user_id: UUID
    title: str
    message: str
    type: str = "system"


class NotificationRead(BaseModel):
    success: bool
