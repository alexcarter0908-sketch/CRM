from __future__ import annotations

from sqlalchemy.orm import Session

from app.database.models.property import Property


class PropertyRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_for_owner(self, owner_id: str) -> list[Property]:
        return (
            self.db.query(Property)
            .filter(Property.owner_id == owner_id)
            .order_by(Property.created_at.desc())
            .all()
        )

    def list_available_for_owner(self, owner_id: str) -> list[Property]:
        return (
            self.db.query(Property)
            .filter(Property.owner_id == owner_id, Property.status == "available")
            .order_by(Property.created_at.desc())
            .all()
        )

    def get(self, property_id: str, owner_id: str) -> Property | None:
        return (
            self.db.query(Property)
            .filter(Property.id == property_id, Property.owner_id == owner_id)
            .first()
        )

    def create(self, **kwargs) -> Property:
        prop = Property(**kwargs)
        self.db.add(prop)
        self.db.commit()
        self.db.refresh(prop)
        return prop

    def update(self, prop: Property, **kwargs) -> Property:
        for key, value in kwargs.items():
            if value is not None:
                setattr(prop, key, value)
        self.db.commit()
        self.db.refresh(prop)
        return prop

    def delete(self, prop: Property) -> None:
        self.db.delete(prop)
        self.db.commit()
