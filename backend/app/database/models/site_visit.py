from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.database.mixins import BaseModelMixin


class SiteVisit(Base, BaseModelMixin):
    __tablename__ = "site_visits"

    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    contact_id: Mapped[str] = mapped_column(ForeignKey("contacts.id"), nullable=False, index=True)
    deal_id: Mapped[str | None] = mapped_column(ForeignKey("deals.id"), nullable=True, index=True)

    property_name: Mapped[str] = mapped_column(String(255), nullable=False)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), default="scheduled", nullable=False, server_default="scheduled")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Automatic reminder — checked by the "site_visit_reminders" automation.
    reminder_hours_before: Mapped[int] = mapped_column(Integer, nullable=False, default=24, server_default="24")
    reminder_sent: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")

    contact = relationship("Contact", back_populates="site_visits")
