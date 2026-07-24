from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.repositories.user_repository import UserRepository
from app.schemas.auth import RegisterRequest


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.users = UserRepository(db)

    def register(self, request: RegisterRequest) -> str:
        if self.users.get_by_email(request.email):
            raise ValueError("An account with this email already exists.")

        self.users.create(
            full_name=request.full_name,
            email=request.email,
            password_hash=hash_password(request.password),
        )
        return request.email

    def login(self, email: str, password: str) -> str:
        user = self.users.get_by_email(email)

        if user is None or not user.password_hash:
            raise ValueError("Invalid email or password.")

        if not verify_password(password, user.password_hash):
            raise ValueError("Invalid email or password.")

        if not user.is_active:
            raise ValueError("This account has been deactivated.")

        return create_access_token(subject=user.id)
