from __future__ import annotations

import urllib.parse
from uuid import uuid4

import httpx
from sqlalchemy.orm import Session

from app.core.config.settings import settings
from app.core.security import create_access_token
from app.repositories.user_repository import UserRepository

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


class GoogleLoginError(Exception):
    pass


def build_login_url() -> str:
    if not settings.GOOGLE_CLIENT_ID:
        raise GoogleLoginError("Google sign-in is not configured on this server.")

    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_LOGIN_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "state": str(uuid4()),
        "access_type": "offline",
        "prompt": "select_account",
    }
    return f"{GOOGLE_AUTH_URL}?{urllib.parse.urlencode(params)}"


def handle_google_callback(db: Session, *, code: str, state: str) -> str:
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise GoogleLoginError("Google sign-in is not configured on this server.")

    token_resp = httpx.post(
        GOOGLE_TOKEN_URL,
        data={
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_LOGIN_REDIRECT_URI,
            "grant_type": "authorization_code",
        },
        timeout=15,
    )
    token_resp.raise_for_status()
    google_access_token = token_resp.json()["access_token"]

    userinfo_resp = httpx.get(
        GOOGLE_USERINFO_URL,
        headers={"Authorization": f"Bearer {google_access_token}"},
        timeout=15,
    )
    userinfo_resp.raise_for_status()
    profile = userinfo_resp.json()

    users = UserRepository(db)
    user = users.get_by_google_id(profile["sub"])

    if user is None:
        user = users.get_by_email(profile.get("email", ""))

    if user is None:
        user = users.create(
            full_name=profile.get("name", "Google User"),
            email=profile["email"],
            google_id=profile["sub"],
            avatar_url=profile.get("picture"),
        )
    elif not user.google_id:
        user.google_id = profile["sub"]
        db.commit()

    return create_access_token(subject=user.id)
