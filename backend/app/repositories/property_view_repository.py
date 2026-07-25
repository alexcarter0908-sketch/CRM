from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.database.models.property_view import PropertyView


class PropertyViewRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, *, owner_id: str, property_id: str, contact_id: str | None) -> PropertyView:
        row = PropertyView(owner_id=owner_id, property_id=property_id, contact_id=contact_id)
        self.db.add(row)
        self.db.commit()
        self.db.refresh(row)
        return row

    def get_by_token(self, token: str) -> PropertyView | None:
        return self.db.query(PropertyView).filter(PropertyView.token == token).first()

    def list_for_property(self, property_id: str, owner_id: str) -> list[PropertyView]:
        return (
            self.db.query(PropertyView)
            .filter(PropertyView.property_id == property_id, PropertyView.owner_id == owner_id)
            .order_by(PropertyView.created_at.desc())
            .all()
        )

    def register_view(self, row: PropertyView) -> bool:
        """Returns True if this is the first time the link was opened."""
        is_first = row.viewed_at is None
        if is_first:
            row.viewed_at = datetime.now(timezone.utc)
        row.view_count = (row.view_count or 0) + 1
        self.db.commit()
        return is_first
