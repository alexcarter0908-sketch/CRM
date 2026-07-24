from __future__ import annotations

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.database.mixins import BaseModelMixin


class Contact(Base, BaseModelMixin):
    __tablename__ = "contacts"

    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)

    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    company: Mapped[str | None] = mapped_column(String(255), nullable=True)
    source: Mapped[str | None] = mapped_column(String(100), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    owner = relationship("User", back_populates="contacts")
    deals = relationship("Deal", back_populates="contact", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="contact", cascade="all, delete-orphan")
    followups = relationship("FollowUp", back_populates="contact", cascade="all, delete-orphan")
