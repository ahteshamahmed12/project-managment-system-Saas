from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from .database import Async_sessionmaker

async def get_db_session() -> AsyncSession:
    async with get_async_session() as session:
        yield session