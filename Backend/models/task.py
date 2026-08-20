from sqlalchemy import Column , Integer , ForeignKey ,Enum , DateTime  , String
import enum
from datetime import datetime
from sqlalchemy.orm import relationship
from Backend.database import Base

class TaskStatus(str , enum.Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    IN_REVIEW = "in_review"
    DONE = "done"
    BLOCKED = "blocked"
    
    
class Taks(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer , primary_key=True)
    title = Column(String(225) , nullable=False)
    description = Column(String , nullable=True)
    status = Column(Enum(TaskStatus) , default=TaskStatus.TODO)
    project_id = Column(Integer , ForeignKey("projects.id") , nullable=False)
    assigned_id = Column(Integer , ForeignKey("users.id") , nullable=True)
    priority = Column(String)
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    

    project = relationship("Project")
    assignee = relationship("User")