from __future__ import annotations

from sqlalchemy.orm import Session

from app.database.models.contact import Contact


class ContactRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_for_owner(self, owner_id: str) -> list[Contact]:
        return (
            self.db.query(Contact)
            .filter(Contact.owner_id == owner_id)
            .order_by(Contact.created_at.desc())
            .all()
        )

    def get(self, contact_id: str, owner_id: str) -> Contact | None:
        return (
            self.db.query(Contact)
            .filter(Contact.id == contact_id, Contact.owner_id == owner_id)
            .first()
        )

    def create(self, **kwargs) -> Contact:
        contact = Contact(**kwargs)
        self.db.add(contact)
        self.db.commit()
        self.db.refresh(contact)
        return contact

    def update(self, contact: Contact, **kwargs) -> Contact:
        for key, value in kwargs.items():
            if value is not None:
                setattr(contact, key, value)
        self.db.commit()
        self.db.refresh(contact)
        return contact

    def delete(self, contact: Contact) -> None:
        self.db.delete(contact)
        self.db.commit()
