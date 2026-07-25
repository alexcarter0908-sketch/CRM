from datetime import datetime

from pydantic import BaseModel

from app.core.enums import ActivityType


class ActivityCreate(BaseModel):
    contact_id: str
    deal_id: str | None = None
    type: ActivityType
    content: str


class ActivityResponse(BaseModel):
    id: str
    contact_id: str
    deal_id: str | None
    type: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
