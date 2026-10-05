from contextlib import asynccontextmanager
from fastapi import FastAPI
from src.routes.auth import router as auth_router
from src.utils.db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="RemindMed!", lifespan=lifespan)
init_db()

app.include_router(auth_router)


# Test Route
@app.get("/")
def root():
    return {"message": "FastAPI is running!"}