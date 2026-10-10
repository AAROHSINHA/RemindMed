import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy import or_
from sqlalchemy.orm import Session

from src.utils.config.tokenConfig import (
    REFRESH,
    create_token_pair,
    decode_token,
    get_current_user,
)
from src.utils.config.db import get_db
from src.utils.models import User

router = APIRouter(prefix="/auth", tags=["auth"])


class SignupRequest(BaseModel):
    username: str = Field(min_length=2, max_length=255)
    email: EmailStr
    phone: str = Field(pattern=r"^\+?[0-9]{7,15}$")
    password: str = Field(min_length=8, max_length=72)  # bcrypt ignores beyond 72 bytes


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    phone: str


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    email = payload.email.lower()
    existing = db.query(User).filter(or_(User.email == email, User.phone == payload.phone)).first()
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "Email or phone already registered")

    password_hash = bcrypt.hashpw(payload.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    user = User(name=payload.username, email=email, phone=payload.phone, password_hash=password_hash)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


class LoginRequest(BaseModel):
    identifier: str = Field(min_length=3, max_length=255)  # email or phone
    password: str = Field(min_length=1, max_length=72)


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    identifier = payload.identifier.strip()
    user = db.query(User).filter(or_(User.email == identifier.lower(), User.phone == identifier)).first()
    valid = user is not None and bcrypt.checkpw(
        payload.password.encode("utf-8"), user.password_hash.encode("utf-8")
    )
    if not valid:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email/phone or password")
    return create_token_pair(user.id)


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    # Rotation: every refresh issues a brand new access + refresh pair.
    user_id = decode_token(payload.refresh_token, REFRESH)
    if db.get(User, user_id) is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")
    return create_token_pair(user_id)


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user


class CheckAuthResponse(BaseModel):
    authenticated: bool
    user: UserResponse


@router.get("/check-auth", response_model=CheckAuthResponse)
def check_auth(current_user: User = Depends(get_current_user)):
    # 401 (from get_current_user) when the access token is missing, invalid or expired.
    return {"authenticated": True, "user": current_user}
