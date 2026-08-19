from enum import Enum

from sqlalchemy import Column, DateTime, Enum as SqlEnum, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from database import Base


def utcnow() -> datetime:
    """Naive UTC now — fits the naive DateTime columns without a deprecation warning."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


class SprintStatus(str, Enum):
    PLANNING = "planning"
    ACTIVE = "active"
    COMPLETED = "completed"
    CLOSED = "closed"


class Sprint(Base):
    __tablename__ = "sprints"

    id = Column(Integer, index=True, primary_key=True)
    project_id = Column(Integer, ForeignKey("project.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)

    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)

    status = Column(
        SqlEnum(
            SprintStatus,
            values_callable=lambda enum: [member.value for member in enum],
        ),
        default=SprintStatus.PLANNING,
        nullable=False,
    )

    goal = Column(String, nullable=True)

    capacity = Column(Float, nullable=True)

    created_by = Column(String, nullable=True)

    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    project = relationship("Project", back_populates="sprints")
    tasks = relationship("Task", back_populates="sprint")
    kanban_boards = relationship("KanbanBoard", back_populates="sprint")