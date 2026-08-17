from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.project import Project
from models.sprints import Sprint, SprintStatus
from models.tasks import Task
from models.user import User

MAX_RESULTS_PER_GROUP = 5


def _like_pattern(term: str) -> str:
    """Escape LIKE wildcards so user input is matched literally."""
    escaped = term.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    return f"%{escaped}%"


def _status_value(status) -> str | None:
    if status is None:
        return None
    if isinstance(status, SprintStatus):
        return status.value
    return str(status)


async def perform_search(db: AsyncSession, search_term: str) -> dict:
    """Global search across users, projects, sprints and tasks."""
    term = search_term.strip().lower()

    if not term:
        return {"users": [], "projects": [], "sprints": [], "tasks": []}

    pattern = _like_pattern(term)

    # ---------------------------------------------------------
    # Users
    # ---------------------------------------------------------
    user_result = await db.execute(
        select(User)
        .where(
            or_(
                func.lower(User.name).like(pattern, escape="\\"),
                func.lower(User.email).like(pattern, escape="\\"),
            )
        )
        .order_by(User.name)
        .limit(MAX_RESULTS_PER_GROUP)
    )

    users = [
        {
            "id": str(u.id),
            "name": u.name,
            "email": u.email,
            "avatar": u.avatar,
            "department": u.department.value if u.department else None,
        }
        for u in user_result.scalars().all()
    ]

    # ---------------------------------------------------------
    # Projects
    # ---------------------------------------------------------
    project_result = await db.execute(
        select(Project)
        .where(
            or_(
                func.lower(Project.name).like(pattern, escape="\\"),
                func.lower(Project.description).like(pattern, escape="\\"),
            )
        )
        .order_by(Project.name)
        .limit(MAX_RESULTS_PER_GROUP)
    )

    projects = [
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
        }
        for p in project_result.scalars().all()
    ]

    # ---------------------------------------------------------
    # Sprints
    # ---------------------------------------------------------
    sprint_result = await db.execute(
        select(Sprint)
        .options(selectinload(Sprint.project))
        .where(
            or_(
                func.lower(Sprint.name).like(pattern, escape="\\"),
                func.lower(Sprint.goal).like(pattern, escape="\\"),
                func.lower(Sprint.description).like(pattern, escape="\\"),
            )
        )
        .order_by(Sprint.name)
        .limit(MAX_RESULTS_PER_GROUP)
    )

    sprints = [
        {
            "id": s.id,
            "name": s.name,
            "goal": s.goal,
            "description": s.description,
            "status": _status_value(s.status),
            "project": s.project.name if s.project else "Unknown",
        }
        for s in sprint_result.scalars().all()
    ]

    # ---------------------------------------------------------
    # Tasks
    # ---------------------------------------------------------
    task_result = await db.execute(
        select(Task)
        .where(
            or_(
                func.lower(Task.title).like(pattern, escape="\\"),
                func.lower(Task.description).like(pattern, escape="\\"),
            )
        )
        .order_by(Task.title)
        .limit(MAX_RESULTS_PER_GROUP)
    )

    tasks = [
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "status": t.status,
            "priority": t.priority,
            "project_id": t.project_id,
        }
        for t in task_result.scalars().all()
    ]

    return {
        "users": users,
        "projects": projects,
        "sprints": sprints,
        "tasks": tasks,
    }
