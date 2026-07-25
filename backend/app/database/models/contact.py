from __future__ import annotations

from sqlalchemy import ForeignKey, Integer, Numeric, String, Text
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

    # Real-estate client preferences — used by the property matching engine.
    budget_min: Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    budget_max: Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    preferred_property_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    preferred_city: Mapped[str | None] = mapped_column(String(150), nullable=True)
    preferred_bedrooms: Mapped[int | None] = mapped_column(Integer, nullable=True)

    owner = relationship("User", back_populates="contacts")
    deals = relationship("Deal", back_populates="contact", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="contact", cascade="all, delete-orphan")
    followups = relationship("FollowUp", back_populates="contact", cascade="all, delete-orphan")
