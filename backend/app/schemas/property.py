from datetime import datetime

from pydantic import BaseModel

from app.core.enums import PropertyStatus, PropertyType


class PropertyCreate(BaseModel):
    title: str
    property_type: PropertyType
    status: PropertyStatus = PropertyStatus.AVAILABLE
    price: float | None = None
    city: str | None = None
    address: str | None = None
    bedrooms: int | None = None
    bathrooms: int | None = None
    size_sqft: int | None = None
    description: str | None = None


class PropertyUpdate(BaseModel):
    title: str | None = None
    property_type: PropertyType | None = None
    status: PropertyStatus | None = None
    price: float | None = None
    city: str | None = None
    address: str | None = None
    bedrooms: int | None = None
    bathrooms: int | None = None
    size_sqft: int | None = None
    description: str | None = None


class PropertyResponse(BaseModel):
    id: str
    title: str
    property_type: str
    status: str
    price: float | None
    city: str | None
    address: str | None
    bedrooms: int | None
    bathrooms: int | None
    size_sqft: int | None
    description: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PropertyMatch(BaseModel):
    """A property scored against a client's stated preferences (or vice versa)."""

    score: int  # 0-100
    reasons: list[str]
    missing: list[str]


class PropertyMatchResult(PropertyMatch):
    property: PropertyResponse
