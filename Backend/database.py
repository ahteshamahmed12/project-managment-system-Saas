from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from config import settings
from models.user import User

async def init_db():
    client = AsyncIOMotorClient(settings.mongo_uri)
    db = client[settings.database_name]          # ✅ select the actual database
    await init_beanie(database=db, document_models=[User])