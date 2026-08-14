from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routes.auth import router as auth_router
from routes.role import router as roles_router
from routes.user import router as users_router
from routes.sprints import router as sprints_router
from app.websocket.routes import router as websocket_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="Project Management API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(roles_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(sprints_router, prefix="/api")
app.include_router(websocket_router)


@app.get("/")
async def root():
    return {"message": "Project Management API"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
