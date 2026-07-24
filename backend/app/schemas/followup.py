from datetime import datetime

from pydantic import BaseModel


class FollowUpCreate(BaseModel):
    contact_id: str
    deal_id: str | None = None
    due_at: datetime
    note: str | None = None


class FollowUpUpdate(BaseModel):
    due_at: datetime | None = None
    note: str | None = None
    is_done: bool | None = None


class FollowUpResponse(BaseModel):
    id: str
    contact_id: str
    deal_id: str | None
    due_at: datetime
    note: str | None
    is_done: bool
    created_at: datetime

    class Config:
        from_attributes = True
