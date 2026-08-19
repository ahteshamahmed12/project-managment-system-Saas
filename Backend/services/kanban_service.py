# services/kanban_service.py
from datetime import datetime, timezone
from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.kanban import KanbanBoard, KanbanColumn, KanbanStatus, KanbanTask, TaskPriority
from models.sprints import utcnow


def _enum_value(value):
    return value.value if hasattr(value, "value") else value


def _float(value):
    if value is None:
        return None
    return float(value)


def task_to_dict(task: KanbanTask) -> dict:
    return {
        "id": task.id,
        "board_id": task.board_id,
        "column_id": task.column_id,
        "task_id": task.task_id,
        "title": task.title,
        "description": task.description,
        "priority": _enum_value(task.priority),
        "assignee_id": task.assignee_id,
        "assignee_name": task.assignee.name if task.assignee else None,
        "assignee_avatar": task.assignee.avatar if task.assignee else None,
        "story_points": task.story_points,
        "time_estimate": task.time_estimate,
        "time_spent": task.time_spent,
        "due_date": task.due_date,
        "order": _float(task.order),
        "status": _enum_value(task.status),
        "is_blocked": task.is_blocked,
        "blocked_reason": task.blocked_reason,
        "is_completed": task.is_completed,
        "tags": task.tags,
        "completed_at": task.completed_at,
        "created_at": task.created_at,
        "updated_at": task.updated_at,
        "comment_count": 0,
    }


def column_to_dict(column: KanbanColumn, task_count: int | None = None) -> dict:
    loaded_tasks = column.__dict__.get("tasks")
    if task_count is None and loaded_tasks is not None:
        task_count = len(loaded_tasks)
    return {
        "id": column.id,
        "board_id": column.board_id,
        "name": column.name,
        "status": _enum_value(column.status),
        "wip_limit": column.wip_limit,
        "order": _float(column.order),
        "created_at": column.created_at,
        "task_count": task_count,
    }


def board_to_dict(board: KanbanBoard, include_tasks: bool = True) -> dict:
    data = {
        "id": board.id,
        "project_id": board.project_id,
        "sprint_id": board.sprint_id,
        "name": board.name,
        "description": board.description,
        "created_at": board.created_at,
        "updated_at": board.updated_at,
        "columns": [
            {
                **column_to_dict(column),
                "tasks": [
                    task_to_dict(t)
                    for t in sorted(column.tasks, key=lambda t: (t.order or 0, t.id))
                ],
            }
            for column in board.columns
        ],
    }
    if include_tasks:
        data["tasks"] = [task_to_dict(t) for t in board.tasks]
    return data


DEFAULT_COLUMNS = [
    ("Todo", KanbanStatus.TODO, 0),
    ("In Progress", KanbanStatus.IN_PROGRESS, 1),
    ("In Review", KanbanStatus.IN_REVIEW, 2),
    ("Done", KanbanStatus.DONE, 3),
]

VALID_STATUSES = {s.value for s in KanbanStatus}
VALID_PRIORITIES = {p.value for p in TaskPriority}


class KanbanBoardService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    async def _get_board(self, board_id: int) -> KanbanBoard:
        result = await self.db.execute(
            select(KanbanBoard)
            .options(
                selectinload(KanbanBoard.columns).selectinload(KanbanColumn.tasks)
                .selectinload(KanbanTask.assignee),
                selectinload(KanbanBoard.tasks).selectinload(KanbanTask.assignee),
                selectinload(KanbanBoard.project),
            )
            .where(KanbanBoard.id == board_id)
        )
        board = result.scalar_one_or_none()
        if board is None:
            raise HTTPException(status_code=404, detail="Board not found")
        return board

    async def _get_column(self, column_id: int) -> KanbanColumn:
        result = await self.db.execute(
            select(KanbanColumn)
            .options(
                selectinload(KanbanColumn.board),
                selectinload(KanbanColumn.tasks).selectinload(KanbanTask.assignee),
            )
            .where(KanbanColumn.id == column_id)
        )
        column = result.scalar_one_or_none()
        if column is None:
            raise HTTPException(status_code=404, detail="Column not found")
        return column

    async def _get_task(self, task_id: int) -> KanbanTask:
        result = await self.db.execute(
            select(KanbanTask)
            .options(
                selectinload(KanbanTask.column),
                selectinload(KanbanTask.assignee),
                selectinload(KanbanTask.linked_task),
            )
            .where(KanbanTask.id == task_id)
        )
        task = result.scalar_one_or_none()
        if task is None:
            raise HTTPException(status_code=404, detail="Kanban task not found")
        return task

    async def _max_order_in_column(self, column_id: int) -> float:
        result = await self.db.execute(
            select(func.max(KanbanTask.order)).where(KanbanTask.column_id == column_id)
        )
        max_order = result.scalar_one_or_none()
        return float(max_order) if max_order is not None else 0.0

    async def _column_task_count(self, column_id: int, exclude_task_id: int | None = None) -> int:
        stmt = select(func.count(KanbanTask.id)).where(KanbanTask.column_id == column_id)
        if exclude_task_id is not None:
            stmt = stmt.where(KanbanTask.id != exclude_task_id)
        result = await self.db.execute(stmt)
        return result.scalar_one()

    async def _sync_linked_task(self, task: KanbanTask) -> None:
        """Keep the legacy tasks table in sync so the board is connected
        to the existing task manager."""
        if task.linked_task is None:
            return
        task.linked_task.status = _enum_value(task.status)
        if task.assignee_id is not None:
            task.linked_task.assigned_to = task.assignee_id
        task.linked_task.story_points = task.story_points

    def _check_wip(self, column: KanbanColumn, count_after_move: int) -> None:
        if column.wip_limit is None:
            return
        if count_after_move > column.wip_limit:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"WIP limit exceeded for column '{column.name}' "
                    f"({count_after_move} tasks, limit {column.wip_limit}). "
                    "Move or remove tasks before adding more."
                ),
            )

    # ------------------------------------------------------------------
    # Boards
    # ------------------------------------------------------------------
    async def create_board(self, project_id: int, sprint_id: int | None, name: str, description: str | None) -> dict:
        board = KanbanBoard(
            project_id=project_id,
            sprint_id=sprint_id,
            name=name,
            description=description,
        )
        self.db.add(board)
        await self.db.flush()

        for idx, (col_name, col_status, order) in enumerate(DEFAULT_COLUMNS):
            self.db.add(
                KanbanColumn(
                    board_id=board.id,
                    name=col_name,
                    status=col_status,
                    wip_limit=None,
                    order=Decimal(str(idx + 1)),
                )
            )

        await self.db.commit()
        return board_to_dict(await self._get_board(board.id))

    async def get_board(self, board_id: int) -> dict:
        return board_to_dict(await self._get_board(board_id))

    async def list_project_boards(self, project_id: int) -> list[dict]:
        result = await self.db.execute(
            select(KanbanBoard)
            .options(
                selectinload(KanbanBoard.columns),
                selectinload(KanbanBoard.tasks),
            )
            .where(KanbanBoard.project_id == project_id)
            .order_by(KanbanBoard.created_at.desc())
        )
        return [
            {
                **board_to_dict(board, include_tasks=False),
                "task_count": len(board.tasks),
            }
            for board in result.scalars().all()
        ]

    async def update_board(self, board_id: int, data: dict) -> dict:
        board = await self._get_board(board_id)
        if "name" in data and data["name"] is not None:
            board.name = data["name"]
        if "description" in data:
            board.description = data["description"]
        if "sprint_id" in data:
            board.sprint_id = data["sprint_id"]
        await self.db.commit()
        return board_to_dict(await self._get_board(board.id))

    async def delete_board(self, board_id: int) -> None:
        board = await self._get_board(board_id)
        await self.db.delete(board)
        await self.db.commit()

    # ------------------------------------------------------------------
    # Columns
    # ------------------------------------------------------------------
    async def create_column(self, board_id: int, data: dict) -> dict:
        board = await self._get_board(board_id)

        status = data.get("status", "todo")
        if status not in VALID_STATUSES:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {sorted(VALID_STATUSES)}")

        order = data.get("order")
        if order is None:
            order = (await self._max_column_order(board_id)) + 1.0

        column = KanbanColumn(
            board_id=board_id,
            name=data["name"],
            status=KanbanStatus(status),
            wip_limit=data.get("wip_limit"),
            order=Decimal(str(order)),
        )
        self.db.add(column)
        await self.db.commit()
        await self.db.refresh(column)
        return column_to_dict(column)

    async def _max_column_order(self, board_id: int) -> float:
        result = await self.db.execute(
            select(func.max(KanbanColumn.order)).where(KanbanColumn.board_id == board_id)
        )
        max_order = result.scalar_one_or_none()
        return float(max_order) if max_order is not None else 0.0

    async def update_column(self, column_id: int, data: dict) -> dict:
        column = await self._get_column(column_id)

        if "name" in data and data["name"] is not None:
            column.name = data["name"]
        if "status" in data and data["status"] is not None:
            if data["status"] not in VALID_STATUSES:
                raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {sorted(VALID_STATUSES)}")
            column.status = KanbanStatus(data["status"])
        if "wip_limit" in data:
            column.wip_limit = data["wip_limit"]
        if "order" in data and data["order"] is not None:
            column.order = Decimal(str(data["order"]))

        await self.db.commit()
        await self.db.refresh(column)
        return column_to_dict(column)

    async def delete_column(self, column_id: int) -> None:
        column = await self._get_column(column_id)
        board = column.board

        remaining = [
            c for c in board.columns if c.id != column_id
        ]
        if not remaining:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete the only column on the board. Add another column first.",
            )

        # Reassign tasks to the first remaining column (lowest order)
        fallback = min(remaining, key=lambda c: (c.order or 0, c.id))
        for task in column.tasks:
            task.column_id = fallback.id
            task.status = fallback.status
            if fallback.status == KanbanStatus.DONE:
                task.is_completed = True
                task.completed_at = utcnow()
            else:
                task.is_completed = False
                task.completed_at = None
            await self._sync_linked_task(task)

        await self.db.delete(column)
        await self.db.commit()

    # ------------------------------------------------------------------
    # Tasks
    # ------------------------------------------------------------------
    async def create_task(self, board_id: int, data: dict) -> dict:
        await self._get_board(board_id)

        if data.get("column_id") is not None:
            column = await self._get_column(data["column_id"])
            if column.board_id != board_id:
                raise HTTPException(status_code=400, detail="Column does not belong to this board")
        else:
            result = await self.db.execute(
                select(KanbanColumn)
                .where(KanbanColumn.board_id == board_id)
                .order_by(KanbanColumn.order)
                .limit(1)
            )
            column = result.scalar_one_or_none()
            if column is None:
                raise HTTPException(
                    status_code=400,
                    detail="Board has no columns. Create a column before adding tasks.",
                )

        priority = data.get("priority", TaskPriority.MEDIUM.value)
        if priority not in VALID_PRIORITIES:
            raise HTTPException(status_code=400, detail=f"Invalid priority. Must be one of: {sorted(VALID_PRIORITIES)}")

        self._check_wip(column, (await self._column_task_count(column.id)) + 1)

        order = data.get("order")
        if order is None:
            order = (await self._max_order_in_column(column.id)) + 1.0

        task = KanbanTask(
            board_id=board_id,
            column_id=column.id,
            task_id=data.get("task_id"),
            title=data["title"],
            description=data.get("description"),
            priority=TaskPriority(priority),
            assignee_id=data.get("assignee_id"),
            story_points=data.get("story_points"),
            time_estimate=data.get("time_estimate"),
            time_spent=data.get("time_spent", 0),
            due_date=data.get("due_date"),
            order=Decimal(str(order)),
            status=column.status,
            is_blocked=data.get("is_blocked", False),
            blocked_reason=data.get("blocked_reason"),
            is_completed=column.status == KanbanStatus.DONE,
            tags=data.get("tags"),
            completed_at=utcnow() if column.status == KanbanStatus.DONE else None,
        )
        self.db.add(task)
        await self.db.flush()
        await self._sync_linked_task(task)
        await self.db.commit()

        loaded = await self._get_task(task.id)
        return task_to_dict(loaded)

    async def get_task(self, task_id: int) -> dict:
        return task_to_dict(await self._get_task(task_id))

    async def update_task(self, task_id: int, data: dict) -> dict:
        task = await self._get_task(task_id)

        for field in ("title", "description", "story_points", "time_estimate",
                      "time_spent", "due_date", "blocked_reason", "tags"):
            if field in data:
                setattr(task, field, data[field])

        if "priority" in data and data["priority"] is not None:
            if data["priority"] not in VALID_PRIORITIES:
                raise HTTPException(status_code=400, detail=f"Invalid priority. Must be one of: {sorted(VALID_PRIORITIES)}")
            task.priority = TaskPriority(data["priority"])

        if "assignee_id" in data:
            task.assignee_id = data["assignee_id"]

        if "is_blocked" in data:
            task.is_blocked = data["is_blocked"]
            if not data["is_blocked"]:
                task.blocked_reason = None

        if "order" in data and data["order"] is not None:
            task.order = Decimal(str(data["order"]))

        # Moving to another column via update keeps status in sync + WIP limits
        if "column_id" in data and data["column_id"] is not None and data["column_id"] != task.column_id:
            column = await self._get_column(data["column_id"])
            if column.board_id != task.board_id:
                raise HTTPException(status_code=400, detail="Column does not belong to the task's board")
            self._check_wip(column, (await self._column_task_count(column.id, exclude_task_id=task.id)) + 1)
            task.column_id = column.id
            task.status = column.status
            if column.status == KanbanStatus.DONE:
                task.is_completed = True
                task.completed_at = utcnow()
            else:
                task.is_completed = False
                task.completed_at = None

        await self._sync_linked_task(task)
        await self.db.commit()

        loaded = await self._get_task(task_id)
        return task_to_dict(loaded)

    async def delete_task(self, task_id: int) -> None:
        task = await self._get_task(task_id)
        await self.db.delete(task)
        await self.db.commit()

    # ------------------------------------------------------------------
    # Movement
    # ------------------------------------------------------------------
    async def move_task(self, task_id: int, column_id: int, order: float | None) -> dict:
        task = await self._get_task(task_id)
        column = await self._get_column(column_id)

        if task.board_id != column.board_id:
            raise HTTPException(status_code=400, detail="Task and column belong to different boards")

        self._check_wip(
            column,
            (await self._column_task_count(column.id, exclude_task_id=task.id)) + 1,
        )

        if order is None:
            order = (await self._max_order_in_column(column.id)) + 1.0

        task.column_id = column.id
        task.status = column.status
        task.order = Decimal(str(order))

        if column.status == KanbanStatus.DONE:
            task.is_completed = True
            task.completed_at = utcnow()
        else:
            task.is_completed = False
            task.completed_at = None

        await self._sync_linked_task(task)
        await self.db.commit()

        loaded = await self._get_task(task_id)
        return task_to_dict(loaded)

    async def reorder_tasks_in_column(self, column_id: int, task_ids: list[int]) -> list[dict]:
        column = await self._get_column(column_id)

        tasks = []
        for task_id in task_ids:
            task = await self._get_task(task_id)
            if task.column_id != column_id:
                raise HTTPException(status_code=400, detail=f"Task {task_id} is not in column {column_id}")
            tasks.append(task)

        for idx, task in enumerate(tasks):
            task.order = Decimal(str(idx + 1.0))

        await self.db.commit()
        return [task_to_dict(t) for t in tasks]

    async def move_tasks_bulk(self, task_ids: list[int], column_id: int, order: float | None) -> list[dict]:
        column = await self._get_column(column_id)

        tasks = [await self._get_task(tid) for tid in task_ids]
        for task in tasks:
            if task.board_id != column.board_id:
                raise HTTPException(status_code=400, detail="Some tasks belong to a different board")

        already_in_column = sum(1 for t in tasks if t.column_id == column_id)
        current_count = await self._column_task_count(column.id)
        self._check_wip(column, current_count - already_in_column + len(tasks))

        next_order = order
        if next_order is None:
            next_order = (await self._max_order_in_column(column.id)) + 1.0

        for idx, task in enumerate(tasks):
            task.column_id = column.id
            task.status = column.status
            task.order = Decimal(str(next_order + idx))

            if column.status == KanbanStatus.DONE:
                task.is_completed = True
                task.completed_at = utcnow()
            else:
                task.is_completed = False
                task.completed_at = None
            await self._sync_linked_task(task)

        await self.db.commit()
        return [task_to_dict(t) for t in tasks]

    async def check_wip_limit(self, column_id: int) -> dict:
        column = await self._get_column(column_id)
        count = await self._column_task_count(column_id)
        if column.wip_limit is None:
            return {
                "column_id": column.id,
                "wip_limit": None,
                "count": count,
                "at_limit": False,
                "over_limit": False,
            }
        return {
            "column_id": column.id,
            "wip_limit": column.wip_limit,
            "count": count,
            "at_limit": count >= column.wip_limit,
            "over_limit": count > column.wip_limit,
        }

    # ------------------------------------------------------------------
    # Status operations
    # ------------------------------------------------------------------
    async def complete_task(self, task_id: int) -> dict:
        task = await self._get_task(task_id)
        task.is_completed = True
        task.completed_at = utcnow()
        if task.linked_task is not None:
            task.linked_task.status = KanbanStatus.DONE.value
        await self.db.commit()
        return task_to_dict(await self._get_task(task_id))

    async def reopen_task(self, task_id: int) -> dict:
        task = await self._get_task(task_id)
        task.is_completed = False
        task.completed_at = None
        await self._sync_linked_task(task)
        await self.db.commit()
        return task_to_dict(await self._get_task(task_id))

    async def block_task(self, task_id: int, reason: str | None) -> dict:
        task = await self._get_task(task_id)
        task.is_blocked = True
        task.blocked_reason = reason
        await self.db.commit()
        return task_to_dict(await self._get_task(task_id))

    async def unblock_task(self, task_id: int) -> dict:
        task = await self._get_task(task_id)
        task.is_blocked = False
        task.blocked_reason = None
        await self.db.commit()
        return task_to_dict(await self._get_task(task_id))

    # ------------------------------------------------------------------
    # Search
    # ------------------------------------------------------------------
    async def search_tasks(
        self,
        board_id: int,
        search: str | None = None,
        priority: str | None = None,
        status: str | None = None,
        assignee_id: UUID | None = None,
        is_blocked: bool | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> dict:
        await self._get_board(board_id)

        filters = [KanbanTask.board_id == board_id]

        if search:
            term = search.strip().lower()
            pattern = f"%{term}%"
            filters.append(
                or_(
                    func.lower(KanbanTask.title).like(pattern),
                    func.lower(func.coalesce(KanbanTask.description, "")).like(pattern),
                )
            )
        if priority:
            if priority not in VALID_PRIORITIES:
                raise HTTPException(status_code=400, detail=f"Invalid priority. Must be one of: {sorted(VALID_PRIORITIES)}")
            filters.append(KanbanTask.priority == TaskPriority(priority))
        if status:
            if status not in VALID_STATUSES:
                raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {sorted(VALID_STATUSES)}")
            filters.append(KanbanTask.status == KanbanStatus(status))
        if assignee_id is not None:
            filters.append(KanbanTask.assignee_id == assignee_id)
        if is_blocked is not None:
            filters.append(KanbanTask.is_blocked == is_blocked)

        count_result = await self.db.execute(select(func.count(KanbanTask.id)).where(*filters))
        total = count_result.scalar_one()

        page = max(1, page)
        page_size = min(max(1, page_size), 100)

        result = await self.db.execute(
            select(KanbanTask)
            .options(selectinload(KanbanTask.assignee))
            .where(*filters)
            .order_by(KanbanTask.order, KanbanTask.id)
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        return {
            "items": [task_to_dict(t) for t in result.scalars().all()],
            "total": total,
            "page": page,
            "page_size": page_size,
        }

    # ------------------------------------------------------------------
    # Stats
    # ------------------------------------------------------------------
    async def get_board_stats(self, board_id: int) -> dict:
        await self._get_board(board_id)

        result = await self.db.execute(
            select(
                func.count(KanbanTask.id),
                func.count(KanbanTask.id).filter(KanbanTask.status == KanbanStatus.DONE),
                func.count(KanbanTask.id).filter(KanbanTask.status == KanbanStatus.TODO),
                func.count(KanbanTask.id).filter(KanbanTask.status == KanbanStatus.IN_PROGRESS),
                func.count(KanbanTask.id).filter(KanbanTask.status == KanbanStatus.IN_REVIEW),
                func.count(KanbanTask.id).filter(KanbanTask.status == KanbanStatus.BLOCKED),
                func.count(KanbanTask.id).filter(KanbanTask.is_completed.is_(True)),
                func.coalesce(func.sum(KanbanTask.story_points), 0),
                func.coalesce(func.sum(KanbanTask.story_points).filter(KanbanTask.is_completed.is_(True)), 0),
            ).where(KanbanTask.board_id == board_id)
        )
        total, done, todo, in_progress, in_review, blocked, completed, total_points, completed_points = result.one()

        return {
            "board_id": board_id,
            "total": total,
            "by_status": {
                "todo": todo,
                "in_progress": in_progress,
                "in_review": in_review,
                "done": done,
                "blocked": blocked,
            },
            "todo": todo,
            "in_progress": in_progress,
            "in_review": in_review,
            "done": done,
            "blocked": blocked,
            "completed": completed,
            "completion_percentage": round((completed / total * 100), 2) if total else 0.0,
            "total_story_points": float(total_points or 0),
            "completed_story_points": float(completed_points or 0),
        }

    async def get_column_stats(self, column_id: int) -> dict:
        column = await self._get_column(column_id)

        result = await self.db.execute(
            select(
                func.count(KanbanTask.id),
                func.count(KanbanTask.id).filter(KanbanTask.is_blocked.is_(True)),
                func.coalesce(func.avg(KanbanTask.story_points), 0),
                func.coalesce(func.sum(KanbanTask.story_points), 0),
                func.coalesce(func.sum(KanbanTask.time_estimate), 0),
                func.coalesce(func.sum(KanbanTask.time_spent), 0),
            ).where(KanbanTask.column_id == column_id)
        )
        total, blocked_count, avg_points, total_points, total_estimate, total_spent = result.one()

        by_priority = {}
        for priority in TaskPriority:
            count_result = await self.db.execute(
                select(func.count(KanbanTask.id)).where(
                    KanbanTask.column_id == column_id,
                    KanbanTask.priority == priority,
                )
            )
            by_priority[priority.value] = count_result.scalar_one()

        wip_limit = column.wip_limit
        return {
            "column_id": column.id,
            "board_id": column.board_id,
            "name": column.name,
            "status": _enum_value(column.status),
            "wip_limit": wip_limit,
            "total_tasks": total,
            "at_limit": wip_limit is not None and total >= wip_limit,
            "over_limit": wip_limit is not None and total > wip_limit,
            "by_priority": by_priority,
            "blocked_count": blocked_count,
            "avg_story_points": round(float(avg_points), 2) if avg_points else None,
            "total_story_points": float(total_points or 0),
            "total_time_estimate": float(total_estimate or 0),
            "total_time_spent": float(total_spent or 0),
        }

    async def get_user_workload(self, board_id: int, user_id: UUID) -> dict:
        await self._get_board(board_id)

        result = await self.db.execute(
            select(
                func.count(KanbanTask.id),
                func.count(KanbanTask.id).filter(KanbanTask.is_completed.is_(True)),
                func.count(KanbanTask.id).filter(KanbanTask.is_blocked.is_(True)),
                func.count(KanbanTask.id).filter(KanbanTask.status == KanbanStatus.IN_PROGRESS),
                func.coalesce(func.sum(KanbanTask.story_points), 0),
                func.coalesce(func.sum(KanbanTask.story_points).filter(KanbanTask.is_completed.is_(True)), 0),
                func.coalesce(func.sum(KanbanTask.time_spent), 0),
            ).where(KanbanTask.board_id == board_id, KanbanTask.assignee_id == user_id)
        )
        total, completed, blocked, in_progress, total_points, completed_points, total_spent = result.one()

        tasks_result = await self.db.execute(
            select(KanbanTask)
            .options(selectinload(KanbanTask.assignee))
            .where(KanbanTask.board_id == board_id, KanbanTask.assignee_id == user_id)
            .order_by(KanbanTask.order, KanbanTask.id)
        )

        return {
            "board_id": board_id,
            "user_id": user_id,
            "total_tasks": total,
            "completed_tasks": completed,
            "blocked_tasks": blocked,
            "in_progress_tasks": in_progress,
            "total_story_points": float(total_points or 0),
            "completed_story_points": float(completed_points or 0),
            "total_time_spent": float(total_spent or 0),
            "tasks": [task_to_dict(t) for t in tasks_result.scalars().all()],
        }

    # ------------------------------------------------------------------
    # Bulk updates
    # ------------------------------------------------------------------
    async def assign_tasks_bulk(self, task_ids: list[int], assignee_id: UUID | None) -> list[dict]:
        tasks = [await self._get_task(tid) for tid in task_ids]
        for task in tasks:
            task.assignee_id = assignee_id
            await self._sync_linked_task(task)
        await self.db.commit()
        return [task_to_dict(t) for t in tasks]

    async def update_priority_bulk(self, task_ids: list[int], priority: str) -> list[dict]:
        if priority not in VALID_PRIORITIES:
            raise HTTPException(status_code=400, detail=f"Invalid priority. Must be one of: {sorted(VALID_PRIORITIES)}")
        tasks = [await self._get_task(tid) for tid in task_ids]
        for task in tasks:
            task.priority = TaskPriority(priority)
        await self.db.commit()
        return [task_to_dict(t) for t in tasks]