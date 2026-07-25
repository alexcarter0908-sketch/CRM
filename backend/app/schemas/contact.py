from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.core.enums import PropertyType


class ContactCreate(BaseModel):
    full_name: str
    email: EmailStr | None = None
    phone: str | None = None
    company: str | None = None
    source: str | None = None
    notes: str | None = None
    budget_min: float | None = None
    budget_max: float | None = None
    preferred_property_type: PropertyType | None = None
    preferred_city: str | None = None
    preferred_bedrooms: int | None = None


class ContactUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    company: str | None = None
    source: str | None = None
    notes: str | None = None
    budget_min: float | None = None
    budget_max: float | None = None
    preferred_property_type: PropertyType | None = None
    preferred_city: str | None = None
    preferred_bedrooms: int | None = None


class ContactResponse(BaseModel):
    id: str
    full_name: str
    email: EmailStr | None
    phone: str | None
    company: str | None
    source: str | None
    notes: str | None
    budget_min: float | None
    budget_max: float | None
    preferred_property_type: str | None
    preferred_city: str | None
    preferred_bedrooms: int | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
