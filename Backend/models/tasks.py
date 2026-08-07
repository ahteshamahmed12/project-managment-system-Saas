from database import Base
from sqlalchemy import Column , Integer ,String , ForeignKey , Float

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer ,  primary_key=True)
    project_id = Column(Integer , ForeignKey("project.id") )
    sprint_id = Column(Integer , ForeignKey("sprints.id") , nullable=True )
    title = Column(String , nullable=False)
    description = Column(String , nullable=True)
    status = Column(String )
    priority = Column(String)
    story_point = Column(Float , nullable=True)
    assigned_to = Column(Integer , ForeignKey("users.id") , nullable=True)