from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config.settings import settings
from app.database.session.database import get_db
from app.schemas.auth import RegisterRequest, RegisterResponse, TokenResponse
from app.services.auth_google_service import (
    GoogleLoginError,
    build_login_url,
    handle_google_callback,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    try:
        email = service.register(request)
        return RegisterResponse(email=email)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    service = AuthService(db)
    try:
        token = service.login(form_data.username, form_data.password)
        return TokenResponse(access_token=token, token_type="bearer")
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))


@router.get("/google/login")
def google_login():
    try:
        url = build_login_url()
    except GoogleLoginError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return RedirectResponse(url)


@router.get("/google/callback")
def google_callback(code: str, state: str, db: Session = Depends(get_db)):
    try:
        token = handle_google_callback(db, code=code, state=state)
    except GoogleLoginError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Google sign-in failed: {exc}")

    return RedirectResponse(f"{settings.FRONTEND_URL}/auth/callback?token={token}")
