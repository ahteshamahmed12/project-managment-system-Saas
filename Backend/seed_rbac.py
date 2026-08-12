import asyncio

from sqlalchemy import delete, select

from database import AsyncSessionLocal
from models import Permission, Role
from models.role import role_permissions


PERMISSIONS = [
    ("project:create", "Create projects", "project", "create"),
    ("project:read", "View projects", "project", "read"),
    ("project:update", "Update projects", "project", "update"),
    ("project:delete", "Delete projects", "project", "delete"),

    ("task:create", "Create tasks", "task", "create"),
    ("task:read", "View tasks", "task", "read"),
    ("task:update", "Update tasks", "task", "update"),
    ("task:delete", "Delete tasks", "task", "delete"),

    ("sprint:create", "Create sprints", "sprint", "create"),
    ("sprint:read", "View sprints", "sprint", "read"),
    ("sprint:update", "Update sprints", "sprint", "update"),
    ("sprint:delete", "Delete sprints", "sprint", "delete"),

    ("user:read", "View users", "user", "read"),
    ("user:update", "Update users", "user", "update"),
    ("user:delete", "Delete users", "user", "delete"),

    ("role:read", "View roles", "role", "read"),
    ("role:create", "Create roles", "role", "create"),
    ("role:update", "Update roles", "role", "update"),
    ("role:delete", "Delete roles", "role", "delete"),
]


ROLE_PERMISSIONS = {
    "owner": [
        permission[0]
        for permission in PERMISSIONS
    ],

    "admin": [
        permission[0]
        for permission in PERMISSIONS
        if permission[0] not in {
            "role:delete",
        }
    ],

    "manager": [
        "project:create",
        "project:read",
        "project:update",

        "task:create",
        "task:read",
        "task:update",
        "task:delete",

        "sprint:create",
        "sprint:read",
        "sprint:update",
    ],

    "member": [
        "project:read",

        "task:create",
        "task:read",
        "task:update",

        "sprint:read",
    ],

    "viewer": [
        "project:read",
        "task:read",
        "sprint:read",
    ],
}


async def seed():

    async with AsyncSessionLocal() as db:

        # ---------------------------------------------------------
        # 1. Create / get permissions
        # ---------------------------------------------------------

        permission_objects = {}

        for (
            name,
            description,
            resource,
            action,
        ) in PERMISSIONS:

            result = await db.execute(
                select(Permission)
                .where(Permission.name == name)
            )

            permission = result.scalar_one_or_none()

            if permission is None:

                permission = Permission(
                    name=name,
                    description=description,
                    resource=resource,
                    action=action,
                )

                db.add(permission)

                await db.flush()

            permission_objects[name] = permission

        # ---------------------------------------------------------
        # 2. Create / get roles
        # ---------------------------------------------------------

        for role_name, permission_names in ROLE_PERMISSIONS.items():

            result = await db.execute(
                select(Role)
                .where(Role.name == role_name)
            )

            role = result.scalar_one_or_none()

            if role is None:

                role = Role(
                    name=role_name,
                    description=f"{role_name.capitalize()} role",
                    is_system_role=True,
                )

                db.add(role)

                await db.flush()

            # -----------------------------------------------------
            # 3. Remove existing role-permission relationships
            #
            # IMPORTANT:
            # Do NOT use role.permissions.clear()
            # because that causes MissingGreenlet with async SQLAlchemy.
            # -----------------------------------------------------

            await db.execute(
                delete(role_permissions).where(
                    role_permissions.c.role_id == role.id
                )
            )

            # -----------------------------------------------------
            # 4. Add the correct permissions for this role
            # -----------------------------------------------------

            for permission_name in permission_names:

                permission = permission_objects[permission_name]

                await db.execute(
                    role_permissions.insert().values(
                        role_id=role.id,
                        permission_id=permission.id,
                    )
                )

        # ---------------------------------------------------------
        # 5. Commit everything
        # ---------------------------------------------------------

        await db.commit()

        print("RBAC seed completed successfully.")


if __name__ == "__main__":
    asyncio.run(seed())