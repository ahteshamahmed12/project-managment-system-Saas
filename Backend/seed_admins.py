import asyncio

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database import AsyncSessionLocal
from models import Role, User
from models.user import UserStatus
from models.notification import Notification
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
            elif admin_role not in user.roles:
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

        await db.commit()
        print("Admin seed completed successfully.")


if __name__ == "__main__":
    asyncio.run(seed())