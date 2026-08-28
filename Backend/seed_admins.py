import asyncio

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database import AsyncSessionLocal
from models import Role, User
from models.user import UserStatus
from models.notification import Notification
from models.project import Project
from models.tasks import Task
from auth.hashing import hash_password


ADMINS = [
    {
        "name": "Syed Huzaifa",
        "email": "syedhuzaifa@gmail.com",
        "password": "Admin@123",
    },
    {
        "name": "Ahtesham Ahmed",
        "email": "ahteshamahmed402@gmail.com",
        "password": "Admin@123",
    },
    {
        "name": "Zain ",
        "email": "zainulabideen@gmail.com",
        "password": "Admin@123",
    },
]

SAMPLE_PROJECTS = [
    {
        "name": "Project Alpha",
        "description": "Project management dashboard redesign.",
        "status": "Active",
        "priority": "High",
        "start_date": "2026-08-01",
        "end_date": "2026-10-15",
        "created_by": "Syed Huzaifa",
    },
    {
        "name": "CRM System",
        "description": "Customer relationship management system.",
        "status": "On Hold",
        "priority": "Medium",
        "start_date": "2026-07-20",
        "end_date": "2026-09-30",
        "created_by": "Ahtesham Ahmed",
    },
    {
        "name": "E-Commerce Website",
        "description": "Complete online shopping platform.",
        "status": "Completed",
        "priority": "High",
        "start_date": "2026-05-01",
        "end_date": "2026-07-01",
        "created_by": "Zain",
    },
    {
        "name": "TaskFlow",
        "description": "Task management platform for agile teams.",
        "status": "Active",
        "priority": "High",
        "start_date": "2025-06-01",
        "end_date": "2025-09-15",
        "created_by": "Syed Huzaifa",
    },
    {
        "name": "Hospital ERP",
        "description": "Hospital management and patient record system.",
        "status": "On Hold",
        "priority": "Medium",
        "start_date": "2025-04-10",
        "end_date": "2025-11-20",
        "created_by": "Ahtesham Ahmed",
    },
]

SAMPLE_NOTIFICATIONS = [
    {
        "title": "New Task Assigned",
        "message": "You have been assigned a new task in Project Management SaaS.",
        "type": "task",
        "read": False,
    },
    {
        "title": "Sprint Started",
        "message": "Sprint 21 is now active.",
        "type": "sprint",
        "read": False,
    },
    {
        "title": "Project Updated",
        "message": "Project Management SaaS project details were updated.",
        "type": "project",
        "read": False,
    },
    {
        "title": "New Team Member",
        "message": "A new member has been added to your team.",
        "type": "team",
        "read": True,
    },
]


async def seed():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Role).where(Role.name == "admin"))
        admin_role = result.scalar_one_or_none()

        if admin_role is None:
            print("Admin role not found. Run seed_rbac.py first.")
            return

        for admin in ADMINS:
            result = await db.execute(
                select(User)
                .options(selectinload(User.roles))
                .where(User.email == admin["email"])
            )
            user = result.scalar_one_or_none()

            if user is None:
                user = User(
                    name=admin["name"],
                    email=admin["email"],
                    hashed_password=hash_password(admin["password"]),
                    is_active=True,
                    status=UserStatus.ACTIVE,
                    roles=[admin_role],
                )
                db.add(user)
            else:
                user.hashed_password = hash_password(admin["password"])
                user.is_active = True
                user.status = UserStatus.ACTIVE
                if admin_role not in user.roles:
                    user.roles.append(admin_role)

            # Sample notifications (skip if the user already has some).
            existing = await db.execute(
                select(Notification).where(Notification.user_id == user.id)
            )
            if existing.scalars().first() is None:
                for sample in SAMPLE_NOTIFICATIONS:
                    db.add(
                        Notification(
                            user_id=user.id,
                            title=sample["title"],
                            message=sample["message"],
                            type=sample["type"],
                            read=sample["read"],
                        )
                    )

            print(f"Admin ready: {admin['email']} / {admin['password']}")

        # Seed projects for search and dashboard
        for p_data in SAMPLE_PROJECTS:
            existing_p = await db.execute(
                select(Project).where(Project.name == p_data["name"])
            )
            project = existing_p.scalar_one_or_none()
            if project is None:
                project = Project(
                    name=p_data["name"],
                    description=p_data["description"],
                    status=p_data["status"],
                    priority=p_data["priority"],
                    start_date=p_data["start_date"],
                    end_date=p_data["end_date"],
                    created_by=p_data["created_by"],
                )
                db.add(project)

        await db.commit()
        print("Admin seed and sample projects completed successfully.")


if __name__ == "__main__":
    asyncio.run(seed())