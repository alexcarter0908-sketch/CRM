from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.models.user import User
from app.database.session.database import get_db
from app.dependencies.auth import get_current_user
from app.repositories.contact_repository import ContactRepository
from app.repositories.property_repository import PropertyRepository
from app.schemas.contact import ContactCreate, ContactResponse, ContactUpdate
from app.schemas.property import PropertyMatchResult
from app.services.matching_service import match_properties_for_contact

router = APIRouter(prefix="/contacts", tags=["Contacts"])


def _normalize_enum_fields(data: dict) -> dict:
    if "preferred_property_type" in data and hasattr(data["preferred_property_type"], "value"):
        data["preferred_property_type"] = data["preferred_property_type"].value
    return data


@router.get("", response_model=list[ContactResponse])
def list_contacts(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return ContactRepository(db).list_for_owner(user.id)


@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def create_contact(
    payload: ContactCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    data = _normalize_enum_fields(payload.model_dump())
    return ContactRepository(db).create(owner_id=user.id, **data)


@router.get("/{contact_id}", response_model=ContactResponse)
def get_contact(
    contact_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    contact = ContactRepository(db).get(contact_id, user.id)
    if contact is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found.")
    return contact


@router.patch("/{contact_id}", response_model=ContactResponse)
def update_contact(
    contact_id: str,
    payload: ContactUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    repo = ContactRepository(db)
    contact = repo.get(contact_id, user.id)
    if contact is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found.")
    data = _normalize_enum_fields(payload.model_dump(exclude_unset=True))
    return repo.update(contact, **data)


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(
    contact_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    repo = ContactRepository(db)
    contact = repo.get(contact_id, user.id)
    if contact is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found.")
    repo.delete(contact)
    return None


@router.get("/{contact_id}/property-matches", response_model=list[PropertyMatchResult])
def get_property_matches_for_contact(
    contact_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Real, rule-based matching: scores every available property against this
    client's stated preferences (budget, city, type, bedrooms). No external AI
    call and no invented numbers — every score is computed from real fields."""
    contact = ContactRepository(db).get(contact_id, user.id)
    if contact is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found.")

    properties = PropertyRepository(db).list_available_for_owner(user.id)
    results = match_properties_for_contact(contact, properties)
    return [r for r in results if r.score > 0]
