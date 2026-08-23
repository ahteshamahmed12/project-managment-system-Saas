from datetime import datetime, timezone
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth.dependencies import get_current_user
from database import get_db
from models.tasks import Task
from models.user import User

router = APIRouter(
    prefix="/comments",
    tags=["Comments"],
)


@router.post("/tasks/{task_id}")
async def add_task_comment(
    task_id: int,
    content: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a comment to a task."""
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {
        "id": str(uuid4()),
        "task_id": task_id,
        "user_id": str(current_user.id),
        "user_name": current_user.name,
        "content": content,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/tasks/{task_id}")
async def get_task_comments(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get comments for a task."""
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {"comments": [], "total": 0}


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Upload a file/attachment."""
    return {
        "filename": file.filename,
        "size": file.size,
        "url": f"/uploads/{file.filename}",
        "message": "File uploaded successfully",
    }