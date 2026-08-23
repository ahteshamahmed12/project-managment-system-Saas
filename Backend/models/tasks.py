from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project.id"), nullable=False, index=True)
    sprint_id = Column(Integer, ForeignKey("sprints.id"), nullable=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    status = Column(String, index=True, nullable=False, default="todo")
    priority = Column(String, nullable=True, default="Medium")
    story_points = Column(Float, nullable=True)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    due_date = Column(DateTime, nullable=True)
    is_blocked = Column(Boolean, nullable=False, default=False)
    blocked_reason = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    sprint = relationship("Sprint", back_populates="tasks")
    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", back_populates="tasks")
    kanban_tasks = relationship("KanbanTask", back_populates="linked_task")