from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
)

from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from config import settings


# PostgreSQL Async Engine.
#
# On serverless each function instance holds its own pool, so many concurrent
# instances can exhaust the database connection limit. NullPool opens a
# connection per checkout and closes it after, which is the safe default on
# Vercel Functions and behind an external pooler (Neon / Supabase pgbouncer).
_engine_kwargs: dict = {"echo": settings.sql_echo}

if settings.serverless:
    _engine_kwargs["poolclass"] = NullPool
else:
    _engine_kwargs["pool_pre_ping"] = True

engine = create_async_engine(settings.database_url, **_engine_kwargs)

class Base(DeclarativeBase):
    pass

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# Session Factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# Dependency for FastAPI
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session