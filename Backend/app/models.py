from sqlalchemy import Column , Integer , String , Text , ForeignKey , DateTime , Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum 
from database import Base

class TaskUser(str , enum.Enum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"