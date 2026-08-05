from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from config import settings
from models.user import User
from models.task import Task
import certifi


async def init_db():

    client = AsyncIOMotorClient(
        settings.mongo_uri,
        tlsCAFile=certifi.where()
    )

    db = client[settings.database_name]

    await init_beanie(
        database=db,
        document_models=[
            User,
            Task
        ]
    )

    print("MongoDB Connected Successfully")