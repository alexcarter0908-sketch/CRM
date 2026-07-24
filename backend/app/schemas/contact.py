from datetime import datetime

from pydantic import BaseModel, EmailStr


class ContactCreate(BaseModel):
    full_name: str
    email: EmailStr | None = None
    phone: str | None = None
    company: str | None = None
    source: str | None = None
    notes: str | None = None


class ContactUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    company: str | None = None
    source: str | None = None
    notes: str | None = None


class ContactResponse(BaseModel):
    id: str
    full_name: str
    email: EmailStr | None
    phone: str | None
    company: str | None
    source: str | None
    notes: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
