from __future__ import annotations

from sqlalchemy import Date, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.database.mixins import BaseModelMixin


class Deal(Base, BaseModelMixin):
    __tablename__ = "deals"

    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    contact_id: Mapped[str] = mapped_column(ForeignKey("contacts.id"), nullable=False, index=True)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    value: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    stage: Mapped[str] = mapped_column(String(50), default="new", nullable=False, index=True)
    expected_close_date: Mapped[str | None] = mapped_column(Date, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    owner = relationship("User", back_populates="deals")
    contact = relationship("Contact", back_populates="deals")
    activities = relationship("Activity", back_populates="deal", cascade="all, delete-orphan")
    followups = relationship("FollowUp", back_populates="deal", cascade="all, delete-orphan")
