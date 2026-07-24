from datetime import date, datetime

from pydantic import BaseModel

from app.core.enums import DealStage


class DealCreate(BaseModel):
    contact_id: str
    title: str
    value: float | None = None
    stage: DealStage = DealStage.NEW
    expected_close_date: date | None = None
    notes: str | None = None


class DealUpdate(BaseModel):
    title: str | None = None
    value: float | None = None
    stage: DealStage | None = None
    expected_close_date: date | None = None
    notes: str | None = None


class DealResponse(BaseModel):
    id: str
    contact_id: str
    title: str
    value: float | None
    stage: str
    expected_close_date: date | None
    notes: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
