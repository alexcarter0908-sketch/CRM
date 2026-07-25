from datetime import datetime

from pydantic import BaseModel

from app.core.enums import SiteVisitStatus


class SiteVisitCreate(BaseModel):
    contact_id: str
    deal_id: str | None = None
    property_name: str
    scheduled_at: datetime
    notes: str | None = None
    status: SiteVisitStatus = SiteVisitStatus.SCHEDULED
    reminder_hours_before: int = 24


class SiteVisitUpdate(BaseModel):
    property_name: str | None = None
    scheduled_at: datetime | None = None
    notes: str | None = None
    status: SiteVisitStatus | None = None
    reminder_hours_before: int | None = None


class SiteVisitResponse(BaseModel):
    id: str
    contact_id: str
    deal_id: str | None
    property_name: str
    scheduled_at: datetime
    status: str
    notes: str | None
    reminder_hours_before: int
    reminder_sent: bool
    created_at: datetime

    class Config:
        from_attributes = True
