from datetime import datetime

from pydantic import BaseModel


class ShareLinkRequest(BaseModel):
    contact_id: str | None = None


class ShareLinkResponse(BaseModel):
    token: str
    url: str


class PropertyViewResponse(BaseModel):
    id: str
    token: str
    property_id: str
    contact_id: str | None
    viewed_at: datetime | None
    view_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class PublicPropertyResponse(BaseModel):
    title: str
    address: str | None
    property_type: str | None
    price: float | None
    bedrooms: int | None
    bathrooms: int | None
    area_sqft: float | None
    description: str | None
