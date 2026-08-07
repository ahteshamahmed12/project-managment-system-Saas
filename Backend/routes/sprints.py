# routes/sprints.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from models.sprints import Sprint, SprintStatus
from schemas.sprints import SprintCreate, SprintUpdate, SprintResponse
from database import get_db

router = APIRouter(prefix="/sprints", tags=["sprints"])

# Create Sprint
@router.post("/projects/{project_id}/sprints", response_model=SprintResponse)
def create_sprint(project_id: int, sprint: SprintCreate, db: Session = Depends(get_db)):
    if sprint.start_date >= sprint.end_date:
        raise HTTPException(status_code=400, detail="End date must be after start date")
    
    new_sprint = Sprint(
        project_id=project_id,
        name=sprint.name,
        description=sprint.description,
        start_date=sprint.start_date,
        end_date=sprint.end_date,
        goal=sprint.goal,
        capacity=sprint.capacity,
        status=SprintStatus.PLANNING
    )
    db.add(new_sprint)
    db.commit()
    db.refresh(new_sprint)
    return new_sprint

# Get all sprints for a project
@router.get("/projects/{project_id}/sprints")
def get_project_sprints(project_id: int, db: Session = Depends(get_db)):
    sprints = db.query(Sprint).filter(Sprint.project_id == project_id).all()
    return sprints

# Get single sprint with tasks
@router.get("/sprints/{sprint_id}")
def get_sprint_detail(sprint_id: int, db: Session = Depends(get_db)):
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
    
    # Calculate velocity
    completed_tasks = [t for t in sprint.tasks if t.status == "done"]
    velocity = sum([t.story_points or 1 for t in completed_tasks])
    
    return {
        **sprint.__dict__,
        "tasks": sprint.tasks,
        "velocity": velocity
    }

# Start Sprint (change status to active)
@router.patch("/sprints/{sprint_id}/start")
def start_sprint(sprint_id: int, db: Session = Depends(get_db)):
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
    
    sprint.status = SprintStatus.ACTIVE
    sprint.start_date = datetime.utcnow()
    db.commit()
    return sprint

# Complete Sprint
@router.patch("/sprints/{sprint_id}/complete")
def complete_sprint(sprint_id: int, db: Session = Depends(get_db)):
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
    
    sprint.status = SprintStatus.COMPLETED
    db.commit()
    return sprint

# Move task to sprint
@router.patch("/tasks/{task_id}/move-to-sprint/{sprint_id}")
def move_task_to_sprint(task_id: int, sprint_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()
    
    if not task or not sprint:
        raise HTTPException(status_code=404, detail="Task or Sprint not found")
    
    task.sprint_id = sprint_id
    db.commit()
    return task

# Get burndown data (for burndown chart)
@router.get("/sprints/{sprint_id}/burndown")
def get_burndown(sprint_id: int, db: Session = Depends(get_db)):
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
    
    # Calculate work remaining over time
    remaining_tasks = db.query(Task).filter(
        Task.sprint_id == sprint_id,
        Task.status != "done"
    ).all()
    
    total_points = sum([t.story_points or 1 for t in sprint.tasks])
    completed_points = sum([t.story_points or 1 for t in sprint.tasks if t.status == "done"])
    remaining_points = total_points - completed_points
    
    return {
        "sprint_id": sprint_id,
        "total_points": total_points,
        "completed_points": completed_points,
        "remaining_points": remaining_points,
        "completion_percentage": (completed_points / total_points * 100) if total_points > 0 else 0
    }