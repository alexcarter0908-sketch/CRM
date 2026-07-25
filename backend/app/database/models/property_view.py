from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.database.mixins import BaseModelMixin


class PropertyView(Base, BaseModelMixin):
    """
    A shareable public link for a property. When a lead opens the link
    (e.g. from an email or WhatsApp message), the view is logged here
    and the "property_view_alert" automation notifies the agent — this
    is the real implementation of "event-triggered when a client views
    a property", not a simulated one.
    """

    __tablename__ = "property_views"

    token: Mapped[str] = mapped_column(String(36), unique=True, index=True, default=lambda: str(uuid4()))
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    property_id: Mapped[str] = mapped_column(ForeignKey("properties.id"), nullable=False, index=True)
    contact_id: Mapped[str | None] = mapped_column(ForeignKey("contacts.id"), nullable=True, index=True)

    viewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    view_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")

    property_ref = relationship("Property")
    contact = relationship("Contact")
