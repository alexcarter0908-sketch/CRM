from __future__ import annotations

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.database.mixins import BaseModelMixin


class Activity(Base, BaseModelMixin):
    __tablename__ = "activities"

    contact_id: Mapped[str] = mapped_column(ForeignKey("contacts.id"), nullable=False, index=True)
    deal_id: Mapped[str | None] = mapped_column(ForeignKey("deals.id"), nullable=True, index=True)
    created_by: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)

    type: Mapped[str] = mapped_column(String(50), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    contact = relationship("Contact", back_populates="activities")
    deal = relationship("Deal", back_populates="activities")
