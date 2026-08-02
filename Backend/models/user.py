from beanie import Document, Indexed
from pydantic import EmailStr
from typing import Annotated
from datetime import datetime

class User(Document):
    username: str
    email: Annotated[EmailStr, Indexed(unique=True)]
    hashed_password: str
    is_active: bool = True
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "users"