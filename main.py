from fastapi import FastAPI
from contextlib import asynccontextmanager

from routes import task, auth
from database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="TaskFlow API",
    lifespan=lifespan
)


@app.get("/")
def home():
    return {
        "message": "TaskFlow API Running"
    }


app.include_router(
    auth.router
)

app.include_router(
    task.router,
    prefix="/tasks",
    tags=["Tasks"]
)