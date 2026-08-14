from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    username: str = Field(min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserUpdate(BaseModel):
    username: str | None = Field(default=None, min_length=2, max_length=50)
    email: EmailStr | None = None


class UserOut(BaseModel):
    id: UUID
    username: str
    email: EmailStr
    is_active: bool
    roles: list[str] = []
    permissions: list[str] = []

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str
