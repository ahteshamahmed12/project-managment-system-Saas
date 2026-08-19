import uuid
from datetime import datetime, timezone
from enum import Enum

from sqlalchemy import Boolean, DateTime, Enum as SqlEnum, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base
from models.associations import user_roles


class UserStatus(str, Enum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"
    SUSPENDED = "Suspended"


class UserDepartment(str, Enum):
    DEVELOPMENT = "Development"
    DESIGN = "Design"
    QA = "QA"
    MARKETING = "Marketing"
    HR = "HR"
    SALES = "Sales"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(254),
        unique=True,
        nullable=False,
        index=True,
    )

    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    phone: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    avatar: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    department: Mapped[UserDepartment | None] = mapped_column(
        SqlEnum(UserDepartment),
        nullable=True,
    )

    status: Mapped[UserStatus] = mapped_column(
        SqlEnum(UserStatus),
        default=UserStatus.ACTIVE,
        nullable=False,
    )

    joining_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    roles = relationship(
        "Role",
        secondary=user_roles,
        back_populates="users",
    )

    kanban_tasks = relationship("KanbanTask", back_populates="assignee")