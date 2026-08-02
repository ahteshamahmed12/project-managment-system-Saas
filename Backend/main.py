from contextlib import asynccontextmanager
from fastapi import FastAPI
from database import init_db
from routes.auth import router as auth_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title="FastAPI + MongoDB JWT Auth", lifespan=lifespan)
app.include_router(auth_router)

@app.get("/")
async def root():
    return {"message": "Auth API running"}