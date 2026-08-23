from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db

from routers.auth import router as auth_router
from routers.role import router as roles_router
from routers.user import router as users_router
from routers.sprints import router as sprints_router
from routers.search import router as search_router
from routers.projects import router as projects_router
from routers.kanban import router as kanban_router
from routers.tasks import router as tasks_router
from routers.settings import router as settings_router
from routers.teams import router as teams_router
from routers.comments import router as comments_router
from routers.activity import router as activity_router
from routers.admin import router as admin_router

from app.websocket.routes import router as websocket_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="Project Management API",
    version="1.0.0",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Authentication
app.include_router(
    auth_router,
    prefix="/api",
)


# Roles / RBAC
app.include_router(
    roles_router,
    prefix="/api",
)


# Users
app.include_router(
    users_router,
    prefix="/api",
)


# Sprints
app.include_router(
    sprints_router,
    prefix="/api",
)


# WebSocket
app.include_router(
    websocket_router,
)

# Global search
app.include_router(
    search_router,
    prefix="/api",
)


# Projects
app.include_router(
    projects_router,
    prefix="/api",
)


# Kanban boards
app.include_router(
    kanban_router,
    prefix="/api",
)


app.include_router(
    tasks_router,
    prefix="/api",
)


app.include_router(
    settings_router,
    prefix="/api",
)


app.include_router(
    teams_router,
    prefix="/api",
)


app.include_router(
    comments_router,
    prefix="/api",
)


app.include_router(
    activity_router,
    prefix="/api",
)


app.include_router(
    admin_router,
    prefix="/api",
)


@app.get("/")
async def root():
    return {
        "message": "Project Management API"
    }


@app.get("/health")
async def health():
    return {
        "status": "ok"
    }
    