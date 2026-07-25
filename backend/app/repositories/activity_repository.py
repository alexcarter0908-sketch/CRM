from __future__ import annotations

from sqlalchemy.orm import Session

from app.database.models.activity import Activity


class ActivityRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_for_contact(self, contact_id: str) -> list[Activity]:
        return (
            self.db.query(Activity)
            .filter(Activity.contact_id == contact_id)
            .order_by(Activity.created_at.desc())
            .all()
        )

    def create(self, **kwargs) -> Activity:
        activity = Activity(**kwargs)
        self.db.add(activity)
        self.db.commit()
        self.db.refresh(activity)
        return activity
