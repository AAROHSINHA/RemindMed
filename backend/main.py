from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.exception_handlers import (
    http_exception_handler,
    request_validation_exception_handler,
)
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from src.routes.auth import router as auth_router
from src.routes.ocr import router as ocr_router
from src.routes.prescriptions import router as prescriptions_router
from src.routes.medicines import router as medicine_router
from src.utils.config.db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="RemindMed!", lifespan=lifespan)
init_db()

@app.exception_handler(StarletteHTTPException)
async def log_http_exception(request: Request, exc: StarletteHTTPException):
    print(f"[ERROR] {request.method} {request.url.path} -> {exc.status_code}: {exc.detail}", flush=True)
    return await http_exception_handler(request, exc)


@app.exception_handler(RequestValidationError)
async def log_validation_error(request: Request, exc: RequestValidationError):
    problems = [(".".join(str(p) for p in e["loc"]), e["msg"]) for e in exc.errors()]
    print(f"[ERROR] {request.method} {request.url.path} -> 422: {problems}", flush=True)
    return await request_validation_exception_handler(request, exc)


app.include_router(auth_router)
app.include_router(ocr_router)
app.include_router(prescriptions_router)
app.include_router(medicine_router)


# Test Route
@app.get("/")
def root():
    return {"message": "FastAPI is running!"}