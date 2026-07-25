"""
Public, unauthenticated endpoint — this is hit by whoever opens a shared
property link (a lead), not by the logged-in agent, so it intentionally
has no auth dependency.
"""

from fastapi import APIRouter, HTTPException, status

from app.database.session.database import SessionLocal
from app.repositories.property_repository import PropertyRepository
from app.repositories.property_view_repository import PropertyViewRepository
from app.repositories.user_repository import UserRepository
from app.schemas.property_view import PublicPropertyResponse
from app.services.automation_service import maybe_alert_property_view

router = APIRouter(tags=["Tracking (public)"])


@router.get("/public/properties/{token}", response_model=PublicPropertyResponse)
def view_public_property(token: str):
    db = SessionLocal()
    try:
        view_repo = PropertyViewRepository(db)
        row = view_repo.get_by_token(token)
        if row is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="This listing link is invalid or expired.")

        prop = PropertyRepository(db).get(row.property_id, row.owner_id)
        if prop is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found.")

        is_first_view = view_repo.register_view(row)
        if is_first_view:
            user = UserRepository(db).get_by_id(row.owner_id)
            contact = None
            if row.contact_id:
                from app.repositories.contact_repository import ContactRepository

                contact = ContactRepository(db).get(row.contact_id, row.owner_id)
            if user is not None:
                maybe_alert_property_view(db, user, prop, contact)

        return PublicPropertyResponse(
            title=prop.title,
            address=prop.address,
            property_type=prop.property_type,
            price=float(prop.price) if prop.price is not None else None,
            bedrooms=prop.bedrooms,
            bathrooms=prop.bathrooms,
            area_sqft=float(prop.area_sqft) if prop.area_sqft is not None else None,
            description=prop.description,
        )
    finally:
        db.close()
