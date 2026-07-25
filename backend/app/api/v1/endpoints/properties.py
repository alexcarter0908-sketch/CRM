from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.models.user import User
from app.database.session.database import get_db
from app.dependencies.auth import get_current_user
from app.repositories.contact_repository import ContactRepository
from app.repositories.property_repository import PropertyRepository
from app.schemas.property import PropertyCreate, PropertyResponse, PropertyUpdate
from app.services.matching_service import match_contacts_for_property

router = APIRouter(prefix="/properties", tags=["Properties"])


def _normalize_enum_fields(data: dict) -> dict:
    for key in ("property_type", "status"):
        if key in data and hasattr(data[key], "value"):
            data[key] = data[key].value
    return data


@router.get("", response_model=list[PropertyResponse])
def list_properties(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return PropertyRepository(db).list_for_owner(user.id)


@router.post("", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
def create_property(
    payload: PropertyCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    data = _normalize_enum_fields(payload.model_dump())
    return PropertyRepository(db).create(owner_id=user.id, **data)


@router.get("/{property_id}", response_model=PropertyResponse)
def get_property(
    property_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    prop = PropertyRepository(db).get(property_id, user.id)
    if prop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found.")
    return prop


@router.patch("/{property_id}", response_model=PropertyResponse)
def update_property(
    property_id: str,
    payload: PropertyUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    repo = PropertyRepository(db)
    prop = repo.get(property_id, user.id)
    if prop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found.")
    data = _normalize_enum_fields(payload.model_dump(exclude_unset=True))
    return repo.update(prop, **data)


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_property(
    property_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    repo = PropertyRepository(db)
    prop = repo.get(property_id, user.id)
    if prop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found.")
    repo.delete(prop)
    return None


@router.get("/{property_id}/client-matches")
def get_client_matches_for_property(
    property_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Real, rule-based matching: scores every client's stated preferences
    against this property. See app.services.matching_service for the scoring
    breakdown — no external AI call, no invented numbers."""
    prop = PropertyRepository(db).get(property_id, user.id)
    if prop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found.")

    contacts = ContactRepository(db).list_for_owner(user.id)
    results = match_contacts_for_property(prop, contacts)
    return [r for r in results if r["score"] > 0]
