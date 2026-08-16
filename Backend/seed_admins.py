import asyncio

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database import AsyncSessionLocal
from models import Role, User
from models.user import UserStatus
from auth.hashing import hash_password


ADMINS = [
    {
        "name": "Syed Huzaifa",
        "email": "syedhuzaifa@gmail.com",
        "password": "Admin@123",
    },
    {
        "name": "Ahtesham Ahmed",
        "email": "ahteshamahmed405@gmail.com",
        "password": "Admin@123",
    },
    {
        "name": "Zain ",
        "email": "zainulabideen@gmail.com",
        "password": "Admin@123",
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

            print(f"Admin ready: {admin['email']} / {admin['password']}")

        await db.commit()
        print("Admin seed completed successfully.")


if __name__ == "__main__":
    asyncio.run(seed())