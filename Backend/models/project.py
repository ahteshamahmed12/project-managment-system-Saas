from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from database import Base


class Project(Base):
    __tablename__ = "project"

    id = Column(Integer, index=True, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    sprints = relationship("Sprint", back_populates="project")
    tasks = relationship("Task", back_populates="project")