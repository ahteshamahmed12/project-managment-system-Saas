import uuid

from pydantic import BaseModel, Field, ConfigDict


class PermissionCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    description: str | None = None
    resource: str = Field(..., min_length=1, max_length=50)
    action: str = Field(..., min_length=1, max_length=50)


class PermissionOut(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    resource: str
    action: str

    model_config = ConfigDict(
        from_attributes=True
    )


class RoleCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    description: str | None = None


class RoleOut(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    is_system_role: bool
    permissions: list[PermissionOut] = []

    model_config = ConfigDict(
        from_attributes=True
    )