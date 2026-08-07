from sqlalchemy import Integer , String , Column , ForeignKey , DateTime , Enum as SqlEnum , Float
from datetime import datetime , timedelta
from enum import Enum
from database import Base
from sqlalchemy.orm import relationship

class SprintStatus(Base):
    PLANNING = "planning"
    ACTIVE = "active"
    COMPLETED = "completed"
    CLOSED = "closed"
    
class Sprint(Base):
    __tablename__ = "sprints"
    
    id = Column(Integer , index=True , primary_key=True)
    project_id = Column( Integer , ForeignKey ("project.id") , nullable= False )
    name = Column(String , nullable= False)
    description = Column(String , nullable= True)
    
    start_date = Column(DateTime , nullable=False)
    end_date = Column(DateTime , nullable=False)
    
    status = Column(SqlEnum(SprintStatus) , default= SprintStatus.PLANNING)
    
    goal = Column(String , nullable= True)
    
    capacity = Column(Float , nullable= True)
    
    created_at = Column(DateTime , default=datetime.utcnow)
    upadted_at = Column(DateTime , default=datetime.utcnow)
    
    project = relationship("Project" , back_populates="sprints")
    tasks = relationship("Task" , back_populates="sprint")