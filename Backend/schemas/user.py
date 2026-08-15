import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserDepartment(str, Enum):
    DEVELOPMENT = "Development"
    DESIGN = "Design"
    QA = "QA"
    MARKETING = "Marketing"
    HR = "HR"
    SALES = "Sales"


class UserStatus(str, Enum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"
    SUSPENDED = "Suspended"


# ---------------------------------------------------------------------------
# Request payloads — what the frontend sends TO the backend
# ---------------------------------------------------------------------------


class UserRegister(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)


class RefreshRequest(BaseModel):
    refresh_token: str


class UpdateProfilePayload(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = None
    avatar: Optional[str] = None
    department: Optional[UserDepartment] = None


class ForgotPasswordPayload(BaseModel):
    email: EmailStr


class ResetPasswordPayload(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


# ---------------------------------------------------------------------------
# Response payloads — what the backend sends BACK to the frontend
# ---------------------------------------------------------------------------


class PermissionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: str


class RoleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: str
    permissions: list[PermissionOut] = []


class UserOut(BaseModel):
    """Returned by /register and GET /me. This is the exact JSON shape
    the frontend mapper needs to match — nothing more, nothing less."""

    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    email: EmailStr
    is_active: bool
    phone: Optional[str] = None
    avatar: Optional[str] = None
    department: Optional[UserDepartment] = None
    status: UserStatus
    joining_date: Optional[datetime] = None
    created_at: datetime
    roles: list[RoleOut] = []


class TokenPair(BaseModel):
    """Returned by POST /login."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AccessToken(BaseModel):
    """Returned by POST /refresh — only a new access token, refresh token unchanged."""

    access_token: str
    token_type: str = "bearer"