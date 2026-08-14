from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from config import settings

engine = create_async_engine(settings.database_url, echo=False, pool_pre_ping=True)


class Base(DeclarativeBase):
    pass


AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)


async def init_db() -> None:
    import models.project  # noqa: F401
    import models.role  # noqa: F401
    import models.user  # noqa: F401
    import models.sprints  # noqa: F401
    import models.tasks  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
