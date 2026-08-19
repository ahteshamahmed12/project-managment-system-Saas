from datetime import datetime, timezone
from enum import Enum

from sqlalchemy import (
    ARRAY,
    Boolean,
    Column,
    DateTime,
    Enum as SqlEnum,
    Float,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database import Base


def utcnow() -> datetime:
    """Naive UTC now — fits the naive DateTime columns without a deprecation warning."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


class KanbanStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    IN_REVIEW = "in_review"
    DONE = "done"
    BLOCKED = "blocked"


class TaskPriority(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


def _enum_values(enum_cls):
    return lambda enum: [member.value for member in enum]


class KanbanBoard(Base):
    __tablename__ = "kanban_boards"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project.id"), nullable=False, index=True)
    sprint_id = Column(Integer, ForeignKey("sprints.id"), nullable=True, index=True)

    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    project = relationship("Project", back_populates="kanban_boards")
    sprint = relationship("Sprint", back_populates="kanban_boards")

    columns = relationship(
        "KanbanColumn",
        back_populates="board",
        cascade="all, delete-orphan",
        order_by="KanbanColumn.order",
    )
    tasks = relationship(
        "KanbanTask",
        back_populates="board",
        cascade="all, delete-orphan",
    )


class KanbanColumn(Base):
    __tablename__ = "kanban_columns"

    id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, ForeignKey("kanban_boards.id"), nullable=False, index=True)

    name = Column(String, nullable=False)
    status = Column(
        SqlEnum(
            KanbanStatus,
            values_callable=_enum_values(KanbanStatus),
        ),
        nullable=False,
    )
    wip_limit = Column(Integer, nullable=True)
    order = Column(Numeric(10, 4), nullable=False, default=0)

    created_at = Column(DateTime, default=utcnow)

    board = relationship("KanbanBoard", back_populates="columns")
    tasks = relationship(
        "KanbanTask",
        back_populates="column",
        cascade="all, delete-orphan",
        order_by="KanbanTask.order",
    )

    __table_args__ = (
        Index("ix_kanban_columns_board_order", "board_id", "order"),
    )


class KanbanTask(Base):
    __tablename__ = "kanban_tasks"

    id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, ForeignKey("kanban_boards.id"), nullable=False, index=True)
    column_id = Column(Integer, ForeignKey("kanban_columns.id"), nullable=False, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    priority = Column(
        SqlEnum(
            TaskPriority,
            values_callable=_enum_values(TaskPriority),
        ),
        nullable=False,
        default=TaskPriority.MEDIUM,
    )
    assignee_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    story_points = Column(Float, nullable=True)
    time_estimate = Column(Float, nullable=True)
    time_spent = Column(Float, nullable=True, default=0)
    due_date = Column(DateTime, nullable=True)

    # DECIMAL for fractional drag-and-drop positioning
    order = Column(Numeric(12, 6), nullable=False, default=0)

    # Always matches the status of the column it currently sits in
    status = Column(
        SqlEnum(
            KanbanStatus,
            values_callable=_enum_values(KanbanStatus),
        ),
        nullable=False,
    )

    is_blocked = Column(Boolean, nullable=False, default=False)
    blocked_reason = Column(Text, nullable=True)
    is_completed = Column(Boolean, nullable=False, default=False)
    tags = Column(ARRAY(String), nullable=True)

    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    board = relationship("KanbanBoard", back_populates="tasks")
    column = relationship("KanbanColumn", back_populates="tasks")
    assignee = relationship("User", back_populates="kanban_tasks")
    linked_task = relationship("Task", back_populates="kanban_tasks")

    __table_args__ = (
        Index("ix_kanban_tasks_status", "status"),
        Index("ix_kanban_tasks_board_column_order", "board_id", "column_id", "order"),
    )