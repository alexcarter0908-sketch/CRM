from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.models.user import User
from app.database.session.database import get_db
from app.dependencies.auth import get_current_user
from app.repositories.contact_repository import ContactRepository
from app.schemas.contact import ContactCreate, ContactResponse, ContactUpdate

router = APIRouter(prefix="/contacts", tags=["Contacts"])


@router.get("", response_model=list[ContactResponse])
def list_contacts(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return ContactRepository(db).list_for_owner(user.id)


@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def create_contact(
    payload: ContactCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return ContactRepository(db).create(owner_id=user.id, **payload.model_dump())


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
    return repo.update(contact, **payload.model_dump(exclude_unset=True))


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
